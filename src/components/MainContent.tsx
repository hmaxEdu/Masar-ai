// src/components/MainContent.tsx
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
import { Label } from "@/components/ui/label";
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
import { useMyRole, useProjectMembers, useProjects } from "@/hooks/use-masar";
import { supabase } from "@/lib/supabase";
import { type Session } from "@supabase/supabase-js";
import {
  KanbanSquare,
  LayoutDashboard,
  LayoutList,
  Loader2,
  LogOut,
  Menu,
  Moon,
  Network,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Users
} from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import EmptyState from "./EmptyState";
import { Logo } from "./Logo";

// Lazily load nested dashboard modules
const AIAgent = lazy(() => import("@/components/AIAgent"));
const BoardView = lazy(() => import("@/components/BoardView"));
const NodeView = lazy(() => import("@/components/NodeView")); // <-- Added NodeView
const CollaborationDialog = lazy(
  () => import("@/components/CollaborationDialog"),
);
const CreateTaskDialog = lazy(() => import("@/components/CreateTaskDialog"));
const ProjectInsightsDialog = lazy(
  () => import("@/components/ProjectInsightsDialog"),
);
const ProjectSettings = lazy(() => import("@/components/ProjectSettings"));
const ProjectDialog = lazy(() => import("@/components/ProjectDialog"));
const SettingsDialog = lazy(() =>
  import("@/components/SettingsDialog").then((m) => ({
    default: m.SettingsDialog,
  })),
);
const TaskDetailDialog = lazy(
  () => import("@/components/TaskDetail/TaskDetailDialog"),
);
const ListView = lazy(() => import("./ListView"));
const DashboardView = lazy(() => import("./Dashboard/DashboardView"));

