import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/db';
import { Trash2, Info, Github, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const handleClearLocalData = async () => {
    if (confirm('هل أنت متأكد من مسح البيانات المحلية؟ سيتم حذف بيانات Dexie المهاجرة.')) {
      await db.transaction('rw', [db.projects, db.tasks, db.dependencies], async () => {
        await db.projects.clear();
        await db.tasks.clear();
        await db.dependencies.clear();
      });
      localStorage.removeItem('dexie_migrated');
      alert('تم مسح البيانات المحلية بنجاح');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="font-['ibm-ar'] max-w-md" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DialogHeader>
            <DialogTitle className="text-right">الإعدادات</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2 flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> البيانات المحلية
              </h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 text-right">
                  <Label className="text-base">مسح بيانات Dexie</Label>
                  <p className="text-sm text-muted-foreground">
                    سيتم حذف البيانات المحلية المخزنة في المتصفح.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearLocalData}>
                   مسح
                </Button>
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-medium border-b pb-2 flex items-center gap-2">
                <LogOut className="h-4 w-4" /> الحساب
              </h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 text-right">
                  <Label className="text-base">تسجيل الخروج</Label>
                </div>
                <Button variant="destructive" size="sm" onClick={() => supabase.auth.signOut()}>
                   خروج
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2 flex items-center gap-2">
                <Info className="h-4 w-4" /> عن مسار
              </h3>
              <div className="flex flex-col gap-3 text-right text-sm">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span>الإصدار 1.1.0 (Supabase)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-primary" />
                  <span>مفتوح المصدر على GitHub</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  مسار هو تطبيق بسيط لإدارة المهام والمشاريع مع دعم كامل للغة العربية والتبعيات والجدول الزمني والتعاون الفوري.
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
