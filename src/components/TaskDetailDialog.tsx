import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from './RichTextEditor';
import { masarActions, useSubtasks, useDependencies, useTasks } from '@/hooks/use-masar';
import { db, type Task, type TaskStatus } from '@/lib/db';
import { Trash2, Plus, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface TaskDetailDialogProps {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailDialog({ taskId, isOpen, onClose }: TaskDetailDialogProps) {
  const [task, setTask] = useState<Task | null>(null);
  const subtasks = useSubtasks(taskId || 0);
  const { blockingMe, iAmBlocking } = useDependencies(taskId || 0);
  const allTasks = useTasks(task?.projectId);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (taskId) {
      db.tasks.get(taskId).then(t => t && setTask(t));
    } else {
      setTask(null);
    }
  }, [taskId]);

  if (!task) return null;

  const handleUpdate = (changes: Partial<Task>) => {
    if (!taskId) return;
    masarActions.updateTask(taskId, changes);
    setTask(prev => prev ? { ...prev, ...changes } : null);
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim() || !taskId) return;
    await masarActions.addSubtask(taskId, newSubtask);
    setNewSubtask('');
  };

  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const availableTasksToBlock = allTasks.filter(t =>
    t.id !== taskId &&
    !blockingMe.some(d => d.blockingTaskId === t.id) &&
    !iAmBlocking.some(d => d.blockedTaskId === t.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-['ibm-ar']" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Input
                value={task.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="text-xl font-bold border-none px-0 focus-visible:ring-0 text-right"
              />
              {task.status === 'Blocked' && (
                <Badge variant="destructive" className="flex gap-1">
                  <AlertCircle className="h-3 w-3" /> معطل
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2 text-right">
                <Label>الوصف</Label>
                <RichTextEditor
                  content={task.description}
                  onChange={(content) => handleUpdate({ description: content })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>المهام الفرعية ({completedSubtasks}/{subtasks.length})</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="space-y-2">
                  <AnimatePresence>
                    {subtasks.map(s => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2 group"
                      >
                        <Checkbox
                          checked={s.completed}
                          onCheckedChange={(checked) => masarActions.toggleSubtask(s.id!, !!checked)}
                        />
                        <span className={s.completed ? 'line-through text-muted-foreground' : ''}>{s.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 mr-auto opacity-0 group-hover:opacity-100"
                          onClick={() => masarActions.deleteSubtask(s.id!)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <form onSubmit={handleAddSubtask} className="flex gap-2">
                    <Input
                      placeholder="أضف مهمة فرعية..."
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      className="h-8 text-right"
                    />
                    <Button type="submit" size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2 text-right">
                <Label>الحالة</Label>
                <Select
                  value={task.status}
                  disabled={task.status === 'Blocked'}
                  onValueChange={(v) => handleUpdate({ status: v as TaskStatus })}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">قيد الانتظار</SelectItem>
                    <SelectItem value="Doing">قيد التنفيذ</SelectItem>
                    <SelectItem value="Done">مكتمل</SelectItem>
                    <SelectItem value="Blocked" disabled>معطل</SelectItem>
                  </SelectContent>
                </Select>
                {task.status === 'Blocked' && (
                  <p className="text-xs text-destructive">قم بفك الحظر عن طريق إكمال التبعيات أولاً.</p>
                )}
              </div>

              <div className="space-y-2 text-right">
                <Label>الأولوية</Label>
                <Select
                  value={task.priority.toString()}
                  onValueChange={(v) => handleUpdate({ priority: parseInt(v) })}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - حرجة</SelectItem>
                    <SelectItem value="2">2 - عالية</SelectItem>
                    <SelectItem value="3">3 - متوسطة</SelectItem>
                    <SelectItem value="4">4 - منخفضة</SelectItem>
                    <SelectItem value="5">5 - مؤجلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 text-right">
                <Label>بدأت في</Label>
                <Input
                  type="datetime-local"
                  value={format(task.startedAt, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => handleUpdate({ startedAt: new Date(e.target.value) })}
                  className="text-right"
                />
              </div>

              <div className="space-y-2 text-right">
                <Label>انتهت في</Label>
                <Input
                  type="datetime-local"
                  value={task.finishedAt ? format(task.finishedAt, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => handleUpdate({ finishedAt: e.target.value ? new Date(e.target.value) : undefined })}
                  className="text-right"
                />
              </div>

              <div className="space-y-2 text-right">
                <Label>معطلة بواسطة</Label>
                <div className="space-y-1">
                  {blockingMe.map(dep => {
                    const blocker = allTasks.find(t => t.id === dep.blockingTaskId);
                    return (
                      <div key={dep.id} className="flex items-center justify-between text-sm bg-muted p-1 rounded">
                        <span className="truncate">{blocker?.title || 'مهمة غير معروفة'}</span>
                        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => masarActions.removeDependency(dep.id!)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                  <Select onValueChange={(v) => masarActions.addDependency(parseInt(v), taskId!)}>
                    <SelectTrigger className="h-8 text-xs text-right">
                      <SelectValue placeholder="أضف معطلاً..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasksToBlock.map(t => (
                        <SelectItem key={t.id} value={t.id!.toString()}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 text-right">
                <Label>تعطل هذه المهام</Label>
                <div className="space-y-1">
                  {iAmBlocking.map(dep => {
                    const blocked = allTasks.find(t => t.id === dep.blockedTaskId);
                    return (
                      <div key={dep.id} className="text-sm bg-muted p-1 rounded">
                        <span className="truncate">{blocked?.title || 'مهمة غير معروفة'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between mt-6">
            <Button variant="destructive" size="sm" onClick={() => { masarActions.deleteTask(taskId!); onClose(); }}>
              <Trash2 className="h-4 w-4 ml-2" /> حذف المهمة
            </Button>
            <Button onClick={onClose}>إغلاق</Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
