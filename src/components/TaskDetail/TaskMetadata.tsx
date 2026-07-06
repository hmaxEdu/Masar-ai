// src/components/TaskDetail/TaskMetadata.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Task, TaskStatus } from "@/lib/supabase";
import { format } from "date-fns";
import { AlertCircle, Link as LinkIcon, X } from "lucide-react";

interface TaskMetadataProps {
  task: Task;
  onUpdate: (changes: Partial<Task>) => void;
  blockingMe: any[];
  iAmBlocking: any[];
  allTasks: Task[];
  onAddDependency: (blockingTaskId: string) => void;
  onRemoveDependency: (depId: string) => void;
}

export function TaskMetadata({
  task,
  onUpdate,
  blockingMe,
  iAmBlocking,
  allTasks,
  onAddDependency,
  onRemoveDependency,
}: TaskMetadataProps) {
  const availableTasksToBlock = allTasks.filter(
    (t) => t.id !== task.id && !blockingMe.some((d) => d.blocking_task_id === t.id)
  );

  return (
    <div className="space-y-4 pl-3.5 border-t md:border-t-0 md:border-l border-border/40">
      
      {/* Status Select */}
      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">Status</Label>
        <Select
          value={task.status}
          disabled={task.status === "Blocked"}
          onValueChange={(v) => onUpdate({ status: v as TaskStatus })}
        >
          <SelectTrigger className={`h-8 text-xs bg-background/50 border-border/50 focus:ring-1 focus:ring-primary/30 ${task.status === "Blocked" ? "border-destructive/40" : ""}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="To Do" className="text-xs">To Do</SelectItem>
            <SelectItem value="Doing" className="text-xs">In Progress</SelectItem>
            <SelectItem value="Done" className="text-xs">Completed</SelectItem>
            <SelectItem value="Blocked" disabled className="text-xs">
              Blocked
            </SelectItem>
          </SelectContent>
        </Select>
        {task.status === "Blocked" && (
          <p className="text-[9px] text-destructive font-bold flex gap-1 items-start mt-1">
            <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
            <span>Complete blocking tasks first.</span>
          </p>
        )}
      </div>

      {/* Priority Select */}
      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">Priority</Label>
        <Select
          value={task.priority.toString()}
          onValueChange={(v) => onUpdate({ priority: parseInt(v) })}
        >
          <SelectTrigger className="h-8 text-xs bg-background/50 border-border/50 focus:ring-1 focus:ring-primary/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="1" className="text-xs">1 - Critical</SelectItem>
            <SelectItem value="2" className="text-xs">2 - High</SelectItem>
            <SelectItem value="3" className="text-xs">3 - Medium</SelectItem>
            <SelectItem value="4" className="text-xs">4 - Low</SelectItem>
            <SelectItem value="5" className="text-xs">5 - Backlog</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Started At Date */}
      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">Started at</Label>
        <Input
          type="datetime-local"
          value={format(new Date(task.started_at), "yyyy-MM-dd'T'HH:mm")}
          onChange={(e) =>
            onUpdate({ started_at: new Date(e.target.value).toISOString() })
          }
          className="h-8 text-xs bg-background/50 border-border/50 py-0 focus-visible:ring-1 focus-visible:ring-primary/30"
        />
      </div>

      {/* Finished At Date */}
      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">Finished at</Label>
        <Input
          type="datetime-local"
          value={
            task.finished_at
              ? format(new Date(task.finished_at), "yyyy-MM-dd'T'HH:mm")
              : ""
          }
          onChange={(e) =>
            onUpdate({
              finished_at: e.target.value ? new Date(e.target.value).toISOString() : undefined,
            })
          }
          className="h-8 text-xs bg-background/50 border-border/50 py-0 focus-visible:ring-1 focus-visible:ring-primary/30"
          placeholder="Not finished yet"
        />
      </div>

      {/* Blocked By List */}
      <div className="space-y-1.5 border-t border-border/30 pt-3">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">Blocked By</Label>
        <div className="space-y-1">
          {blockingMe.map((dep) => {
            const blocker = allTasks.find((t) => t.id === dep.blocking_task_id);
            return (
              <div
                key={dep.id}
                className="flex items-center justify-between text-xs bg-destructive/5 text-destructive p-1.5 rounded-md border border-destructive/10"
              >
                <span className="truncate font-semibold text-[10px] max-w-[120px]">{blocker?.title || "Unknown Task"}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-destructive/70 hover:text-white hover:bg-destructive rounded-xs shrink-0"
                  onClick={() => onRemoveDependency(dep.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
          <Select onValueChange={(v) => onAddDependency(v)}>
            <SelectTrigger className="h-7 text-[10px] bg-background/50 border-border/50 focus:ring-1 focus:ring-primary/30 py-0">
              <div className="flex items-center gap-1">
                <LinkIcon className="h-3 w-3 text-muted-foreground" />
                <SelectValue placeholder="Add blocker..." />
              </div>
            </SelectTrigger>
            <SelectContent className="text-xs">
              {availableTasksToBlock.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-xs">
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Blocking These Tasks List */}
      <div className="space-y-1.5 border-t border-border/30 pt-3">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">Blocking</Label>
        <div className="space-y-1">
          {iAmBlocking.length > 0 ? (
            iAmBlocking.map((dep) => {
              const blocked = allTasks.find((t) => t.id === dep.blocked_task_id);
              return (
                <div key={dep.id} className="text-[11px] font-medium text-foreground/80 bg-muted/30 border border-border/20 p-1.5 rounded-md flex items-center gap-1.5 truncate">
                  <LinkIcon className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                  <span className="truncate">{blocked?.title || "Unknown Task"}</span>
                </div>
              );
            })
          ) : (
            <p className="text-[10px] text-muted-foreground/60 italic font-medium px-0.5">Not blocking any tasks.</p>
          )}
        </div>
      </div>
    </div>
  );
}