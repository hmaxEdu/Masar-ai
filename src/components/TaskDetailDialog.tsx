import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  masarActions,
  useDependencies,
  useProjectMembers,
  useTask,
  useTasks,
} from "@/hooks/use-masar";
import { type Task, type TaskStatus } from "@/lib/supabase";
import { format } from "date-fns";
import {
  AlertCircle,
  ChevronRight,
  Link as LinkIcon,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import RichTextEditor from "./RichTextEditor";
import { Shimmer } from "@/components/ai-elements/shimmer";

interface TaskDetailDialogProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetailDialog({
  taskId,
  isOpen,
  onClose,
}: TaskDetailDialogProps) {
  const { task, loading: taskLoading, setTask } = useTask(taskId);
  const { tasks: allTasks, setTasks: setAllTasks } = useTasks(
    task?.project_id || "all",
  );
  const members = useProjectMembers(task?.project_id);
  const { blockingMe, iAmBlocking } = useDependencies(taskId || "");

  const [newChildTask, setNewChildTask] = useState("");
  const [editingChildTaskId, setEditingChildTaskId] = useState<string | null>(
    null,
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const childTasks = useMemo(
    () => allTasks.filter((t) => t.parent_id === taskId),
    [allTasks, taskId],
  );

  const completedChildren = childTasks.filter(
    (t) => t.status === "Done",
  ).length;
  const progress =
    childTasks.length > 0
      ? (completedChildren / childTasks.length) * 100
      : task?.status === "Done"
        ? 100
        : 0;

  const availableTasksToBlock = useMemo(
    () =>
      allTasks.filter(
        (t) =>
          t.id !== taskId &&
          !blockingMe.some((d) => d.blocking_task_id === t.id),
      ),
    [allTasks, taskId, blockingMe],
  );

  const handleUpdate = async (changes: Partial<Task>) => {
    if (!taskId || !task) return;

    // Optimistic Update for the active task
    const oldTask = { ...task };
    setTask({ ...task, ...changes } as Task);

    try {
      await masarActions.updateTask(taskId, changes);
    } catch (error) {
      // Rollback on failure
      setTask(oldTask);
      console.log(error);
    }
  };

  const handleAddChildTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildTask.trim() || !task) return;
    await masarActions.addTask({
      project_id: task.project_id,
      parent_id: task.id,
      title: newChildTask,
      description: "",
      started_at: new Date().toISOString(),
      priority: 3,
      status: "To Do",
    });
    setNewChildTask("");
  };
  const handleAIBreakdown = async () => {
    if (!task) return;
    setIsGeneratingAI(true);
    try {
      // Dynamic import to keep bundle size small if AI isn't used immediately
      const { generateSubtasks } = await import("@/lib/ai");

      const generatedTasks = await generateSubtasks(
        task.title,
        task.description,
      );

      if (generatedTasks.length === 0) {
        throw new Error("AI returned empty subtasks.");
      }

      // Batch create the generated tasks in Supabase
      for (const title of generatedTasks) {
        await masarActions.addTask({
          project_id: task.project_id,
          parent_id: task.id,
          title: title,
          description: "",
          started_at: new Date().toISOString(),
          priority: 3,
          status: "To Do",
        });
      }
    } catch (err: any) {
      alert(
        `AI Breakdown Failed: ${err.message}\n\nPlease check your API URL and Key in Settings.`,
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };
  if (taskLoading || !isOpen) {
    if (!isOpen) return null;
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden"
          dir="ltr"
        >
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr,250px] gap-8">
              <div className="space-y-6">
                <Skeleton className="h-[200px] w-full rounded-md" />
                <Skeleton className="h-[150px] w-full rounded-md" />
              </div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0"
        dir="ltr"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-y-auto p-6"
        >
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px]">
                  TASK #{task.id.slice(0, 8)}
                </Badge>
                {task.status === "Blocked" && (
                  <Badge
                    variant="destructive"
                    className="flex gap-1 animate-pulse"
                  >
                    <AlertCircle className="h-3 w-3" /> BLOCKED
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">
                  Assignee:
                </Label>
                <Select
                  value={task.assignee_id || "unassigned"}
                  onValueChange={(v) =>
                    handleUpdate({
                      assignee_id: v === "unassigned" ? undefined : v,
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-[180px] text-[11px]">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <SelectValue placeholder="Unassigned" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.profiles.id} value={m.profiles.id}>
                        {m.profiles.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogTitle>
              <Input
                value={task.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="text-2xl font-bold border-none px-0 focus-visible:ring-0 h-auto"
                placeholder="Task Title"
              />
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  Description
                </Label>
                <RichTextEditor
                  content={task.description}
                  onChange={(content) => handleUpdate({ description: content })}
                  placeholder="Describe this task..."
                />
              </div>

              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex justify-between items-center">
                  <Label>
                    Sub-tasks ({completedChildren}/{childTasks.length})
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] font-medium gap-1.5 px-3 border-primary/20 hover:bg-primary/10 text-primary shadow-sm transition-all"
                      onClick={handleAIBreakdown}
                      disabled={isGeneratingAI}
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      {isGeneratingAI ? <Shimmer>Thinking...</Shimmer> : "AI Breakdown"}
                    </Button>
                    <span className="text-xs font-bold text-primary ml-1">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="space-y-2 max-h-[300px] overflow-y-auto pl-1">
                  <AnimatePresence>
                    {childTasks.map((s) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2 group bg-card p-2 rounded border"
                      >
                        <Checkbox
                          checked={s.status === "Done"}
                          onCheckedChange={async (checked) => {
                            const newStatus = checked ? "Done" : "To Do";
                            const oldStatus = s.status;

                            // Optimistically update the list of subtasks
                            setAllTasks((prev) =>
                              prev.map((t) =>
                                t.id === s.id ? { ...t, status: newStatus } : t,
                              ),
                            );

                            try {
                              await masarActions.updateTask(s.id, {
                                status: newStatus,
                              });
                            } catch (e) {
                              // Rollback on failure
                              setAllTasks((prev) =>
                                prev.map((t) =>
                                  t.id === s.id
                                    ? { ...t, status: oldStatus }
                                    : t,
                                ),
                              );
                            }
                          }}
                        />
                        <span
                          className={`flex-1 cursor-pointer text-sm ${s.status === "Done" ? "line-through text-muted-foreground" : ""}`}
                          onClick={() => setEditingChildTaskId(s.id)}
                        >
                          {s.title}
                        </span>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground"
                            onClick={() => setEditingChildTaskId(s.id)}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => masarActions.deleteTask(s.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <form onSubmit={handleAddChildTask} className="flex gap-2 pt-2">
                  <Input
                    placeholder="Add a sub-task..."
                    value={newChildTask}
                    onChange={(e) => setNewChildTask(e.target.value)}
                    className="h-9"
                  />
                  <Button type="submit" size="sm" variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Status</Label>
                <Select
                  value={task.status}
                  disabled={task.status === "Blocked"}
                  onValueChange={(v) =>
                    handleUpdate({ status: v as TaskStatus })
                  }
                >
                  <SelectTrigger
                    className={
                      task.status === "Blocked" ? "border-destructive" : ""
                    }
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="Doing">In Progress</SelectItem>
                    <SelectItem value="Done">Completed</SelectItem>
                    <SelectItem value="Blocked" disabled>
                      Blocked
                    </SelectItem>
                  </SelectContent>
                </Select>
                {task.status === "Blocked" && (
                  <p className="text-[10px] text-destructive font-bold flex gap-1 items-start">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>Complete blocking tasks first.</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Priority</Label>
                <Select
                  value={task.priority.toString()}
                  onValueChange={(v) => handleUpdate({ priority: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Critical</SelectItem>
                    <SelectItem value="2">2 - High</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="4">4 - Low</SelectItem>
                    <SelectItem value="5">5 - Backlog</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Started at</Label>
                <Input
                  type="datetime-local"
                  value={format(
                    new Date(task.started_at),
                    "yyyy-MM-dd'T'HH:mm",
                  )}
                  onChange={(e) =>
                    handleUpdate({
                      started_at: new Date(e.target.value).toISOString(),
                    })
                  }
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Finished at</Label>
                <Input
                  type="datetime-local"
                  value={
                    task.finished_at
                      ? format(new Date(task.finished_at), "yyyy-MM-dd'T'HH:mm")
                      : ""
                  }
                  onChange={(e) =>
                    handleUpdate({
                      finished_at: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    })
                  }
                  className="text-xs"
                  placeholder="Not finished yet"
                />
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label className="text-muted-foreground text-xs">
                  Blocked By
                </Label>
                <div className="space-y-1">
                  {blockingMe.map((dep) => {
                    const blocker = allTasks.find(
                      (t) => t.id === dep.blocking_task_id,
                    );
                    return (
                      <div
                        key={dep.id}
                        className="flex items-center justify-between text-xs bg-destructive/5 text-destructive p-2 rounded border border-destructive/10 group"
                      >
                        <span className="truncate font-medium">
                          {blocker?.title || "Unknown Task"}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 hover:bg-destructive hover:text-white"
                          onClick={() => masarActions.removeDependency(dep.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                  <Select
                    onValueChange={(v) =>
                      masarActions.addDependency(v, taskId!)
                    }
                  >
                    <SelectTrigger className="h-8 text-[10px] bg-muted/50">
                      <div className="flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        <SelectValue placeholder="Add blocker..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasksToBlock.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label className="text-muted-foreground text-xs">
                  Blocking These Tasks
                </Label>
                <div className="space-y-1">
                  {iAmBlocking.length > 0 ? (
                    iAmBlocking.map((dep) => {
                      const blocked = allTasks.find(
                        (t) => t.id === dep.blocked_task_id,
                      );
                      return (
                        <div
                          key={dep.id}
                          className="text-xs bg-muted p-2 rounded flex items-center gap-2"
                        >
                          <LinkIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">
                            {blocked?.title || "Unknown Task"}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic">
                      Not blocking any tasks.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-between items-center mt-8 border-t pt-4 gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete this task? This cannot be undone.",
                  )
                ) {
                  masarActions.deleteTask(taskId!);
                  onClose();
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete Task
            </Button>
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </DialogFooter>
        </motion.div>

        {editingChildTaskId !== null && (
          <TaskDetailDialog
            taskId={editingChildTaskId}
            isOpen={editingChildTaskId !== null}
            onClose={() => setEditingChildTaskId(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}