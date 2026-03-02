import { useState, useEffect } from 'react';
import { useProjects, masarActions } from '@/hooks/use-masar';
import { Button } from '@/components/ui/button';
import { ListView } from '@/components/ListView';
import { TimelineView } from '@/components/TimelineView';
import { TaskDetailDialog } from '@/components/TaskDetailDialog';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Plus, LayoutList, Calendar, Settings, Trash2, MoreVertical, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const projects = useProjects();
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [view, setView] = useState<'list' | 'timeline'>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && activeProjectId === null) {
      setActiveProjectId(projects[0].id!);
    }
  }, [projects, activeProjectId]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleCreateProject = async () => {
    const name = prompt('اسم المشروع:');
    if (name) {
      const id = await masarActions.addProject(name);
      setActiveProjectId(id as number);
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
    <div className="min-h-screen bg-background flex flex-col font-['ibm-ar'] transition-colors duration-300" dir="rtl">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="border-b px-6 py-3 flex items-center justify-between bg-card"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground"
            >
              م
            </motion.div>
            مسار <span className="text-muted-foreground font-normal text-sm">Masar</span>
          </h1>

          <div className="flex items-center gap-2 mr-4">
            <Select
              value={activeProjectId?.toString() || ''}
              onValueChange={(v) => setActiveProjectId(parseInt(v))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="اختر المشروع" />
              </SelectTrigger>
              <SelectContent>
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
                {activeProjectId && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteProject(activeProjectId)}
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
          <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'timeline')}>
            <TabsList>
              <TabsTrigger value="list" className="flex gap-2">
                <LayoutList className="h-4 w-4" /> القائمة
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex gap-2">
                <Calendar className="h-4 w-4" /> الجدول الزمني
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </motion.header>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 p-6 overflow-hidden flex flex-col gap-4"
      >
        {activeProjectId ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                مهام {projects.find(p => p.id === activeProjectId)?.name}
              </h2>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => setIsCreateTaskOpen(true)}>
                  <Plus className="h-4 w-4 ml-2" /> إضافة مهمة
                </Button>
              </motion.div>
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
                  <ListView projectId={activeProjectId} onTaskClick={handleTaskClick} />
                ) : (
                  <TimelineView projectId={activeProjectId} onTaskClick={handleTaskClick} />
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

      <TaskDetailDialog
        taskId={selectedTaskId}
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
      />

      {activeProjectId && (
        <CreateTaskDialog
          projectId={activeProjectId}
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
        />
      )}
    </div>
  );
}
