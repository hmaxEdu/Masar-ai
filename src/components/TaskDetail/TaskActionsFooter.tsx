// src/components/TaskDetail/TaskActionsFooter.tsx
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface TaskActionsFooterProps {
  onDelete: () => void;
  onClose: () => void;
}

export function TaskActionsFooter({ onDelete, onClose }: TaskActionsFooterProps) {
  return (
    <div className="flex flex-row justify-between items-center mt-6 border-t border-border/40 pt-3 gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-md font-semibold"
        onClick={onDelete}
      >
        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Task
      </Button>
      <Button onClick={onClose} variant="secondary" size="sm" className="h-8 text-xs font-semibold px-4 rounded-md">
        Close
      </Button>
    </div>
  );
}