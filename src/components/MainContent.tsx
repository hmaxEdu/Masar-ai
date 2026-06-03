// src/components/MainContent.tsx
import { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate, useParams, Route, Routes } from "react-router-dom";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useMyRole, useProjectMembers, useProjects } from "@/hooks/use-masar";
import { toast } from "sonner";
import { Logo } from "./Logo";
import EmptyState from "./EmptyState";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
  KanbanSquare,
  LayoutDashboard,
  LayoutList,
  Loader2,
  LogOut,
  Menu,
  Moon,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";

// Lazily load nested dashboard modules
const AIAgent = lazy(() => import("@/components/AIAgent"));
const BoardView = lazy(() => import("@/components/BoardView"));
const CollaborationDialog = lazy(() => import("@/components/CollaborationDialog"));
const CreateTaskDialog = lazy(() => import("@/components/CreateTaskDialog"));
const ProjectInsightsDialog = lazy(() => import("@/components/ProjectInsightsDialog"));
const ProjectSettings = lazy(() => import("@/components/ProjectSettings"));
const ProjectDialog = lazy(() => import("@/components/ProjectDialog"));
const SettingsDialog = lazy(() =>
  import("@/components/SettingsDialog").then((m) => ({
    default: m.SettingsDialog,
  })),
);
const TaskDetailDialog = lazy(() => import("@/components/TaskDetail/TaskDetailDialog"));
const ListView = lazy(() => import("./ListView"));
const DashboardView = lazy(() => import("./Dashboard/DashboardView"));

