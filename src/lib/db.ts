import Dexie, { type Table } from 'dexie';

export type TaskStatus = 'To Do' | 'Doing' | 'Done' | 'Blocked';

export interface Project {
  id?: number;
  name: string;
  createdAt: Date;
}

export interface Task {
  id?: number;
  projectId: number;
  title: string;
  description: string; // HTML or JSON from TipTap
  startedAt: Date;
  finishedAt?: Date;
  priority: number; // 1 (High) to 5 (Low)
  status: TaskStatus;
  previousStatus?: TaskStatus; // To revert when unblocked
}

export interface Subtask {
  id?: number;
  taskId: number;
  title: string;
  completed: boolean;
}

export interface Dependency {
  id?: number;
  blockingTaskId: number;
  blockedTaskId: number;
}

export class MasarDatabase extends Dexie {
  projects!: Table<Project>;
  tasks!: Table<Task>;
  subtasks!: Table<Subtask>;
  dependencies!: Table<Dependency>;

  constructor() {
    super('MasarDatabase');
    this.version(1).stores({
      projects: '++id, name',
      tasks: '++id, projectId, priority, status',
      subtasks: '++id, taskId',
      dependencies: '++id, blockingTaskId, blockedTaskId'
    });
  }
}

export const db = new MasarDatabase();

// Helper to check for circular dependencies
export async function wouldCreateCircularDependency(blockingTaskId: number, blockedTaskId: number): Promise<boolean> {
  if (blockingTaskId === blockedTaskId) return true;

  const visited = new Set<number>();
  const queue = [blockingTaskId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (currentId === blockedTaskId) return true;

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const blockers = await db.dependencies.where('blockedTaskId').equals(currentId).toArray();
    for (const dep of blockers) {
      queue.push(dep.blockingTaskId);
    }
  }

  return false;
}

// Logic to update blocked status
export async function updateBlockedStatus(taskId: number) {
  const task = await db.tasks.get(taskId);
  if (!task) return;

  const dependencies = await db.dependencies.where('blockedTaskId').equals(taskId).toArray();
  let isBlocked = false;

  for (const dep of dependencies) {
    const blocker = await db.tasks.get(dep.blockingTaskId);
    if (blocker && blocker.status !== 'Done') {
      isBlocked = true;
      break;
    }
  }

  if (isBlocked && task.status !== 'Blocked') {
    await db.tasks.update(taskId, {
      previousStatus: task.status,
      status: 'Blocked'
    });
  } else if (!isBlocked && task.status === 'Blocked') {
    await db.tasks.update(taskId, {
      status: task.previousStatus || 'To Do',
      previousStatus: undefined
    });
  }
}

// When a task becomes 'Done', we need to check tasks it was blocking
export async function onTaskStatusChange(taskId: number) {
  const task = await db.tasks.get(taskId);
  if (!task) return;

  const blockedTasks = await db.dependencies.where('blockingTaskId').equals(taskId).toArray();
  for (const dep of blockedTasks) {
    await updateBlockedStatus(dep.blockedTaskId);
  }
}
