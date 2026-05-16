// src/components/AIAgent.tsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Send, Loader2, 
  Sparkles, Wrench, CheckSquare, Link as LinkIcon, Trash2, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTasks, masarActions, useProjectMembers } from '@/hooks/use-masar';
import { sendAgentTurn } from '@/lib/ai';
import ReactMarkdown from 'react-markdown';

// --- SATISFYING WORD-BY-WORD REVEALER ---
const StreamingMarkdown = ({ content, isLatest }: { content: string, isLatest: boolean }) => {
  const [displayedWords, setDisplayedWords] = useState(isLatest ? 0 : content.split(' ').length);
  const words = useMemo(() => content.split(' '), [content]);

  // If it's the latest message, simulate the stream
  useEffect(() => {
    if (!isLatest) return;
    
    // Reset if content changes
    setDisplayedWords(0);

    const timer = setInterval(() => {
      setDisplayedWords((prev) => {
        if (prev >= words.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 40); // Speed of the word-by-word reveal

    return () => clearInterval(timer);
  }, [content, isLatest, words.length]);

  const wordVariants = {
    hidden: { opacity: 0, y: 5, filter: 'blur(8px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  // If not latest, just show standard markdown
  if (!isLatest) {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {/* 
        We slice the array to only show words up to 'displayedWords' 
        This creates the actual "streaming" visual growth
      */}
      {words.slice(0, displayedWords).map((word, i) => (
        <motion.span
          key={`${i}-${word}`}
          initial="hidden"
          animate="visible"
          variants={wordVariants}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {word}{' '}
        </motion.span>
      ))}
    </div>
  );
};

const ToolUI: Record<string, { icon: React.ElementType, label: string, color: string }> = {
  create_tasks: { icon: CheckSquare, label: 'Creating tasks', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  update_task_status: { icon: LayoutDashboard, label: 'Updating board', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  set_dependency: { icon: LinkIcon, label: 'Linking dependencies', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  delete_task: { icon: Trash2, label: 'Removing task', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
};

export default function AIAgent({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([{ 
    role: 'assistant', 
    content: "Hi! I'm Masar AI. I can manage your board, organize tasks, or build project plans. How can I help?" 
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { tasks } = useTasks(projectId);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  const members = useProjectMembers(projectId);
  useEffect(() => { 
    scrollToBottom(); 
  }, [messages, isLoading, agentStatus]);

const tools = [
  { type: "function", function: { name: "create_tasks", description: "Creates one or many new tasks.", parameters: { type: "object", properties: { tasks: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, priority: { type: "integer" } } } } } } } },
  { type: "function", function: { name: "update_task_status", description: "Moves a task to a different column.", parameters: { type: "object", properties: { taskId: { type: "string" }, newStatus: { type: "string", enum: ["To Do", "Doing", "Done"] } } } } },
  { type: "function", function: { name: "set_dependency", description: "Creates a dependency where one task blocks another.", parameters: { type: "object", properties: { blockingTaskId: { type: "string" }, blockedTaskId: { type: "string" } }, required: ["blockingTaskId", "blockedTaskId"] } } },
  { type: "function", function: { name: "delete_task", description: "Permanently removes a task.", parameters: { type: "object", properties: { taskId: { type: "string" } }, required: ["taskId"] } } },
  // --- NEW TOOL ---
  { 
    type: "function", 
    function: { 
      name: "assign_task", 
      description: "Assigns a task to a team member using their User ID.", 
      parameters: { 
        type: "object", 
        properties: { 
          taskId: { type: "string" }, 
          assigneeId: { type: "string", description: "The UUID of the project member." } 
        }, 
        required: ["taskId", "assigneeId"] 
      } 
    } 
  }
];

const handleSend = async () => {
  if (!input.trim() || isLoading) return;

  // 3. Update context to include team members
  const projectContext = JSON.stringify({
    tasks: tasks.map(t => ({ id: t.id, title: t.title, status: t.status, priority: t.priority })),
    team: members.map(m => ({ id: m.profiles.id, email: m.profiles.email })) // AI now knows WHO is in the project
  });

  const systemMessage = {
    role: 'system',
    content: `You are Masar Agent. Use the available tools to manage the project. 
    CURRENT PROJECT DATA: ${projectContext}`
  };

  const userMsg = { role: 'user', content: input };
  let currentHistory = [...messages, userMsg];

  setMessages(currentHistory);
  setInput('');
  setIsLoading(true);
  setAgentStatus("Thinking...");

  try {
    let isAgentDone = false;
    let loopCount = 0;

    while (!isAgentDone && loopCount < 5) {
      loopCount++;
      // 3. Send the systemMessage (with the task list) + history
      const aiMessage = await sendAgentTurn([systemMessage, ...currentHistory], tools);
        currentHistory = [...currentHistory, aiMessage];
        setMessages([...currentHistory]);

        if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
          setAgentStatus("Executing actions...");
          for (const toolCall of aiMessage.tool_calls) {
            const args = toolCall.function.arguments;
            const toolName = toolCall.function.name;

            if (toolName === 'create_tasks') {
              for (const t of args.tasks || []) {
                await masarActions.addTask({ project_id: projectId, title: t.title, description: t.description || "", priority: t.priority || 3, status: 'To Do', started_at: new Date().toISOString() });
              }
            }
            if (toolName === 'update_task_status') {
              await masarActions.updateTask(args.taskId, { status: args.newStatus });
            }
            if (toolName === 'set_dependency') {
              await masarActions.addDependency(args.blockingTaskId, args.blockedTaskId);
            }
            if (toolName === 'delete_task') {
              await masarActions.deleteTask(args.taskId);
            }
            currentHistory = [...currentHistory, { role: 'tool', name: toolName, content: `Done.` }];
          }
          setMessages([...currentHistory]);
        } else {
          isAgentDone = true;
        }
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${error.message}` }]);
    } finally {
      setIsLoading(false);
      setAgentStatus(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <motion.div
        layout
        className={`relative flex flex-col origin-bottom-right overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen 
          ? "w-[calc(100vw-2rem)] sm:w-[380px] h-[600px] max-h-[calc(100vh-6rem)] bg-background/90 backdrop-blur-xl border border-border/50 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl rounded-[24px]"
          : "w-14 h-14 bg-primary text-primary-foreground cursor-pointer shadow-lg shadow-primary/30 rounded-[28px]"
        }`}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="fab"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex items-center justify-center w-full h-full"
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col w-full h-full"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-border/40 shrink-0 bg-background/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-[13px] leading-tight">Masar AI</h3>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                      </span>
                      Ready
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth">
                {messages.map((msg, idx) => {
                  if (msg.role === 'system' || msg.role === 'tool') return null;
                  const isUser = msg.role === 'user';
                  // Identify if this is the absolute last assistant message
                  const isLatestAssistant = !isUser && idx === messages.length - 1;

                  return (
                    <div key={idx} className="flex flex-col gap-1.5 w-full">
                      {msg.tool_calls && (
                        <div className="flex flex-col gap-2 mb-2 ml-9">
                          {msg.tool_calls.map((tool: any, tIdx: number) => {
                            const ui = ToolUI[tool.function.name] || { icon: Wrench, label: 'Running task', color: 'text-primary bg-primary/10 border-primary/20' };
                            const Icon = ui.icon;
                            return (
                              <motion.div layout initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={tIdx} className={`flex items-center gap-2 text-[11px] font-medium px-2.5 py-1.5 rounded-md border w-fit ${ui.color}`}>
                                <Icon className="h-3 w-3" /> 
                                {ui.label}...
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className={`flex gap-3 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isUser && (
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/10">
                            <Sparkles className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div className={`px-4 py-2 text-[13px] leading-relaxed max-w-[85%] ${isUser ? 'bg-muted/80 text-foreground rounded-2xl rounded-tr-sm border border-border/50 shadow-sm' : 'text-foreground'}`}>
                          <StreamingMarkdown 
                            content={msg.content} 
                            isLatest={isLatestAssistant} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <AnimatePresence>
                  {isLoading && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 w-full">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5 border border-primary/10">
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground py-1.5 animate-pulse">
                        {agentStatus || "Thinking..."}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-background/50 border-t border-border/40 shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
                  <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Message Masar AI..." 
                    className="w-full pr-11 bg-muted/50 border-transparent rounded-[16px] h-11 text-[13px] transition-all" 
                    disabled={isLoading} 
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!input.trim() || isLoading} 
                    className="absolute right-1.5 h-8 w-8 rounded-xl bg-primary text-primary-foreground shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5 ml-0.5" />
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}