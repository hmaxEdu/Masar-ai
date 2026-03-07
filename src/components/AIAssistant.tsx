import { useState, useRef, useEffect } from 'react';
import { useOllama, type ChatProposal } from '@/hooks/use-ollama';
import { useTasks, useProjects } from '@/hooks/use-masar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, X, Check, Trash2, Sparkles, Loader2, Play, ListChecks, ArrowLeft } from 'lucide-react';
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

  const { messages, isLoading, sendMessage, clearChat, executeProposal, executeBatch, rejectProposal } = useOllama(
    projectId === 'all' ? undefined : (projectId || undefined)
  );

  // Auto scroll to bottom
  useEffect(() => {
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
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
    const pendingIds = proposals.filter(p => p.status === 'pending').map(p => p.id);
    if (pendingIds.length === 0) return;

    await executeBatch(pendingIds);
    sendMessage("تم تنفيذ الخطة المقترحة بنجاح. كيف يمكنني مساعدتك الآن؟", { tasks, projectName: currentProjectName }, true);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const messageVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };

  const renderProposal = (p: ChatProposal, index: number) => {
    const isPending = p.status === 'pending';
    const isExecuting = p.status === 'executing';
    const isCompleted = p.status === 'completed';
    const isFailed = p.status === 'failed';
    const isRejected = p.status === 'rejected';

    if (isRejected) return null;

    return (
      <motion.div
        key={p.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`group relative flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
          isCompleted ? 'bg-green-500/5 border-green-500/20' :
          isFailed ? 'bg-destructive/5 border-destructive/20' :
          isExecuting ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' :
          'bg-background border-border hover:border-primary/20'
        }`}
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
          isCompleted ? 'bg-green-500 border-green-500 text-white' :
          isFailed ? 'bg-destructive border-destructive text-white' :
          isExecuting ? 'border-primary text-primary' :
          'border-muted-foreground/30 text-muted-foreground'
        }`}>
          {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> :
           isCompleted ? <Check className="h-3 w-3" /> :
           isFailed ? <X className="h-3 w-3" /> :
           <span className="text-[10px] font-bold">{index + 1}</span>}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium truncate ${isCompleted ? 'text-muted-foreground line-through' : ''}`}>
            {p.description}
          </p>
          {isFailed && p.error && (
            <p className="text-[9px] text-destructive mt-0.5 font-mono truncate">{p.error}</p>
          )}
        </div>

        {isPending && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => rejectProposal(p.id)}
            >
              <X className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-primary hover:bg-primary/10"
              onClick={() => executeProposal(p.id)}
            >
              <Play className="h-3 w-3" />
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
      className="w-140 border-r bg-card flex flex-col h-full shadow-2xl relative z-50"
    >
      <div className="p-4 border-b flex items-center justify-between bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">مساعد مسار</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Active Agent Mode</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={clearChat} title="مسح المحادثة" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 space-y-6"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2 rotate-3">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">كيف يمكنني مساعدتك اليوم؟</h4>
                  <p className="text-sm text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                    يمكنني تخطيط مشاريعك، إدارة المهام، وحل التبعيات المعقدة تلقائياً.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2.5 px-6">
                  <Button variant="outline" size="sm" onClick={() => setInput('خطط لمشروع تطبيق توصيل طلبات مع المهام والتبعيات')} className="h-10 text-xs justify-start px-4 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all">
                    <Play className="h-3.5 w-3.5 ml-2 text-primary" />
                    تخطيط مشروع تطبيق توصيل
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setInput('حلل المشروع الحالي واقترح تحسينات للأولوية')} className="h-10 text-xs justify-start px-4 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all">
                    <ListChecks className="h-3.5 w-3.5 ml-2 text-primary" />
                    تحليل وتحسين سير العمل
                  </Button>
                </div>
              </motion.div>
            )}

            {messages.map((m, i) => (
              <motion.div
                key={`${m.role}-${i}`}
                layout
                variants={messageVariants}
                className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex gap-3 max-w-[92%] ${m.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm mt-1 ${
                    m.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className="space-y-3 flex-1 min-w-0">
                    {m.content && (
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        m.role !== 'user'
                          ? 'bg-muted/50 text-foreground rounded-tr-none border border-border/50'
                          : 'bg-primary text-primary-foreground rounded-tl-none shadow-lg shadow-primary/10 font-medium'
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
                      <div className="bg-muted/30 rounded-2xl p-4 border border-primary/10 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-primary/5 pb-3">
                          <div className="flex items-center gap-2">
                            <ListChecks className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">خطة العمل المقترحة</span>
                          </div>
                          {m.proposals.some(p => p.status === 'pending') && (
                            <Button
                              size="sm"
                              className="h-8 rounded-lg px-4 text-[11px] font-bold shadow-md shadow-primary/20"
                              onClick={() => handleExecuteAll(m.proposals!)}
                            >
                              تنفيذ الكل
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {m.proposals.map(renderProposal)}
                        </div>
                        {m.proposals.every(p => p.status === 'completed') && (
                          <div className="flex items-center justify-center gap-2 py-1 text-green-600 bg-green-500/10 rounded-lg">
                            <Check className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold">تم التنفيذ بنجاح</span>
                          </div>
                        )}
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
                className="flex justify-end"
              >
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center animate-pulse">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted/50 p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center border border-primary/5 shadow-sm h-11">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </ScrollArea>

      <div className="p-4 border-t bg-background/80 backdrop-blur-xl">
        <div className="relative flex items-end gap-2 bg-muted/40 p-2 rounded-2xl border border-primary/10 focus-within:border-primary/40 transition-colors shadow-inner">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="اطلب تنفيذ خطة أو استفسر عن المشروع..."
            className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 text-sm py-2.5 px-2 resize-none leading-relaxed placeholder:text-muted-foreground/60"
            rows={1}
            disabled={isLoading}
          />
          <Button
            size="icon"
            className={`h-9 w-9 rounded-xl shrink-0 transition-all ${
              input.trim() ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
            }`}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-3 opacity-50">
          <Sparkles className="h-2.5 w-2.5 text-primary" />
          <p className="text-[9px] font-medium text-muted-foreground">
            المساعد يمكنه تنفيذ المهام نيابة عنك بشكل ذكي.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
