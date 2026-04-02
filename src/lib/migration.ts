import { db } from './db';
import { masarActions } from '../hooks/use-masar';

export async function migrateFromDexie() {
  const isMigrated = localStorage.getItem('dexie_migrated');
  if (isMigrated === 'true') return;

  const projects = await db.projects.toArray();
  if (projects.length === 0) {
    localStorage.setItem('dexie_migrated', 'true');
    return;
  }

  console.log('Starting migration from Dexie to Supabase...');

  for (const project of projects) {
    const { data: newProject } = await masarActions.addProject(project.name);
    if (!newProject) continue;

    const tasks = await db.tasks.where('projectId').equals(project.id!).toArray();
    const taskIdMap = new Map<number, string>();

    // Pass 1: Create tasks (top-level first)
    const createTasks = async (parentId?: number, newParentId?: string) => {
      const levelTasks = tasks.filter(t => t.parentId === parentId);
      for (const task of levelTasks) {
        const { data: newTask } = await masarActions.addTask({
          project_id: newProject.id,
          parent_id: newParentId,
          title: task.title,
          description: task.description,
          started_at: task.startedAt.toISOString(),
          finished_at: task.finishedAt?.toISOString(),
          priority: task.priority,
          status: task.status,
          previous_status: task.previousStatus,
        });

        if (newTask) {
          taskIdMap.set(task.id!, newTask.id);
          await createTasks(task.id, newTask.id);
        }
      }
    };

    await createTasks(undefined, undefined);

    // Pass 2: Create dependencies
    const dependencies = await db.dependencies.toArray();
    for (const dep of dependencies) {
      const newBlockingId = taskIdMap.get(dep.blockingTaskId);
      const newBlockedId = taskIdMap.get(dep.blockedTaskId);
      if (newBlockingId && newBlockedId) {
        await masarActions.addDependency(newBlockingId, newBlockedId);
      }
    }
  }

  localStorage.setItem('dexie_migrated', 'true');
  console.log('Migration completed!');
}
