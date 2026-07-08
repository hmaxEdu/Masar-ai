import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  collaborationActions,
  masarActions,
  useMyRole,
  useProject,
  useProjectMembers
} from '@/hooks/use-masar';
import { type Profile, type ProjectRole, type ProjectVisibility } from '@/lib/supabase';
import {
  AlertTriangle,
  ChevronLeft,
  Fingerprint,
  Globe,
  Lock,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
  UserX
} from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
};

export default function ProjectSettings() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { project, loading: projectLoading } = useProject(projectId);
  const members = useProjectMembers(projectId);
  const myRole = useMyRole(projectId);

  const [projectName, setProjectName] = useState('');
  const [visibility, setVisibility] = useState<ProjectVisibility>('private');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  
  // FIX: UX improvement over `window.confirm()`
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setVisibility(project.visibility);
    }
  }, [project]);

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

  const canManage = myRole === 'owner' || myRole === 'admin';
  if (projectLoading) return <BentoSkeleton />;
  if (!project || !projectId) return null;

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="max-w-4xl mx-auto py-4 space-y-5"
      dir="ltr"
    >
      {/* Top Bar Navigation */}
      <motion.div variants={itemVariants} className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/projects/${projectId}`)} 
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> 
            Back
          </Button>
          <div className="h-4 w-px bg-border/60" />
          <h1 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            Project Settings
          </h1>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/30 px-2 py-0.5 rounded border border-border/30">
          ID: {projectId.slice(0, 8)}
        </span>
      </motion.div>

      {/* Main Streamlined Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Left/Middle Primary Column */}
        <div className="md:col-span-2 space-y-5">
          
          {/* Section 1: Identity & Privacy */}
          <motion.div variants={itemVariants} className="rounded-lg border border-border/40 bg-card/20 p-4 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Fingerprint className="h-3.5 w-3.5 text-primary" />
                Project Identity
              </div>
              
              {/* Tight Segmented Control for Visibility */}
              <div className="flex bg-muted/40 p-0.5 rounded-md border border-border/40">
                <button
                  onClick={() => canManage && setVisibility('private')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-sm transition-all ${
                    visibility === 'private' 
                    ? 'bg-background text-foreground shadow-2xs' 
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
                  disabled={!canManage}
                >
                  <Lock className="h-3 w-3" /> Private
                </button>
                <button
                  onClick={() => canManage && setVisibility('public')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-sm transition-all ${
                    visibility === 'public' 
                    ? 'bg-background text-foreground shadow-2xs' 
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
                  disabled={!canManage}
                >
                  <Globe className="h-3 w-3" /> Public
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">Rename Project</Label>
              <Input 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-background/40 border-border/50 h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary/45"
                disabled={!canManage}
              />
            </div>
          </motion.div>

          {/* Section 2: Active Team Management */}
          <motion.div variants={itemVariants} className="rounded-lg border border-border/40 bg-card/20 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-border/30 bg-muted/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-primary" />
                Active Team
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded-full">
                {members.length} members
              </span>
            </div>

            <div className="divide-y divide-border/30 max-h-[320px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {members.map((m) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-3 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-7 w-7 ring-1 ring-border/20">
                        <AvatarImage src={m.profiles?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                          {m.profiles?.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium truncate text-foreground/90">{m.profiles?.email}</span>
                          {m.user_id === project.owner_id && (
                            <span className="text-[8px] bg-primary/10 text-primary px-1 rounded-sm uppercase tracking-wider font-bold">Owner</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {canManage && m.role !== 'owner' ? (
                      <div className="flex items-center gap-1.5">
                        <select 
                          value={m.role} 
                          onChange={(e) => collaborationActions.updateMemberRole(m.id, e.target.value as ProjectRole)}
                          className="h-7 rounded border border-border/40 bg-background/50 px-1.5 text-[10px] font-semibold text-muted-foreground uppercase outline-none focus:ring-1 focus:ring-primary/30"
                        >
                          {['admin', 'editor', 'viewer'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
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
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-muted/40 border border-border/30 rounded text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        {getRoleIcon(m.role)}
                        {m.role}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-5">
          
          {/* Section 3: Invite Team */}
          <motion.div variants={itemVariants} className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <UserPlus className="h-3.5 w-3.5" />
              Invite Team
            </div>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 opacity-40 text-foreground" />
              <Input 
                placeholder="Find by email..." 
                className="pl-8 bg-background/60 border-border/50 h-8.5 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-background border border-border/40 rounded-md divide-y divide-border/20 max-h-[150px] overflow-y-auto"
                >
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => collaborationActions.addMember(projectId, user.id, 'viewer')}
                      className="w-full text-left p-2 hover:bg-muted/40 text-[11px] truncate flex items-center justify-between"
                    >
                      <span className="truncate">{user.email}</span>
                      <span className="text-[9px] text-primary font-bold">Add</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Section 4: Danger Zone */}
          <motion.div variants={itemVariants} className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              Danger Zone
            </div>
            <p className="text-[10px] text-muted-foreground/80 leading-normal mb-1">
              Deleting this project will permanently remove all tasks, subtasks, and dependencies.
            </p>

            {/* FIX: Improved inline confirmation instead of `window.confirm()` */}
            {!isConfirmingDelete ? (
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full h-8.5 text-xs font-bold bg-destructive/90 hover:bg-destructive"
                onClick={() => setIsConfirmingDelete(true)}
              >
                Delete Project
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-8.5 text-xs font-bold"
                  onClick={() => setIsConfirmingDelete(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full h-8.5 text-xs font-bold bg-destructive/90 hover:bg-destructive"
                  onClick={async () => {
                     await masarActions.deleteProject(projectId);
                     navigate('/projects/all');
                  }}
                >
                  Confirm
                </Button>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}

const getRoleIcon = (role: ProjectRole) => {
  switch (role) {
    case 'owner': return <ShieldAlert className="h-3 w-3 mr-0.5 text-primary" />;
    case 'admin': return <ShieldCheck className="h-3 w-3 mr-0.5 text-blue-500" />;
    case 'editor': return <Shield className="h-3 w-3 mr-0.5 text-green-500" />;
    default: return <Users className="h-3 w-3 mr-0.5 text-muted-foreground" />;
  }
};

function BentoSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Skeleton className="md:col-span-2 h-44 rounded-lg" />
        <Skeleton className="h-44 rounded-lg" />
        <Skeleton className="md:col-span-2 h-64 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}