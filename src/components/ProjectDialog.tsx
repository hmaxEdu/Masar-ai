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
          <DialogContent className="font-['ibm-ar']" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
            >
              <DialogHeader>
                <DialogTitle className="text-right">
                  {mode === 'create' ? 'إنشاء مشروع جديد' : 'تعديل اسم المشروع'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="block text-right">اسم المشروع</Label>
                  <Input
                    id="name"
                    placeholder="أدخل اسم المشروع..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="text-right"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>
              <DialogFooter className="flex gap-2 sm:justify-start">
                <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  {mode === 'create' ? 'إنشاء المشروع' : 'حفظ التعديلات'}
                </Button>
                <Button variant="outline" onClick={onClose} disabled={loading}>إلغاء</Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
