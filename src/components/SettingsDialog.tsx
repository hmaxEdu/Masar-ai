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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="ltr">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">


            {/* Account Section */}
            <div className="space-y-4">
               <h3 className="text-sm font-medium border-b pb-2 flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Account
              </h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Sign Out</Label>
                  <p className="text-sm text-muted-foreground">Log out of your current session.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => supabase.auth.signOut()}>
                   Sign Out
                </Button>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2 flex items-center gap-2">
                <Info className="h-4 w-4" /> About Masar
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span>Version 1.2.0 (Supabase Realtime)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-primary" />
                  <span>Open Source on GitHub</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Masar is a streamlined project management tool designed for precision task tracking, 
                  real-time collaboration, and smart dependency management.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose} variant="secondary">Close</Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}