// src/components/SettingsDialog.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { Trash2, Info, Github, LogOut, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  // AI Settings State
  const [aiUrl, setAiUrl] = useState(localStorage.getItem('masar_ai_url') || 'https://ollama.com');
  const [aiKey, setAiKey] = useState(localStorage.getItem('masar_ai_key') || '');
  const [aiModel, setAiModel] = useState(localStorage.getItem('masar_ai_model') || 'gemma3');
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleClearLocalData = async () => {
    if (confirm('Are you sure you want to clear local data? This will delete all migrated Dexie records from your browser.')) {
      await db.transaction('rw', [db.projects, db.tasks, db.dependencies], async () => {
        await db.projects.clear();
        await db.tasks.clear();
        await db.dependencies.clear();
      });
      localStorage.removeItem('dexie_migrated');
      alert('Local data cleared successfully.');
    }
  };

  const saveAISettings = () => {
    localStorage.setItem('masar_ai_url', aiUrl);
    localStorage.setItem('masar_ai_key', aiKey);
    localStorage.setItem('masar_ai_model', aiModel);
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2000);
  };

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
            
            {/* AI Integration Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> AI Integration (Ollama)
              </h3>
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">Ollama Host URL</Label>
                  <Input 
                    value={aiUrl} 
                    onChange={(e) => setAiUrl(e.target.value)} 
                    placeholder="https://ollama.com or http://localhost:11434"
                    className="h-8 text-xs bg-background/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">API Key (Ollama Cloud)</Label>
                  <Input 
                    value={aiKey} 
                    onChange={(e) => setAiKey(e.target.value)} 
                    placeholder="Leave blank for local unauthenticated instances"
                    type="password"
                    className="h-8 text-xs bg-background/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">Model Name</Label>
                  <Input 
                    value={aiModel} 
                    onChange={(e) => setAiModel(e.target.value)} 
                    placeholder="e.g. gemma3, llama3.1"
                    className="h-8 text-xs bg-background/50"
                  />
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <AnimatePresence>
                    {showSavedMsg && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="text-xs text-green-500 font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Saved
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <Button onClick={saveAISettings} size="sm" variant="secondary" className="ml-auto h-8 text-xs">
                    Save AI Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Local Data Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2 flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> Local Storage
              </h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Clear Dexie Cache</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove legacy local database records.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearLocalData}>
                   Clear
                </Button>
              </div>
            </div>

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