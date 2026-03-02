import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { masarActions } from '@/hooks/use-masar';

interface CreateTaskDialogProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskDialog({ projectId, isOpen, onClose }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('3');

  const handleCreate = async () => {
    if (!title.trim()) return;
    await masarActions.addTask({
      projectId,
      title,
      description: '',
      startedAt: new Date(),
      priority: parseInt(priority),
      status: 'To Do'
    });
    setTitle('');
    setPriority('3');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Critical</SelectItem>
                <SelectItem value="2">2 - High</SelectItem>
                <SelectItem value="3">3 - Medium</SelectItem>
                <SelectItem value="4">4 - Low</SelectItem>
                <SelectItem value="5">5 - Backlog</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
