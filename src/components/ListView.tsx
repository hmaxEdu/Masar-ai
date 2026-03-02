import { useState, Fragment } from 'react';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTasks } from '@/hooks/use-masar';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { type Task } from '@/lib/db';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

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
  const [sortField, setSortField] = useState<keyof Task>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'priority' | 'status'>('none');

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (valA === undefined || valB === undefined) return 0;
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-500 hover:bg-green-600';
      case 'Doing': return 'bg-blue-500 hover:bg-blue-600';
      case 'Blocked': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-secondary hover:bg-secondary/80';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  const renderTasks = (taskList: Task[]) => (
    taskList.map(task => (
      <motion.tr
        key={task.id}
        variants={item}
        className="cursor-pointer border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
        onClick={() => onTaskClick(task.id!)}
      >
        <TableCell className="font-medium text-right">{task.title}</TableCell>
        <TableCell className="text-right">
          <Badge variant="outline">أولوية {task.priority}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <Badge className={getStatusColor(task.status)}>{statusMap[task.status] || task.status}</Badge>
        </TableCell>
        <TableCell className="text-muted-foreground text-right">
          {format(task.startedAt, 'MMM d, HH:mm', { locale: ar })}
        </TableCell>
        <TableCell className="font-mono text-sm text-right">
          {formatDuration(task.startedAt, task.finishedAt)}
        </TableCell>
      </motion.tr>
    ))
  );

  const groups = groupBy === 'none'
    ? { 'كل المهام': sortedTasks }
    : sortedTasks.reduce((acc, task) => {
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
            className="pr-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="تجميع حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون تجميع</SelectItem>
            <SelectItem value="priority">تجميع حسب الأولوية</SelectItem>
            <SelectItem value="status">تجميع حسب الحالة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('title')}>العنوان</TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('priority')}>الأولوية</TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('status')}>الحالة</TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('startedAt')}>بدأ في</TableHead>
              <TableHead className="text-right">المدة</TableHead>
            </TableRow>
          </TableHeader>
          <motion.tbody
            variants={container}
            initial="hidden"
            animate="show"
          >
            {Object.keys(groups).length === 0 || sortedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  لم يتم العثور على مهام.
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groups).map(([groupName, groupTasks]) => (
                <Fragment key={groupName}>
                  {groupBy !== 'none' && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={5} className="py-2 font-semibold text-xs uppercase tracking-wider text-right">
                        {groupName} ({groupTasks.length})
                      </TableCell>
                    </TableRow>
                  )}
                  {renderTasks(groupTasks)}
                </Fragment>
              ))
            )}
          </motion.tbody>
        </Table>
      </div>
    </div>
  );
}
