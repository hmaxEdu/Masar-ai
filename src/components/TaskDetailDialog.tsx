import { useState, useMemo } from 'react';
import { useTask, useTasks, useDependencies, useProjectMembers, masarActions } from '@/hooks/use-masar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { type Task, type TaskStatus, type Dependency } from '@/lib/supabase';
import { format } from 'date-fns';
import { X, Plus, Trash2, AlertCircle, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RichTextEditor from './RichTextEditor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TaskDetailDialogProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetailDialog({ taskId, isOpen, onClose }: TaskDetailDialogProps) {
  const task = useTask(taskId);
  const { tasks: allTasks } = useTasks(task?.project_id || 'all');
  const members = useProjectMembers(task?.project_id);
  const { blockingMe, iAmBlocking } = useDependencies(taskId || '');
  const [newChildTask, setNewChildTask] = useState('');
  const [editingChildTaskId, setEditingChildTaskId] = useState<string | null>(null);

  const childTasks = useMemo(() =>
    allTasks.filter((t: Task) => t.parent_id === taskId),
  [allTasks, taskId]);

  const completedChildren = childTasks.filter((t: Task) => t.status === 'Done').length;
  const progress = childTasks.length > 0 ? (completedChildren / childTasks.length) * 100 : (task?.status === 'Done' ? 100 : 0);

  const availableTasksToBlock = useMemo(() =>
    allTasks.filter((t: Task) => t.id !== taskId && !blockingMe.some((d: Dependency) => d.blocking_task_id === t.id)),
  [allTasks, taskId, blockingMe]);

  const handleUpdate = (changes: Partial<Task>) => {
    if (taskId) masarActions.updateTask(taskId, changes);
  };

  const handleAddChildTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildTask.trim() || !task) return;
    await masarActions.addTask({
      project_id: task.project_id,
      parent_id: task.id,
      title: newChildTask,
      description: '',
      status: 'To Do',
      priority: 3,
      assignee_id: task.assignee_id,
      started_at: new Date().toISOString()
    });
    setNewChildTask('');
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl" dir="rtl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
               <DialogTitle className="text-2xl font-black tracking-tight mb-2 truncate group cursor-text">
                <input
                  value={task.title}
                  onChange={(e) => handleUpdate({ title: e.target.value })}
                  className="bg-transparent border-none outline-none w-full focus:ring-2 focus:ring-primary/20 rounded px-1 transition-shadow"
                />
              </DialogTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">المسؤول:</span>
                  <Select
                    value={task.assignee_id || 'unassigned'}
                    onValueChange={(v) => handleUpdate({ assignee_id: v === 'unassigned' ? undefined : v })}
                  >
                    <SelectTrigger className="h-7 border-none bg-muted/50 hover:bg-muted py-0 px-2 text-xs rounded-full gap-2 transition-colors">
                      <div className="flex items-center gap-1.5">
                        {task.assignee_id ? (
                          <Avatar className="size-4 border shadow-sm">
                            <AvatarImage src={(members.find(m => m.profiles.id === task.assignee_id)?.profiles.avatar_url as string | undefined)} />
                            <AvatarFallback className="text-[6px] bg-primary/10 text-primary font-bold">
                              {members.find(m => m.profiles.id === task.assignee_id)?.profiles.email?.[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="size-4 rounded-full bg-muted-foreground/20" />
                        )}
                        <SelectValue placeholder="غير معين" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">غير معين</SelectItem>
                      {members.map(m => (
                        <SelectItem key={m.profiles.id} value={m.profiles.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-4 border shadow-sm">
                              <AvatarImage src={(m.profiles.avatar_url as string | undefined)} />
                              <AvatarFallback className="text-[6px] bg-primary/10 text-primary font-bold">
                                {m.profiles.email?.[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {m.profiles.email}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-muted-foreground flex items-center justify-end">
                  الوصف
                </Label>
                <RichTextEditor
                  content={task.description || ''}
                  onChange={(content) => handleUpdate({ description: content })}
                />
              </div>

              <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-muted-foreground/5 shadow-inner">
                <div className="flex justify-between items-center">
                  <Label className="font-black text-sm">المهام الفرعية ({completedChildren}/{childTasks.length})</Label>
                  <span className="text-xs font-black text-primary">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5 shadow-sm" />
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {childTasks.map((s: Task) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-3 group bg-card p-3 rounded-xl border border-muted shadow-sm hover:shadow-md transition-all"
                      >
                        <Checkbox
                          checked={s.status === 'Done'}
                          onCheckedChange={(checked) => masarActions.updateTask(s.id, { status: checked ? 'Done' : 'To Do' })}
                          className="size-5 rounded-md"
                        />
                        <span
                          className={`flex-1 cursor-pointer text-sm font-medium transition-colors ${s.status === 'Done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                          onClick={() => setEditingChildTaskId(s.id)}
                        >
                          {s.title}
                        </span>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 gap-1 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:bg-muted"
                            onClick={() => setEditingChildTaskId(s.id)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => masarActions.deleteTask(s.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <form onSubmit={handleAddChildTask} className="flex gap-2 pt-2">
                  <Input
                    placeholder="أضف مهمة فرعية..."
                    value={newChildTask}
                    onChange={(e) => setNewChildTask(e.target.value)}
                    className="h-10 text-right bg-background rounded-xl"
                  />
                  <Button type="submit" size="icon" variant="secondary" className="h-10 w-10 shrink-0 rounded-xl">
                    <Plus className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2 text-right">
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">الحالة</Label>
                <Select
                  value={task.status}
                  disabled={task.status === 'Blocked'}
                  onValueChange={(v) => handleUpdate({ status: v as TaskStatus })}
                >
                  <SelectTrigger className={task.status === 'Blocked' ? "text-right border-destructive h-10 rounded-xl" : "text-right h-10 rounded-xl"}>
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
                  <p className="text-[10px] text-destructive font-black flex gap-1 items-start mt-1">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>يجب إكمال المهام المعطلة أولاً.</span>
                  </p>
                )}
              </div>

              <div className="space-y-2 text-right">
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">الأولوية</Label>
                <Select
                  value={task.priority.toString()}
                  onValueChange={(v) => handleUpdate({ priority: parseInt(v) })}
                >
                  <SelectTrigger className="text-right h-10 rounded-xl">
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
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">بدأت في</Label>
                <Input
                  type="datetime-local"
                  value={format(new Date(task.started_at), "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => handleUpdate({ started_at: new Date(e.target.value).toISOString() })}
                  className="text-right text-xs h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2 text-right">
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">انتهت في</Label>
                <Input
                  type="datetime-local"
                  value={task.finished_at ? format(new Date(task.finished_at), "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => handleUpdate({ finished_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  className="text-right text-xs h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2 text-right">
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">معطلة بواسطة</Label>
                <div className="space-y-1.5">
                  {blockingMe.map((dep: Dependency) => {
                    const blocker = allTasks.find((t: Task) => t.id === dep.blocking_task_id);
                    return (
                      <div key={dep.id} className="flex items-center justify-between text-xs bg-destructive/5 text-destructive p-2.5 rounded-xl border border-destructive/10 group shadow-sm">
                        <span className="truncate font-bold">{blocker?.title || 'مهمة غير معروفة'}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-destructive hover:text-destructive-foreground rounded-md" onClick={() => masarActions.removeDependency(dep.id)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                  <Select onValueChange={(v) => masarActions.addDependency(v, taskId!)}>
                    <SelectTrigger className="h-9 text-[11px] text-right bg-muted/30 border-dashed rounded-xl border-muted-foreground/20">
                      <div className="flex items-center gap-1.5">
                        <LinkIcon className="h-3.5 w-3.5" />
                        <SelectValue placeholder="أضف معطلاً..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasksToBlock.map((t: Task) => (
                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 text-right border-t pt-5 mt-5">
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">تعطل هذه المهام</Label>
                <div className="space-y-1.5">
                  {iAmBlocking.length > 0 ? iAmBlocking.map((dep: Dependency) => {
                    const blocked = allTasks.find((t: Task) => t.id === dep.blocked_task_id);
                    return (
                      <div key={dep.id} className="text-[11px] bg-muted/50 p-2.5 rounded-xl flex items-center gap-2 border border-muted font-medium shadow-sm">
                        <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate">{blocked?.title || 'مهمة غير معروفة'}</span>
                      </div>
                    );
                  }) : (
                    <p className="text-[11px] text-muted-foreground italic bg-muted/20 p-2.5 rounded-xl border border-dashed text-center">لا تعطل أي مهام أخرى.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-between px-6 py-4 bg-muted/5 border-t">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => { if(confirm('هل أنت متأكد من حذف هذه المهمة؟')){ masarActions.deleteTask(taskId!); onClose(); } }}>
            <Trash2 className="h-4 w-4 ml-2" /> حذف المهمة
          </Button>
          <Button onClick={onClose} variant="secondary" className="rounded-xl px-6 font-bold shadow-sm">إغلاق</Button>
        </DialogFooter>
      </DialogContent>
      {editingChildTaskId !== null && (
        <TaskDetailDialog
          taskId={editingChildTaskId}
          isOpen={editingChildTaskId !== null}
          onClose={() => setEditingChildTaskId(null)}
        />
      )}
    </Dialog>
  );
}
