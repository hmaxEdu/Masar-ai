import { useState, Fragment } from 'react';
import { useTasks, useProjectMembers, useProjects } from '@/hooks/use-masar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ChevronRight, ChevronDown, AlertCircle, Search, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type Task } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ListViewProps {
  projectId: string;
  onTaskClick: (taskId: string) => void;
  userId?: string;
}

const statusMap: Record<string, string> = {
  'To Do': 'قيد الانتظار',
  'Doing': 'قيد التنفيذ',
  'Done': 'تم الإنجاز',
  'Blocked': 'متوقف'
};

const formatDuration = (start: string | null | undefined, end: string | null | undefined) => {
  if (!start || !end) return '-';
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}س ${minutes}د`;
};

export default function ListView({ projectId, onTaskClick, userId }: ListViewProps) {
  const { tasks, taskProgress } = useTasks(projectId);
  const members = useProjectMembers(projectId);
  const projects = useProjects(userId);
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<"none" | "priority" | "status">("none");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof Task>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const toggleExpand = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) newExpanded.delete(taskId);
    else newExpanded.add(taskId);
    setExpandedTasks(newExpanded);
  };

  const filteredTasks = tasks.filter((t: Task) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
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
      const children = tasks.filter((t: Task) => t.parent_id === task.id);
      const isExpanded = expandedTasks.has(task.id);
      const assignee = members.find(m => m.profiles.id === task.assignee_id);

      const row = (
        <motion.tr
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key={task.id}
          className="cursor-pointer border-b transition-colors hover:bg-muted/50 group"
          onClick={() => onTaskClick(task.id)}
        >
          <TableCell className="font-medium text-right py-3 sm:py-4" style={{ paddingRight: `${depth * 1.5 + 1}rem` }}>
            <div className="flex items-center gap-2">
              {children.length > 0 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-transparent" onClick={(e) => toggleExpand(e, task.id)}>
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isExpanded ? 'طي المهام الفرعية' : 'عرض المهام الفرعية'}</TooltipContent>
                </Tooltip>
              ) : (
                <div className="w-4" />
              )}
              {task.status === 'Blocked' && <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive shrink-0" />}
              <span className="text-foreground text-sm sm:text-base truncate max-w-[120px] sm:max-w-none group-hover:text-primary transition-colors">{task.title}</span>
            </div>
          </TableCell>
          <TableCell className="text-right py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3">
               <Badge variant="outline" className="text-[10px] sm:text-[11px] font-normal px-2 py-0 border-muted-foreground/20">أولوية {task.priority}</Badge>
               {assignee && (
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground bg-muted/50 px-1.5 sm:px-2 py-0.5 rounded-full border border-muted-foreground/10 hover:bg-muted transition-colors">
                        <Avatar className="size-3.5 sm:size-4 border shadow-sm">
                          <AvatarImage src={assignee.profiles.avatar_url} />
                          <AvatarFallback className="text-[6px] sm:text-[8px] bg-primary/10 text-primary font-bold">
                            {assignee.profiles.email?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="max-w-[60px] truncate">{assignee.profiles.email.split('@')[0]}</span>
                     </div>
                   </TooltipTrigger>
                   <TooltipContent>{assignee.profiles.email}</TooltipContent>
                 </Tooltip>
               )}
            </div>
          </TableCell>
          <TableCell className="text-right py-3 sm:py-4">
            <Badge variant={getStatusVariant(task.status)} className="text-[10px] sm:text-xs font-medium px-2.5">{statusMap[task.status] || task.status}</Badge>
          </TableCell>
          <TableCell className="text-right w-[80px] sm:w-[150px] py-3 sm:py-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[9px] sm:text-[10px] text-muted-foreground font-semibold">
                <span>{Math.round(taskProgress[task.id] || 0)}%</span>
              </div>
              <Progress value={taskProgress[task.id] || 0} className="h-1 sm:h-1.5" />
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground text-right text-[10px] sm:text-xs py-3 sm:py-4 hidden md:table-cell">
            {format(new Date(task.created_at), 'MMM d, HH:mm', { locale: ar })}
          </TableCell>
          <TableCell className="font-mono text-[10px] sm:text-sm text-right py-3 sm:py-4 hidden lg:table-cell">
            {formatDuration(task.started_at, task.finished_at)}
          </TableCell>
          {projectId === 'all' && (
            <TableCell className="text-right py-3 sm:py-4 hidden xl:table-cell">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">{projects.find((p: any) => p.id === task.project_id)?.name || 'غير معروف'}</Badge>
            </TableCell>
          )}
        </motion.tr>
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

  const topLevelFiltered = filteredTasks.filter((t: Task) => !t.parent_id);

  const groups = groupBy === 'none'
    ? { 'كل المهام': topLevelFiltered }
    : topLevelFiltered.reduce((acc: Record<string, Task[]>, task: Task) => {
        const key = groupBy === 'priority' ? `أولوية ${task.priority}` : (statusMap[task.status] || task.status);
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
      }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-4 flex flex-col h-full overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 shrink-0">
        <div className="relative flex-1 group">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="ابحث عن المهام..."
            className="pr-10 text-right h-10 shadow-sm focus:shadow-md transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "none" | "priority" | "status")}>
          <SelectTrigger className="w-full sm:w-[180px] text-right h-10 shadow-sm">
            <SelectValue placeholder="تجميع حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون تجميع</SelectItem>
            <SelectItem value="priority">تجميع حسب الأولوية</SelectItem>
            <SelectItem value="status">تجميع حسب الحالة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-auto flex-1 custom-scrollbar">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="cursor-pointer text-right font-bold h-10 sm:h-12" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                  العنوان
                  {sortField === 'title' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right font-bold h-10 sm:h-12" onClick={() => handleSort('priority')}>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                  الأولوية
                  {sortField === 'priority' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right font-bold h-10 sm:h-12" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                  الحالة
                  {sortField === 'status' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </TableHead>
              <TableHead className="text-right font-bold h-10 sm:h-12 text-xs sm:text-sm text-muted-foreground">الإنجاز</TableHead>
              <TableHead className="cursor-pointer text-right font-bold h-10 sm:h-12 text-xs sm:text-sm hidden md:table-cell" onClick={() => handleSort('created_at')}>
                <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  بدأ في
                  {sortField === 'created_at' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </div>
              </TableHead>
              {projectId === 'all' && <TableHead className="text-right font-bold h-10 sm:h-12 text-xs sm:text-sm hidden xl:table-cell text-muted-foreground">المشروع</TableHead>}
              <TableHead className="text-right font-bold h-10 sm:h-12 text-xs sm:text-sm hidden lg:table-cell text-muted-foreground">المدة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout" initial={false}>
              {Object.keys(groups).length === 0 || topLevelFiltered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-muted-foreground italic">
                    لم يتم العثور على مهام.
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(groups).map(([groupName, groupTasks]) => (
                  <Fragment key={groupName}>
                    {groupBy !== 'none' && (
                      <TableRow className="bg-muted/40 hover:bg-muted/40 transition-none border-b-2">
                        <TableCell colSpan={7} className="py-2 sm:py-3 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider text-right text-primary px-4">
                          {groupName} ({(groupTasks as Task[]).length})
                        </TableCell>
                      </TableRow>
                    )}
                    {renderTaskRows(groupTasks as Task[])}
                  </Fragment>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
