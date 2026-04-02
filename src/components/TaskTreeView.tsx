import { useMemo } from 'react';
import { useTasks, useProjects } from '@/hooks/use-masar';
import { TreeView } from '@/components/ui/tree-view';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { type Task } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';

interface TaskTreeViewProps {
  projectId: string | 'all';
  onTaskClick: (taskId: string) => void;
}

const statusMap: Record<string, string> = {
  'Done': 'مكتمل',
  'Doing': 'قيد التنفيذ',
  'To Do': 'قيد الانتظار',
  'Blocked': 'معطل'
};

const getStatusVariant = (status: string): "default" | "outline" | "secondary" | "destructive" => {
  switch (status) {
    case 'Done': return 'default';
    case 'Doing': return 'secondary';
    case 'Blocked': return 'destructive';
    default: return 'outline';
  }
};

export function TaskTreeView({ projectId, onTaskClick }: TaskTreeViewProps) {
  const tasks = useTasks(projectId);
  const projects = useProjects();

  const treeData = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      name: task.title,
    }));
  }, [tasks]);

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

  const renderTaskItem = (item: any) => {
    const task = item as Task;
    const progress = taskProgress[task.id] || 0;

    return (
      <div
        className="flex items-center gap-4 py-1"
        onClick={(e) => {
          e.stopPropagation();
          onTaskClick(task.id);
        }}
      >
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {task.status === 'Blocked' && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
          <span className="font-medium truncate">{task.title}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {projectId === 'all' && (
            <Badge variant="outline" className="bg-primary/5 text-[10px] hidden md:flex">
              {projects.find(p => p.id === task.project_id)?.name || 'غير معروف'}
            </Badge>
          )}

          <Badge variant="outline" className="text-[10px]">أولوية {task.priority}</Badge>

          <Badge variant={getStatusVariant(task.status)} className="text-[10px]">
            {statusMap[task.status] || task.status}
          </Badge>

          <div className="w-24 flex flex-col gap-1">
            <div className="flex justify-between text-[8px] text-muted-foreground font-bold">
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-auto h-full">
      <TreeView
        data={treeData}
        renderItem={renderTaskItem}
        parentField="parent_id"
        defaultExpanded={true}
        className="p-4"
      />
    </div>
  );
}
