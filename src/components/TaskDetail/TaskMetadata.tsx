// src/components/task-detail/TaskMetadata.tsx
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
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-muted-foreground">Status</Label>
        <Select
          value={task.status}
          disabled={task.status === "Blocked"}
          onValueChange={(v) => onUpdate({ status: v as TaskStatus })}
        >
          <SelectTrigger className={task.status === "Blocked" ? "border-destructive" : ""}>
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
          onValueChange={(v) => onUpdate({ priority: parseInt(v) })}
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
          value={format(new Date(task.started_at), "yyyy-MM-dd'T'HH:mm")}
          onChange={(e) =>
            onUpdate({ started_at: new Date(e.target.value).toISOString() })
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
            onUpdate({
              finished_at: e.target.value ? new Date(e.target.value).toISOString() : undefined,
            })
          }
          className="text-xs"
          placeholder="Not finished yet"
        />
      </div>

      {/* Blocked By */}
      <div className="space-y-2 border-t pt-4">
        <Label className="text-muted-foreground text-xs">Blocked By</Label>
        <div className="space-y-1">
          {blockingMe.map((dep) => {
            const blocker = allTasks.find((t) => t.id === dep.blocking_task_id);
            return (
              <div
                key={dep.id}
                className="flex items-center justify-between text-xs bg-destructive/5 text-destructive p-2 rounded border border-destructive/10 group"
              >
                <span className="truncate font-medium">{blocker?.title || "Unknown Task"}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-destructive hover:text-white"
                  onClick={() => onRemoveDependency(dep.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
          <Select onValueChange={(v) => onAddDependency(v)}>
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

      {/* Blocking These Tasks */}
      <div className="space-y-2 border-t pt-4">
        <Label className="text-muted-foreground text-xs">Blocking These Tasks</Label>
        <div className="space-y-1">
          {iAmBlocking.length > 0 ? (
            iAmBlocking.map((dep) => {
              const blocked = allTasks.find((t) => t.id === dep.blocked_task_id);
              return (
                <div key={dep.id} className="text-xs bg-muted p-2 rounded flex items-center gap-2">
                  <LinkIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{blocked?.title || "Unknown Task"}</span>
                </div>
              );
            })
          ) : (
            <p className="text-[10px] text-muted-foreground italic">Not blocking any tasks.</p>
          )}
        </div>
      </div>
    </div>
  );
}