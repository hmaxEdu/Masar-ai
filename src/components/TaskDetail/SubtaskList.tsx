// src/components/task-detail/SubtaskList.tsx
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { Task } from "@/lib/supabase";
import { ChevronRight, Loader2, Plus, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface SubtaskListProps {
  task: Task;
  childTasks: Task[];
  onSubtaskStatusChange: (subtaskId: string, newStatus: "To Do" | "Done") => void;
  onSubtaskEdit: (subtaskId: string) => void;
  onSubtaskDelete: (subtaskId: string) => void;
  onAddSubtask: (title: string) => void;
}

export function SubtaskList({
  task,
  childTasks,
  onSubtaskStatusChange,
  onSubtaskEdit,
  onSubtaskDelete,
  onAddSubtask,
}: SubtaskListProps) {
  const [newChildTask, setNewChildTask] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const completedChildren = childTasks.filter((t) => t.status === "Done").length;
  const progress = childTasks.length > 0 ? (completedChildren / childTasks.length) * 100 : task.status === "Done" ? 100 : 0;

  const handleAIBreakdown = async () => {
    setIsGeneratingAI(true);
    try {
      const { generateSubtasks } = await import("@/lib/ai");
      const generatedTasks = await generateSubtasks(task.title, task.description);
      for (const title of generatedTasks) {
        await onAddSubtask(title);
      }
    } catch (err: any) {
      alert(`AI Breakdown Failed: ${err.message}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildTask.trim()) return;
    onAddSubtask(newChildTask);
    setNewChildTask("");
  };

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex justify-between items-center">
        <Label>Sub-tasks ({completedChildren}/{childTasks.length})</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px] font-medium gap-1.5 px-3 border-primary/20 hover:bg-primary/10 text-primary shadow-sm transition-all"
            onClick={handleAIBreakdown}
            disabled={isGeneratingAI}
          >
            {isGeneratingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {isGeneratingAI ? <Shimmer>Thinking...</Shimmer> : "AI Breakdown"}
          </Button>
          <span className="text-xs font-bold text-primary ml-1">{Math.round(progress)}%</span>
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
                onCheckedChange={(checked) =>
                  onSubtaskStatusChange(s.id, checked ? "Done" : "To Do")
                }
              />
              <span
                className={`flex-1 cursor-pointer text-sm ${
                  s.status === "Done" ? "line-through text-muted-foreground" : ""
                }`}
                onClick={() => onSubtaskEdit(s.id)}
              >
                {s.title}
              </span>
              <div className="flex items-center opacity-0 group-hover:opacity-100 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground"
                  onClick={() => onSubtaskEdit(s.id)}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => onSubtaskDelete(s.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <form onSubmit={handleAdd} className="flex gap-2 pt-2">
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
  );
}