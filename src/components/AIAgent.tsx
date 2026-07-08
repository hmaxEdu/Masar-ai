import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, LayoutDashboard, Link as LinkIcon, Trash2, CheckSquare, Wrench,
  Type, ArrowUpCircle, FileText, PenLine, UserPlus, UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTasks, masarActions, useProjectMembers, collaborationActions } from '@/hooks/use-masar';
import { streamAgentTurn } from '@/lib/ai';

// --- AI Elements ---
import { 
  Conversation, 
  ConversationContent, 
  ConversationEmptyState,
  ConversationScrollButton
} from "@/components/ai-elements/conversation";
import { 
  Message, 
  MessageContent, 
  MessageResponse 
} from "@/components/ai-elements/message";
import { 
  PromptInput, 
  PromptInputTextarea, 
  PromptInputSubmit, 
  PromptInputFooter,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  usePromptInputAttachments
} from "@/components/ai-elements/prompt-input";
import { 
  Tool, 
  ToolHeader 
} from "@/components/ai-elements/tool";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Attachments, Attachment, AttachmentPreview, AttachmentRemove
} from "@/components/ai-elements/attachments";
import { Image } from "@/components/ai-elements/image";

const ToolUI: Record<string, { icon: React.ElementType, label: string }> = {
  create_tasks: { icon: CheckSquare, label: 'Creating tasks' },
  update_task_status: { icon: LayoutDashboard, label: 'Updating board' },
  set_dependency: { icon: LinkIcon, label: 'Linking dependencies' },
  delete_tasks: { icon: Trash2, label: 'Removing tasks' },
  delete_task: { icon: Trash2, label: 'Removing task' },
  assign_task: { icon: Wrench, label: 'Assigning task' },
  update_task_title: { icon: Type, label: 'Renaming task' },
  update_task_priority: { icon: ArrowUpCircle, label: 'Changing priority' },
  update_task_description: { icon: FileText, label: 'Updating description' },
  rename_project: { icon: PenLine, label: 'Renaming project' },
  invite_member: { icon: UserPlus, label: 'Inviting member' },
  remove_member: { icon: UserMinus, label: 'Removing member' },
};

