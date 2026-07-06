// src/components/ProjectDialog.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { masarActions } from '@/hooks/use-masar';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'rename';
  projectId?: string;
  initialName?: string;
}

export default function ProjectDialog({ isOpen, onClose, mode, projectId, initialName = '' }: ProjectDialogProps) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
    }
  }, [isOpen, initialName]);

  const handleSubmit = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      if (mode === 'create') {
        const { data } = await masarActions.addProject(name);
        if (data) {
          navigate(`/projects/${data.id}`);
        }
      } else if (mode === 'rename' && projectId) {
        await masarActions.updateProject(projectId, { name });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="sm:max-w-[320px] p-4 gap-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 5 }}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle className="text-sm font-semibold tracking-tight text-foreground/90">
                  {mode === 'create' ? 'Create New Project' : 'Rename Project'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Project Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter project name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                  disabled={loading}
                  className="h-8 text-xs bg-background/50 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>

              <DialogFooter className="gap-1.5 flex flex-row justify-end pt-1">
                <Button variant="outline" size="sm" onClick={onClose} disabled={loading} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={!name.trim() || loading} className="h-8 text-xs">
                  {loading && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
                  {mode === 'create' ? 'Create' : 'Save'}
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}