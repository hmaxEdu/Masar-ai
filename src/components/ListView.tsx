import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProjectMembers, useProjects, useTasks } from "@/hooks/use-masar";
import { type Task } from "@/lib/supabase";
import { format } from "date-fns";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  LayoutList,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Fragment, useMemo, useState } from "react";

interface ListViewProps {
  projectId: string;
  onTaskClick: (taskId: string) => void;
}

const statusMap: Record<string, string> = {
  "To Do": "To Do",
  Doing: "In Progress",
  Done: "Done",
  Blocked: "Blocked",
};

const formatDuration = (
  start: string | null | undefined,
  end: string | null | undefined,
) => {
  if (!start || !end) return "-";
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

const TaskRowSkeleton = ({ projectId }: { projectId: string }) => (
  <TableRow>
    <TableCell className="py-2.5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-3.5 rounded" />
        <Skeleton className="h-4 w-[140px] sm:w-[200px]" />
      </div>
    </TableCell>
    <TableCell className="py-2.5">
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-4.5 w-12 rounded-full" />
        <Skeleton className="h-4.5 w-4.5 rounded-full" />
      </div>
    </TableCell>
    <TableCell className="py-2.5">
      <Skeleton className="h-4.5 w-14 rounded-full inline-block" />
    </TableCell>
    <TableCell className="py-2.5">
      <div className="space-y-1">
        <Skeleton className="h-1.5 w-full" />
        <Skeleton className="h-1.5 w-8" />
      </div>
    </TableCell>
    <TableCell className="py-2.5 hidden md:table-cell">
      <Skeleton className="h-3.5 w-16 inline-block" />
    </TableCell>
    {projectId === "all" && (
      <TableCell className="py-2.5 hidden xl:table-cell">
        <Skeleton className="h-4.5 w-16 rounded-full inline-block" />
      </TableCell>
    )}
    <TableCell className="py-2.5 hidden lg:table-cell">
      <Skeleton className="h-3.5 w-8 inline-block" />
    </TableCell>
  </TableRow>
);

export default function ListView({ projectId, onTaskClick }: ListViewProps) {
  const { tasks, loading: tasksLoading } = useTasks(projectId);
  const { projects, loading: projectsLoading } = useProjects();
  const members = useProjectMembers(
    projectId === "all" ? undefined : projectId,
  );
  void projectsLoading;

  const [sortField, setSortField] = useState<keyof Task>("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<"none" | "priority" | "status">(
    "none",
  );
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleExpand = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const taskProgress = useMemo(() => {
    const progress: Record<string, number> = {};

    const calculateProgress = (task: Task): number => {
      const children = tasks.filter((t) => t.parent_id === task.id);
      if (children.length === 0) {
        return task.status === "Done" ? 100 : 0;
      }
      const childProgressSum = children.reduce(
        (sum, child) => sum + calculateProgress(child),
        0,
      );
      return childProgressSum / children.length;
    };

    tasks.forEach((task) => {
      progress[task.id] = calculateProgress(task);
    });
    return progress;
  }, [tasks]);

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()),
  );

  const getStatusVariant = (
    status: string,
  ): "default" | "outline" | "secondary" | "destructive" => {
    switch (status) {
      case "Done":
        return "default";
      case "Doing":
        return "secondary";
      case "Blocked":
        return "destructive";
      default:
        return "outline";
    }
  };

  const renderTaskRows = (taskList: Task[], depth = 0): React.ReactNode[] => {
    const sorted = [...taskList].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === undefined || valB === undefined) return 0;
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted.flatMap((task) => {
      const children = tasks.filter((t) => t.parent_id === task.id);
      const isExpanded = expandedTasks.has(task.id);
      const assignee = members.find((m) => m.profiles.id === task.assignee_id);

      const row = (
        <motion.tr
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key={task.id}
          className="cursor-pointer border-b border-border/30 transition-colors hover:bg-muted/30 group"
          onClick={() => onTaskClick(task.id)}
        >
          <TableCell
            className="font-medium py-2 sm:py-2.5"
            style={{ paddingLeft: `${depth * 1.2 + 0.75}rem` }}
          >
            <div className="flex items-center gap-1.5">
              {children.length > 0 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4.5 w-4.5 p-0 hover:bg-muted"
                      onClick={(e) => toggleExpand(e, task.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/80" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/80" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {isExpanded ? "Collapse" : "Expand"}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="w-4.5" />
              )}
              {task.status === "Blocked" && (
                <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
              )}
              <span className="text-xs font-semibold text-foreground/90 truncate max-w-[150px] sm:max-w-none group-hover:text-primary transition-colors">
                {task.title}
              </span>
            </div>
          </TableCell>
          <TableCell className="py-2 sm:py-2.5">
            <div className="flex flex-row items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] px-1 py-0 rounded">
                P{task.priority}
              </Badge>
              {assignee && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 bg-muted/60 pl-1 pr-1.5 py-0.5 rounded-full border border-border/20">
                  <Avatar className="size-4 shrink-0">
                    <AvatarImage
                      src={assignee.profiles.avatar_url}
                      alt={assignee.profiles.email}
                    />
                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                      {assignee.profiles.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[60px] sm:max-w-none">
                    {assignee.profiles.email.split("@")[0]}
                  </span>
                </div>
              )}
            </div>
          </TableCell>
          <TableCell className="py-2 sm:py-2.5">
            <Badge
              variant={getStatusVariant(task.status)}
              className="text-[10px] px-1.5 py-0 rounded-sm"
            >
              {statusMap[task.status] || task.status}
            </Badge>
          </TableCell>
          <TableCell className="w-[80px] sm:w-[130px] py-2 sm:py-2.5">
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground/80">
                <span>{Math.round(taskProgress[task.id] || 0)}%</span>
              </div>
              <Progress value={taskProgress[task.id] || 0} className="h-1" />
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground/75 text-[10px] py-2 sm:py-2.5 hidden md:table-cell">
            {format(new Date(task.created_at), "MMM d, HH:mm")}
          </TableCell>
          <TableCell className="font-mono text-muted-foreground text-[10px] py-2 sm:py-2.5 hidden lg:table-cell">
            {formatDuration(task.started_at, task.finished_at)}
          </TableCell>
          {projectId === "all" && (
            <TableCell className="py-2 sm:py-2.5 hidden xl:table-cell">
              <Badge
                variant="outline"
                className="bg-primary/5 text-[10px] px-1.5 py-0 rounded"
              >
                {projects.find((p) => p.id === task.project_id)?.name ||
                  "Unknown"}
              </Badge>
            </TableCell>
          )}
        </motion.tr>
      );

      return isExpanded ? [row, ...renderTaskRows(children, depth + 1)] : [row];
    });
  };

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const topLevelFiltered = filteredTasks.filter((t) => !t.parent_id);

  const groups =
    groupBy === "none"
      ? { "All Tasks": topLevelFiltered }
      : topLevelFiltered.reduce(
          (acc, task) => {
            const key =
              groupBy === "priority"
                ? `Priority ${task.priority}`
                : statusMap[task.status] || task.status;
            if (!acc[key]) acc[key] = [];
            acc[key].push(task);
            return acc;
          },
          {} as Record<string, Task[]>,
        );

  return (
    <div className="space-y-3.5 flex flex-col h-full overflow-hidden" dir="ltr">
      {/* High Density Filtering Bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Search tasks..."
            style={{ height: "32px" }}
            className="pl-8 !h-[32px] !py-0 text-xs bg-background/40 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={groupBy}
          onValueChange={(v) => setGroupBy(v as "none" | "priority" | "status")}
        >
          <SelectTrigger
            style={{ height: "32px" }}
            className="w-full sm:w-40 !h-[32px] !py-0 text-xs bg-background/40 border-border/50 focus:ring-1 focus:ring-primary/30 flex items-center"
          >
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="none" className="text-xs">
              No Grouping
            </SelectItem>
            <SelectItem value="priority" className="text-xs">
              By Priority
            </SelectItem>
            <SelectItem value="status" className="text-xs">
              By Status
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid Border Layout */}
      <div className="rounded-lg border border-border/40 bg-card/25 shadow-2xs overflow-auto flex-1">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10 hover:bg-transparent">
            <TableRow className="hover:bg-transparent border-b border-border/40">
              <TableHead
                className="cursor-pointer font-bold h-8.5 hover:bg-muted/40 transition-colors"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground/80">
                  Title
                  {sortField === "title" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer font-bold h-8.5 hover:bg-muted/40 transition-colors"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground/80">
                  Priority
                  {sortField === "priority" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer font-bold h-8.5 hover:bg-muted/40 transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground/80">
                  Status
                  {sortField === "status" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="font-bold h-8.5 text-[11px] uppercase tracking-wider text-muted-foreground/80">
                Progress
              </TableHead>
              <TableHead
                className="cursor-pointer font-bold h-8.5 text-[11px] uppercase tracking-wider text-muted-foreground/80 hidden md:table-cell hover:bg-muted/40 transition-colors"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center gap-1">
                  Created At
                  {sortField === "created_at" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </TableHead>
              {projectId === "all" && (
                <TableHead className="font-bold h-8.5 text-[11px] uppercase tracking-wider text-muted-foreground/80 hidden xl:table-cell">
                  Project
                </TableHead>
              )}
              <TableHead className="font-bold h-8.5 text-[11px] uppercase tracking-wider text-muted-foreground/80 hidden lg:table-cell">
                Duration
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout" initial={false}>
              {tasksLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TaskRowSkeleton key={i} projectId={projectId} />
                ))
              ) : Object.keys(groups).length === 0 ||
                topLevelFiltered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                      <div className="h-9 w-9 bg-muted/40 border border-border/30 rounded-md flex items-center justify-center text-muted-foreground/60 mb-2.5">
                        <LayoutList className="h-4.5 w-4.5" />
                      </div>
                      <h3 className="text-xs font-bold tracking-tight text-foreground/90 mb-1">
                        No tasks found
                      </h3>
                      <p className="text-[11px] text-muted-foreground/85 leading-normal mb-3">
                        Try adjusting your search query or filters.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] px-2.5 font-bold"
                        onClick={() => setSearch("")}
                      >
                        Clear Search
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(groups).map(([groupName, groupTasks]) => (
                  <Fragment key={groupName}>
                    {groupBy !== "none" && (
                      <TableRow className="bg-muted/20 hover:bg-muted/20 transition-none border-b border-border/30">
                        <TableCell
                          colSpan={7}
                          className="py-1.5 font-bold text-[10px] uppercase tracking-wider text-primary px-3"
                        >
                          {groupName} ({groupTasks.length})
                        </TableCell>
                      </TableRow>
                    )}
                    {renderTaskRows(groupTasks)}
                  </Fragment>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}