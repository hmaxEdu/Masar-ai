import { useState, useCallback } from 'react';
import { ollamaService, type OllamaMessage } from '@/lib/ollama';
import { masarActions } from '@/hooks/use-masar';
import { type Task } from '@/lib/db';

export interface ChatProposal {
  type: 'add_task' | 'update_task' | 'delete_task';
  data: Record<string, unknown>;
  description: string;
}

export interface ExtendedMessage extends OllamaMessage {
  proposal?: ChatProposal;
}

export function useOllama(projectId?: number) {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string, projectContext: { tasks: Task[], projectName: string }) => {
    const userMessage: ExtendedMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const systemPrompt = `أنت مساعد ذكي لتطبيق "مسار" (Masar)، وهو تطبيق لإدارة المهام.
المشروع الحالي: "${projectContext.projectName}".
المهام الحالية في هذا المشروع: ${JSON.stringify(projectContext.tasks.map(t => ({ id: t.id, title: t.title, status: t.status, priority: t.priority })))}.

يمكنك اقتراح إجراءات عن طريق إضافة كتلة JSON خاصة في نهاية رسالتك.
يجب أن تكون الاقتراحات مفيدة وتساعد المستخدم في تنظيم مشروعه.

صيغ الإجراءات المتاحة:
- إضافة مهمة: [PROPOSAL:{"type": "add_task", "data": {"title": "عنوان المهمة", "description": "وصف المهمة", "priority": 3}, "description": "إضافة مهمة جديدة لـ..."}]
- تحديث مهمة (مثل تغيير الحالة أو الأولوية): [PROPOSAL:{"type": "update_task", "data": {"id": 1, "status": "Done"}, "description": "تحديد المهمة ... كمكتملة"}]
- حذف مهمة: [PROPOSAL:{"type": "delete_task", "data": {"id": 1}, "description": "حذف المهمة ..."}]

ملاحظات هامة:
1. أجب دائماً باللغة العربية بأسلوب ودود ومختصر.
2. لا تقترح إجراءات إلا إذا كانت ذات صلة بطلب المستخدم أو مفيدة لسياق المشروع.
3. يمكنك اقتراح إجراء واحد فقط في الرسالة الواحدة.
4. الأولوية (priority) من 1 (عالية) إلى 5 (منخفضة).
5. حالات المهام المتاحة: 'To Do', 'Doing', 'Done'.

ابدأ بمساعدة المستخدم الآن.`;

      const stream = await ollamaService.chat([
        { role: "system", content: systemPrompt },
        ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        userMessage
      ], true) as ReadableStream;

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      // Add an empty assistant message to be updated
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              fullContent += json.message.content;
              // Update the last message content
              setMessages(prev => {
                const newMessages = [...prev];
                const last = newMessages[newMessages.length - 1];
                if (last && last.role === "assistant") {
                  return [...newMessages.slice(0, -1), { ...last, content: fullContent }];
                }
                return newMessages;
              });
            }
          } catch (e) {
            console.error("Error parsing streaming chunk:", e);
          }
        }
      }

      // Final processing for proposals
      let proposal: ChatProposal | undefined;
      const proposalMatch = fullContent.match(/\[PROPOSAL:(.*?)\]/);
      if (proposalMatch) {
        try {
          proposal = JSON.parse(proposalMatch[1].trim());
          fullContent = fullContent.replace(/\[PROPOSAL:.*?\]/, "").trim();
        } catch (e) {
          console.error("Failed to parse proposal", e);
        }
      }

      // Final update with the cleaned content and proposal
      setMessages(prev => {
        const newMessages = [...prev];
        const last = newMessages[newMessages.length - 1];
        if (last && last.role === "assistant") {
          return [...newMessages.slice(0, -1), { ...last, content: fullContent, proposal }];
        }
        return newMessages;
      });

    } catch (error) {
      console.error('Ollama Chat Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'عذراً، حدث خطأ أثناء الاتصال بـ Ollama. تأكد من تشغيله في الخلفية وتوفر الموديل المطلوب وتفعيل CORS.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = () => setMessages([]);

  const executeProposal = async (proposal: ChatProposal) => {
    try {
      switch (proposal.type) {
        case 'add_task':
          if (!projectId) throw new Error('No active project');
          await masarActions.addTask({
            projectId: projectId,
            title: proposal.data.title as string,
            description: (proposal.data.description as string) || '',
            status: 'To Do',
            priority: (proposal.data.priority as number) || 3,
            startedAt: new Date(),
          });
          break;
        case 'update_task':
          await masarActions.updateTask(proposal.data.id as number, proposal.data as Partial<Task>);
          break;
        case 'delete_task':
          await masarActions.deleteTask(proposal.data.id as number);
          break;
      }
      // Remove proposal from message after execution
      setMessages(prev => prev.map(m => m.proposal === proposal ? { ...m, proposal: undefined } : m));
    } catch (error) {
      console.error('Failed to execute proposal', error);
    }
  };

  const rejectProposal = (proposal: ChatProposal) => {
    setMessages(prev => prev.map(m => m.proposal === proposal ? { ...m, proposal: undefined } : m));
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    executeProposal,
    rejectProposal
  };
}
