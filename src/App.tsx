import Logo from "@/assets/masar.png";
import AIAgent from "@/components/AIAgent";
import BoardView from "@/components/BoardView";
import CollaborationDialog from "@/components/CollaborationDialog";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import Login from "@/components/Login";
import ProjectInsightsDialog from "@/components/ProjectInsightsDialog";
import ProjectSettings from "@/components/ProjectSettings";
import { SettingsDialog } from "@/components/SettingsDialog";
import TaskDetailDialog from "@/components/TaskDetailDialog";
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
import {
  masarActions,
  useMyRole,
  useProjectMembers,
  useProjects,
} from "@/hooks/use-masar";
import { migrateFromDexie } from "@/lib/migration";
import { supabase } from "@/lib/supabase";
import { type Session } from "@supabase/supabase-js";
import {
  KanbanSquare,
  LayoutList,
  Loader2,
  LogOut,
  Menu,
  Moon,
  MoreVertical,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  Users
} from "lucide-react";
import { motion } from "motion/react";
import { Suspense, lazy, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
const ListView = lazy(() => import("./components/ListView"));

function ProjectMembersAvatars({ projectId }: { projectId: string }) {
  const members = useProjectMembers(projectId);
  if (members.length === 0) return null;

  return (
    <div className="flex -space-x-2   ml-2">
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
          <AvatarImage />
          <AvatarFallback>{`+${members.length - 3}`}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function MainContent({ session }: { session: Session }) {
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
  void projectsLoading;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleCreateProject = async () => {
    const name = prompt("New Project Name:");
    if (name) {
      const { data } = await masarActions.addProject(name);
      if (data) navigate(`/projects/${data.id}`);
    }
  };

  const handleRenameProject = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    const newName = prompt("New Project Name:", project?.name);
    if (newName && newName !== project?.name) {
      await masarActions.updateProject(id, { name: newName });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      await masarActions.deleteProject(id);
      navigate("/projects/all");
    }
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailOpen(true);
  };

  const canManage = myRole === "owner" || myRole === "admin";

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden ">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-14 sm:h-16 border-b border-border px-4 sm:px-6 flex items-center justify-between shrink-0 bg-card/50 backdrop-blur-md sticky top-0 z-50"
        >
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/projects/all")}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <img
                  src={Logo}
                  className="w-6 h-6 sm:w-6 sm:h-6 brightness-0 invert"
                  alt="Masar"
                />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight hidden xs:block">
                مسار
              </h1>
            </motion.div>

            <div className="h-6  bg-border hidden sm:block mx-2" />

            <div className="flex items-center gap-1 sm:gap-2 max-w-[140px] sm:max-w-none">
              <Select
                value={activeProjectId || "all"}
                onValueChange={(v) => navigate(`/projects/${v}`)}
              >
                <SelectTrigger className="w-full max-w-[140px] sm:max-w-[200px] h-9 text-xs sm:text-sm truncate">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Project options</TooltipContent>
                    </Tooltip>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={handleCreateProject}
                    className="flex gap-2"
                  >
                    <Plus className="h-4 w-4" /> New Project
                  </DropdownMenuItem>
                  {activeProjectId &&
                    activeProjectId !== "all" &&
                    canManage && (
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/projects/${activeProjectId}/settings`)
                        }
                        className="flex gap-2"
                      >
                        <Settings className="h-4 w-4" /> Project Settings
                      </DropdownMenuItem>
                    )}
                  {activeProjectId &&
                    activeProjectId !== "all" &&
                    !canManage && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleRenameProject(activeProjectId as string)
                        }
                        className="flex gap-2"
                      >
                        <Settings className="h-4 w-4" /> Rename project
                      </DropdownMenuItem>
                    )}
                  {activeProjectId &&
                    activeProjectId !== "all" &&
                    myRole === "owner" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleDeleteProject(activeProjectId as string)
                          }
                          className="flex gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" /> Delete current
                        </DropdownMenuItem>
                      </>
                    )}
                </DropdownMenuContent>
              </DropdownMenu>

              {activeProjectId && activeProjectId !== "all" && (
                <ProjectMembersAvatars projectId={activeProjectId} />
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 ml-1">
            <div className="hidden sm:flex items-center gap-2">
              {activeProjectId && activeProjectId !== "all" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsCollaborationOpen(true)}
                      className="text-primary h-9 w-9"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Project members</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="h-9 w-9"
                  >
                    {isDarkMode ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isDarkMode ? "Light mode" : "Dark mode"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsSettingsOpen(true)}
                    className="h-9 w-9"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent> General settings</TooltipContent>
              </Tooltip>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="sm:hidden h-8 w-8"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {activeProjectId && activeProjectId !== "all" && (
                  <DropdownMenuItem
                    onClick={() => setIsCollaborationOpen(true)}
                    className="flex gap-2"
                  >
                    <Users className="h-4 w-4" /> Project members
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex gap-2"
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  {isDarkMode ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex gap-2"
                >
                  <Settings className="h-4 w-4" /> General settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => supabase.auth.signOut()}
                  className="flex gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => supabase.auth.signOut()}
                    className="h-9 w-9"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent> Sign out</TooltipContent>
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
              <Route
                path="/"
                element={
                  activeProjectId ? (
                    <>
                      <div className="flex items-center justify-between shrink-0">
                        <h2 className="text-lg sm:text-xl font-semibold truncate ml-2">
                          {activeProjectId === "all"
                            ? "All tasks"
                            : `tasks ${projects.find((p) => p.id === activeProjectId)?.name || ""}`}
                        </h2>
                        {activeProjectId !== "all" && (
                          <div className="flex items-center gap-2">
                            {/* View Toggle */}
                            <div className="flex items-center bg-muted p-1 rounded-md border border-border mr-2">
                              <Button
                                variant={
                                  viewMode === "list" ? "secondary" : "ghost"
                                }
                                size="sm"
                                className="h-7 px-2 shadow-none"
                                onClick={() => setViewMode("list")}
                              >
                                <LayoutList className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={
                                  viewMode === "board" ? "secondary" : "ghost"
                                }
                                size="sm"
                                className="h-7 px-2 shadow-none"
                                onClick={() => setViewMode("board")}
                              >
                                <KanbanSquare className="h-4 w-4" />
                              </Button>
                            </div>
                            {/* NEW AI INSIGHTS BUTTON */}
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                onClick={() => setIsInsightsOpen(true)}
                                size="sm"
                                variant="secondary"
                                className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                              >
                                <Sparkles className="h-4 w-4 sm:mr-2" />{" "}
                                <span className="hidden sm:inline">
                                  AI Insights
                                </span>
                              </Button>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                onClick={() => setIsCreateTaskOpen(true)}
                                size="sm"
                                className="sm:size-default"
                              >
                                <Plus className="h-4 w-4 sm:ml-2" />{" "}
                                <span className="hidden sm:inline">
                                  Create new task
                                </span>
                              </Button>
                            </motion.div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <Suspense
                          fallback={
                            <div className="flex h-full items-center justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          }
                        >
                          {viewMode === "list" ? (
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
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        }}
                        className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4"
                      >
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </motion.div>
                      <h2 className="text-2xl font-semibold">
                        Welcome to Masar
                      </h2>
                      <p className="text-muted-foreground max-w-md">
                        Create your first project to start tracking your path
                        and managing tasks with dependencies.
                      </p>
                      <Button onClick={handleCreateProject}>
                        Create First Project
                      </Button>
                    </div>
                  )
                }
              />
            </Routes>
          </motion.main>
        </div>

        <SettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
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
      <Route
        path="/projects/:projectId/*"
        element={<MainContent session={session} />}
      />
      <Route path="*" element={<Navigate to="/projects/all" replace />} />
    </Routes>
  );
}
