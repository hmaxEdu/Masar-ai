import { useState, useRef, useEffect } from 'react';
import { useOllama, type ChatProposal } from '@/hooks/use-ollama';
import { useTasks, useProjects } from '@/hooks/use-masar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, X, Check, Trash2, Sparkles, AlertCircle, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIAssistantProps {
  projectId: number | 'all' | null;
  onClose: () => void;
}

export function AIAssistant({ projectId, onClose }: AIAssistantProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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
    const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input, { tasks, projectName: currentProjectName });
    setInput('');
  };

  const handleExecuteAll = async (proposals: ChatProposal[]) => {
    for (const p of proposals) {
      if (p.status === 'pending') {
        await executeProposal(p.id);
      }
    }

    sendMessage("تم تنفيذ جميع الخطوات. ما هي الخطوة التالية؟", { tasks, projectName: currentProjectName }, true);
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

  const renderProposal = (p: ChatProposal) => {
    const isPending = p.status === 'pending';
    const isExecuting = p.status === 'executing';
    const isCompleted = p.status === 'completed';
    const isFailed = p.status === 'failed';
    const isRejected = p.status === 'rejected';

    if (isRejected) return null;

    return (
      <motion.div
        key={p.id}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative border rounded-xl p-3 space-y-2 transition-all ${
          isCompleted ? 'bg-green-500/5 border-green-500/20' :
          isFailed ? 'bg-destructive/5 border-destructive/20' :
          'bg-accent/30 border-primary/10 shadow-sm'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
            isCompleted ? 'bg-green-500/20 text-green-600' :
            isFailed ? 'bg-destructive/20 text-destructive' :
            'bg-primary/10 text-primary'
          }`}>
            {isExecuting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
             isCompleted ? <Check className="h-3.5 w-3.5" /> :
             <Sparkles className="h-3.5 w-3.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium leading-relaxed">{p.description}</p>
            {isFailed && p.error && (
              <p className="text-[10px] text-destructive mt-1 font-mono">{p.error}</p>
            )}
          </div>
        </div>

        {isPending && (
          <div className="flex gap-2 justify-end pt-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[10px] px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => rejectProposal(p.id)}
            >
              <X className="h-3 w-3 ml-1" /> تجاهل
            </Button>
            <Button
              size="sm"
              className="h-7 text-[10px] px-3 font-medium shadow-sm"
              onClick={() => executeProposal(p.id)}
            >
              تنفيد
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-140 border-r bg-card flex flex-col h-full shadow-xl"
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
              <p className="text-[10px] text-muted-foreground">الوضع المتطور نشط</p>
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

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
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
                  أهلاً بك! أنا مساعدك الذكي المتطور. يمكنني مساعدتك في تخطيط وتنفيذ مشاريعك بالكامل في <span className="text-primary font-semibold">"{currentProjectName}"</span>.
                </p>
                <div className="grid grid-cols-1 gap-2 px-4 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setInput('خطط لمشروع تطبيق توصيل طلبات مع المهام والتبعيات')} className="text-xs justify-start hover:bg-primary/5 transition-colors">
                    <Play className="h-3 w-3 ml-2 text-primary" />
                    خطط لمشروع جديد كامل
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setInput('حلل المهام الحالية واقترح تحسينات للأولوية والتبعيات')} className="text-xs justify-start hover:bg-primary/5 transition-colors">
                    <Sparkles className="h-3 w-3 ml-2 text-primary" />
                    تحليل وتحسين المشروع
                  </Button>
                </div>
              </motion.div>
            )}

            {messages.map((m, i) => (
              <motion.div
                key={`${m.role}-${i}`}
                layout
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={messageVariants}
                className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    m.role === 'user' ? 'bg-muted' : 'bg-primary/20 text-primary'
                  }`}>
                    {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                  <div className="space-y-3">
                    {m.content && (
                      <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                        m.role != 'user'
                          ? 'bg-muted/80 text-foreground rounded-tr-none shadow-sm border border-border/50'
                          : 'bg-primary text-primary-foreground rounded-tl-none shadow-md'
                      }`}>
                        {m.role === 'user' ? (
                          m.content
                        ) : (
                          <div className="markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}

                    {m.proposals && m.proposals.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Play className="w-2.5 h-2.5" /> خطة العمل المقترحة
                          </p>
                          {m.proposals.some(p => p.status === 'pending') && (
                            <Button
                              variant="link"
                              className="h-auto p-0 text-[10px] text-primary hover:no-underline font-bold"
                              onClick={() => handleExecuteAll(m.proposals!)}
                            >
                              تنفيذ الخطة بالكامل
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {m.proposals.map(renderProposal)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-end"
              >
                <div className="flex gap-2 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center animate-pulse">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-primary/10 p-3.5 rounded-2xl rounded-tl-none flex gap-2 items-center h-11 shadow-sm border border-primary/10">
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
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اطلب تنفيذ خطة عمل..."
            className="w-full flex h-11 rounded-xl border border-primary/20 bg-muted/30 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-12 transition-all group-hover:bg-muted/50"
            disabled={isLoading}
          />
          <Button
            size="icon"
            variant="ghost"
            className={`absolute left-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg transition-all ${
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
            المساعد في الوضع المتقدم يمكنه تنفيذ عمليات متعددة الخطوات.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
