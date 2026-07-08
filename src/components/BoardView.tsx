// src/components/BoardView.tsx
import { useState, useMemo, useCallback } from 'react';
import { useTasks, masarActions } from '@/hooks/use-masar';
import { type Task, type TaskStatus } from '@/lib/supabase';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, AlertCircle, KanbanSquare, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const COLUMNS: TaskStatus[] = ['To Do', 'Doing', 'Done', 'Blocked'];

// ============================================================================
// SORTABLE TASK CARD 
// ============================================================================
function SortableTaskCard({ task, onClick }: { task: Task; onClick: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id, 
    data: { type: 'Task', task } 
  });
  
  const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.35 : 1 };

  return (
    <div
      ref={setNodeRef} style={style} 
      onClick={() => onClick(task.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(task.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}`}
      className={`group relative flex flex-col gap-1.5 p-2.5 bg-card rounded-md shadow-2xs border border-border/40 cursor-pointer hover:border-primary/45 hover:shadow-xs transition-all z-10 focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none outline-none ${task.status === 'Blocked' ? 'border-destructive/30 bg-destructive/5' : ''}`}
    >
      <div className="flex items-start justify-between gap-1.5">
        <h4 className="text-xs font-semibold leading-normal line-clamp-2 text-foreground/90">{task.title}</h4>
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground/30 hover:text-foreground/80 shrink-0 touch-none outline-none rounded transition-colors" 
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-0.5">
        <Badge variant="outline" className="text-[10px] px-1 py-0 rounded-xs">P{task.priority}</Badge>
        {task.status === 'Blocked' && <AlertCircle className="h-3 w-3 text-destructive animate-pulse" />}
      </div>
    </div>
  );
}

// ============================================================================
// COLUMN DROP AREA 
// ============================================================================
function ColumnDropArea({ id, tasks, onTaskClick, projectId }: { id: TaskStatus, tasks: Task[], onTaskClick: (id: string) => void, projectId: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const saveTask = useCallback(async (title: string) => {
    if (!title.trim()) {
      setIsAdding(false);
      return;
    }
    try {
      await masarActions.addTask({
        project_id: projectId,
        title: title,
        description: '',
        started_at: new Date().toISOString(),
        priority: 3,
        status: id
      });
      setNewTaskTitle("");
      setIsAdding(false);
      toast.success("Task added successfully");
    } catch (err) {
      toast.error("Failed to add task");
    }
  }, [projectId, id]);

  const handleQuickAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveTask(newTaskTitle);
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTaskTitle("");
    }
  };

  return (
    <div className={`flex flex-col w-[260px] min-w-[240px] h-full rounded-lg border overflow-hidden shrink-0 transition-all ${isOver ? 'bg-primary/5 border-primary/25 shadow-xs' : 'bg-muted/10 border-border/45'}`}>
      <div className="p-2.5 border-b border-border/30 bg-muted/20 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground/60">{id}</h3>
        <span className="text-[11px] font-bold text-muted-foreground/80 bg-muted/50 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 p-2.5 overflow-y-auto">
        <SortableContext id={id} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5 min-h-[150px] h-full pb-10">
            {tasks.map(task => (
              <SortableTaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))}
            
            {/* FIX: Improved UX onBlur handling saves work instead of deleting */}
            {isAdding ? (
              <div className="p-1.5 bg-card rounded-md border border-primary/40 shadow-2xs flex items-center mt-1">
                <Input 
                  autoFocus
                  placeholder="Task title (Enter)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleQuickAdd}
                  onBlur={() => {
                     if (newTaskTitle.trim()) saveTask(newTaskTitle);
                     else setIsAdding(false);
                  }}
                  className="h-7 text-xs border-none bg-transparent shadow-none focus-visible:ring-0 px-1 py-0"
                />
              </div>
            ) : (
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 w-full p-1.5 mt-1 text-[11px] font-medium text-muted-foreground/80 hover:text-foreground hover:bg-muted/30 rounded-md transition-colors group outline-none focus-visible:ring-1 ring-primary/40"
              >
                <Plus className="h-3.5 w-3.5 group-hover:text-primary transition-colors" /> Add Task
              </button>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export default function BoardView({ projectId, onTaskClick }: { projectId: string; onTaskClick: (taskId: string) => void }) {
  const { tasks, setTasks } = useTasks(projectId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = useMemo(() => {
    const cols: Record<TaskStatus, Task[]> = { 'To Do': [], 'Doing': [], 'Done': [], 'Blocked': [] };
    tasks.filter(t => !t.parent_id).forEach(task => {
      if (cols[task.status]) cols[task.status].push(task);
    });
    return cols;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const isOverColumn = COLUMNS.includes(overId as TaskStatus);
    const overTask = tasks.find(t => t.id === overId);
    const newStatus = isOverColumn ? (overId as TaskStatus) : overTask?.status;

    if (newStatus && newStatus !== activeTask.status) {
      if (activeTask.status === 'Blocked' || newStatus === 'Blocked') {
        toast.info("Blocked status is managed automatically via task dependencies.");
        return;
      }
      
      const oldStatus = activeTask.status;
      setTasks(prevTasks => prevTasks.map(t => t.id === activeId ? { ...t, status: newStatus } : t));

      try {
        await masarActions.updateTask(activeId, { status: newStatus });
      } catch (error) {
        toast.error("Failed to move task");
        setTasks(prevTasks => prevTasks.map(t => t.id === activeId ? { ...t, status: oldStatus } : t));
      }
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center max-w-xs text-center">
          <div className="h-9 w-9 bg-muted/40 border border-border/30 rounded-md flex items-center justify-center text-muted-foreground/60 mb-2.5">
            <KanbanSquare className="h-4.5 w-4.5" />
          </div>
          <h3 className="text-xs font-bold tracking-tight text-foreground/90 mb-1">
            This board is a clean slate
          </h3>
          <p className="text-[11px] text-muted-foreground/80 leading-normal mb-3">
            Break down your project into manageable steps.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px] px-2.5 font-bold"
            onClick={() => document.getElementById('create-task-trigger')?.click()}
          >
            Add First Task
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full overflow-x-auto pb-4" dir="ltr">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 sm:gap-4 h-full min-w-max">
          {COLUMNS.map(columnId => (
            <ColumnDropArea key={columnId} id={columnId} tasks={columns[columnId]} onTaskClick={onTaskClick} projectId={projectId} />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="p-2.5 bg-card rounded-md shadow-md border border-primary rotate-1.5 scale-[1.02] cursor-grabbing opacity-90 z-50">
              <h4 className="text-xs font-semibold leading-normal text-foreground/90">{activeTask.title}</h4>
              <Badge variant="outline" className="mt-1.5 text-[10px] px-1 py-0">P{activeTask.priority}</Badge>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}