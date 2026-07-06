// src/components/SettingsDialog.tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Cpu, Github, Info, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[340px] p-4 gap-0" dir="ltr">
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold tracking-tight text-foreground/90">
              App Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Account Section */}
            <div className="space-y-2">
               <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 border-b border-border/30 pb-1.5 flex items-center gap-1.5">
                <LogOut className="h-3.5 w-3.5" /> Account
              </h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold text-foreground/90">Sign Out</Label>
                  <p className="text-[10px] text-muted-foreground">Terminate your session.</p>
                </div>
                <Button variant="destructive" size="sm" className="h-7 text-[10px] px-3 font-semibold" onClick={() => supabase.auth.signOut()}>
                   Sign Out
                </Button>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 border-b border-border/30 pb-1.5 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" /> About Masar
              </h3>
              <div className="flex flex-col gap-2 text-xs font-medium">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Cpu className="h-3.5 w-3.5 text-primary/80" />
                  <span>Version 1.2.0 (Supabase Realtime)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Github className="h-3.5 w-3.5 text-primary/80" />
                  <span>Open Source on GitHub</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal font-normal">
                  Masar is a streamlined workspace designed for precision task tracking, 
                  real-time team collaboration, and automated dependency protection.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/40 flex justify-end">
            <Button onClick={onClose} variant="secondary" size="sm" className="h-8 text-xs">
              Close
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}