// src/components/TaskDetailDialog.tsx (moved to task-detail folder? but keep original location)
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { masarActions, useDependencies, useTask, useTasks } from "@/hooks/use-masar";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { TaskHeader } from "./TaskHeader";
import { TaskDescriptionEditor } from "./TaskDescriptionEditor";
import { SubtaskList } from "./SubtaskList";
import { TaskMetadata } from "./TaskMetadata";
import { TaskActionsFooter } from "./TaskActionsFooter";

// Actually we need recursive nesting for subtask editing. We'll keep the dialog inside the same file but simplified.
// Better: use the same component recursively. We'll keep a separate inner component to avoid circular imports.

export default function TaskDetailDialog({
  taskId,
  isOpen,
  onClose,
}: {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { task, loading, setTask } = useTask(taskId);
  const { tasks: allTasks, setTasks: setAllTasks } = useTasks(task?.project_id || "all");
  const { blockingMe, iAmBlocking } = useDependencies(taskId || "");

  const childTasks = useMemo(
    () => allTasks.filter((t) => t.parent_id === taskId),
    [allTasks, taskId]
  );

  const handleUpdate = async (changes: Partial<any>) => {
    if (!taskId || !task) return;
    const oldTask = { ...task };
    setTask({ ...task, ...changes });
    try {
      await masarActions.updateTask(taskId, changes);
    } catch (error) {
      setTask(oldTask);
    }
  };

  const handleDelete = async () => {
    if (confirm("Delete this task? This cannot be undone.")) {
      await masarActions.deleteTask(taskId!);
      onClose();
    }
  };

  const handleAddSubtask = async (title: string) => {
    if (!task) return;
    await masarActions.addTask({
      project_id: task.project_id,
      parent_id: task.id,
      title,
      description: "",
      started_at: new Date().toISOString(),
      priority: 3,
      status: "To Do",
    });
  };

  const handleSubtaskStatusChange = async (subtaskId: string, newStatus: "To Do" | "Done") => {
    const oldStatus = allTasks.find((t) => t.id === subtaskId)?.status;
    if (!oldStatus) return; // Guard clause guarantees oldStatus is typed as TaskStatus

    setAllTasks((prev) =>
      prev.map((t) => (t.id === subtaskId ? { ...t, status: newStatus } : t))
    );
    try {
      await masarActions.updateTask(subtaskId, { status: newStatus });
    } catch (e) {
      setAllTasks((prev) =>
        prev.map((t) => (t.id === subtaskId ? { ...t, status: oldStatus } : t))
      );
    }
  };

  const handleSubtaskDelete = async (subtaskId: string) => {
    await masarActions.deleteTask(subtaskId);
  };

  const [editingChildId, setEditingChildId] = useState<string | null>(null);

  if (loading || !isOpen) {
    if (!isOpen) return null;
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!task) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="min-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <motion.div className="flex-1 overflow-y-auto p-6">
            <TaskHeader task={task} onUpdate={handleUpdate} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <TaskDescriptionEditor description={task.description} onChange={(desc) => handleUpdate({ description: desc })} />
                <SubtaskList
                  task={task}
                  childTasks={childTasks}
                  onSubtaskStatusChange={handleSubtaskStatusChange}
                  onSubtaskEdit={setEditingChildId}
                  onSubtaskDelete={handleSubtaskDelete}
                  onAddSubtask={handleAddSubtask}
                />
              </div>
              <TaskMetadata
                task={task}
                onUpdate={handleUpdate}
                blockingMe={blockingMe}
                iAmBlocking={iAmBlocking}
                allTasks={allTasks}
                onAddDependency={(blockingTaskId) => masarActions.addDependency(blockingTaskId, task.id)}
                onRemoveDependency={(depId) => masarActions.removeDependency(depId)}
              />
            </div>
            <TaskActionsFooter onDelete={handleDelete} onClose={onClose} />
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Recursive nested task dialog */}
      {editingChildId !== null && (
        <TaskDetailDialog
          taskId={editingChildId}
          isOpen={editingChildId !== null}
          onClose={() => setEditingChildId(null)}
        />
      )}
    </>
  );
}