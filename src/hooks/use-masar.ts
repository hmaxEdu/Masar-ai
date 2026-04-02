import { useState, useEffect } from 'react';
import { supabase, type Project, type Task, type Dependency, type ProjectMember, type Profile, type ProjectRole } from '@/lib/supabase';

const getChannelName = (base: string) => `${base}-${Math.random().toString(36).substring(2, 9)}`;

export function useProjects(userId?: string) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setProjects(data);
    };

    fetchProjects();

    const channel = supabase
      .channel(getChannelName('projects-all'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return projects;
}

export function useTasks(projectId?: string | 'all') {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      let query = supabase.from('tasks').select('*');
      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      const { data } = await query.order('priority', { ascending: true });
      if (data) setTasks(data);
    };

    fetchTasks();

    const channel = supabase
      .channel(getChannelName('tasks-all'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return tasks;
}

export function useTopLevelTasks(projectId?: string | 'all') {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      let query = supabase.from('tasks').select('*').is('parent_id', null);
      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      const { data } = await query.order('priority', { ascending: true });
      if (data) setTasks(data);
    };

    fetchTasks();

    const channel = supabase
      .channel(getChannelName('top-tasks'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return tasks;
}

export function useChildTasks(parentId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!parentId) return;

    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('parent_id', parentId)
        .order('priority', { ascending: true });

      if (data) setTasks(data);
    };

    fetchTasks();

    const channel = supabase
      .channel(getChannelName(`child-tasks-${parentId}`))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `parent_id=eq.${parentId}` }, fetchTasks)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parentId]);

  return tasks;
}

export function useTask(taskId?: string | null) {
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!taskId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTask(null);
      return;
    }

    const fetchTask = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (data) setTask(data);
    };

    fetchTask();

    const channel = supabase
      .channel(getChannelName(`task-${taskId}`))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `id=eq.${taskId}` }, fetchTask)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  return task;
}

export function useDependencies(taskId: string) {
  const [blockingMe, setBlockingMe] = useState<Dependency[]>([]);
  const [iAmBlocking, setIAmBlocking] = useState<Dependency[]>([]);

  useEffect(() => {
    if (!taskId) return;

    const fetchDeps = async () => {
      const { data: bMe } = await supabase.from('dependencies').select('*').eq('blocked_task_id', taskId);
      const { data: iAB } = await supabase.from('dependencies').select('*').eq('blocking_task_id', taskId);
      if (bMe) setBlockingMe(bMe);
      if (iAB) setIAmBlocking(iAB);
    };

    fetchDeps();

    const channel = supabase
      .channel(getChannelName(`deps-${taskId}`))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dependencies' }, fetchDeps)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  return { blockingMe, iAmBlocking };
}

export async function updateBlockedStatus(taskId: string) {
  if (!taskId) return;
  const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).single();
  if (!task) return;

  const { data: dependencies } = await supabase.from('dependencies').select('*').eq('blocked_task_id', taskId);
  let isBlocked = false;

  if (dependencies) {
    for (const dep of dependencies) {
      const { data: blocker } = await supabase.from('tasks').select('status').eq('id', dep.blocking_task_id).single();
      if (blocker && blocker.status !== 'Done') {
        isBlocked = true;
        break;
      }
    }
  }

  if (isBlocked && task.status !== 'Blocked') {
    await supabase.from('tasks').update({
      previous_status: task.status,
      status: 'Blocked',
      finished_at: null
    }).eq('id', taskId);
  } else if (!isBlocked && task.status === 'Blocked') {
    const nextStatus = task.previous_status || 'To Do';
    await supabase.from('tasks').update({
      status: nextStatus,
      previous_status: null,
      finished_at: nextStatus === 'Done' ? new Date().toISOString() : null
    }).eq('id', taskId);
  }
}

export async function onTaskStatusChange(taskId: string) {
  if (!taskId) return;
  const { data: blockedTasks } = await supabase.from('dependencies').select('blocked_task_id').eq('blocking_task_id', taskId);
  if (blockedTasks) {
    for (const dep of blockedTasks) {
      await updateBlockedStatus(dep.blocked_task_id);
    }
  }
}

export const masarActions = {
  async addProject(name: string) {
    return await supabase.from('projects').insert({ name }).select().single();
  },

  async updateProject(id: string, changes: Partial<{name: string}>) {
    await supabase.from('projects').update(changes).eq('id', id);
  },

  async deleteProject(id: string) {
    await supabase.from('projects').delete().eq('id', id);
  },

  async addTask(task: Omit<Task, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('tasks').insert(task).select().single();
    if (data) {
      await updateBlockedStatus(data.id);
    }
    return { data, error };
  },

  async updateTask(id: string, changes: Partial<Task>) {
    const { data: oldTask } = await supabase.from('tasks').select('*').eq('id', id).single();
    if (!oldTask) return;

    const finalChanges = { ...changes };
    if (changes.status && changes.status !== oldTask.status) {
      if (changes.status === 'Done') {
        finalChanges.finished_at = new Date().toISOString();
      } else {
        finalChanges.finished_at = undefined;
      }
    }

    await supabase.from('tasks').update(finalChanges).eq('id', id);

    if (finalChanges.status && finalChanges.status !== oldTask.status) {
      await onTaskStatusChange(id);
    }
  },

  async deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id);
  },

  async addDependency(blocking_task_id: string, blocked_task_id: string) {
    await supabase.from('dependencies').insert({ blocking_task_id, blocked_task_id });
    await updateBlockedStatus(blocked_task_id);
  },

  async removeDependency(id: string) {
    const { data: dep } = await supabase.from('dependencies').select('blocked_task_id').eq('id', id).single();
    if (dep) {
      await supabase.from('dependencies').delete().eq('id', id);
      await updateBlockedStatus(dep.blocked_task_id);
    }
  }
};

type MemberWithProfile = ProjectMember & { profiles: Profile };

export function useProjectMembers(projectId?: string) {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);

  useEffect(() => {
    if (!projectId || projectId === 'all') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMembers([]);
      return;
    }

    const fetchMembers = async () => {
      const { data } = await supabase
        .from('project_members')
        .select('*, profiles(*)')
        .eq('project_id', projectId);

      if (data) setMembers(data as MemberWithProfile[]);
    };

    fetchMembers();

    const channel = supabase
      .channel(getChannelName(`members-${projectId}`))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members', filter: `project_id=eq.${projectId}` }, fetchMembers)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return members;
}

export const collaborationActions = {
  async addMember(projectId: string, email: string, role: ProjectRole = 'viewer') {
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single();
    if (!profile) throw new Error('المستخدم غير موجود');

    return await supabase.from('project_members').insert({
      project_id: projectId,
      user_id: profile.id,
      role
    });
  },

  async updateMemberRole(memberId: string, role: ProjectRole) {
    return await supabase.from('project_members').update({ role }).eq('id', memberId);
  },

  async removeMember(memberId: string) {
    return await supabase.from('project_members').delete().eq('id', memberId);
  }
};
