import { useState, useEffect } from 'react';
import { useProjects, masarActions } from '@/hooks/use-masar';
import { Button } from '@/components/ui/button';
import { ListView } from '@/components/ListView';
import { TimelineView } from '@/components/TimelineView';
import { TaskDetailDialog } from '@/components/TaskDetailDialog';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, LayoutList, Calendar, Settings } from 'lucide-react';

export default function App() {
  const projects = useProjects();
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [view, setView] = useState<'list' | 'timeline'>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && activeProjectId === null) {
      setActiveProjectId(projects[0].id!);
    }
  }, [projects, activeProjectId]);

  const handleCreateProject = async () => {
    const name = prompt('Project Name:');
    if (name) {
      const id = await masarActions.addProject(name);
      setActiveProjectId(id as number);
    }
  };

  const handleTaskClick = (id: number) => {
    setSelectedTaskId(id);
    setIsTaskDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">M</div>
            Masar <span className="text-muted-foreground font-normal">مسار</span>
          </h1>

          <div className="flex items-center gap-2 ml-4">
            <Select
              value={activeProjectId?.toString() || ''}
              onValueChange={(v) => setActiveProjectId(parseInt(v))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id!.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={handleCreateProject}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'timeline')}>
            <TabsList>
              <TabsTrigger value="list" className="flex gap-2">
                <LayoutList className="h-4 w-4" /> List
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex gap-2">
                <Calendar className="h-4 w-4" /> Timeline
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
        {activeProjectId ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {projects.find(p => p.id === activeProjectId)?.name} Tasks
              </h2>
              <Button onClick={() => setIsCreateTaskOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Task
              </Button>
            </div>

            {view === 'list' ? (
              <ListView projectId={activeProjectId} onTaskClick={handleTaskClick} />
            ) : (
              <TimelineView projectId={activeProjectId} onTaskClick={handleTaskClick} />
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">Welcome to Masar</h2>
            <p className="text-muted-foreground max-w-md">
              Create your first project to start tracking your path and managing your tasks with dependencies.
            </p>
            <Button onClick={handleCreateProject}>Create Your First Project</Button>
          </div>
        )}
      </main>

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