function InputAttachments() {
  const { files, remove } = usePromptInputAttachments();
  if (!files.length) return null;
  return (
    <Attachments className="px-4 pt-3 pb-0" variant="list">
      {files.map((file) => (
        <Attachment key={file.id} data={file} onRemove={() => remove(file.id)}>
          <AttachmentPreview />
          <div className="flex-1 text-xs truncate">{file.filename || "Image"}</div>
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}

export default function AIAgent({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);

  const { tasks } = useTasks(projectId);
  const members = useProjectMembers(projectId);

  const handleSend = async (text: string, files: any[]) => {
    if ((!text.trim() && files.length === 0) || isLoading) return;

    const base64Images = files
      .filter(f => f.mediaType?.startsWith('image/'))
      .map(f => f.url?.split(',')[1])
      .filter(Boolean);

    const activeTasksContext = tasks
      .filter(t => t.status !== 'Done')
      .slice(0, 100)
      .map(t => ({ 
        id: t.id, 
        title: t.title, 
        status: t.status, 
        priority: t.priority,
        parent_id: t.parent_id 
      }));

    const projectContext = JSON.stringify({
      tasks: activeTasksContext,
      team: members.map(m => ({ id: m.profiles.id, email: m.profiles.email, role: m.role })) 
    });

    const systemMessage = {
      role: 'system',
      content: `You are Masar Agent. Use the available tools to manage the project. 
      CURRENT PROJECT DATA: ${projectContext}`
    };

    const userMsg: any = { role: 'user', content: text };
    if (base64Images.length > 0) userMsg.images = base64Images;

    let currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    setIsLoading(true);
    setAgentStatus("Thinking...");

    try {
      let isAgentDone = false;
      let loopCount = 0;

      while (!isAgentDone && loopCount < 5) {
        loopCount++;
        let currentContent = "";
        let currentToolCalls: any[] = [];
        
        setMessages(prev => [...prev, { role: 'assistant', content: '', tool_calls: [] }]);
        const stream = streamAgentTurn([systemMessage, ...currentHistory]);
        
        for await (const chunk of stream) {
          if (chunk.message?.content) currentContent += chunk.message.content;
          if (chunk.message?.tool_calls) currentToolCalls = chunk.message.tool_calls;
          
          setMessages(prev => {
             const newMsgs = [...prev];
             newMsgs[newMsgs.length - 1] = {
               role: 'assistant',
               content: currentContent,
               tool_calls: currentToolCalls
             };
             return newMsgs;
          });
        }

        const aiMessage = { role: 'assistant', content: currentContent, tool_calls: currentToolCalls };
        currentHistory = [...currentHistory, aiMessage];

        if (currentToolCalls && currentToolCalls.length > 0) {
          setAgentStatus("Executing actions...");
          
          for (const toolCall of currentToolCalls) {
            const args = typeof toolCall.function.arguments === 'string' 
              ? JSON.parse(toolCall.function.arguments) 
              : toolCall.function.arguments;
              
            const toolName = toolCall.function.name;
            let toolResponseContent = "Successfully executed.";

            try {
              if (toolName === 'create_tasks') {
                const created = [];
                for (const t of args.tasks || []) {
                  const res = await masarActions.addTask({ 
                    project_id: projectId, 
                    title: t.title, 
                    description: t.description || "", 
                    priority: t.priority || 3, 
                    status: 'To Do', 
                    started_at: new Date().toISOString(),
                    parent_id: t.parentId
                  });
                  if (res.data) created.push({ id: res.data.id, title: t.title });
                }
                toolResponseContent = `Created tasks: ${JSON.stringify(created)}`;
              }
              else if (toolName === 'delete_tasks') {
                for (const id of args.taskIds || []) await masarActions.deleteTask(id);
                toolResponseContent = `Deleted tasks successfully.`;
              }
              else if (toolName === 'delete_task') {
                await masarActions.deleteTask(args.taskId);
                toolResponseContent = `Deleted task ${args.taskId}`;
              }
              else if (toolName === 'update_task_status') {
                await masarActions.updateTask(args.taskId, { status: args.newStatus });
              }
              else if (toolName === 'set_dependency') {
                await masarActions.addDependency(args.blockingTaskId, args.blockedTaskId);
              }
              else if (toolName === 'assign_task') {
                await masarActions.updateTask(args.taskId, { assignee_id: args.assigneeId });
              }
              else if (toolName === 'update_task_title') {
                await masarActions.updateTask(args.taskId, { title: args.title });
              }
              else if (toolName === 'update_task_priority') {
                await masarActions.updateTask(args.taskId, { priority: args.priority });
              }
              else if (toolName === 'update_task_description') {
                await masarActions.updateTask(args.taskId, { description: args.description });
              }
              else if (toolName === 'rename_project') {
                await masarActions.updateProject(projectId, { name: args.newName });
              }
              else if (toolName === 'invite_member') {
                await collaborationActions.addMember(projectId, args.email, args.role);
              }
              else if (toolName === 'remove_member') {
                const member = members.find(m => m.profiles.email === args.email);
                if (member) await collaborationActions.removeMember(member.id);
              }

              currentHistory = [...currentHistory, { role: 'tool', name: toolName, content: toolResponseContent }];
            } catch (err: any) {
              currentHistory = [...currentHistory, { role: 'tool', name: toolName, content: `Error: ${err.message}` }];
            }
          }
          setMessages([...currentHistory]);
        } else {
          isAgentDone = true;
        }
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**System Error:** ${error.message}` }]);
    } finally {
      setIsLoading(false);
      setAgentStatus(null);
    }
  };

  return (
    <div className="fixed z-50 font-sans pointer-events-none inset-0">
      
      {/* FIX: Eliminated layout prop morphing in favor of completely separate AnimatePresence modes */}
      {/* 1. Floating Action Button State */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 bg-primary text-primary-foreground shadow-lg shadow-primary/30 rounded-full flex items-center justify-center hover:scale-105 transition-transform pointer-events-auto"
          >
            <Sparkles className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. Open Chat Modal State */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full h-[100dvh] sm:w-[420px] sm:h-[650px] sm:max-h-[calc(100vh-6rem)] bg-background/95 backdrop-blur-xl sm:border border-border/50 sm:ring-1 ring-black/5 dark:ring-white/10 shadow-2xl flex flex-col sm:rounded-xl overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-border/40 shrink-0 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-[14px] sm:text-[13px] leading-tight">Masar AI</h3>
                  <span className="text-[11px] sm:text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    {agentStatus || "Online"}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8 rounded-full text-muted-foreground hover:bg-muted" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            </div>

            {/* Chat Area */}
            <Conversation className="flex-1 bg-background/50">
              <ConversationContent>
                {messages.length === 0 && (
                  <ConversationEmptyState
                    title="AI Project Assistant"
                    description="I can manage your board, invite members, edit tasks, or build plans. Ask me anything!"
                    icon={<Sparkles className="size-8 text-primary/50" />}
                  />
                )}

                {messages.map((msg, idx) => {
                  if (msg.role === 'system' || msg.role === 'tool') return null;
                  const isUser = msg.role === 'user';
                  const isLatestAssistant = !isUser && idx === messages.length - 1;

                  return (
                    <div key={idx} className="flex flex-col gap-2 w-full">
                      {msg.tool_calls?.map((tool: any, tIdx: number) => {
                        const ui = ToolUI[tool.function.name] || { label: tool.function.name, icon: Wrench };
                        return (
                          <Tool key={tIdx} className="w-10/12 ml-4 bg-muted/30">
                            <ToolHeader
                              type="dynamic-tool"
                              state={isLoading && isLatestAssistant ? "input-available" : "output-available"}
                              toolName={ui.label}
                              className="py-2.5 px-3"
                            />
                          </Tool>
                        );
                      })}

                      {(msg.content || (msg.images && msg.images.length > 0)) && (
                        <Message from={msg.role as 'user' | 'assistant'}>
                          <MessageContent>
                            {msg.images && msg.images.length > 0 && (
                              <Attachments variant="grid" className="mt-1">
                                {msg.images.map((base64: string, i: number) => (
                                  <Attachment key={i} data={{ type: 'file', mediaType: 'image/jpeg', url: '', id: `img-${i}` }}>
                                    <Image base64={base64} mediaType="image/jpeg" uint8Array={new Uint8Array()} />
                                  </Attachment>
                                ))}
                              </Attachments>
                            )}
                            
                            {isLatestAssistant && isLoading && !msg.content ? (
                              <Shimmer>Processing response...</Shimmer>
                            ) : (
                              msg.content && <MessageResponse>{msg.content}</MessageResponse>
                            )}
                          </MessageContent>
                        </Message>
                      )}
                    </div>
                  );
                })}
                
                {isLoading && agentStatus === "Thinking..." && (!messages.length || messages[messages.length - 1].role === 'user') && (
                  <Message from="assistant">
                    <MessageContent>
                      <Shimmer>Processing response...</Shimmer>
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-background border-t border-border/40 shrink-0">
              <PromptInput
                accept="image/*"
                onSubmit={(message) => handleSend(message.text, message.files)}
                className="relative flex flex-col w-full overflow-hidden border border-border/50 rounded-md bg-muted/30 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all shadow-sm"
              >
                <InputAttachments />
                <PromptInputTextarea 
                  placeholder="Message Masar AI..." 
                  className="border-none bg-transparent shadow-none focus-visible:ring-0 min-h-[44px] resize-none px-4 pt-3 pb-2 text-[16px] sm:text-[13px]" 
                  disabled={isLoading}
                />
                <PromptInputFooter className="px-2 pb-2 pt-0 justify-between items-center bg-transparent border-none shadow-none">
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                      <PromptInputActionAddScreenshot />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                  
                  <div className="flex-1 text-[10px] sm:text-xs text-muted-foreground text-right mr-2 font-medium">
                    Press <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/50 font-sans shadow-sm">Enter</kbd> to send
                  </div>
                  <PromptInputSubmit status={isLoading ? "submitted" : undefined} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}