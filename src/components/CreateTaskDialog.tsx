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
          <DialogContent className="font-['ibm-ar']" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
            >
              <DialogHeader>
                <DialogTitle className="text-right">إنشاء مهمة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="block text-right">العنوان</Label>
                  <Input
                    id="title"
                    placeholder="عنوان المهمة..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    className="text-right"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority" className="block text-right">الأولوية</Label>
                  <Select value={priority} onValueChange={setPriority} disabled={loading}>
                    <SelectTrigger id="priority" className="text-right">
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
              </div>
              <DialogFooter className="flex gap-2 sm:justify-start">
                <Button onClick={handleCreate} disabled={!title.trim() || loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  إنشاء المهمة
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
