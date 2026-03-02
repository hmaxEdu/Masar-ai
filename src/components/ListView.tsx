import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTasks } from '@/hooks/use-masar';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { type Task } from '@/lib/db';
import { Search } from 'lucide-react';

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
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (days === 0 && hours === 0) result += `${mins}m`;

  return result.trim() || '0m';
}

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

  const renderTasks = (taskList: Task[]) => (
    taskList.map(task => (
      <TableRow key={task.id} className="cursor-pointer" onClick={() => onTaskClick(task.id!)}>
        <TableCell className="font-medium">{task.title}</TableCell>
        <TableCell>
          <Badge variant="outline">P{task.priority}</Badge>
        </TableCell>
        <TableCell>
          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {format(task.startedAt, 'MMM d, HH:mm')}
        </TableCell>
        <TableCell className="font-mono text-sm">
          {formatDuration(task.startedAt, task.finishedAt)}
        </TableCell>
      </TableRow>
    ))
  );

  const groups = groupBy === 'none'
    ? { 'All Tasks': sortedTasks }
    : sortedTasks.reduce((acc, task) => {
        const key = groupBy === 'priority' ? `Priority ${task.priority}` : task.status;
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
      }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Grouping</SelectItem>
            <SelectItem value="priority">Group by Priority</SelectItem>
            <SelectItem value="status">Group by Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>Title</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('priority')}>Priority</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('startedAt')}>Started</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(groups).length === 0 || sortedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groups).map(([groupName, groupTasks]) => (
                <Fragment key={groupName}>
                  {groupBy !== 'none' && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={5} className="py-2 font-semibold text-xs uppercase tracking-wider">
                        {groupName} ({groupTasks.length})
                      </TableCell>
                    </TableRow>
                  )}
                  {renderTasks(groupTasks)}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { Fragment } from 'react';