function ProjectMembersAvatars({ projectId }: { projectId: string }) {
  const members = useProjectMembers(projectId);
  if (members.length === 0) return null;

  return (
    <div className="flex -space-x-2 ml-2">
      {members.slice(0, 3).map((m) => (
        <Tooltip key={m.id}>
          <TooltipTrigger asChild>
            <AvatarGroup>
              <Avatar className="shadow-lg">
                <AvatarImage src={m.profiles?.avatar_url} />
                <AvatarFallback>
                  {m.profiles?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </AvatarGroup>
          </TooltipTrigger>
          <TooltipContent>{m.profiles?.email}</TooltipContent>
        </Tooltip>
      ))}
      {members.length > 3 && (
        <Avatar>
          <AvatarFallback>{`+${members.length - 3}`}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default function MainContent({ session }: { session: Session }) {
  const { projectId: activeProjectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = useProjects(session.user.id);
  const myRole = useMyRole(activeProjectId);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "board" | "dashboard">("dashboard");

  const [projectDialog, setProjectDialog] = useState<{
    isOpen: boolean;
    mode: "create" | "rename";
    projectId?: string;
    initialName?: string;
  }>({ isOpen: false, mode: "create" });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleCreateProject = () =>
    setProjectDialog({ isOpen: true, mode: "create", initialName: "" });

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailOpen(true);
  };

  const canManage = myRole === "owner" || myRole === "admin";

  if (projectsLoading) return null;

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
        {/* --- LEFT SIDEBAR (App Shell) --- */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/30 backdrop-blur-md shrink-0">
          <div
            className="h-16 flex items-center gap-3 px-6 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate("/projects/all")}
          >
            <Logo className="w-6 h-6 sm:w-6 sm:h-6" />
            <h1 className="text-xl font-bold tracking-tight">Masar</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Workspace
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={handleCreateProject}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New Project</TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={activeProjectId || "all"}
                onValueChange={(v) => navigate(`/projects/${v}`)}
              >
                <SelectTrigger className="w-full bg-background shadow-sm h-9 text-sm">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeProjectId && activeProjectId !== "all" && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Views
                </Label>
                <Button
                  variant={viewMode === "dashboard" ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setViewMode("dashboard")}
                >
                  <LayoutDashboard className="mr-3 h-4 w-4" /> Dashboard
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="mr-3 h-4 w-4" /> List
                </Button>
                <Button
                  variant={viewMode === "board" ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setViewMode("board")}
                >
                  <KanbanSquare className="mr-3 h-4 w-4" /> Board
                </Button>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border space-y-1 bg-muted/10">
            {activeProjectId && activeProjectId !== "all" && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => setIsCollaborationOpen(true)}
                >
                  <Users className="mr-3 h-4 w-4" /> Team
                </Button>
                {canManage && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() =>
                      navigate(`/projects/${activeProjectId}/settings`)
                    }
                  >
                    <Settings className="mr-3 h-4 w-4" /> Project Settings
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="mr-3 h-4 w-4" /> App Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? (
                <Sun className="mr-3 h-4 w-4" />
              ) : (
                <Moon className="mr-3 h-4 w-4" />
              )}{" "}
              Theme
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut className="mr-3 h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden h-14 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-md z-10 shrink-0">
            <div
              className="flex items-center gap-2"
              onClick={() => navigate("/projects/all")}
            >
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Logo />
              </div>
              <h1 className="text-lg font-bold tracking-tight">Masar</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/projects/all")}>
                  All Projects
                </DropdownMenuItem>
                {activeProjectId && activeProjectId !== "all" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setViewMode("dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode("list")}>
                      <LayoutList className="mr-2 h-4 w-4" /> List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode("board")}>
                      <KanbanSquare className="mr-2 h-4 w-4" /> Board
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsCollaborationOpen(true)}
                    >
                      <Users className="mr-2 h-4 w-4" /> Team
                    </DropdownMenuItem>
                    {canManage && (
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/projects/${activeProjectId}/settings`)
                        }
                      >
                        <Settings className="mr-2 h-4 w-4" /> Project Settings
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" /> App Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}{" "}
                  Toggle Theme
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => supabase.auth.signOut()}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Desktop Top Content Bar */}
          <header className="h-16 hidden md:flex items-center justify-between px-6 border-b border-border shrink-0 z-10 bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold tracking-tight">
                {activeProjectId === "all"
                  ? "All Tasks"
                  : projects.find((p) => p.id === activeProjectId)?.name ||
                    "Project"}
              </h2>
              {activeProjectId !== "all" && (
                <ProjectMembersAvatars projectId={activeProjectId!} />
              )}
            </div>

            {activeProjectId && activeProjectId !== "all" && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsInsightsOpen(true)}
                  size="sm"
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-sm"
                >
                  <Sparkles className="h-4 w-4 sm:mr-2" />{" "}
                  <span className="hidden sm:inline">AI Insights</span>
                </Button>
                <Button
                  onClick={() => setIsCreateTaskOpen(true)}
                  size="sm"
                  className="shadow-md shadow-primary/25"
                >
                  <Plus className="h-4 w-4 sm:mr-2" />{" "}
                  <span className="hidden sm:inline">New Task</span>
                </Button>
              </div>
            )}
          </header>

          <div className="flex-1 overflow-hidden p-4 sm:p-6">
            <Routes>
              <Route
                path="settings"
                element={
                  <Suspense
                    fallback={
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    }
                  >
                    <ProjectSettings />
                  </Suspense>
                }
              />
              <Route
                path="/"
                element={
                  activeProjectId ? (
                    <Suspense
                      fallback={
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      }
                    >
                      {viewMode === "dashboard" ? (
                        <DashboardView projectId={activeProjectId} />
                      ) : viewMode === "list" ? (
                        <ListView
                          projectId={activeProjectId}
                          onTaskClick={handleTaskClick}
                        />
                      ) : (
                        <BoardView
                          projectId={activeProjectId}
                          onTaskClick={handleTaskClick}
                        />
                      )}
                    </Suspense>
                  ) : (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <EmptyState
                        icon={Sparkles}
                        title="Ready to start your path?"
                        description="You don't have any projects yet. Initialize a workspace to start managing tasks with AI-driven precision."
                        actionLabel="Create Project"
                        onAction={handleCreateProject}
                        secondaryActionLabel="Try AI Demo"
                        onSecondaryAction={() =>
                          toast.info(
                            "Ask the AI Agent in the bottom right to 'Build a marketing plan'!",
                          )
                        }
                        className="max-w-2xl w-full border-none bg-transparent"
                      />
                    </div>
                  )
                }
              />
            </Routes>
          </div>
        </main>

        <Suspense fallback={null}>
          <SettingsDialog
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
          <ProjectDialog
            isOpen={projectDialog.isOpen}
            mode={projectDialog.mode}
            projectId={projectDialog.projectId}
            initialName={projectDialog.initialName}
            onClose={() =>
              setProjectDialog((prev) => ({ ...prev, isOpen: false }))
            }
          />
          {activeProjectId && activeProjectId !== "all" && (
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
          {activeProjectId && activeProjectId !== "all" && (
            <CreateTaskDialog
              projectId={activeProjectId}
              isOpen={isCreateTaskOpen}
              onClose={() => setIsCreateTaskOpen(false)}
            />
          )}
          {activeProjectId && activeProjectId !== "all" && (
            <ProjectInsightsDialog
              projectId={activeProjectId}
              isOpen={isInsightsOpen}
              onClose={() => setIsInsightsOpen(false)}
            />
          )}
          {activeProjectId && activeProjectId !== "all" && (
            <AIAgent projectId={activeProjectId} />
          )}
        </Suspense>
      </div>
    </TooltipProvider>
  );
}