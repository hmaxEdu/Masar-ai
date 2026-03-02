import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task, onTaskStatusChange, updateBlockedStatus, wouldCreateCircularDependency } from '@/lib/db';

export function useProjects() {
  return useLiveQuery(() => db.projects.toArray()) || [];
}

export function useTasks(projectId?: number) {
  return useLiveQuery(() =>
    projectId ? db.tasks.where('projectId').equals(projectId).toArray() : db.tasks.toArray()
  ) || [];
}

export function useTask(taskId?: number) {
  return useLiveQuery(() => taskId ? db.tasks.get(taskId) : undefined, [taskId]);
}

export function useSubtasks(taskId: number) {
  return useLiveQuery(() => db.subtasks.where('taskId').equals(taskId).toArray()) || [];
}

export function useDependencies(taskId: number) {
  const blockingMe = useLiveQuery(() => db.dependencies.where('blockedTaskId').equals(taskId).toArray()) || [];
  const iAmBlocking = useLiveQuery(() => db.dependencies.where('blockingTaskId').equals(taskId).toArray()) || [];
  return { blockingMe, iAmBlocking };
}

export const masarActions = {
  async addProject(name: string) {
    return await db.projects.add({ name, createdAt: new Date() });
  },

  async addTask(task: Omit<Task, 'id'>) {
    const id = await db.tasks.add(task);
    await updateBlockedStatus(id);
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
    await db.transaction('rw', db.tasks, db.dependencies, db.subtasks, async () => {
      await db.tasks.delete(id);
      await db.dependencies.where('blockingTaskId').equals(id).or('blockedTaskId').equals(id).delete();
      await db.subtasks.where('taskId').equals(id).delete();
    });
  },

  async addSubtask(taskId: number, title: string) {
    return await db.subtasks.add({ taskId, title, completed: false });
  },

  async toggleSubtask(id: number, completed: boolean) {
    await db.subtasks.update(id, { completed });
  },

  async deleteSubtask(id: number) {
    await db.subtasks.delete(id);
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
