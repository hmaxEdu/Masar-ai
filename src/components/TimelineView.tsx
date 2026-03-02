import { useState, useRef, useMemo } from 'react';
import { useTasks, masarActions } from '@/hooks/use-masar';
import { format, addDays, startOfDay, addHours, differenceInHours, isBefore, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface TimelineViewProps {
  projectId: number;
  onTaskClick: (taskId: number) => void;
}

type ZoomLevel = 'day' | 'week' | 'month';

export function TimelineView({ projectId, onTaskClick }: TimelineViewProps) {
  const tasks = useTasks(projectId);
  const dependencies = useLiveQuery(() => db.dependencies.toArray()) || [];
  const [zoom, setZoom] = useState<ZoomLevel>('day');
  const [startDate, setStartDate] = useState(startOfDay(subDays(new Date(), 2)));
  const containerRef = useRef<HTMLDivElement>(null);

  // Constants for layout
  const ROW_HEIGHT = 50;
  const HEADER_HEIGHT = 40;
  const PIXELS_PER_UNIT = zoom === 'day' ? 100 : zoom === 'week' ? 40 : 15;

  const timeRange = useMemo(() => {
    let end;
    if (zoom === 'day') end = addDays(startDate, 3);
    else if (zoom === 'week') end = addWeeks(startDate, 4);
    else end = addMonths(startDate, 6);
    return { start: startDate, end };
  }, [startDate, zoom]);

  const units = useMemo(() => {
    const result = [];
    let current = timeRange.start;
    while (isBefore(current, timeRange.end)) {
      result.push(current);
      if (zoom === 'day') current = addHours(current, 1);
      else current = addDays(current, 1);
    }
    return result;
  }, [timeRange, zoom]);

  const getPosition = (date: Date) => {
    if (zoom === 'day') {
      const hours = differenceInHours(date, timeRange.start);
      return hours * PIXELS_PER_UNIT;
    } else {
      const totalHours = differenceInHours(date, timeRange.start);
      return (totalHours / 24) * PIXELS_PER_UNIT;
    }
  };

  const getWidth = (start: Date, end?: Date) => {
    const targetEnd = end || new Date();
    const posStart = getPosition(start);
    const posEnd = getPosition(targetEnd);
    return Math.max(posEnd - posStart, 20);
  };

  const handleDrag = (taskId: number, e: React.MouseEvent, type: 'start' | 'end' | 'move') => {
    const initialX = e.clientX;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const onMouseUp = (upEvent: MouseEvent) => {
      let unitsMoved = (upEvent.clientX - initialX) / PIXELS_PER_UNIT;
      unitsMoved = -unitsMoved;

      const update: any = {};
      if (zoom === 'day') {
        if (type === 'start' || type === 'move') {
          update.startedAt = addHours(task.startedAt, unitsMoved);
        }
        if (type === 'end' || (type === 'move' && task.finishedAt)) {
          const baseEnd = task.finishedAt || new Date();
          update.finishedAt = addHours(baseEnd, unitsMoved);
        } else if (type === 'move' && !task.finishedAt) {
          update.startedAt = addHours(task.startedAt, unitsMoved);
        }
      } else {
        if (type === 'start' || type === 'move') {
          update.startedAt = addDays(task.startedAt, unitsMoved);
        }
        if (type === 'end' || (type === 'move' && task.finishedAt)) {
          const baseEnd = task.finishedAt || new Date();
          update.finishedAt = addDays(baseEnd, unitsMoved);
        } else if (type === 'move' && !task.finishedAt) {
          update.startedAt = addDays(task.startedAt, unitsMoved);
        }
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
          <span className="text-sm font-medium min-w-[150px] text-center">
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
            minHeight: Math.max(tasks.length * ROW_HEIGHT + HEADER_HEIGHT, 400)
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
                    <span>{format(unit, 'mm')}</span>
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
                className="absolute top-0 bottom-0 border-l border-muted/20"
                style={{ right: i * PIXELS_PER_UNIT }}
              />
            ))}
            {tasks.map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-b border-muted/20"
                style={{ top: i * ROW_HEIGHT + HEADER_HEIGHT, height: ROW_HEIGHT }}
              />
            ))}
          </div>

          {/* Dependency Arrows */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
             <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" fillOpacity="0.6" />
              </marker>
            </defs>
            {dependencies.map(dep => {
              const fromTask = tasks.find(t => t.id === dep.blockingTaskId);
              const toTask = tasks.find(t => t.id === dep.blockedTaskId);
              if (!fromTask || !toTask) return null;

              const fromX = units.length * PIXELS_PER_UNIT - getPosition(fromTask.finishedAt || new Date());
              const fromY = tasks.indexOf(fromTask) * ROW_HEIGHT + HEADER_HEIGHT + ROW_HEIGHT / 2;
              const toX = units.length * PIXELS_PER_UNIT - getPosition(toTask.startedAt);
              const toY = tasks.indexOf(toTask) * ROW_HEIGHT + HEADER_HEIGHT + ROW_HEIGHT / 2;

              return (
                <motion.path
                  key={dep.id}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  d={`M ${fromX} ${fromY} C ${fromX - 20} ${fromY}, ${toX + 20} ${toY}, ${toX} ${toY}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  markerEnd="url(#arrowhead)"
                  className="text-primary"
                />
              );
            })}
          </svg>

          {/* Task Bars */}
          <div className="relative z-20">
            {tasks.map((task, index) => {
              const x = getPosition(task.startedAt);
              const w = getWidth(task.startedAt, task.finishedAt);
              const y = index * ROW_HEIGHT + HEADER_HEIGHT + 10;

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
                  <div
                    className="absolute inset-0 flex items-center px-2 overflow-hidden cursor-pointer"
                    onClick={() => onTaskClick(task.id!)}
                  >
                    <span className="text-xs font-semibold truncate select-none text-right w-full">{task.title}</span>
                  </div>

                  <div
                    className="absolute inset-x-2 inset-y-0 cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => handleDrag(task.id!, e, 'move')}
                  />

                  <div
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize group-hover:bg-primary/10 transition-colors"
                    onMouseDown={(e) => handleDrag(task.id!, e, 'start')}
                  />
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize group-hover:bg-primary/10 transition-colors"
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
