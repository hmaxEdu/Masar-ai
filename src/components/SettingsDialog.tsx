import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/db';
import { Trash2, Info, Github, Cpu, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem('ollama_url') || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem('ollama_model') || 'llama3');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    localStorage.setItem('ollama_url', ollamaUrl);
  }, [ollamaUrl]);

  useEffect(() => {
    localStorage.setItem('ollama_model', ollamaModel);
  }, [ollamaModel]);

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

  const testConnection = async () => {
    setIsTesting(true);
    setTestStatus('idle');
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const models = data.models?.map((m: any) => m.name) || [];
        setAvailableModels(models);
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      console.error('Ollama connection error:', error);
      setTestStatus('error');
    } finally {
      setIsTesting(false);
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
                <Cpu className="h-4 w-4" /> ذكاء اصطناعي (Ollama)
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="ollama-url">رابط Ollama</Label>
                  <Input
                    id="ollama-url"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    dir="ltr"
                    className="text-left"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ollama-model">الموديل</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      {availableModels.length > 0 ? (
                        <Select value={ollamaModel} onValueChange={setOllamaModel}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الموديل" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableModels.map((model) => (
                              <SelectItem key={model} value={model} dir="ltr">
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="ollama-model"
                          value={ollamaModel}
                          onChange={(e) => setOllamaModel(e.target.value)}
                          placeholder="llama3"
                          dir="ltr"
                          className="text-left"
                        />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={testConnection}
                      disabled={isTesting}
                      title="تحديث قائمة الموديلات"
                    >
                      <RefreshCw className={`h-4 w-4 ${isTesting ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
                {testStatus === 'success' && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> تم الاتصال بنجاح وتحديث قائمة الموديلات.
                  </p>
                )}
                {testStatus === 'error' && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> فشل الاتصال. تأكد من تشغيل Ollama وتفعيل CORS.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2 flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> البيانات
              </h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 text-right">
                  <Label className="text-base">مسح جميع البيانات</Label>
                  <p className="text-sm text-muted-foreground">
                    سيتم حذف جميع المشاريع والمهام والإعدادات بشكل نهائي.
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleClearData}>
                   مسح البيانات
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
