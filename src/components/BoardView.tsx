// src/components/BoardView.tsx
import { useState, useMemo } from 'react';
import { useTasks, masarActions } from '@/hooks/use-masar';
import { type Task, type TaskStatus } from '@/lib/supabase';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { GripVertical, AlertCircle, KanbanSquare, Plus } from 'lucide-react';
import EmptyState from './EmptyState';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner'; // <-- ADDED

const COLUMNS: TaskStatus[] = ['To Do', 'Doing', 'Done', 'Blocked'];

function SortableTaskCard({ task, onClick }: { task: Task; onClick: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id, 
    data: { type: 'Task', task } 
  });
  
  const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };

  return (
    <div
      ref={setNodeRef} style={style} 
      onClick={() => onClick(task.id)}
      onKeyDown={(e) => {
        // Accessibility Enhancement
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(task.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}`}
      className={`group relative flex flex-col gap-2 p-3 bg-card rounded-lg shadow-sm border border-border cursor-pointer hover:border-primary/50 hover:shadow-md transition-all z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none outline-none ${task.status === 'Blocked' ? 'border-destructive/50 bg-destructive/5' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-tight line-clamp-2">{task.title}</h4>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -mr-2 -mt-1 text-muted-foreground hover:text-foreground shrink-0 touch-none outline-none" onClick={e => e.stopPropagation()}>
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <Badge variant="outline" className="text-[10px]">P{task.priority}</Badge>
        {task.status === 'Blocked' && <AlertCircle className="h-3 w-3 text-destructive animate-pulse" />}
      </div>
    </div>
  );
}

function ColumnDropArea({ id, tasks, onTaskClick, projectId }: { id: TaskStatus, tasks: Task[], onTaskClick: (id: string) => void, projectId: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleQuickAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!newTaskTitle.trim()) {
        setIsAdding(false);
        return;
      }
      try {
        await masarActions.addTask({
          project_id: projectId,
          title: newTaskTitle,
          description: '',
          started_at: new Date().toISOString(),
          priority: 3,
          status: id
        });
        setNewTaskTitle("");
        toast.success("Task added successfully");
      } catch (err) {
        toast.error("Failed to add task");
      }
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTaskTitle("");
    }
  };

  return (
    <div className={`flex flex-col w-[300px] min-w-[280px] h-full rounded-md border overflow-hidden shrink-0 transition-colors ${isOver ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border/50'}`}>
      <div className="p-3 border-b border-border/50 bg-muted/50 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{id}</h3>
        <Badge variant="secondary" className="text-xs">{tasks.length}</Badge>
      </div>
      
      <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto">
        <SortableContext id={id} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[150px] h-full pb-10">
            {tasks.map(task => (
              <SortableTaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))}
            
            {/* INLINE QUICK ADD */}
            {isAdding ? (
              <div className="p-2 bg-card rounded-lg border border-primary/50 shadow-sm flex items-center mt-2">
                <Input 
                  autoFocus
                  placeholder="Task title (Press Enter)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleQuickAdd}
                  onBlur={() => { setIsAdding(false); setNewTaskTitle(""); }}
                  className="h-8 text-sm border-none bg-transparent shadow-none focus-visible:ring-0 px-1"
                />
              </div>
            ) : (
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 w-full p-2 mt-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors group outline-none focus-visible:ring-2 ring-primary"
              >
                <Plus className="h-4 w-4 group-hover:text-primary transition-colors" /> Add Task
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
        toast.info("Blocked status is managed automatically via task dependencies."); // <-- REPLACED ALERT
        return;
      }
      
      const oldStatus = activeTask.status;

      setTasks(prevTasks => prevTasks.map(t => t.id === activeId ? { ...t, status: newStatus } : t));

      try {
        await masarActions.updateTask(activeId, { status: newStatus });
      } catch (error) {
        toast.error("Failed to move task"); // <-- REPLACED CONSOLE ERROR
        setTasks(prevTasks => prevTasks.map(t => t.id === activeId ? { ...t, status: oldStatus } : t));
      }
    }
  };

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={KanbanSquare}
        title="This board is a clean slate"
        description="Every massive goal starts with a single task. Break down your project into manageable steps or let the AI help you plan."
        actionLabel="Add First Task"
        onAction={() => document.getElementById('create-task-trigger')?.click()}
        secondaryActionLabel="AI Breakdown"
        onSecondaryAction={() => toast.info("Open the AI Agent and say: 'Generate a task list for this project'")}
      />
    );
  }
  
  return (
    <div className="h-full w-full overflow-x-auto pb-4" dir="ltr">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map(columnId => (
            <ColumnDropArea key={columnId} id={columnId} tasks={columns[columnId]} onTaskClick={onTaskClick} projectId={projectId} />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="p-3 bg-card rounded-lg shadow-2xl border-2 border-primary rotate-3 scale-105 cursor-grabbing opacity-90 z-50">
              <h4 className="text-sm font-semibold leading-tight">{activeTask.title}</h4>
              <Badge variant="outline" className="mt-2 text-[10px]">P{activeTask.priority}</Badge>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}