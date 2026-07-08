// src/components/CreateTaskDialog.tsx
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
          // FIX: Full width responsive sizing on mobile, rounded card styling (w-[95vw] sm:max-w-[360px])
          <DialogContent className="w-[95vw] sm:max-w-[360px] p-5 sm:p-4 gap-0 rounded-xl sm:rounded-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 5 }}
              className="space-y-4 sm:space-y-3.5"
            >
              <DialogHeader>
                <DialogTitle className="text-base sm:text-sm font-semibold tracking-tight text-foreground/90">
                  Create New Task
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-3.5">
                <div className="space-y-2 sm:space-y-1.5">
                  <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    Task Title
                  </Label>
                  {/* FIX: text-[16px] on mobile touch screens to prevent automatic browser zoom */}
                  <Input
                    id="title"
                    placeholder="What needs to be done?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    autoFocus
                    disabled={loading}
                    className="h-10 sm:h-8 text-[16px] sm:text-xs bg-background/50 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30"
                  />
                </div>
                
                <div className="space-y-2 sm:space-y-1.5">
                  <Label htmlFor="priority" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    Priority
                  </Label>
                  <Select value={priority} onValueChange={setPriority} disabled={loading}>
                    {/* FIX: Raised mobile trigger text size limit */}
                    <SelectTrigger id="priority" className="h-10 sm:h-8 text-[16px] sm:text-xs bg-background/50 border-border/60 focus:ring-1 focus:ring-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="1" className="text-xs py-2.5 sm:py-1">1 - Critical</SelectItem>
                      <SelectItem value="2" className="text-xs py-2.5 sm:py-1">2 - High</SelectItem>
                      <SelectItem value="3" className="text-xs py-2.5 sm:py-1">3 - Medium</SelectItem>
                      <SelectItem value="4" className="text-xs py-2.5 sm:py-1">4 - Low</SelectItem>
                      <SelectItem value="5" className="text-xs py-2.5 sm:py-1">5 - Backlog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2 flex flex-row justify-end pt-2">
                <Button variant="outline" size="sm" onClick={onClose} disabled={loading} className="h-10 sm:h-8 text-sm sm:text-xs flex-1 sm:flex-none">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreate} disabled={!title.trim() || loading} className="h-10 sm:h-8 text-sm sm:text-xs flex-1 sm:flex-none">
                  {loading && <Loader2 className="h-4 w-4 sm:h-3 sm:w-3 animate-spin mr-1.5" />}
                  Create
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}