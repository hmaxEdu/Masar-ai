// src/components/TaskDetail/TaskHeader.tsx
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

export default function TaskHeader({ task, onUpdate }: TaskHeaderProps) {
  const members = useProjectMembers(task.project_id);

  return (
    <div className="mb-4 space-y-2 border-b border-border/40 pb-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded">
            TASK #{task.id.slice(0, 8)}
          </Badge>
          {task.status === "Blocked" && (
            <Badge variant="destructive" className="flex gap-1 animate-pulse text-[9px] px-1.5 py-0 rounded">
              <AlertCircle className="h-3 w-3" /> BLOCKED
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 shrink-0">Assignee:</Label>
          <Select
            value={task.assignee_id || "unassigned"}
            onValueChange={(v) => onUpdate({ assignee_id: v === "unassigned" ? undefined : v })}
          >
            <SelectTrigger className="h-7 w-[160px] text-[10px] font-semibold bg-background/50 border-border/50 focus:ring-1 focus:ring-primary/30">
              <div className="flex items-center gap-1.5">
                <User className="h-3 w-3 text-muted-foreground" />
                <SelectValue placeholder="Unassigned" />
              </div>
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="unassigned" className="text-xs">Unassigned</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.profiles.id} value={m.profiles.id} className="text-xs">
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
        className="text-base font-bold border-none px-0 focus-visible:ring-0 h-auto text-foreground/95 bg-transparent placeholder:text-muted-foreground/50 tracking-tight"
        placeholder="Task Title"
      />
    </div>
  );
}