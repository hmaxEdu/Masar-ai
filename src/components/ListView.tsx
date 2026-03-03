import { useState, Fragment, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useTasks, useProjects } from '@/hooks/use-masar';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { type Task } from '@/lib/db';
import { Search, AlertCircle, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

interface ListViewProps {
  projectId: number | 'all';
  onTaskClick: (taskId: number) => void;
}

function formatDuration(start: Date, end?: Date) {
  const targetEnd = end || new Date();
  const days = differenceInDays(targetEnd, start);
  const hours = differenceInHours(targetEnd, start) % 24;
  const mins = differenceInMinutes(targetEnd, start) % 60;

  let result = '';
  if (days > 0) result += `${days}ي `;
  if (hours > 0) result += `${hours}س `;
  if (days === 0 && hours === 0) result += `${mins}د`;

  return result.trim() || '0د';
}

const statusMap: Record<string, string> = {
  'Done': 'مكتمل',
  'Doing': 'قيد التنفيذ',
  'To Do': 'قيد الانتظار',
  'Blocked': 'معطل'
};

export function ListView({ projectId, onTaskClick }: ListViewProps) {
  const tasks = useTasks(projectId === 'all' ? undefined : projectId);
  const projects = useProjects();
  const [sortField, setSortField] = useState<keyof Task>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'priority' | 'status'>('none');
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());

  const toggleExpand = (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

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

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusVariant = (status: string): "success" | "info" | "error" | "secondary" => {
    switch (status) {
      case 'Done': return 'success';
      case 'Doing': return 'info';
      case 'Blocked': return 'error';
      default: return 'secondary';
    }
  };

  const renderTaskRows = (taskList: Task[], depth = 0): React.ReactNode[] => {
    const sorted = [...taskList].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === undefined || valB === undefined) return 0;
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted.flatMap(task => {
      const children = tasks.filter(t => t.parentId === task.id);
      const isExpanded = expandedTasks.has(task.id!);

      const row = (
        <TableRow
          key={task.id}
          className="cursor-pointer border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
          onClick={() => onTaskClick(task.id!)}
        >
          <TableCell className="font-medium text-right py-4" style={{ paddingRight: `${depth * 2 + 1}rem` }}>
            <div className="flex items-center gap-2">
              {children.length > 0 ? (
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={(e) => toggleExpand(e, task.id!)}>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              ) : (
                <div className="w-4" />
              )}
              {task.status === 'Blocked' && <AlertCircle className="h-4 w-4 text-destructive" />}
              <span className="text-foreground">{task.title}</span>
            </div>
          </TableCell>
          <TableCell className="text-right py-4">
            <Badge variant="outline">أولوية {task.priority}</Badge>
          </TableCell>
          <TableCell className="text-right py-4">
            <Badge variant={getStatusVariant(task.status)}>{statusMap[task.status] || task.status}</Badge>
          </TableCell>
          <TableCell className="text-right w-[150px] py-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                <span>{Math.round(taskProgress[task.id!] || 0)}%</span>
              </div>
              <Progress value={taskProgress[task.id!] || 0} className="h-2" />
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground text-right text-xs py-4">
            {format(task.startedAt, 'MMM d, HH:mm', { locale: ar })}
          </TableCell>
          <TableCell className="font-mono text-sm text-right py-4">
            {formatDuration(task.startedAt, task.finishedAt)}
          </TableCell>
          {projectId === 'all' && (
            <TableCell className="text-right py-4">
              <Badge variant="outline" className="bg-primary/5">{projects.find(p => p.id === task.projectId)?.name || 'غير معروف'}</Badge>
            </TableCell>
          )}
        </TableRow>
      );

      return isExpanded ? [row, ...renderTaskRows(children, depth + 1)] : [row];
    });
  };

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const topLevelFiltered = filteredTasks.filter(t => !t.parentId);

  const groups = groupBy === 'none'
    ? { 'كل المهام': topLevelFiltered }
    : topLevelFiltered.reduce((acc, task) => {
        const key = groupBy === 'priority' ? `أولوية ${task.priority}` : (statusMap[task.status] || task.status);
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
      }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن المهام..."
            className="pr-8 text-right h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "none" | "priority" | "status")}>
          <SelectTrigger className="w-[180px] text-right h-10">
            <SelectValue placeholder="تجميع حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون تجميع</SelectItem>
            <SelectItem value="priority">تجميع حسب الأولوية</SelectItem>
            <SelectItem value="status">تجميع حسب الحالة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="cursor-pointer text-right font-bold h-12" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-1">
                  العنوان
                  {sortField === 'title' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right font-bold h-12" onClick={() => handleSort('priority')}>
                <div className="flex items-center gap-1">
                  الأولوية
                  {sortField === 'priority' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right font-bold h-12" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  الحالة
                  {sortField === 'status' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </TableHead>
              <TableHead className="text-right font-bold h-12">الإنجاز</TableHead>
              <TableHead className="cursor-pointer text-right font-bold h-12" onClick={() => handleSort('startedAt')}>
                <div className="flex items-center gap-1">
                  بدأ في
                  {sortField === 'startedAt' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </TableHead>
              {projectId === 'all' && <TableHead className="text-right font-bold h-12">المشروع</TableHead>}
              <TableHead className="text-right font-bold h-12">المدة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(groups).length === 0 || topLevelFiltered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={projectId === 'all' ? 7 : 6} className="text-center py-20 text-muted-foreground italic">
                  لم يتم العثور على مهام.
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groups).map(([groupName, groupTasks]) => (
                <Fragment key={groupName}>
                  {groupBy !== 'none' && (
                    <TableRow className="bg-muted/40 hover:bg-muted/40 transition-none">
                      <TableCell colSpan={projectId === 'all' ? 7 : 6} className="py-2.5 font-bold text-xs uppercase tracking-wider text-right text-primary px-4">
                        {groupName} ({groupTasks.length})
                      </TableCell>
                    </TableRow>
                  )}
                  {renderTaskRows(groupTasks)}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
