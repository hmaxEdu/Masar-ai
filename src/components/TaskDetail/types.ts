// src/components/task-detail/types.ts
import type { Task } from "@/lib/supabase";

export interface TaskDetailProps {
  task: Task;
  taskId: string;
  onUpdate: (changes: Partial<Task>) => Promise<void>;
  onDelete: () => void;
  onClose: () => void;
}