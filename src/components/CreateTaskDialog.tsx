import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { masarActions } from '@/hooks/use-masar';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface CreateTaskDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTaskDialog({ projectId, isOpen, onClose }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('3');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || loading) return;
    setLoading(true);
    try {
      await masarActions.addTask({
        project_id: projectId,
        title,
        description: '',
        started_at: new Date().toISOString(),
        priority: parseInt(priority),
        status: 'To Do'
      });
      setTitle('');
      setPriority('3');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="sm:max-w-[425px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
            >
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="block">Task Title</Label>
                  <Input
                    id="title"
                    placeholder="What needs to be done?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority" className="block">Priority</Label>
                  <Select value={priority} onValueChange={setPriority} disabled={loading}>
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
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!title.trim() || loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Create Task
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}