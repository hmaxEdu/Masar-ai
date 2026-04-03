import { useState, useEffect, Suspense, lazy } from 'react';
import {
  Plus,
  Settings,
  Users,
  Sun,
  Moon,
  LogOut,
  MoreVertical,
  Trash2,
  Menu,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProjects, useMyRole, useProjectMembers, masarActions } from '@/hooks/use-masar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { motion } from 'motion/react';
import Login from '@/components/Login';
import { SettingsDialog } from '@/components/SettingsDialog';
import CreateTaskDialog from '@/components/CreateTaskDialog';
import TaskDetailDialog from '@/components/TaskDetailDialog';
import CollaborationDialog from '@/components/CollaborationDialog';
import ProjectSettings from '@/components/ProjectSettings';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Session } from '@supabase/supabase-js';
import { migrateFromDexie } from '@/lib/migration';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const ListView = lazy(() => import('./components/ListView'));

function ProjectMembersAvatars({ projectId }: { projectId: string }) {
  const members = useProjectMembers(projectId);
  if (members.length === 0) return null;

  return (
    <AvatarGroup className="mr-2 rtl:mr-0 rtl:ml-2" dir="ltr">
      {members.slice(0, 3).map((m) => (
        <Tooltip key={m.id}>
          <TooltipTrigger asChild>
            <Avatar size="sm" className="ring-2 ring-background border-none">
              <AvatarImage src={m.profiles?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {m.profiles?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{m.profiles?.email}</TooltipContent>
        </Tooltip>
      ))}
      {members.length > 3 && (
        <AvatarGroupCount className="ring-2 ring-background size-6 text-[10px]">
          +{members.length - 3}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}

function MainContent({ session }: { session: Session }) {
  const { projectId: activeProjectId } = useParams();
  const navigate = useNavigate();
  const projects = useProjects(session.user.id);
  const myRole = useMyRole(activeProjectId);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleCreateProject = async () => {
    const name = prompt('اسم المشروع الجديد:');
    if (name) {
      const { data, error } = await masarActions.addProject(name);
      if (error) alert('خطأ في إنشاء المشروع');
      else if (data) navigate(`/projects/${data.id}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المشروع وجميع مهامه؟')) {
      const { error } = await masarActions.deleteProject(id);
      if (error) alert('خطأ في حذف المشروع');
      else navigate('/projects/all');
    }
  };

  const handleRenameProject = async (id: string) => {
    const project = projects.find(p => p.id === id);
    const newName = prompt('الاسم الجديد للمشروع:', project?.name);
    if (newName && newName !== project?.name) {
      const { error } = await masarActions.updateProject(id, { name: newName });
      if (error) alert('خطأ في تحديث المشروع');
    }
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailOpen(true);
  };

  const canManage = myRole === 'owner' || myRole === 'admin';

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-['ibm-ar']" dir="rtl">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm shadow-black/5"
        >
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <motion.h1
              whileHover={{ scale: 1.02 }}
              className="text-xl sm:text-2xl font-black text-primary shrink-0 flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/projects/all')}
            >
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25">
                م
              </div>
              <span className="hidden sm:inline tracking-tighter uppercase italic">Masar</span>
            </motion.h1>

            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block opacity-50" />

            <div className="flex items-center gap-2 overflow-hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/80 px-2.5 py-1.5 rounded-xl transition-all overflow-hidden group border border-transparent hover:border-border">
                    <span className="font-bold text-sm sm:text-base truncate max-w-[100px] sm:max-w-[220px] group-hover:text-primary transition-colors">
                      {activeProjectId === 'all' ? 'جميع المشاريع' : (projects.find(p => p.id === activeProjectId)?.name || 'تحميل...')}
                    </span>
                    <MoreVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={handleCreateProject} className="flex gap-2 py-2.5">
                    <div className="p-1 bg-primary/10 rounded-md text-primary">
                      <Plus className="h-3.5 w-3.5" />
                    </div>
                    <span>مشروع جديد</span>
                  </DropdownMenuItem>
                  {activeProjectId && activeProjectId !== 'all' && canManage && (
                    <DropdownMenuItem onClick={() => navigate(`/projects/${activeProjectId}/settings`)} className="flex gap-2 py-2.5">
                      <div className="p-1 bg-muted rounded-md">
                        <Settings className="h-3.5 w-3.5" />
                      </div>
                      <span>إعدادات المشروع</span>
                    </DropdownMenuItem>
                  )}
                  {activeProjectId && activeProjectId !== 'all' && !canManage && (
                    <DropdownMenuItem onClick={() => handleRenameProject(activeProjectId as string)} className="flex gap-2 py-2.5">
                       <div className="p-1 bg-muted rounded-md">
                        <Settings className="h-3.5 w-3.5" />
                      </div>
                      <span>إعادة تسمية المشروع</span>
                    </DropdownMenuItem>
                  )}
                  {activeProjectId && activeProjectId !== 'all' && myRole === 'owner' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteProject(activeProjectId as string)}
                        className="flex gap-2 text-destructive focus:text-destructive py-2.5"
                      >
                         <div className="p-1 bg-destructive/10 rounded-md">
                          <Trash2 className="h-3.5 w-3.5" />
                        </div>
                        <span>حذف المشروع الحالي</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {activeProjectId && activeProjectId !== 'all' && <ProjectMembersAvatars projectId={activeProjectId} />}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-1">
            <div className="hidden sm:flex items-center gap-1.5">
              {activeProjectId && activeProjectId !== 'all' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsCollaborationOpen(true)}
                      className="text-muted-foreground hover:text-primary h-9 w-9 hover:bg-primary/5 transition-colors"
                    >
                      <Users className="h-[18px] w-[18px]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>أعضاء المشروع</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="h-9 w-9 text-muted-foreground hover:text-foreground">
                    {isDarkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isDarkMode ? 'الوضع المضيء' : 'الوضع الليلي'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="h-9 w-9 text-muted-foreground hover:text-foreground">
                    <Settings className="h-[18px] w-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>الإعدادات العامة</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block opacity-50" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="sm:hidden h-9 w-9 rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {activeProjectId && activeProjectId !== 'all' && (
                  <DropdownMenuItem onClick={() => setIsCollaborationOpen(true)} className="flex gap-2 py-2.5">
                    <Users className="h-4 w-4" /> أعضاء المشروع
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)} className="flex gap-2 py-2.5">
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDarkMode ? 'الوضع المضيء' : 'الوضع الليلي'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className="flex gap-2 py-2.5">
                  <Settings className="h-4 w-4" /> الإعدادات العامة
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => supabase.auth.signOut()} className="flex gap-2 text-destructive focus:text-destructive py-2.5">
                  <LogOut className="h-4 w-4" /> تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()} className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-xl">
                    <LogOut className="h-[18px] w-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تسجيل الخروج</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </motion.header>

        <div className="flex flex-1 overflow-hidden relative">
          <motion.main
            layout
            className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col gap-4"
          >
            <Routes>
              <Route path="settings" element={<ProjectSettings />} />
              <Route path="/" element={
                activeProjectId ? (
                  <>
                    <div className="flex items-center justify-between shrink-0 mb-2">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-8 bg-primary rounded-full hidden sm:block" />
                         <h2 className="text-xl sm:text-2xl font-black truncate text-foreground tracking-tight">
                          {activeProjectId === 'all' ? 'جميع المهام' : `${projects.find(p => p.id === activeProjectId)?.name || ''}`}
                        </h2>
                      </div>
                      {activeProjectId !== 'all' && (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button onClick={() => setIsCreateTaskOpen(true)} className="shadow-lg shadow-primary/20 rounded-xl px-4 sm:px-6 h-10 font-bold">
                            <Plus className="h-5 w-5 sm:ml-2" /> <span className="hidden sm:inline">إضافة مهمة</span>
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <Suspense fallback={
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      }>
                        <ListView projectId={activeProjectId} onTaskClick={handleTaskClick} userId={session.user.id} />
                      </Suspense>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 shadow-inner"
                    >
                      <Plus className="h-10 w-10 text-primary" />
                    </motion.div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground">مرحباً بك في مسار</h2>
                    <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
                      أنشئ مشروعك الأول للبدء في تتبع مسارك وإدارة مهامك مع التبعيات بشكل احترافي.
                    </p>
                    <Button onClick={handleCreateProject} size="lg" className="rounded-xl px-8 h-12 font-bold shadow-xl shadow-primary/20">أنشئ مشروعك الأول</Button>
                  </div>
                )
              } />
            </Routes>
          </motion.main>
        </div>

        <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        {activeProjectId && activeProjectId !== 'all' && (
          <CollaborationDialog
            projectId={activeProjectId}
            isOpen={isCollaborationOpen}
            onClose={() => setIsCollaborationOpen(false)}
          />
        )}
        <TaskDetailDialog
          taskId={selectedTaskId}
          isOpen={isTaskDetailOpen}
          onClose={() => setIsTaskDetailOpen(false)}
        />

        {activeProjectId && activeProjectId !== 'all' && (
          <CreateTaskDialog
            projectId={activeProjectId}
            isOpen={isCreateTaskOpen}
            onClose={() => setIsCreateTaskOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) migrateFromDexie();
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) migrateFromDexie();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!session) return <Login />;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects/all" replace />} />
      <Route path="/projects/:projectId/*" element={<MainContent session={session} />} />
      <Route path="*" element={<Navigate to="/projects/all" replace />} />
    </Routes>
  );
}
