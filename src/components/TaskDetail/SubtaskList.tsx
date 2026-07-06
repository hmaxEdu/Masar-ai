// src/components/TaskDetail/SubtaskList.tsx
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
    <div className="space-y-2.5 p-3.5 bg-muted/20 rounded-lg border border-border/40 shadow-2xs">
      <div className="flex justify-between items-center">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Subtasks ({completedChildren}/{childTasks.length})
        </Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6.5 text-[9px] font-bold gap-1 px-2.5 border-primary/25 hover:bg-primary/10 text-primary shadow-2xs rounded-md transition-all"
            onClick={handleAIBreakdown}
            disabled={isGeneratingAI}
          >
            {isGeneratingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {isGeneratingAI ? <Shimmer>Thinking...</Shimmer> : "AI Breakdown"}
          </Button>
          <span className="text-[10px] font-bold text-primary ml-1">{Math.round(progress)}%</span>
        </div>
      </div>
      <Progress value={progress} className="h-1.5" />
      <div className="space-y-1.5 max-h-[180px] overflow-y-auto pl-0.5 pr-1">
        <AnimatePresence>
          {childTasks.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 group bg-card border border-border/30 p-1.5 rounded-md hover:border-primary/25 transition-colors"
            >
              <Checkbox
                checked={s.status === "Done"}
                onCheckedChange={(checked) =>
                  onSubtaskStatusChange(s.id, checked ? "Done" : "To Do")
                }
              />
              <span
                className={`flex-1 cursor-pointer text-xs font-semibold text-foreground/90 ${
                  s.status === "Done" ? "line-through text-muted-foreground/50" : ""
                }`}
                onClick={() => onSubtaskEdit(s.id)}
              >
                {s.title}
              </span>
              <div className="flex items-center opacity-0 group-hover:opacity-100 gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground/60 hover:text-foreground"
                  onClick={() => onSubtaskEdit(s.id)}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive/70 hover:text-destructive"
                  onClick={() => onSubtaskDelete(s.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <form onSubmit={handleAdd} className="flex gap-2 pt-1 border-t border-border/30">
        <Input
          placeholder="Add a subtask..."
          value={newChildTask}
          onChange={(e) => setNewChildTask(e.target.value)}
          className="h-8 text-xs bg-background/50 border-border/50 py-0 focus-visible:ring-1 focus-visible:ring-primary/30"
        />
        <Button type="submit" size="sm" variant="secondary" className="h-8 w-8 p-0 shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}