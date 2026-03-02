import { useState, useEffect } from 'react';
import { type Task, type TaskStatus } from '@/lib/db';
import { useTask, useSubtasks, useDependencies, useTasks, masarActions } from '@/hooks/use-masar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/RichTextEditor';
import { format } from 'date-fns';
import { AlertCircle, X, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskDetailDialogProps {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailDialog({ taskId, isOpen, onClose }: TaskDetailDialogProps) {
  const fetchedTask = useTask(taskId || undefined);
  const [task, setTask] = useState<Task | null>(null);
  const subtasks = useSubtasks(taskId || 0);
  const { blockingMe, iAmBlocking } = useDependencies(taskId || 0);
  const allTasks = useTasks(task?.projectId);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (fetchedTask) {
      setTask(fetchedTask);
    }
  }, [fetchedTask]);

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
                className="text-xl font-bold border-none px-0 focus-visible:ring-0 text-right bg-transparent"
              />
              {task.status === 'Blocked' && (
                <Badge variant="destructive" className="flex gap-1 animate-pulse">
                  <AlertCircle className="h-3 w-3" /> معطل
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2 text-right">
                <Label className="text-muted-foreground">الوصف</Label>
                <RichTextEditor
                  content={task.description}
                  onChange={(content) => handleUpdate({ description: content })}
                />
              </div>

              <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <Label>المهام الفرعية ({completedSubtasks}/{subtasks.length})</Label>
                  <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  <AnimatePresence>
                    {subtasks.map(s => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2 group bg-card p-2 rounded border"
                      >
                        <Checkbox
                          checked={s.completed}
                          onCheckedChange={(checked) => masarActions.toggleSubtask(s.id!, !!checked)}
                        />
                        <span className={s.completed ? 'line-through text-muted-foreground' : ''}>{s.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 mr-auto opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={() => masarActions.deleteSubtask(s.id!)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
                  <Input
                    placeholder="أضف مهمة فرعية..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    className="h-9 text-right"
                  />
                  <Button type="submit" size="sm" variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2 text-right">
                <Label className="text-muted-foreground">الحالة</Label>
                <Select
                  value={task.status}
                  disabled={task.status === 'Blocked'}
                  onValueChange={(v) => handleUpdate({ status: v as TaskStatus })}
                >
                  <SelectTrigger className={task.status === 'Blocked' ? "text-right border-destructive" : "text-right"}>
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
                  <p className="text-[10px] text-destructive font-bold flex gap-1 items-start">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>يجب إكمال المهام المعطلة أولاً.</span>
                  </p>
                )}
              </div>

              <div className="space-y-2 text-right">
                <Label className="text-muted-foreground">الأولوية</Label>
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
                <Label className="text-muted-foreground">بدأت في</Label>
                <Input
                  type="datetime-local"
                  value={format(task.startedAt, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => handleUpdate({ startedAt: new Date(e.target.value) })}
                  className="text-right text-xs"
                />
              </div>

              <div className="space-y-2 text-right">
                <Label className="text-muted-foreground">انتهت في</Label>
                <Input
                  type="datetime-local"
                  value={task.finishedAt ? format(task.finishedAt, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => handleUpdate({ finishedAt: e.target.value ? new Date(e.target.value) : undefined })}
                  className="text-right text-xs"
                />
              </div>

              <div className="space-y-2 text-right">
                <Label className="text-muted-foreground">معطلة بواسطة</Label>
                <div className="space-y-1">
                  {blockingMe.map(dep => {
                    const blocker = allTasks.find(t => t.id === dep.blockingTaskId);
                    return (
                      <div key={dep.id} className="flex items-center justify-between text-xs bg-destructive/10 text-destructive p-2 rounded border border-destructive/20 group">
                        <span className="truncate font-medium">{blocker?.title || 'مهمة غير معروفة'}</span>
                        <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground" onClick={() => masarActions.removeDependency(dep.id!)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                  <Select onValueChange={(v) => masarActions.addDependency(parseInt(v), taskId!)}>
                    <SelectTrigger className="h-8 text-[10px] text-right bg-muted/50">
                      <div className="flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        <SelectValue placeholder="أضف معطلاً..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasksToBlock.map(t => (
                        <SelectItem key={t.id} value={t.id!.toString()}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 text-right border-t pt-4 mt-4">
                <Label className="text-muted-foreground text-xs">تعطل هذه المهام</Label>
                <div className="space-y-1">
                  {iAmBlocking.length > 0 ? iAmBlocking.map(dep => {
                    const blocked = allTasks.find(t => t.id === dep.blockedTaskId);
                    return (
                      <div key={dep.id} className="text-xs bg-muted p-2 rounded flex items-center gap-2">
                        <LinkIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{blocked?.title || 'مهمة غير معروفة'}</span>
                      </div>
                    );
                  }) : (
                    <p className="text-[10px] text-muted-foreground italic">لا تعطل أي مهام أخرى.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between mt-6 border-t pt-4">
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { if(confirm('هل أنت متأكد من حذف هذه المهمة؟')){ masarActions.deleteTask(taskId!); onClose(); } }}>
              <Trash2 className="h-4 w-4 ml-2" /> حذف المهمة
            </Button>
            <Button onClick={onClose} variant="secondary">إغلاق</Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
