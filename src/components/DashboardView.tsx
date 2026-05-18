// src/components/DashboardView.tsx
import { useMemo } from "react";
import { useTasks, useProjectMembers } from "@/hooks/use-masar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { CheckCircle2, ListTodo, AlertCircle, Clock, LineChart } from "lucide-react";
import { motion } from "motion/react";
import EmptyState from "./EmptyState";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function DashboardView({ projectId }: { projectId: string }) {
  const { tasks } = useTasks(projectId);
  const members = useProjectMembers(projectId);

  // 1. Calculate KPI Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "Done").length;
    const doing = tasks.filter((t) => t.status === "Doing").length;
    const blocked = tasks.filter((t) => t.status === "Blocked").length;
    const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);

    return { total, done, doing, blocked, completionRate };
  }, [tasks]);

  // 2. Data for Status Pie Chart
  const statusData = useMemo(() => {
    return [
      { name: "To Do", value: tasks.filter((t) => t.status === "To Do").length },
      { name: "In Progress", value: tasks.filter((t) => t.status === "Doing").length },
      { name: "Completed", value: tasks.filter((t) => t.status === "Done").length },
      { name: "Blocked", value: tasks.filter((t) => t.status === "Blocked").length },
    ].filter((item) => item.value > 0);
  }, [tasks]);

  // 3. Data for Priority Bar Chart
  const priorityData = useMemo(() => {
    const labels: Record<number, string> = { 1: "Critical", 2: "High", 3: "Medium", 4: "Low", 5: "Backlog" };
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    tasks.forEach((t) => {
      if (counts[t.priority] !== undefined) counts[t.priority]++;
    });

    return Object.entries(counts)
      .map(([key, value]) => ({ name: labels[Number(key)], count: value }))
      .filter(item => item.count > 0);
  }, [tasks]);

  // 4. Data for Assignee Workload
  const assigneeData = useMemo(() => {
    const workload: Record<string, number> = {};
    
    tasks.forEach((t) => {
      if (t.status !== "Done") {
        const member = members.find(m => m.profiles.id === t.assignee_id);
        const name = member ? member.profiles.email.split('@')[0] : "Unassigned";
        workload[name] = (workload[name] || 0) + 1;
      }
    });

    return Object.entries(workload)
      .map(([name, activeTasks]) => ({ name, activeTasks }))
      .sort((a, b) => b.activeTasks - a.activeTasks)
      .slice(0, 5); // Top 5
  }, [tasks, members]);

  // Reusable custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border shadow-lg p-3 rounded-lg">
          <p className="font-semibold text-sm mb-1">{label || payload[0].name}</p>
          <p className="text-primary font-bold text-sm">
            {payload[0].value} Tasks
          </p>
        </div>
      );
    }
    return null;
  };

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={LineChart}
          title="Analytics pending"
          description="Create and complete some tasks to generate productivity insights and workload visualizations."
          className="border-none bg-transparent"
        />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 h-full overflow-y-auto pb-8 pr-2"
      dir="ltr"
    >
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Completion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.done} of {stats.total} tasks completed
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.doing}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blocked}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Backlog</CardTitle>
            <ListTodo className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total - stats.done}</div>
            <p className="text-xs text-muted-foreground mt-1">Remaining tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Breakdown (Pie Chart) */}
        <Card className="shadow-sm border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Task Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution (Bar Chart) */}
        <Card className="shadow-sm border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.4 }} content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Workload (Horizontal Bar Chart) */}
        <Card className="shadow-sm border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Active Team Workload</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assigneeData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.4 }} content={<CustomTooltip />} />
                <Bar dataKey="activeTasks" fill="var(--chart-2)" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}