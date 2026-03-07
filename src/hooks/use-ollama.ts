import { useState, useCallback, useRef, useEffect } from 'react';
import { ollamaService, type OllamaMessage, type OllamaChatResponse } from '@/lib/ollama';
import { masarActions } from '@/hooks/use-masar';
import { type Task } from '@/lib/db';

export interface ChatProposal {
  id: string;
  type: 'add_task' | 'update_task' | 'delete_task' | 'add_dependency' | 'remove_dependency';
  data: Record<string, unknown>;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'rejected';
  error?: string;
}

export interface ExtendedMessage extends OllamaMessage {
  proposals?: ChatProposal[];
  isThinking?: boolean;
}

export function useOllama(projectId?: number) {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const clearChat = () => setMessages([]);

  const executeProposal = async (proposalId: string) => {
    let targetProposal: ChatProposal | undefined;

    setMessages(prev => prev.map(m => {
      const p = m.proposals?.find(p => p.id === proposalId);
      if (p) {
        targetProposal = p;
        return {
          ...m,
          proposals: m.proposals?.map(pp => pp.id === proposalId ? { ...pp, status: 'executing' as const } : pp)
        };
      }
      return m;
    }));

    if (!targetProposal) return;

    try {
      const proposal = targetProposal;
      switch (proposal.type) {
        case 'add_task':
          if (!projectId && !proposal.data.projectId) throw new Error('No active project');
          await masarActions.addTask({
            projectId: (proposal.data.projectId as number) || (projectId as number),
            title: proposal.data.title as string,
            description: (proposal.data.description as string) || '',
            status: (proposal.data.status as 'To Do' | 'Doing' | 'Done') || 'To Do',
            priority: (proposal.data.priority as number) || 3,
            startedAt: new Date(),
            parentId: proposal.data.parentId as number | undefined,
          });
          break;
        case 'update_task':
          await masarActions.updateTask(proposal.data.id as number, proposal.data as Partial<Task>);
          break;
        case 'delete_task':
          await masarActions.deleteTask(proposal.data.id as number);
          break;
        case 'add_dependency':
          await masarActions.addDependency(proposal.data.blockingTaskId as number, proposal.data.blockedTaskId as number);
          break;
        case 'remove_dependency':
          if (proposal.data.id) {
            await masarActions.removeDependency(proposal.data.id as number);
          } else {
             throw new Error('Dependency ID is required for removal');
          }
          break;
      }

      setMessages(prev => prev.map(m => ({
        ...m,
        proposals: m.proposals?.map(p => p.id === proposalId ? { ...p, status: 'completed' as const } : p)
      })));
      return true;
    } catch (error) {
      console.error('Failed to execute proposal', error);
      setMessages(prev => prev.map(m => ({
        ...m,
        proposals: m.proposals?.map(p => p.id === proposalId ? { ...p, status: 'failed' as const, error: (error as Error).message } : p)
      })));
      return false;
    }
  };

  const rejectProposal = (proposalId: string) => {
    setMessages(prev => prev.map(m => ({
      ...m,
      proposals: m.proposals?.map(p => p.id === proposalId ? { ...p, status: 'rejected' as const } : p)
    })));
  };

  const sendMessage = useCallback(async (content: string, projectContext: { tasks: Task[], projectName: string }, isSystemGenerated = false) => {
    if (isLoading && !isSystemGenerated) return;

    if (!isSystemGenerated) {
      const userMessage: ExtendedMessage = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);
    }

    setIsLoading(true);

    try {
      const currentMessages: OllamaMessage[] = [
        {
          role: 'system',
          content: `أنت مساعد ذكي متطور للغاية لتطبيق "مسار" (Masar)، وهو تطبيق احترافي لإدارة المهام والتبعيات.
أنت تعمل الآن في وضع "العميل المستقل" (Autonomous Agent)، مما يعني أنك تمتلك القدرة على التخطيط الاستراتيجي، التحليل العميق، وتنفيذ العمليات المعقدة.

السياق الحالي:
- المشروع: "${projectContext.projectName}".
- المهام الحالية والتبعيات: ${JSON.stringify(projectContext.tasks.map(t => ({ id: t.id, title: t.title, status: t.status, priority: t.priority, parentId: t.parentId })))}.

أدواتك المتاحة (استخدم تنسيق [PROPOSAL:JSON]):
1. إضافة مهمة: {"type": "add_task", "data": {"title": "...", "description": "...", "priority": 1-5, "parentId": number | null}, "description": "..."}
2. تحديث مهمة: {"type": "update_task", "data": {"id": number, "status": "To Do" | "Doing" | "Done", "priority": 1-5, "title": "..."}, "description": "..."}
3. حذف مهمة: {"type": "delete_task", "data": {"id": number}, "description": "..."}
4. إضافة تبعية: {"type": "add_dependency", "data": {"blockingTaskId": number, "blockedTaskId": number}, "description": "..."}
5. إزالة تبعية: {"type": "remove_dependency", "data": {"id": number}, "description": "..."}

إرشادات العمل كخبير:
- التحليل: قبل الاقتراح، حلل طلب المستخدم. هل يحتاج لمشروع كامل؟ هل يحتاج لتعديل في مسار العمل؟
- التخطيط: قسم الأهداف الكبيرة إلى مهام صغيرة قابلة للتنفيذ. اربط المهام ببعضها باستخدام التبعيات (Dependencies) لإنشاء مسار عمل منطقي.
- التكرار: إذا تم تنفيذ خطة، حلل النتيجة واقترح الخطوات التالية.
- اللغة: أجب دائماً بالعربية بلهجة مهنية ومحفزة.
- التفاصيل: اجعل عناوين المهام واضحة ووصفها مفصلاً.

حالات المهام:
- 'To Do': مهمة لم تبدأ.
- 'Doing': مهمة قيد العمل.
- 'Done': مهمة اكتملت.
- 'Blocked': مهمة معطلة بسبب تبعية (يتم إدارتها تلقائياً من التطبيق عند إضافة تبعية).

ابدأ الآن في مساعدة المستخدم لتحقيق أهدافه بأعلى كفاءة.`
        },
        ...messages.slice(-15).map(m => ({ role: m.role, content: m.content })),
        ...(isSystemGenerated ? [] : [{ role: 'user' as const, content }])
      ];

      const response = await ollamaService.chat(currentMessages, false, abortControllerRef.current?.signal) as OllamaChatResponse;

      if (!response || !response.message) {
        throw new Error('Invalid response from Ollama');
      }

      let assistantContent = response.message.content || '';
      const proposals: ChatProposal[] = [];

      const proposalRegex = /\[PROPOSAL:({.*?})\]/g;
      let match;
      while ((match = proposalRegex.exec(assistantContent)) !== null) {
        try {
          const rawProposal = JSON.parse(match[1]);
          proposals.push({
            ...rawProposal,
            id: Math.random().toString(36).substr(2, 9),
            status: 'pending'
          });
        } catch (e) {
          console.error('Failed to parse proposal', e);
        }
      }

      assistantContent = assistantContent.replace(/\[PROPOSAL:.*?\]/g, '').trim();

      const assistantMessage: ExtendedMessage = {
        role: 'assistant',
        content: assistantContent || (proposals.length > 0 ? 'لقد قمت بإعداد خطة عمل لك:' : ''),
        proposals: proposals.length > 0 ? proposals : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      if (error.name === 'AbortError') return;

      console.error('Ollama Chat Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'عذراً، حدث خطأ أثناء الاتصال بـ Ollama. تأكد من تشغيله في الخلفية وتوفر الموديل المطلوب وتفعيل CORS.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, projectId]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    executeProposal,
    rejectProposal
  };
}
