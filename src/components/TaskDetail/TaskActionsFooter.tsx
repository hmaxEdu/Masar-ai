// src/components/task-detail/TaskActionsFooter.tsx
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface TaskActionsFooterProps {
  onDelete: () => void;
  onClose: () => void;
}

export function TaskActionsFooter({ onDelete, onClose }: TaskActionsFooterProps) {
  return (
    <div className="flex flex-row justify-between items-center mt-8 border-t pt-4 gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" /> Delete Task
      </Button>
      <Button onClick={onClose} variant="secondary">
        Close
      </Button>
    </div>
  );
}