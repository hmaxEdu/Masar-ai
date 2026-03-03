import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task, onTaskStatusChange, updateBlockedStatus, wouldCreateCircularDependency } from '@/lib/db';

export function useProjects() {
  return useLiveQuery(() => db.projects.toArray()) || [];
}

export function useTasks(projectId?: number) {
  return useLiveQuery(() =>
    projectId ? db.tasks.where('projectId').equals(projectId).toArray() : db.tasks.toArray(),
    [projectId]
  ) || [];
}

export function useTopLevelTasks(projectId?: number) {
  return useLiveQuery(() => {
    if (!projectId) return db.tasks.filter(t => t.parentId === undefined).toArray();
    return db.tasks.where('projectId').equals(projectId).filter(t => t.parentId === undefined).toArray();
  }, [projectId]) || [];
}

export function useChildTasks(parentId: number) {
  return useLiveQuery(() => db.tasks.where('parentId').equals(parentId).toArray(), [parentId]) || [];
}

export function useTask(taskId?: number) {
  return useLiveQuery(() => taskId ? db.tasks.get(taskId) : undefined, [taskId]);
}

export function useDependencies(taskId: number) {
  const blockingMe = useLiveQuery(() => db.dependencies.where('blockedTaskId').equals(taskId).toArray(), [taskId]) || [];
  const iAmBlocking = useLiveQuery(() => db.dependencies.where('blockingTaskId').equals(taskId).toArray(), [taskId]) || [];
  return { blockingMe, iAmBlocking };
}

async function deleteRecursive(taskId: number) {
  const children = await db.tasks.where('parentId').equals(taskId).toArray();
  for (const child of children) {
    await deleteRecursive(child.id!);
  }

  // Find tasks that were blocked by this task BEFORE deleting dependencies
  const dependents = await db.dependencies.where('blockingTaskId').equals(taskId).toArray();

  await db.tasks.delete(taskId);
  await db.dependencies.where('blockingTaskId').equals(taskId).or('blockedTaskId').equals(taskId).delete();

  // Update status of tasks that were blocked by the deleted task
  for (const dep of dependents) {
    await updateBlockedStatus(dep.blockedTaskId);
  }
}

export const masarActions = {
  async addProject(name: string) {
    return await db.projects.add({ name, createdAt: new Date() });
  },

  async deleteProject(id: number) {
    await db.transaction('rw', [db.projects, db.tasks, db.dependencies], async () => {
      const tasks = await db.tasks.where('projectId').equals(id).toArray();
      const taskIds = tasks.map(t => t.id!);

      // Find all tasks outside this project that might be blocked by tasks in this project
      const externalDependents = await db.dependencies
        .where('blockingTaskId')
        .anyOf(taskIds)
        .filter(async dep => {
          const blockedTask = await db.tasks.get(dep.blockedTaskId);
          return blockedTask?.projectId !== id;
        })
        .toArray();

      await db.projects.delete(id);
      await db.tasks.where('projectId').equals(id).delete();
      await db.dependencies.where('blockingTaskId').anyOf(taskIds).delete();
      await db.dependencies.where('blockedTaskId').anyOf(taskIds).delete();

      // Update external tasks
      for (const dep of externalDependents) {
        await updateBlockedStatus(dep.blockedTaskId);
      }
    });
  },

  async addTask(task: Omit<Task, 'id'>) {
    const id = await db.tasks.add(task);
    await updateBlockedStatus(id as number);
    return id;
  },

  async updateTask(id: number, changes: Partial<Task>) {
    const oldTask = await db.tasks.get(id);
    await db.tasks.update(id, changes);

    if (changes.status && changes.status !== oldTask?.status) {
      await onTaskStatusChange(id);
    }
  },

  async deleteTask(id: number) {
    await db.transaction('rw', [db.tasks, db.dependencies], async () => {
      await deleteRecursive(id);
    });
  },

  async addDependency(blockingTaskId: number, blockedTaskId: number) {
    if (await wouldCreateCircularDependency(blockingTaskId, blockedTaskId)) {
      throw new Error('Circular dependency detected');
    }
    await db.dependencies.add({ blockingTaskId, blockedTaskId });
    await updateBlockedStatus(blockedTaskId);
  },

  async removeDependency(id: number) {
    const dep = await db.dependencies.get(id);
    if (dep) {
      await db.dependencies.delete(id);
      await updateBlockedStatus(dep.blockedTaskId);
    }
  }
};
