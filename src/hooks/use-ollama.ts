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

  const resolveDataRefs = (data: Record<string, any>, idMap: Map<string, number>) => {
    const resolved = { ...data };
    for (const key in resolved) {
      const val = resolved[key];
      if (typeof val === 'string' && val.startsWith('ref:')) {
        const tempId = val.substring(4);
        if (idMap.has(tempId)) {
          resolved[key] = idMap.get(tempId);
        }
      }
    }
    return resolved;
  };

  const executeProposal = async (proposalId: string, idMap?: Map<string, number>) => {
    let targetProposal: ChatProposal | undefined;

    setMessages(prev => {
      let found = false;
      const next = prev.map(m => {
        const p = m.proposals?.find(p => p.id === proposalId);
        if (p) {
          targetProposal = p;
          found = true;
          return {
            ...m,
            proposals: m.proposals?.map(pp => pp.id === proposalId ? { ...pp, status: 'executing' as const } : pp)
          };
        }
        return m;
      });
      return found ? next : prev;
    });

    // Wait for state update to settle if needed, but since we have targetProposal from the loop, we can proceed.
    if (!targetProposal) return;

    try {
      const proposal = targetProposal;
      const data = idMap ? resolveDataRefs(proposal.data, idMap) : proposal.data;

      let resultId: number | undefined;

      switch (proposal.type) {
        case 'add_task':
          if (!projectId && !data.projectId) throw new Error('No active project');
          resultId = await masarActions.addTask({
            projectId: (data.projectId as number) || (projectId as number),
            title: data.title as string,
            description: (data.description as string) || '',
            status: (data.status as any) || 'To Do',
            priority: (data.priority as number) || 3,
            startedAt: new Date(),
            parentId: data.parentId as number | undefined,
          }) as number;

          if (data.tempId && idMap) {
            idMap.set(data.tempId as string, resultId);
          }
          break;
        case 'update_task':
          await masarActions.updateTask(data.id as number, data as Partial<Task>);
          break;
        case 'delete_task':
          await masarActions.deleteTask(data.id as number);
          break;
        case 'add_dependency':
          await masarActions.addDependency(data.blockingTaskId as number, data.blockedTaskId as number);
          break;
        case 'remove_dependency':
          if (data.id) {
            await masarActions.removeDependency(data.id as number);
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

  const executeBatch = async (proposalIds: string[]) => {
    const idMap = new Map<string, number>();
    for (const id of proposalIds) {
      await executeProposal(id, idMap);
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
      const history = messages.slice(-15).map(m => ({ role: m.role, content: m.content }));

      const currentMessages: OllamaMessage[] = [
        {
          role: 'system',
          content: `أنت مساعد ذكي متطور للغاية لتطبيق "مسار" (Masar)، وهو تطبيق احترافي لإدارة المهام والتبعيات.
أنت تعمل الآن في وضع "العميل المستقل" (Autonomous Agent).

السياق الحالي:
- المشروع: "${projectContext.projectName}".
- المهام الحالية: ${JSON.stringify(projectContext.tasks.map(t => ({ id: t.id, title: t.title, status: t.status, priority: t.priority, parentId: t.parentId })))}.

أدواتك المتاحة:
1. إضافة مهمة: [PROPOSAL:{"type": "add_task", "data": {"tempId": "string", "title": "...", "description": "...", "priority": 1-5, "parentId": number | "ref:tempId"}, "description": "..."}]
2. تحديث مهمة: [PROPOSAL:{"type": "update_task", "data": {"id": number, "status": "To Do" | "Doing" | "Done", "priority": 1-5, "title": "..."}, "description": "..."}]
3. حذف مهمة: [PROPOSAL:{"type": "delete_task", "data": {"id": number}, "description": "..."}]
4. إضافة تبعية: [PROPOSAL:{"type": "add_dependency", "data": {"blockingTaskId": number | "ref:tempId", "blockedTaskId": number | "ref:tempId"}, "description": "..."}]
5. إزالة تبعية: [PROPOSAL:{"type": "remove_dependency", "data": {"id": number}, "description": "..."}]

إرشادات هامة:
- التبعيات: يمكنك إنشاء مهمة واستخدامها كتبعية في نفس الخطة باستخدام "tempId" و "ref:tempId".
- التنسيق: كل إجراء يجب أن يكون مغلفاً بـ [PROPOSAL:...] بشكل مستقل.
- اللغة: أجب دائماً بالعربية بلهجة مهنية.`
        },
        ...history,
        ...(isSystemGenerated ? [{ role: 'system' as const, content }] : [{ role: 'user' as const, content }])
      ];

      const response = await ollamaService.chat(currentMessages, false, abortControllerRef.current?.signal) as OllamaChatResponse;

      if (!response || !response.message) {
        throw new Error('Invalid response from Ollama');
      }

      let assistantContent = response.message.content || '';
      const proposals: ChatProposal[] = [];

      // Robust parsing for [PROPOSAL:...]
      let searchIndex = 0;
      while (true) {
        const startIndex = assistantContent.indexOf('[PROPOSAL:', searchIndex);
        if (startIndex === -1) break;

        let depth = 0;
        let endIndex = -1;
        for (let i = startIndex + 10; i < assistantContent.length; i++) {
          if (assistantContent[i] === '{') depth++;
          if (assistantContent[i] === '}') depth--;
          if (assistantContent[i] === ']' && depth === 0) {
            endIndex = i;
            break;
          }
        }

        if (endIndex !== -1) {
          const rawJson = assistantContent.substring(startIndex + 10, endIndex);
          try {
            const parsed = JSON.parse(rawJson);
            proposals.push({
              ...parsed,
              id: Math.random().toString(36).substr(2, 9),
              status: 'pending'
            });
          } catch (e) {
            console.error('Failed to parse proposal JSON', e);
          }
          searchIndex = endIndex + 1;
        } else {
          searchIndex = startIndex + 10;
        }
      }

      // Fallback: if no [PROPOSAL:] found but content looks like JSON array
      if (proposals.length === 0) {
        const jsonArrayMatch = assistantContent.match(/\[\s*{[\s\S]*}\s*\]/);
        if (jsonArrayMatch) {
          try {
            const items = JSON.parse(jsonArrayMatch[0]);
            if (Array.isArray(items)) {
              items.forEach(item => {
                if (item.type && item.data) {
                  proposals.push({
                    ...item,
                    id: Math.random().toString(36).substr(2, 9),
                    status: 'pending'
                  });
                }
              });
              assistantContent = assistantContent.replace(jsonArrayMatch[0], '').trim();
            }
          } catch (e) {}
        }
      }

      assistantContent = assistantContent.replace(/\[PROPOSAL:[\s\S]*?\]/g, '').trim();

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
        content: 'عذراً، حدث خطأ أثناء الاتصال بـ Ollama.'
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
    executeBatch,
    rejectProposal
  };
}
