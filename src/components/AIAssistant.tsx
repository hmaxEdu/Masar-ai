import { useState, useRef, useEffect } from 'react';
import { useOllama } from '@/hooks/use-ollama';
import { useTasks, useProjects } from '@/hooks/use-masar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, X, Check, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';

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

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input, { tasks, projectName: currentProjectName });
    setInput('');
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const messageVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
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
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">مساعد مسار الذكي</h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] text-muted-foreground">Ollama نشط</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={clearChat} title="مسح المحادثة" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary/60" />
                </div>
                <p className="text-sm text-muted-foreground px-4 leading-relaxed">
                  أهلاً بك! أنا مساعدك الذكي. يمكنني مساعدتك في تنظيم مهامك في مشروع <span className="text-primary font-semibold">"{currentProjectName}"</span>.
                </p>
                <div className="grid grid-cols-1 gap-2 px-4 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setInput('اقترح عليّ 3 مهام جديدة للمشروع')} className="text-xs justify-start hover:bg-primary/5 transition-colors">
                    <Sparkles className="h-3 w-3 ml-2 text-primary" />
                    اقترح مهام جديدة
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setInput('لخص حالة المشروع الحالية')} className="text-xs justify-start hover:bg-primary/5 transition-colors">
                    <Sparkles className="h-3 w-3 ml-2 text-primary" />
                    لخص حالة المشروع
                  </Button>
                </div>
              </motion.div>
            )}

            {messages.map((m, i) => (
              <motion.div
                key={i}
                layout
                variants={messageVariants}
                className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex gap-2 max-w-[90%] ${m.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    m.role === 'user' ? 'bg-muted' : 'bg-primary/20 text-primary'
                  }`}>
                    {m.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  </div>
                  <div className="space-y-2">
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-muted text-foreground rounded-tr-none'
                        : 'bg-primary text-primary-foreground rounded-tl-none shadow-md'
                    }`}>
                      {m.content || (isLoading && i === messages.length - 1 ? "..." : "")}
                    </div>

                    {m.proposal && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 5 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-accent/50 border border-primary/20 rounded-xl p-3 space-y-3 backdrop-blur-sm shadow-sm"
                      >
                        <div className="flex items-start gap-2 text-xs">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold mb-1 text-primary">إجراء مقترح:</p>
                            <p className="text-muted-foreground leading-snug">{m.proposal.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-[10px] px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => rejectProposal(m.proposal!)}
                          >
                            <X className="h-3 w-3 ml-1" /> رفض
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-[10px] px-3 font-medium shadow-sm"
                            onClick={() => executeProposal(m.proposal!)}
                          >
                            <Check className="h-3 w-3 ml-1" /> تنفيذ
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && !messages[messages.length-1]?.content && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="flex gap-2 flex-row-reverse">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center animate-pulse">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="bg-primary/10 p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center h-10 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </ScrollArea>

      <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
        <div className="relative group">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسأل المساعد..."
            className="pl-10 h-10 rounded-xl border-primary/20 focus-visible:ring-primary/30 transition-all bg-muted/30 group-hover:bg-muted/50"
            disabled={isLoading}
          />
          <Button
            size="icon"
            variant="ghost"
            className={`absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg transition-all ${
              input.trim() ? "text-primary hover:bg-primary/10" : "text-muted-foreground"
            }`}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2.5 opacity-60">
          <AlertCircle className="h-2.5 w-2.5" />
          <p className="text-[9px] text-muted-foreground">
            قد يرتكب الذكاء الاصطناعي أخطاء. راجع الإجراءات.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
