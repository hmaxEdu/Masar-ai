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
          <DialogContent className="sm:max-w-[425px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
            >
              <DialogHeader>
                <DialogTitle>
                  {mode === 'create' ? 'Create New Project' : 'Rename Project'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="block">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter project name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {mode === 'create' ? 'Create Project' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}