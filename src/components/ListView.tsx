import { useState, useMemo, Fragment } from 'react';
import { useTasks, useProjects, useProjectMembers } from '@/hooks/use-masar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Task } from '@/lib/supabase';
import { format, differenceInMinutes } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ChevronDown, ChevronRight, ChevronUp, Search, AlertCircle, User } from 'lucide-react';

interface ListViewProps {
  projectId: string | 'all';
  onTaskClick: (taskId: string) => void;
}

function formatDuration(start: string, end?: string) {
  const startDate = new Date(start);
  const targetEnd = end ? new Date(end) : new Date();

  const totalMinutes = Math.abs(differenceInMinutes(targetEnd, startDate));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const mins = totalMinutes % 60;

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

export default function ListView({ projectId, onTaskClick }: ListViewProps) {
  const tasks = useTasks(projectId);
  const projects = useProjects();
  const members = useProjectMembers(projectId === 'all' ? undefined : projectId);
  const [sortField, setSortField] = useState<keyof Task>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'priority' | 'status'>('none');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleExpand = (e: React.MouseEvent, taskId: string) => {
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
    const progress: Record<string, number> = {};

    const calculateProgress = (task: Task): number => {
      const children = tasks.filter(t => t.parent_id === task.id);
      if (children.length === 0) {
        return task.status === 'Done' ? 100 : 0;
      }
      const childProgressSum = children.reduce((sum, child) => sum + calculateProgress(child), 0);
      return childProgressSum / children.length;
    };

    tasks.forEach(task => {
      progress[task.id] = calculateProgress(task);
    });
    return progress;
  }, [tasks]);

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusVariant = (status: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (status) {
      case 'Done': return 'default';
      case 'Doing': return 'secondary';
      case 'Blocked': return 'destructive';
      default: return 'outline';
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
      const children = tasks.filter(t => t.parent_id === task.id);
      const isExpanded = expandedTasks.has(task.id);
      const assignee = members.find(m => m.profiles.id === task.assignee_id);

      const row = (
        <TableRow
          key={task.id}
          className="cursor-pointer border-b transition-colors hover:bg-muted/50"
          onClick={() => onTaskClick(task.id)}
        >
          <TableCell className="font-medium text-right py-4" style={{ paddingRight: `${depth * 2 + 1}rem` }}>
            <div className="flex items-center gap-2">
              {children.length > 0 ? (
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={(e) => toggleExpand(e, task.id)}>
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
            <div className="flex items-center gap-2">
               <Badge variant="outline">أولوية {task.priority}</Badge>
               {assignee && (
                 <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    <User className="h-2.5 w-2.5" />
                    {assignee.profiles.email.split('@')[0]}
                 </div>
               )}
            </div>
          </TableCell>
          <TableCell className="text-right py-4">
            <Badge variant={getStatusVariant(task.status)}>{statusMap[task.status] || task.status}</Badge>
          </TableCell>
          <TableCell className="text-right w-[150px] py-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                <span>{Math.round(taskProgress[task.id] || 0)}%</span>
              </div>
              <Progress value={taskProgress[task.id] || 0} className="h-2" />
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground text-right text-xs py-4">
            {format(new Date(task.created_at), 'MMM d, HH:mm', { locale: ar })}
          </TableCell>
          <TableCell className="font-mono text-sm text-right py-4">
            {formatDuration(task.started_at, task.finished_at)}
          </TableCell>
          {projectId === 'all' && (
            <TableCell className="text-right py-4">
              <Badge variant="outline" className="bg-primary/5">{projects.find(p => p.id === task.project_id)?.name || 'غير معروف'}</Badge>
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

  const topLevelFiltered = filteredTasks.filter(t => !t.parent_id);

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
              <TableHead className="cursor-pointer text-right font-bold h-12" onClick={() => handleSort('created_at')}>
                <div className="flex items-center gap-1">
                  بدأ في
                  {sortField === 'created_at' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
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
