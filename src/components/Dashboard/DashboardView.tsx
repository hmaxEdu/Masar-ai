// src/components/dashboard/DashboardView.tsx
import { useMemo } from "react";
import { useTasks, useProjectMembers } from "@/hooks/use-masar";
import { motion } from "motion/react";
import EmptyState from "@/components/EmptyState";
import { LineChart } from "lucide-react";
import { KpiCards } from "./KpiCards";
import { StatusPieChart } from "./StatusPieChart";
import { PriorityBarChart } from "./PriorityBarChart";
import { TeamWorkloadChart } from "./TeamWorkloadChart";

interface DashboardViewProps {
  projectId: string;
}

export default function DashboardView({ projectId }: DashboardViewProps) {
  const { tasks } = useTasks(projectId);
  const members = useProjectMembers(projectId);

  // KPI Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "Done").length;
    const doing = tasks.filter((t) => t.status === "Doing").length;
    const blocked = tasks.filter((t) => t.status === "Blocked").length;
    const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, doing, blocked, completionRate };
  }, [tasks]);

  // Status Pie Data
  const statusData = useMemo(
    () => [
      { name: "To Do", value: tasks.filter((t) => t.status === "To Do").length },
      { name: "In Progress", value: tasks.filter((t) => t.status === "Doing").length },
      { name: "Completed", value: tasks.filter((t) => t.status === "Done").length },
      { name: "Blocked", value: tasks.filter((t) => t.status === "Blocked").length },
    ].filter((item) => item.value > 0),
    [tasks]
  );

  // Priority Bar Data
  const priorityData = useMemo(() => {
    const labels: Record<number, string> = { 1: "Critical", 2: "High", 3: "Medium", 4: "Low", 5: "Backlog" };
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    tasks.forEach((t) => {
      if (counts[t.priority] !== undefined) counts[t.priority]++;
    });
    return Object.entries(counts)
      .map(([key, value]) => ({ name: labels[Number(key)], count: value }))
      .filter((item) => item.count > 0);
  }, [tasks]);

  // Team Workload Data
  const workloadData = useMemo(() => {
    const workload: Record<string, number> = {};
    tasks.forEach((t) => {
      if (t.status !== "Done") {
        const member = members.find((m) => m.profiles.id === t.assignee_id);
        const name = member ? member.profiles.email.split("@")[0] : "Unassigned";
        workload[name] = (workload[name] || 0) + 1;
      }
    });
    return Object.entries(workload)
      .map(([name, activeTasks]) => ({ name, activeTasks }))
      .sort((a, b) => b.activeTasks - a.activeTasks)
      .slice(0, 5);
  }, [tasks, members]);

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
      <KpiCards stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusPieChart data={statusData} />
        <PriorityBarChart data={priorityData} />
        <TeamWorkloadChart data={workloadData} />
      </div>
    </motion.div>
  );
}