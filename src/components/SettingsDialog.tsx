import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/db';
import { Trash2, Info, Github } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const handleClearData = async () => {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      await db.transaction('rw', [db.projects, db.tasks, db.dependencies], async () => {
        await db.projects.clear();
        await db.tasks.clear();
        await db.dependencies.clear();
      });
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="font-['ibm-ar']" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DialogHeader>
            <DialogTitle className="text-right">الإعدادات</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">البيانات</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 text-right">
                  <Label className="text-base">مسح جميع البيانات</Label>
                  <p className="text-sm text-muted-foreground">
                    سيتم حذف جميع المشاريع والمهام والإعدادات بشكل نهائي.
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleClearData}>
                  <Trash2 className="h-4 w-4 ml-2" /> مسح البيانات
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">عن مسار</h3>
              <div className="flex flex-col gap-3 text-right text-sm">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span>الإصدار 1.0.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-primary" />
                  <span>مفتوح المصدر على GitHub</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  مسار هو تطبيق بسيط لإدارة المهام والمشاريع مع دعم كامل للغة العربية والتبعيات والجدول الزمني.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose} variant="secondary">إغلاق</Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
