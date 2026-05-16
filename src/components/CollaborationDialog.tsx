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
      setError(err.message === 'User not found' ? 'No user found with this email address' : 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (r: ProjectRole) => {
    switch (r) {
      case 'owner': return <ShieldAlert className="h-4 w-4 text-primary" />;
      case 'admin': return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case 'editor': return <Shield className="h-4 w-4 text-green-500" />;
      default: return <Shield className="h-4 w-4 text-muted-foreground" />;
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Team</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="email">Invite new member</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="w-[120px] space-y-2">
                <Label>Permission</Label>
                <Select value={role} onValueChange={(v) => setRole(v as ProjectRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Add to Project
            </Button>
          </form>

          <div className="space-y-3">
            <Label className="block font-semibold">Project Members ({members.length})</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <AnimatePresence>
                {members.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={m.profiles?.avatar_url} alt={m.profiles?.email} />
                        <AvatarFallback>{m.profiles?.email?.[0].toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{m.profiles?.email}</span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                          {getRoleIcon(m.role)}
                          {getRoleName(m.role)}
                        </div>
                      </div>
                    </div>

                    {m.role !== 'owner' && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={m.role}
                          onValueChange={(v) => collaborationActions.updateMemberRole(m.id, v as ProjectRole)}
                        >
                          <SelectTrigger className="h-8 w-[100px] text-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => collaborationActions.removeMember(m.id)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}