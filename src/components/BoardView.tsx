import { useState, useMemo } from 'react';
import { useTasks, masarActions } from '@/hooks/use-masar';
import { type Task, type TaskStatus } from '@/lib/supabase';
import { 
  DndContext, DragOverlay, closestCorners, KeyboardSensor, 
  PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, useDroppable 
} from '@dnd-kit/core';
import { 
  SortableContext, sortableKeyboardCoordinates, 
  verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { GripVertical, AlertCircle } from 'lucide-react';

const COLUMNS: TaskStatus[] = ['To Do', 'Doing', 'Done', 'Blocked'];

// --- Individual Sortable Task Card ---
function SortableTaskCard({ task, onClick }: { task: Task; onClick: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id, 
    data: { type: 'Task', task } 
  });
  
  // FIX 1: Use CSS.Translate instead of Transform to prevent visual squishing bugs
  const style = { 
    transform: CSS.Translate.toString(transform), 
    transition, 
    opacity: isDragging ? 0.3 : 1 
  };

  return (
    <div
      ref={setNodeRef} style={style} onClick={() => onClick(task.id)}
      className={`group relative flex flex-col gap-2 p-3 bg-card rounded-lg shadow-sm border border-border cursor-pointer hover:border-primary/50 hover:shadow-md transition-all z-10 ${task.status === 'Blocked' ? 'border-destructive/50 bg-destructive/5' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-tight line-clamp-2">{task.title}</h4>
        {/* Only the Grip icon acts as the drag handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -mr-2 -mt-1 text-muted-foreground hover:text-foreground shrink-0 touch-none" onClick={e => e.stopPropagation()}>
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

// --- FIX 2: Create a Dedicated Droppable Column Component ---
function ColumnDropArea({ id, tasks, onTaskClick }: { id: TaskStatus, tasks: Task[], onTaskClick: (id: string) => void }) {
  // This makes the entire empty column a valid target!
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className={`flex flex-col w-[300px] h-full rounded-xl border overflow-hidden shrink-0 transition-colors ${isOver ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border/50'}`}>
      <div className="p-3 border-b border-border/50 bg-muted/50 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{id}</h3>
        <Badge variant="secondary" className="text-xs">{tasks.length}</Badge>
      </div>
      
      {/* ref={setNodeRef} is applied to the scrollable area */}
      <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto">
        <SortableContext id={id} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[150px] h-full pb-10">
            {tasks.map(task => (
              <SortableTaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

// --- Main Board Component ---
export default function BoardView({ projectId, onTaskClick }: { projectId: string; onTaskClick: (taskId: string) => void }) {
  const { tasks, setTasks } = useTasks(projectId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure sensors to allow clicking inside cards without instantly dragging
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
        alert("Blocked status is managed automatically via task dependencies.");
        return;
      }
      
      const oldStatus = activeTask.status;

      // OPTIMISTIC UI UPDATE: Instantly move the card locally
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === activeId ? { ...t, status: newStatus } : t)
      );

      try {
        // Perform the background network request
        await masarActions.updateTask(activeId, { status: newStatus });
      } catch (error) {
        // ROLLBACK: If the DB fails, move it back and alert the user
        console.error("Optimistic update failed:", error);
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === activeId ? { ...t, status: oldStatus } : t)
        );
      }
    }
  };
  return (
    <div className="h-full w-full overflow-x-auto pb-4" dir="ltr">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map(columnId => (
            <ColumnDropArea 
              key={columnId} 
              id={columnId} 
              tasks={columns[columnId]} 
              onTaskClick={onTaskClick} 
            />
          ))}
        </div>

        {/* The floating card that follows your mouse */}
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