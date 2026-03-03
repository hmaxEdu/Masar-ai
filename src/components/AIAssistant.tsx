import { useState, useRef, useEffect } from 'react';
import { useOllama, type ExtendedMessage, type ChatProposal } from '@/hooks/use-ollama';
import { useTasks, useProjects } from '@/hooks/use-masar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Bot, User, Send, X, Check, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIAssistantProps {
  projectId: number | 'all' | null;
  onClose: () => void;
}

export function AIAssistant({ projectId, onClose }: AIAssistantProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const projects = useProjects();
  const tasks = useTasks(projectId === 'all' ? undefined : (projectId || undefined));

  const currentProjectName = projectId === 'all'
    ? 'جميع المشاريع'
    : projects.find(p => p.id === projectId)?.name || 'غير معروف';

  const { messages, isLoading, sendMessage, clearChat, executeProposal, rejectProposal } = useOllama(
    projectId === 'all' ? undefined : (projectId || undefined)
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input, { tasks, projectName: currentProjectName });
    setInput('');
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-80 border-r bg-card flex flex-col h-full shadow-xl"
    >
      <div className="p-4 border-b flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">مساعد مسار الذكي</h3>
            <p className="text-[10px] text-muted-foreground">مدعوم بواسطة Ollama</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={clearChat} title="مسح المحادثة">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <Sparkles className="h-12 w-12 text-primary/20 mx-auto" />
              <p className="text-sm text-muted-foreground px-4">
                أهلاً بك! أنا مساعدك الذكي. يمكنني مساعدتك في تنظيم مهامك في مشروع "{currentProjectName}".
              </p>
              <div className="grid grid-cols-1 gap-2 px-4">
                <Button variant="outline" size="sm" onClick={() => setInput('اقترح عليّ 3 مهام جديدة للمشروع')} className="text-xs">
                  اقترح مهام جديدة
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInput('لخص حالة المشروع الحالية')} className="text-xs">
                  لخص حالة المشروع
                </Button>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex gap-2 max-w-[90%] ${m.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === 'user' ? 'bg-muted' : 'bg-primary/20 text-primary'
                }`}>
                  {m.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                </div>
                <div className="space-y-2">
                  <div className={`p-3 rounded-2xl text-sm ${
                    m.role === 'user'
                      ? 'bg-muted text-foreground rounded-tr-none'
                      : 'bg-primary text-primary-foreground rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>

                  {m.proposal && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-accent border rounded-lg p-3 space-y-3"
                    >
                      <div className="flex items-start gap-2 text-xs">
                        <Sparkles className="h-3 w-3 mt-0.5 text-primary" />
                        <div>
                          <p className="font-semibold mb-1">إجراء مقترح:</p>
                          <p className="text-muted-foreground">{m.proposal.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] px-2 border-destructive text-destructive hover:bg-destructive/10"
                          onClick={() => rejectProposal(m.proposal!)}
                        >
                          <X className="h-3 w-3 ml-1" /> رفض
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-[10px] px-2"
                          onClick={() => executeProposal(m.proposal!)}
                        >
                          <Check className="h-3 w-3 ml-1" /> تنفيذ
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-end">
              <div className="flex gap-2 flex-row-reverse">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center animate-pulse">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="bg-primary/10 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center h-10">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسأل المساعد..."
            className="pl-10"
            disabled={isLoading}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          قد يرتكب الذكاء الاصطناعي أخطاء. راجع الإجراءات قبل التنفيذ.
        </p>
      </div>
    </motion.div>
  );
}
