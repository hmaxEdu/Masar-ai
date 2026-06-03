// src/components/task-detail/TaskHeader.tsx
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, User } from "lucide-react";
import { useProjectMembers } from "@/hooks/use-masar";
import type { Task } from "@/lib/supabase";

interface TaskHeaderProps {
  task: Task;
  onUpdate: (changes: Partial<Task>) => void;
}

export function TaskHeader({ task, onUpdate }: TaskHeaderProps) {
  const members = useProjectMembers(task.project_id);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px]">
            TASK #{task.id.slice(0, 8)}
          </Badge>
          {task.status === "Blocked" && (
            <Badge variant="destructive" className="flex gap-1 animate-pulse">
              <AlertCircle className="h-3 w-3" /> BLOCKED
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Assignee:</Label>
          <Select
            value={task.assignee_id || "unassigned"}
            onValueChange={(v) => onUpdate({ assignee_id: v === "unassigned" ? undefined : v })}
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
      <Input
        value={task.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        className="text-2xl font-bold border-none px-0 focus-visible:ring-0 h-auto"
        placeholder="Task Title"
      />
    </div>
  );
}