import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';
import { useProjects, masarActions } from './hooks/use-masar';
import TaskDetailDialog from './components/TaskDetailDialog';
import CreateTaskDialog from './components/CreateTaskDialog';
import { SettingsDialog } from './components/SettingsDialog';
import CollaborationDialog from './components/CollaborationDialog';
import Login from './components/Login';
import { migrateFromDexie } from './lib/migration';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Button } from './components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './components/ui/tooltip';
import { Plus, Settings, Trash2, MoreVertical, Moon, Sun, LogOut, Users, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from './assets/masar.png';
import { type Session } from '@supabase/supabase-js';

// Lazy load heavy view components
const ListView = lazy(() => import('./components/ListView'));

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const projects = useProjects(session?.user?.id);
  const [activeProjectId, setActiveProjectId] = useState<string | 'all' | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

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

  useEffect(() => {
    if (projects.length > 0 && activeProjectId === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId]);

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
    const name = prompt('اسم المشروع:');
    if (name) {
      const { data } = await masarActions.addProject(name);
      if (data) setActiveProjectId(data.id);
    }
  };

  const handleRenameProject = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const name = prompt('اسم المشروع الجديد:', project.name);
    if (name && name !== project.name) {
      await masarActions.updateProject(id, { name });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع المهام والتبعيات المرتبطة به.')) {
      await masarActions.deleteProject(id);
      if (activeProjectId === id) {
        const remaining = projects.filter(p => p.id !== id);
        setActiveProjectId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const handleTaskClick = (id: string) => {
    setSelectedTaskId(id);
    setIsTaskDetailOpen(true);
  };

  if (loading) return null;
  if (!session) return <Login />;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col font-['ibm-ar'] transition-colors duration-300 overflow-hidden h-screen" dir="rtl">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="border-b px-6 py-3 flex items-center justify-between bg-card shrink-0 z-10"
        >
          <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10"
              >
                <img src={Logo} alt="Project Logo" />
              </motion.div>

            <div className="flex items-center gap-2 mr-4">
              <Select
                value={activeProjectId?.toString() || ''}
                onValueChange={(v) => setActiveProjectId(v)}
              >
                <SelectTrigger className="w-[150px] sm:w-[200px]">
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المشاريع</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>خيارات المشروع</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={handleCreateProject} className="flex gap-2">
                    <Plus className="h-4 w-4" /> مشروع جديد
                  </DropdownMenuItem>
                  {activeProjectId && activeProjectId !== 'all' && (
                    <DropdownMenuItem onClick={() => handleRenameProject(activeProjectId as string)} className="flex gap-2">
                      <Settings className="h-4 w-4" /> إعادة تسمية المشروع
                    </DropdownMenuItem>
                  )}
                  {activeProjectId && activeProjectId !== 'all' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteProject(activeProjectId as string)}
                        className="flex gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> حذف المشروع الحالي
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {activeProjectId && activeProjectId !== 'all' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCollaborationOpen(true)}
                    className="text-primary"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>أعضاء المشروع</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isDarkMode ? 'الوضع المضيء' : 'الوضع الليلي'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>الإعدادات</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => supabase.auth.signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>تسجيل الخروج</TooltipContent>
            </Tooltip>
          </div>
        </motion.header>

        <div className="flex flex-1 overflow-hidden relative">
          <motion.main
            layout
            className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col gap-4"
          >
            {activeProjectId ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold truncate ml-2">
                    {activeProjectId === 'all' ? 'جميع المهام' : `مهام ${projects.find(p => p.id === activeProjectId)?.name}`}
                  </h2>
                  {activeProjectId !== 'all' && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={() => setIsCreateTaskOpen(true)} size="sm" className="sm:size-default">
                        <Plus className="h-4 w-4 sm:ml-2" /> <span className="hidden sm:inline">إضافة مهمة</span>
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
                    <ListView projectId={activeProjectId as string} onTaskClick={handleTaskClick} />
                  </Suspense>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4"
                >
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </motion.div>
                <h2 className="text-2xl font-semibold">مرحباً بك في مسار</h2>
                <p className="text-muted-foreground max-w-md">
                  أنشئ مشروعك الأول للبدء في تتبع مسارك وإدارة مهامك مع التبعيات.
                </p>
                <Button onClick={handleCreateProject}>أنشئ مشروعك الأول</Button>
              </div>
            )}
          </motion.main>
        </div>

        <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        {activeProjectId && activeProjectId !== 'all' && (
          <CollaborationDialog
            projectId={activeProjectId as string}
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
            projectId={activeProjectId as string}
            isOpen={isCreateTaskOpen}
            onClose={() => setIsCreateTaskOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
