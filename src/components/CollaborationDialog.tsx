// src/components/CollaborationDialog.tsx
import { useState } from 'react';
import { useProjectMembers, collaborationActions } from '@/hooks/use-masar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, UserX, Shield, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { type ProjectRole } from '@/lib/supabase';

interface CollaborationDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CollaborationDialog({ projectId, isOpen, onClose }: CollaborationDialogProps) {
  const members = useProjectMembers(projectId);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProjectRole>('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await collaborationActions.addMember(projectId, email, role);
      if (error) throw error;
      setEmail('');
    } catch (err: any) {
      setError(err.message === 'User not found' ? 'No user found with this email' : 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (r: ProjectRole) => {
    switch (r) {
      case 'owner': return <ShieldAlert className="h-3 w-3 text-primary" />;
      case 'admin': return <ShieldCheck className="h-3 w-3 text-blue-500" />;
      case 'editor': return <Shield className="h-3 w-3 text-green-500" />;
      default: return <Shield className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getRoleName = (r: ProjectRole) => {
    switch (r) {
      case 'owner': return 'Owner';
      case 'admin': return 'Admin';
      case 'editor': return 'Editor';
      default: return 'Viewer';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-4 gap-0">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-sm font-semibold tracking-tight text-foreground/90">
            Manage Team
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invitation Section */}
          <form onSubmit={handleAddMember} className="space-y-2.5">
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Invite new member
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-xs bg-background/50 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="w-[100px] space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Role
                </Label>
                <Select value={role} onValueChange={(v) => setRole(v as ProjectRole)}>
                  <SelectTrigger className="h-8 text-xs bg-background/50 border-border/60 focus:ring-1 focus:ring-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="viewer" className="text-xs">Viewer</SelectItem>
                    <SelectItem value="editor" className="text-xs">Editor</SelectItem>
                    <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <p className="text-[10px] text-destructive font-semibold">{error}</p>}
            <Button type="submit" className="w-full h-8.5 text-xs font-semibold gap-1.5" disabled={loading}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              Add Member
            </Button>
          </form>

          {/* Members List */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <Label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              Project Members ({members.length})
            </Label>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {members.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between p-2 rounded-md border border-border/30 bg-card/25"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-7 w-7 ring-1 ring-border/20">
                        <AvatarImage src={m.profiles?.avatar_url} alt={m.profiles?.email} />
                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                          {m.profiles?.email?.[0].toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-foreground/90 truncate">{m.profiles?.email}</span>
                        <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {getRoleIcon(m.role)}
                          {getRoleName(m.role)}
                        </div>
                      </div>
                    </div>

                    {m.role !== 'owner' && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <select
                          value={m.role}
                          onChange={(e) => collaborationActions.updateMemberRole(m.id, e.target.value as ProjectRole)}
                          className="h-7 rounded border border-border/40 bg-background/50 px-1.5 text-[10px] font-semibold text-muted-foreground uppercase outline-none focus:ring-1 focus:ring-primary/30"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => collaborationActions.removeMember(m.id)}
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-2 border-t border-border/40 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs px-4">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}