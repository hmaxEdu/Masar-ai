import { useState, useEffect } from 'react';
import { useProjects, masarActions } from '@/hooks/use-masar';
import { ListView } from '@/components/ListView';
import { TimelineView } from '@/components/TimelineView';
import { TaskTreeView } from '@/components/TaskTreeView';
import { TaskDetailDialog } from '@/components/TaskDetailDialog';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { SettingsDialog } from '@/components/SettingsDialog';
import { AIAssistant } from '@/components/AIAssistant';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Plus, LayoutList, Calendar, Settings, Trash2, MoreVertical, Moon, Sun, GitGraph, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './assets/masar.png';
export default function App() {
  const projects = useProjects();
  const [activeProjectId, setActiveProjectId] = useState<number | 'all' | null>(null);
  const [view, setView] = useState<'list' | 'timeline' | 'tree'>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => { if (typeof window !== 'undefined') { return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches); } return false; });

  useEffect(() => {
    if (projects.length > 0 && activeProjectId === null) {
      setActiveProjectId(projects[0].id!);
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
      const id = await masarActions.addProject(name);
      setActiveProjectId(id as number);
    }
  };

  const handleRenameProject = async (id: number) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const name = prompt('اسم المشروع الجديد:', project.name);
    if (name && name !== project.name) {
      await masarActions.updateProject(id, { name });
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع المهام والتبعيات المرتبطة به.')) {
      await masarActions.deleteProject(id);
      if (activeProjectId === id) {
        const remaining = projects.filter(p => p.id !== id);
        setActiveProjectId(remaining.length > 0 ? remaining[0].id! : null);
      }
    }
  };

  const handleTaskClick = (id: number) => {
    setSelectedTaskId(id);
    setIsTaskDetailOpen(true);
  };

  return (
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
              onValueChange={(v) => setActiveProjectId(v === 'all' ? 'all' : parseInt(v))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="اختر المشروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المشاريع</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id!.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={handleCreateProject} className="flex gap-2">
                  <Plus className="h-4 w-4" /> مشروع جديد
                </DropdownMenuItem>
                {activeProjectId && activeProjectId !== 'all' && (
                  <DropdownMenuItem onClick={() => handleRenameProject(activeProjectId as number)} className="flex gap-2">
                    <Settings className="h-4 w-4" /> إعادة تسمية المشروع
                  </DropdownMenuItem>
                )}
                {activeProjectId && activeProjectId !== 'all' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteProject(activeProjectId as number)}
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

        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'timeline' | 'tree')}>
            <TabsList>
              <TabsTrigger value="list" className="flex gap-2">
                <LayoutList className="h-4 w-4" /> القائمة
              </TabsTrigger>
              <TabsTrigger value="tree" className="flex gap-2">
                <GitGraph className="h-4 w-4" /> الشجرة
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex gap-2">
                <Calendar className="h-4 w-4" /> الجدول الزمني
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant={isAIOpen ? "default" : "outline"}
            size="icon"
            onClick={() => setIsAIOpen(!isAIOpen)}
            className={isAIOpen ? "" : "text-primary"}
          >
            <Sparkles className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </motion.header>

      <div className="flex flex-1 overflow-hidden relative">
        <motion.main
          layout
          className="flex-1 p-6 overflow-hidden flex flex-col gap-4"
        >
          {activeProjectId ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {activeProjectId === 'all' ? 'جميع المهام' : `مهام ${projects.find(p => p.id === activeProjectId)?.name}`}
                </h2>
                {activeProjectId !== 'all' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={() => setIsCreateTaskOpen(true)}>
                      <Plus className="h-4 w-4 ml-2" /> إضافة مهمة
                    </Button>
                  </motion.div>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, x: view === 'list' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: view === 'list' ? -20 : 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex-1 overflow-hidden"
                >
                  {view === 'list' ? (
                    <ListView projectId={activeProjectId as number} onTaskClick={handleTaskClick} />
                  ) : view === 'tree' ? (
                    <TaskTreeView projectId={activeProjectId as number} onTaskClick={handleTaskClick} />
                  ) : (
                    <TimelineView projectId={activeProjectId as number} onTaskClick={handleTaskClick} />
                  )}
                </motion.div>
              </AnimatePresence>
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

        <AnimatePresence>
          {isAIOpen && (
            <AIAssistant
              projectId={activeProjectId}
              onClose={() => setIsAIOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <TaskDetailDialog
        taskId={selectedTaskId}
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
      />

      {activeProjectId && activeProjectId !== 'all' && (
        <CreateTaskDialog
          projectId={activeProjectId as number}
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
        />
      )}
    </div>
  );
}
