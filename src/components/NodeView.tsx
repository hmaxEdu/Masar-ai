// src/components/NodeView.tsx
import { useState, useEffect, useMemo } from "react";
import { useTasks } from "@/hooks/use-masar";
import { supabase, type Task, type Dependency } from "@/lib/supabase";
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  Handle,
  Position,
  type Edge,
  type Node
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, CircleDashed, Network } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { motion } from "motion/react";

// --- TaskNode Component ---
function TaskNode({ data }: { data: { task: Task; onTaskClick: (id: string) => void } }) {
  const { task, onTaskClick } = data;
  const isDone = task.status === "Done";
  const isBlocked = task.status === "Blocked";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      onClick={() => onTaskClick(task.id)}
      className={`bg-card border-2 rounded-lg p-3 shadow-md w-[220px] cursor-pointer transition-colors hover:shadow-lg ${
        isDone 
          ? "border-emerald-500/30" 
          : isBlocked 
          ? "border-destructive/40 bg-destructive/5" 
          : "border-border hover:border-primary/50"
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-muted-foreground border-none" />
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold line-clamp-2 leading-tight">{task.title}</h4>
      </div>
      <div className="flex items-center justify-between mt-3">
        <Badge variant="outline" className="text-[10px]">
          P{task.priority}
        </Badge>
        <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
          {isDone ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : isBlocked ? (
            <AlertCircle className="w-3.5 h-3.5 text-destructive" />
          ) : (
            <CircleDashed className="w-3.5 h-3.5" />
          )}
          {task.status}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-muted-foreground border-none" />
    </motion.div>
  );
}

const nodeTypes = { taskNode: TaskNode };

// --- Main NodeView Component ---
export default function NodeView({ projectId, onTaskClick }: { projectId: string; onTaskClick: (id: string) => void }) {
  const { tasks } = useTasks(projectId);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const { theme } = useTheme();

  // Fetch dependencies connecting tasks in this project
  useEffect(() => {
    if (tasks.length === 0) return;
    const taskIds = tasks.map(t => t.id);
    const fetchDeps = async () => {
      const { data } = await supabase
        .from('dependencies')
        .select('*')
        .in('blocking_task_id', taskIds);
      if (data) setDependencies(data);
    };
    fetchDeps();
  }, [tasks]);

  const { nodes, edges } = useMemo(() => {
    if (!tasks.length) return { nodes: [], edges: [] };

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    tasks.forEach(t => {
      adj.set(t.id, []);
      inDegree.set(t.id, 0);
    });

    // Register blocking dependencies
    dependencies.forEach(d => {
      if (adj.has(d.blocking_task_id) && adj.has(d.blocked_task_id)) {
        adj.get(d.blocking_task_id)!.push(d.blocked_task_id);
        inDegree.set(d.blocked_task_id, (inDegree.get(d.blocked_task_id) || 0) + 1);
      }
    });

    // Register parent-child relations as layout edges
    tasks.forEach(t => {
      if (t.parent_id && adj.has(t.parent_id)) {
        adj.get(t.parent_id)!.push(t.id);
        inDegree.set(t.id, (inDegree.get(t.id) || 0) + 1);
      }
    });

    // Standard topological sort (BFS) to determine depth layers for layout spacing
    const depth = new Map<string, number>();
    const queue: string[] = [];

    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) {
        queue.push(id);
        depth.set(id, 0);
      }
    }

    while (queue.length > 0) {
      const u = queue.shift()!;
      const d = depth.get(u)!;

      for (const v of adj.get(u)!) {
        inDegree.set(v, inDegree.get(v)! - 1);
        depth.set(v, Math.max(depth.get(v) || 0, d + 1));
        if (inDegree.get(v) === 0) queue.push(v);
      }
    }

    // Catch cycle stragglers arbitrarily
    for (const [id, deg] of inDegree.entries()) {
      if (deg > 0 && !depth.has(id)) depth.set(id, 0);
    }

    // Collect columns by depth
    const depthGroups = new Map<number, string[]>();
    for (const [id, d] of depth.entries()) {
      if (!depthGroups.has(d)) depthGroups.set(d, []);
      depthGroups.get(d)!.push(id);
    }

    // Assign final XY locations
    const positions = new Map<string, { x: number; y: number }>();
    for (const [d, ids] of depthGroups.entries()) {
      // Sort vertically inside column: High priority tasks at the top
      ids.sort((a, b) => {
        const ta = tasks.find(t => t.id === a);
        const tb = tasks.find(t => t.id === b);
        return (ta?.priority || 3) - (tb?.priority || 3);
      });

      // Vertically center the column group
      const startY = -((ids.length - 1) * 160) / 2;

      ids.forEach((id, index) => {
        positions.set(id, { x: d * 350, y: startY + index * 160 });
      });
    }

    // Form final mapped Nodes
    const newNodes: Node[] = tasks.map(task => ({
      id: task.id,
      type: 'taskNode',
      position: positions.get(task.id) || { x: 0, y: 0 },
      data: { task, onTaskClick },
      // Allows smooth positional transitions when layout recalculates
      style: { transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)" } 
    }));

    const newEdges: Edge[] = [];
    const isDark = theme === "dark";
    const parentEdgeColor = isDark ? "#555" : "#ccc";
    const blockEdgeColor = isDark ? "#ff5c5c" : "#e11d48";

    // Form Edges (Blockers - Solid Red)
    dependencies.forEach(d => {
      if (tasks.find(t => t.id === d.blocking_task_id) && tasks.find(t => t.id === d.blocked_task_id)) {
        newEdges.push({
          id: `dep-${d.id}`,
          source: d.blocking_task_id,
          target: d.blocked_task_id,
          animated: true,
          style: { stroke: blockEdgeColor, strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: blockEdgeColor }
        });
      }
    });

    // Form Edges (Parent/Child - Dashed Grey)
    tasks.forEach(t => {
      if (t.parent_id && tasks.find(pt => pt.id === t.parent_id)) {
        newEdges.push({
          id: `parent-${t.id}`,
          source: t.parent_id,
          target: t.id,
          style: { stroke: parentEdgeColor, strokeDasharray: '5,5', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: parentEdgeColor }
        });
      }
    });

    return { nodes: newNodes, edges: newEdges };
  }, [tasks, dependencies, onTaskClick, theme]);

  if (tasks.length === 0) {
    return (
      <div className="w-full h-full rounded-lg border border-border/40 bg-muted/10 flex flex-col items-center justify-center">
        <Network className="w-8 h-8 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground text-sm font-medium">No tasks found to generate node view.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg border border-border/40 bg-background overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.2}
      >
        <Background color={theme === 'dark' ? '#444' : '#ddd'} gap={16} />
        <Controls className="bg-card border-border fill-foreground" />
      </ReactFlow>
    </div>
  );
}