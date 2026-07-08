// src/components/CollaborationDialog.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collaborationActions, useProjectMembers } from '@/hooks/use-masar';
import { type Profile, type ProjectRole } from '@/lib/supabase';
import { Loader2, Search, Shield, ShieldAlert, ShieldCheck, UserPlus, UserX } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface CollaborationDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CollaborationDialog({ projectId, isOpen, onClose }: CollaborationDialogProps) {
  const members = useProjectMembers(projectId);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [role, setRole] = useState<ProjectRole>('viewer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      const results = await collaborationActions.searchUsers(searchQuery);
      setSearchResults(results.filter(r => !members.some(m => m.user_id === r.id)));
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, members]);

  const handleAddMember = async (userId: string) => {
    setLoading(true);
    try {
      await collaborationActions.addMember(projectId, userId, role);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (r: ProjectRole) => {
    switch (r) {
      case 'owner': return <ShieldAlert className="h-3.5 w-3.5 text-primary" />;
      case 'admin': return <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />;
      case 'editor': return <Shield className="h-3.5 w-3.5 text-green-500" />;
      default: return <Shield className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  // FIX: Restored missing helper
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
      {/* Mobile: 100dvh full screen. Desktop: standard modal sizing */}
      <DialogContent className="w-full h-[100dvh] sm:h-auto sm:max-w-[460px] p-0 sm:p-5 gap-0 border-0 sm:border rounded-none sm:rounded-xl overflow-hidden flex flex-col bg-background">
        
        {/* FIX: Native Tailwind sr-only class replaces external radix package */}
        <DialogTitle className="sr-only">Manage Team</DialogTitle>

        {/* Mobile specific header with close button */}
        <div className="flex sm:hidden items-center justify-between p-3.5 border-b border-border/40 bg-muted/10 shrink-0">
          <span className="font-bold text-sm">Manage Team</span>
         
        </div>

        {/* Desktop Header */}
        <DialogHeader className="hidden sm:block mb-5 px-1">
          <DialogTitle className="text-base font-bold tracking-tight text-foreground">
            Manage Team
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-0 space-y-6">
          
          {/* Search Section */}
          <div className="space-y-4 p-4 bg-muted/20 border border-border/40 rounded-xl">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
              <div className="flex-1 space-y-2 relative min-w-0">
                <Label className="text-xs sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Search Users
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 sm:h-9 pl-9 text-[16px] sm:text-xs bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30 w-full"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-[120px] space-y-2 shrink-0">
                <Label className="text-xs sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Role Assign
                </Label>
                <Select value={role} onValueChange={(v) => setRole(v as ProjectRole)}>
                  <SelectTrigger className="h-12 sm:h-9 text-[16px] sm:text-xs bg-background border-border/60 focus:ring-1 focus:ring-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-sm sm:text-xs">
                    <SelectItem value="viewer" className="py-2.5 sm:py-1.5">Viewer</SelectItem>
                    <SelectItem value="editor" className="py-2.5 sm:py-1.5">Editor</SelectItem>
                    <SelectItem value="admin" className="py-2.5 sm:py-1.5">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-background border border-border/40 rounded-lg divide-y divide-border/20 max-h-[180px] overflow-y-auto shadow-sm"
                >
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAddMember(user.id)}
                      disabled={loading}
                      className="w-full text-left p-3.5 hover:bg-muted/40 text-[13px] sm:text-xs truncate flex items-center justify-between group"
                    >
                      <span className="truncate font-medium flex-1 mr-3 text-foreground/90">{user.email}</span>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                      ) : (
                        <span className="text-xs text-primary font-bold opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shrink-0 bg-primary/10 px-2 py-1 rounded-md">
                          <UserPlus className="h-3.5 w-3.5" /> Add
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Members List */}
          <div className="space-y-3 pb-4">
            <Label className="block text-xs sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
              Project Members ({members.length})
            </Label>
            
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {members.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between p-3 sm:p-2.5 rounded-xl border border-border/30 bg-card/60 gap-3 w-full min-w-0"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 sm:h-8 sm:w-8 ring-1 ring-border/30 shrink-0 shadow-sm">
                        <AvatarImage src={m.profiles?.avatar_url} alt={m.profiles?.email} />
                        <AvatarFallback className="text-[13px] sm:text-[10px] bg-primary/10 text-primary font-bold">
                          {m.profiles?.email?.[0].toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[14px] sm:text-xs font-semibold text-foreground/95 truncate block w-full">
                          {m.profiles?.email}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-0.5">
                          {getRoleIcon(m.role)}
                          {getRoleName(m.role)}
                        </div>
                      </div>
                    </div>

                    {m.role !== 'owner' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={m.role}
                          onChange={(e) => collaborationActions.updateMemberRole(m.id, e.target.value as ProjectRole)}
                          className="h-9 w-[88px] sm:h-8 sm:w-[80px] rounded-md border border-border/50 bg-background px-2 text-[12px] sm:text-[10px] font-bold text-muted-foreground/90 uppercase outline-none focus:ring-1 focus:ring-primary/40 shrink-0 shadow-sm cursor-pointer"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 sm:h-8 sm:w-8 text-destructive/80 hover:text-white hover:bg-destructive/90 transition-colors rounded-md shrink-0 bg-destructive/5"
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

        <DialogFooter className="hidden sm:flex mt-2 pt-4 border-t border-border/40 pb-1">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9 text-sm px-6 w-full sm:w-auto">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}