function ProjectMembersAvatars({ projectId }: { projectId: string }) {
  const members = useProjectMembers(projectId);
  if (members.length === 0) return null;

  return (
    <div className="flex -space-x-1.5 ml-1">
      {members.slice(0, 3).map((m) => (
        <Tooltip key={m.id}>
          <TooltipTrigger asChild>
            <AvatarGroup>
              <Avatar className="h-6 w-6 ring-1 ring-background shadow-xs">
                <AvatarImage src={m.profiles?.avatar_url} />
                <AvatarFallback className="text-[8px]">
                  {m.profiles?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </AvatarGroup>
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            {m.profiles?.email}
          </TooltipContent>
        </Tooltip>
      ))}
      {members.length > 3 && (
        <Avatar className="h-6 w-6 ring-1 ring-background shadow-xs">
          <AvatarFallback className="text-[8px] bg-muted">{`+${members.length - 3}`}</AvatarFallback>
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
  // <-- Updated ViewMode Type state tracking
  const [viewMode, setViewMode] = useState<"list" | "board" | "dashboard" | "node">(
    "dashboard",
  );

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
        {/* --- LEFT SIDEBAR (App Shell — Clean, Compact) --- */}
        <aside className="hidden md:flex w-56 flex-col border-r border-border bg-card/10 backdrop-blur-md shrink-0">
          <div
            className="h-12 flex items-center gap-2 px-4 border-b border-border/40 cursor-pointer hover:bg-muted/20 transition-colors"
            onClick={() => navigate("/projects/all")}
          >
            <Logo className="w-5 h-5 brightness-0 dark:invert" />
            <h1 className="text-base font-black tracking-tight">Masar</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Workspace
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-sm"
                      onClick={handleCreateProject}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    New Project
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={activeProjectId || "all"}
                onValueChange={(v) => navigate(`/projects/${v}`)}
              >
                <SelectTrigger className="w-full bg-background/50 border-border/60 shadow-none h-8 text-xs focus:ring-1 focus:ring-primary/30">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All Projects
                  </SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeProjectId && activeProjectId !== "all" && (
              <div className="space-y-0.5">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 mb-1 block">
                  Views
                </Label>
                <Button
                  variant={viewMode === "dashboard" ? "secondary" : "ghost"}
                  className={`w-full justify-start text-xs h-8 px-2 ${viewMode === "dashboard" ? "bg-muted/80 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setViewMode("dashboard")}
                >
                  <LayoutDashboard className="mr-2 h-3.5 w-3.5" /> Dashboard
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  className={`w-full justify-start text-xs h-8 px-2 ${viewMode === "list" ? "bg-muted/80 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="mr-2 h-3.5 w-3.5" /> List
                </Button>
                <Button
                  variant={viewMode === "board" ? "secondary" : "ghost"}
                  className={`w-full justify-start text-xs h-8 px-2 ${viewMode === "board" ? "bg-muted/80 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setViewMode("board")}
                >
                  <KanbanSquare className="mr-2 h-3.5 w-3.5" /> Board
                </Button>
                {/* <-- Node Graph View Link --> */}
                <Button
                  variant={viewMode === "node" ? "secondary" : "ghost"}
                  className={`w-full justify-start text-xs h-8 px-2 ${viewMode === "node" ? "bg-muted/80 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setViewMode("node")}
                >
                  <Network className="mr-2 h-3.5 w-3.5" /> Node Graph
                </Button>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border/40 space-y-0.5 bg-muted/5">
            {activeProjectId && activeProjectId !== "all" && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsCollaborationOpen(true)}
                >
                  <Users className="mr-2 h-3.5 w-3.5" /> Team
                </Button>
                {canManage && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      navigate(`/projects/${activeProjectId}/settings`)
                    }
                  >
                    <Settings className="mr-2 h-3.5 w-3.5" /> Project Settings
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="mr-2 h-3.5 w-3.5" /> App Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? (
                <Sun className="mr-2 h-3.5 w-3.5" />
              ) : (
                <Moon className="mr-2 h-3.5 w-3.5" />
              )}{" "}
              Theme
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-destructive/80 hover:bg-destructive/5 hover:text-destructive"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </aside>

        {/* --- MAIN CONTENT (Sleek Viewport) --- */}
        <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden h-12 border-b border-border/40 flex items-center justify-between px-3 bg-card/20 backdrop-blur-md z-10 shrink-0">
            <div
              className="flex items-center gap-2"
              onClick={() => navigate("/projects/all")}
            >
              <Logo className="w-4 h-4" />
              <h1 className="text-sm font-bold tracking-tight">Masar</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <Menu className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuItem onClick={() => navigate("/projects/all")}>
                  All Projects
                </DropdownMenuItem>
                {activeProjectId && activeProjectId !== "all" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setViewMode("dashboard")}>
                      <LayoutDashboard className="mr-2 h-3.5 w-3.5" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode("list")}>
                      <LayoutList className="mr-2 h-3.5 w-3.5" /> List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode("board")}>
                      <KanbanSquare className="mr-2 h-3.5 w-3.5" /> Board
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode("node")}>
                      <Network className="mr-2 h-3.5 w-3.5" /> Node Graph
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsCollaborationOpen(true)}
                    >
                      <Users className="mr-2 h-3.5 w-3.5" /> Team
                    </DropdownMenuItem>
                    {canManage && (
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/projects/${activeProjectId}/settings`)
                        }
                      >
                        <Settings className="mr-2 h-3.5 w-3.5" /> Project
                        Settings
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                  <Settings className="mr-2 h-3.5 w-3.5" /> App Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? (
                    <Sun className="mr-2 h-3.5 w-3.5" />
                  ) : (
                    <Moon className="mr-2 h-3.5 w-3.5" />
                  )}{" "}
                  Theme
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => supabase.auth.signOut()}
                  className="text-destructive text-xs"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Desktop Compact Header (h-12) */}
          <header className="h-12 hidden md:flex items-center justify-between px-4 border-b border-border/40 shrink-0 z-10 bg-background/30 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold tracking-tight text-foreground/90">
                {activeProjectId === "all"
                  ? "All Tasks"
                  : projects.find((p) => p.id === activeProjectId)?.name ||
                    "Project"}
              </h2>
              {activeProjectId !== "all" && (
                <>
                  <div className="h-3 w-px bg-border/40" />
                  <ProjectMembersAvatars projectId={activeProjectId!} />
                </>
              )}
            </div>

            {activeProjectId && activeProjectId !== "all" && (
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => setIsInsightsOpen(true)}
                  size="sm"
                  variant="secondary"
                  className="h-7 px-2.5 text-xs bg-primary/5 text-primary hover:bg-primary/10 border border-primary/15 shadow-2xs"
                >
                  <Sparkles className="h-3 w-3 sm:mr-1.5" />{" "}
                  <span className="hidden sm:inline">AI Insights</span>
                </Button>
                <Button
                  onClick={() => setIsCreateTaskOpen(true)}
                  size="sm"
                  className="h-7 px-2.5 text-xs shadow-2xs font-semibold"
                >
                  <Plus className="h-3 w-3 sm:mr-1.5" />{" "}
                  <span className="hidden sm:inline">New Task</span>
                </Button>
              </div>
            )}
          </header>

          {/* High Density Padding Container (p-3 sm:p-4) */}
          <div className="flex-1 overflow-hidden p-3 sm:p-4">
            <Routes>
              <Route
                path="settings"
                element={
                  <Suspense
                    fallback={
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
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
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      }
                    >
                      {/* View Output Routing logic */}
                      {viewMode === "dashboard" ? (
                        <DashboardView projectId={activeProjectId} />
                      ) : viewMode === "list" ? (
                        <ListView
                          projectId={activeProjectId}
                          onTaskClick={handleTaskClick}
                        />
                      ) : viewMode === "board" ? (
                        <BoardView
                          projectId={activeProjectId}
                          onTaskClick={handleTaskClick}
                        />
                      ) : (
                        <NodeView
                          projectId={activeProjectId}
                          onTaskClick={handleTaskClick}
                        />
                      )}
                    </Suspense>
                  ) : (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <EmptyState
                        icon={Sparkles}
                        title="Initialize Workspace"
                        description="You don't have any projects yet. Create a project to start planning with AI."
                        actionLabel="Create Project"
                        onAction={handleCreateProject}
                        secondaryActionLabel="Try AI Demo"
                        onSecondaryAction={() =>
                          toast.info(
                            "Ask the AI Agent in the bottom right to 'Build a marketing plan'!",
                          )
                        }
                        className="max-w-md w-full border-none bg-transparent"
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