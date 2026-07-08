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
import { lazy, Suspense, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import EmptyState from "./EmptyState";
import { Logo } from "./Logo";
import { useTheme } from "./theme-provider";

const AIAgent = lazy(() => import("@/components/AIAgent"));
const BoardView = lazy(() => import("@/components/BoardView"));
const NodeView = lazy(() => import("@/components/NodeView"));
const CollaborationDialog = lazy(() => import("@/components/CollaborationDialog"));
const CreateTaskDialog = lazy(() => import("@/components/CreateTaskDialog"));
const ProjectInsightsDialog = lazy(() => import("@/components/ProjectInsightsDialog"));
const ProjectSettings = lazy(() => import("@/components/ProjectSettings"));
const ProjectDialog = lazy(() => import("@/components/ProjectDialog"));
const SettingsDialog = lazy(() =>
  import("@/components/SettingsDialog").then((m) => ({ default: m.SettingsDialog }))
);
const TaskDetailDialog = lazy(() => import("@/components/TaskDetail/TaskDetailDialog"));
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
                <AvatarFallback className="text-[10px]">
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
          <AvatarFallback className="text-[10px] bg-muted">{`+${members.length - 3}`}</AvatarFallback>
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
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "board" | "dashboard" | "node">("dashboard");

  const [projectDialog, setProjectDialog] = useState<{
    isOpen: boolean;
    mode: "create" | "rename";
    projectId?: string;
    initialName?: string;
  }>({ isOpen: false, mode: "create" });

  const handleCreateProject = () =>
    setProjectDialog({ isOpen: true, mode: "create", initialName: "" });

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailOpen(true);
  };

  const canManage = myRole === "owner" || myRole === "admin";
  const hasNoProjects = projects.length === 0;

  if (projectsLoading) return null;

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
        
        {/* --- LEFT SIDEBAR (Desktop) --- */}
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
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm" onClick={handleCreateProject}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">New Project</TooltipContent>
                </Tooltip>
              </div>
              <Select value={activeProjectId || "all"} onValueChange={(v) => navigate(`/projects/${v}`)}>
                <SelectTrigger className="w-full bg-background/50 border-border/60 shadow-none h-8 text-xs focus:ring-1 focus:ring-primary/30">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeProjectId && activeProjectId !== "all" && !hasNoProjects && (
              <div className="space-y-0.5">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 mb-1 block">Views</Label>
                <Button variant={viewMode === "dashboard" ? "secondary" : "ghost"} className={`w-full justify-start text-xs h-8 px-2 ${viewMode === "dashboard" ? "bg-muted/80 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setViewMode("dashboard")}>
                  <LayoutDashboard className="mr-2 h-3.5 w-3.5" /> Dashboard
                </Button>
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} className={`w-full justify-start text-xs h-8 px-2 ${viewMode === "list" ? "bg-muted/80 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setViewMode("list")}>
                  <LayoutList className="mr-2 h-3.5 w-3.5" /> List
                </Button>
                <Button variant={viewMode === "board" ? "secondary" : "ghost"} className={`w-full justify-start text-xs h-8 px-2 ${viewMode === "board" ? "bg-muted/80 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setViewMode("board")}>
                  <KanbanSquare className="mr-2 h-3.5 w-3.5" /> Board
                </Button>
                <Button variant={viewMode === "node" ? "secondary" : "ghost"} className={`w-full justify-start text-xs h-8 px-2 ${viewMode === "node" ? "bg-muted/80 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setViewMode("node")}>
                  <Network className="mr-2 h-3.5 w-3.5" /> Node Graph
                </Button>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border/40 space-y-0.5 bg-muted/5">
            {activeProjectId && activeProjectId !== "all" && !hasNoProjects && (
              <>
                <Button variant="ghost" className="w-full justify-start text-xs h-8 px-2 text-muted-foreground hover:text-foreground" onClick={() => setIsCollaborationOpen(true)}>
                  <Users className="mr-2 h-3.5 w-3.5" /> Team
                </Button>
                {canManage && (
                  <Button variant="ghost" className="w-full justify-start text-xs h-8 px-2 text-muted-foreground hover:text-foreground" onClick={() => navigate(`/projects/${activeProjectId}/settings`)}>
                    <Settings className="mr-2 h-3.5 w-3.5" /> Project Settings
                  </Button>
                )}
              </>
            )}
            <Button variant="ghost" className="w-full justify-start text-xs h-8 px-2 text-muted-foreground hover:text-foreground" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="mr-2 h-3.5 w-3.5" /> App Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-xs h-8 px-2 text-muted-foreground hover:text-foreground" onClick={() => setTheme(isDarkMode ? "light" : "dark")}>
              {isDarkMode ? <Sun className="mr-2 h-3.5 w-3.5" /> : <Moon className="mr-2 h-3.5 w-3.5" />} Theme
            </Button>
            <Button variant="ghost" className="w-full justify-start text-xs h-8 px-2 text-destructive/80 hover:bg-destructive/5 hover:text-destructive" onClick={() => supabase.auth.signOut()}>
              <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
          
          {/* Mobile Header: Grid layout to allow the Select input to span gracefully */}
          <header className="md:hidden h-14 border-b border-border/40 flex items-center justify-between px-3 bg-card/30 backdrop-blur-xl z-10 shrink-0 gap-3">
            <div className="shrink-0 flex items-center justify-center cursor-pointer" onClick={() => navigate("/projects/all")}>
              <Logo className="w-6 h-6" />
            </div>
            
            {/* FIX: Replaced static text with an interactive Select allowing rapid project switching on mobile */}
            <div className="flex-1 min-w-0">
              <Select value={activeProjectId || "all"} onValueChange={(v) => navigate(`/projects/${v}`)}>
                <SelectTrigger className="w-full h-9 bg-muted/40 border-none font-bold text-[14px] truncate flex items-center justify-between shadow-none focus:ring-0">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh] overflow-y-auto">
                  <SelectItem value="all" className="py-2.5 text-sm font-semibold">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="py-2.5 text-sm">{p.name}</SelectItem>
                  ))}
                  <div className="p-2 border-t border-border/30 mt-1">
                    <Button variant="secondary" size="sm" className="w-full text-xs h-8" onClick={handleCreateProject}>
                       <Plus className="h-3 w-3 mr-1.5" /> New Project
                    </Button>
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div className="shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg bg-background/50 border-border/60">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 text-sm p-1.5 shadow-xl">
                  {activeProjectId && activeProjectId !== "all" && !hasNoProjects && (
                    <>
                      <div className="px-2 py-1.5"><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active View</span></div>
                      <DropdownMenuItem className="py-3 px-3" onClick={() => setViewMode("dashboard")}><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</DropdownMenuItem>
                      <DropdownMenuItem className="py-3 px-3" onClick={() => setViewMode("list")}><LayoutList className="mr-2 h-4 w-4" /> List</DropdownMenuItem>
                      <DropdownMenuItem className="py-3 px-3" onClick={() => setViewMode("board")}><KanbanSquare className="mr-2 h-4 w-4" /> Board</DropdownMenuItem>
                      <DropdownMenuItem className="py-3 px-3" onClick={() => setViewMode("node")}><Network className="mr-2 h-4 w-4" /> Node Graph</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="py-3 px-3" onClick={() => setIsCollaborationOpen(true)}><Users className="mr-2 h-4 w-4" /> Manage Team</DropdownMenuItem>
                      {canManage && (
                        <DropdownMenuItem className="py-3 px-3" onClick={() => navigate(`/projects/${activeProjectId}/settings`)}><Settings className="mr-2 h-4 w-4" /> Project Settings</DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem className="py-3 px-3" onClick={() => setIsSettingsOpen(true)}><Settings className="mr-2 h-4 w-4" /> App Settings</DropdownMenuItem>
                  <DropdownMenuItem className="py-3 px-3" onClick={() => setTheme(isDarkMode ? "light" : "dark")}>{isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />} Theme</DropdownMenuItem>
                  <DropdownMenuItem className="py-3 px-3 text-destructive" onClick={() => supabase.auth.signOut()}><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Desktop Compact Header */}
          <header className="h-12 hidden md:flex items-center justify-between px-4 border-b border-border/40 shrink-0 z-10 bg-background/30 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold tracking-tight text-foreground/90">
                {activeProjectId === "all" ? "All Tasks" : projects.find((p) => p.id === activeProjectId)?.name || "Project"}
              </h2>
              {activeProjectId !== "all" && !hasNoProjects && (
                <>
                  <div className="h-3 w-px bg-border/40" />
                  <ProjectMembersAvatars projectId={activeProjectId!} />
                </>
              )}
            </div>

            {activeProjectId && activeProjectId !== "all" && !hasNoProjects && (
              <div className="flex items-center gap-2">
                <Button onClick={() => setIsInsightsOpen(true)} size="sm" variant="secondary" className="h-8 px-3 text-xs bg-primary/5 text-primary hover:bg-primary/10 border border-primary/15 shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">AI Insights</span>
                </Button>
                <Button onClick={() => setIsCreateTaskOpen(true)} size="sm" className="h-8 px-3 text-xs shadow-2xs font-semibold">
                  <Plus className="h-3.5 w-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">New Task</span>
                </Button>
              </div>
            )}
          </header>

          <div className="flex-1 overflow-hidden p-3 sm:p-4">
            <Routes>
              <Route path="settings" element={<Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}><ProjectSettings /></Suspense>} />
              <Route path="/" element={
                  hasNoProjects ? (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <EmptyState icon={Sparkles} title="Initialize Workspace" description="You don't have any projects yet. Create a project to start planning with AI." actionLabel="Create Project" onAction={handleCreateProject} secondaryActionLabel="Try AI Demo" onSecondaryAction={() => toast.info("Ask the AI Agent in the bottom right to 'Build a marketing plan'!")} className="max-w-md w-full border-none bg-transparent" />
                    </div>
                  ) : activeProjectId ? (
                    <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}>
                      {viewMode === "dashboard" ? <DashboardView projectId={activeProjectId} /> : viewMode === "list" ? <ListView projectId={activeProjectId} onTaskClick={handleTaskClick} /> : viewMode === "board" ? <BoardView projectId={activeProjectId} onTaskClick={handleTaskClick} /> : <NodeView projectId={activeProjectId} onTaskClick={handleTaskClick} />}
                    </Suspense>
                  ) : null
                }
              />
            </Routes>
          </div>
        </main>

        <Suspense fallback={null}>
          <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
          <ProjectDialog isOpen={projectDialog.isOpen} mode={projectDialog.mode} projectId={projectDialog.projectId} initialName={projectDialog.initialName} onClose={() => setProjectDialog((prev) => ({ ...prev, isOpen: false }))} />
          {activeProjectId && activeProjectId !== "all" && <CollaborationDialog projectId={activeProjectId} isOpen={isCollaborationOpen} onClose={() => setIsCollaborationOpen(false)} />}
          <TaskDetailDialog taskId={selectedTaskId} isOpen={isTaskDetailOpen} onClose={() => setIsTaskDetailOpen(false)} />
          {activeProjectId && activeProjectId !== "all" && <CreateTaskDialog projectId={activeProjectId} isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} />}
          {activeProjectId && activeProjectId !== "all" && <ProjectInsightsDialog projectId={activeProjectId} isOpen={isInsightsOpen} onClose={() => setIsInsightsOpen(false)} />}
          {activeProjectId && activeProjectId !== "all" && <AIAgent projectId={activeProjectId} />}
        </Suspense>
      </div>
    </TooltipProvider>
  );
}