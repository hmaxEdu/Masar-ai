import { useState, useRef, useMemo } from 'react';
import { useTasks, masarActions } from '@/hooks/use-masar';
import { Button } from '@/components/ui/button';
import { format, addHours, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfDay, endOfDay, eachHourOfInterval, eachDayOfInterval } from 'date-fns';
import { ar } from 'date-fns/locale';
import { type Task } from '@/lib/db';
import { ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface TimelineViewProps {
  projectId: number;
  onTaskClick: (taskId: number) => void;
}

const ROW_HEIGHT = 60;
const HEADER_HEIGHT = 40;
const PIXELS_PER_UNIT = 60; // 60px per hour or day depending on zoom

export function TimelineView({ projectId, onTaskClick }: TimelineViewProps) {
  const tasks = useTasks(projectId);
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('day');
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter tasks to show (maybe only top level or all? let's show all for now but sorted)
  const sortedTasks = useMemo(() => {
    const result: Task[] = [];
    const addChildren = (parentId?: number) => {
      const children = tasks.filter(t => t.parentId === parentId).sort((a, b) => a.priority - b.priority);
      for (const child of children) {
        result.push(child);
        addChildren(child.id);
      }
    };
    addChildren(undefined);
    return result;
  }, [tasks]);

  const taskProgress = useMemo(() => {
    const progress: Record<number, number> = {};
    const calculateProgress = (task: Task): number => {
      const children = tasks.filter(t => t.parentId === task.id);
      if (children.length === 0) {
        return task.status === 'Done' ? 100 : 0;
      }
      const childProgressSum = children.reduce((sum, child) => sum + calculateProgress(child), 0);
      return childProgressSum / children.length;
    };
    tasks.forEach(task => {
      progress[task.id!] = calculateProgress(task);
    });
    return progress;
  }, [tasks]);

  const units = useMemo(() => {
    if (zoom === 'day') {
      return eachHourOfInterval({ start: startDate, end: endOfDay(startDate) });
    }
    if (zoom === 'week') {
      return eachDayOfInterval({ start: startDate, end: addDays(startDate, 7) });
    }
    return eachDayOfInterval({ start: startDate, end: addMonths(startDate, 1) });
  }, [startDate, zoom]);

  const getPosition = (date: Date) => {
    const diff = date.getTime() - startDate.getTime();
    const unitTime = zoom === 'day' ? 1000 * 60 * 60 : 1000 * 60 * 60 * 24;
    return (diff / unitTime) * PIXELS_PER_UNIT;
  };

  const getWidth = (start: Date, end?: Date) => {
    const targetEnd = end || addHours(start, 2);
    const diff = targetEnd.getTime() - start.getTime();
    const unitTime = zoom === 'day' ? 1000 * 60 * 60 : 1000 * 60 * 60 * 24;
    return Math.max((diff / unitTime) * PIXELS_PER_UNIT, 40);
  };

  const handleDrag = (taskId: number, e: React.MouseEvent, type: 'start' | 'end' | 'move') => {
    const initialX = e.clientX;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const onMouseUp = (upEvent: MouseEvent) => {
      const unitsMoved = (upEvent.clientX - initialX) / PIXELS_PER_UNIT;
      const update: Partial<Task> = {};

      const factor = zoom === 'day' ? 1 : 24;
      const moveInHours = -unitsMoved * factor;

      if (type === 'start' || type === 'move') {
        update.startedAt = addHours(task.startedAt, moveInHours);
      }
      if (type === 'end' || (type === 'move' && task.finishedAt)) {
        const baseEnd = task.finishedAt || new Date();
        update.finishedAt = addHours(baseEnd, moveInHours);
      }

      if (Object.keys(update).length > 0) {
        masarActions.updateTask(taskId, update);
      }

      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mouseup', onMouseUp);
  };

  const navigate = (direction: number) => {
    setStartDate(prev => {
      if (zoom === 'day') return direction > 0 ? addDays(prev, 1) : subDays(prev, 1);
      if (zoom === 'week') return direction > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1);
      return direction > 0 ? addMonths(prev, 1) : subMonths(prev, 1);
    });
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-md border overflow-hidden font-['ibm-ar']" dir="rtl">
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[150px] text-center text-foreground">
            {zoom === 'day' ? format(startDate, 'd MMM yyyy', { locale: ar }) :
             zoom === 'week' ? `${format(startDate, 'd MMM', { locale: ar })} - ${format(addWeeks(startDate, 1), 'd MMM', { locale: ar })}` :
             format(startDate, 'MMMM yyyy', { locale: ar })}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
          <Button variant={zoom === 'day' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setZoom('day')}>يوم</Button>
          <Button variant={zoom === 'week' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setZoom('week')}>أسبوع</Button>
          <Button variant={zoom === 'month' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setZoom('month')}>شهر</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative" ref={containerRef}>
        <div
          className="relative"
          style={{
            width: units.length * PIXELS_PER_UNIT,
            minHeight: Math.max(sortedTasks.length * ROW_HEIGHT + HEADER_HEIGHT, 400)
          }}
        >
          {/* Timeline Header */}
          <div className="flex sticky top-0 z-30 bg-card border-b h-[40px]">
            {units.map((unit, i) => (
              <div
                key={i}
                className="border-l h-full flex flex-col items-center justify-center text-[10px] text-muted-foreground shrink-0"
                style={{ width: PIXELS_PER_UNIT }}
              >
                {zoom === 'day' ? (
                  <>
                    <span className="font-bold">{format(unit, 'HH')}</span>
                    <span>{format(unit, '00')}</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold">{format(unit, 'd')}</span>
                    <span>{format(unit, 'MMM', { locale: ar })}</span>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Grid Lines */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
            {units.map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-muted/10"
                style={{ right: i * PIXELS_PER_UNIT }}
              />
            ))}
            {sortedTasks.map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-b border-muted/10"
                style={{ top: i * ROW_HEIGHT + HEADER_HEIGHT, height: ROW_HEIGHT }}
              />
            ))}
          </div>

          {/* Task Bars */}
          <div className="relative z-20">
            {sortedTasks.map((task, index) => {
              const x = getPosition(task.startedAt);
              const w = getWidth(task.startedAt, task.finishedAt);
              const y = index * ROW_HEIGHT + HEADER_HEIGHT + 10;
              const progress = taskProgress[task.id!] || 0;
              const isSmall = w < 100;

              return (
                <motion.div
                  key={task.id}
                  layoutId={`task-${task.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute rounded-md shadow-sm group border"
                  style={{
                    right: x,
                    top: y,
                    width: w,
                    height: ROW_HEIGHT - 20,
                    backgroundColor: task.status === 'Done' ? 'rgb(34 197 94 / 0.15)' :
                                     task.status === 'Doing' ? 'rgb(59 130 246 / 0.15)' :
                                     task.status === 'Blocked' ? 'rgb(239 68 68 / 0.15)' : 'rgb(120 120 120 / 0.1)',
                    borderColor: task.status === 'Done' ? 'rgb(34 197 94)' :
                                 task.status === 'Doing' ? 'rgb(59 130 246)' :
                                 task.status === 'Blocked' ? 'rgb(239 68 68)' : 'rgb(120 120 120 / 0.5)'
                  }}
                >
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20 rounded-b-md overflow-hidden">
                    <motion.div
                      className="h-full bg-primary/40"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>

                  <div
                    className="absolute inset-0 flex items-center px-2 cursor-pointer"
                    onClick={() => onTaskClick(task.id!)}
                  >
                    {isSmall ? (
                      <div className="absolute right-full mr-2 whitespace-nowrap text-xs font-bold text-foreground bg-background/80 px-1 rounded shadow-sm">
                         {task.title}
                      </div>
                    ) : (
                      <span className="text-xs font-bold truncate select-none text-right w-full text-foreground">
                        {task.title}
                      </span>
                    )}

                    {task.status === 'Blocked' && (
                      <AlertCircle className="h-3 w-3 text-destructive absolute left-1 top-1" />
                    )}
                  </div>

                  <div
                    className="absolute inset-x-4 inset-y-0 cursor-grab active:cursor-grabbing z-10"
                    onMouseDown={(e) => handleDrag(task.id!, e, 'move')}
                  />

                  <div
                    className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize group-hover:bg-primary/5 transition-colors z-20"
                    onMouseDown={(e) => handleDrag(task.id!, e, 'start')}
                  />
                  <div
                    className="absolute left-0 top-0 bottom-0 w-4 cursor-ew-resize group-hover:bg-primary/5 transition-colors z-20"
                    onMouseDown={(e) => handleDrag(task.id!, e, 'end')}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
