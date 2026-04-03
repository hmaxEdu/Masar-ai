import { useState, useEffect, useMemo } from 'react';
import { supabase, type Project, type Task, type Dependency, type ProjectMember, type Profile, type ProjectRole, type ProjectVisibility } from '@/lib/supabase';

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

      if (data) setProjects(data as Project[]);
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

export function useProject(projectId?: string) {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!projectId || projectId === 'all') {
      setProject(null);
      return;
    }

    const fetchProject = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (data) setProject(data as Project);
    };

    fetchProject();

    const channel = supabase
      .channel(getChannelName(`project-${projectId}`))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, fetchProject)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return project;
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
      if (data) setTasks(data as Task[]);
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

  const taskProgress = useMemo(() => {
    const progress: Record<string, number> = {};

    const calculateTaskProgress = (taskId: string): number => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return 0;

      const children = tasks.filter(t => t.parent_id === taskId);
      if (children.length === 0) {
        return task.status === 'Done' ? 100 : 0;
      }

      const totalProgress = children.reduce((acc, child) => {
        return acc + calculateTaskProgress(child.id);
      }, 0);

      return totalProgress / children.length;
    };

    tasks.forEach(task => {
      progress[task.id] = calculateTaskProgress(task.id);
    });

    return progress;
  }, [tasks]);

  return { tasks, taskProgress };
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
      if (data) setTasks(data as Task[]);
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

      if (data) setTasks(data as Task[]);
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
      setTask(null);
      return;
    }

    const fetchTask = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (data) setTask(data as Task);
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
      if (bMe) setBlockingMe(bMe as Dependency[]);
      if (iAB) setIAmBlocking(iAB as Dependency[]);
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
    return await supabase.from('projects').insert({ name, visibility: 'private' }).select().single();
  },

  async updateProject(id: string, changes: Partial<{name: string, visibility: ProjectVisibility}>) {
    return await supabase.from('projects').update(changes).eq('id', id);
  },

  async deleteProject(id: string) {
    return await supabase.from('projects').delete().eq('id', id);
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

export function useMyRole(projectId?: string) {
  const [role, setRole] = useState<ProjectRole | null>(null);

  useEffect(() => {
    if (!projectId || projectId === 'all') {
      setRole(null);
      return;
    }

    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) setRole(data.role as ProjectRole);
      else {
        // Check if I am the owner in projects table (for fallback)
        const { data: proj } = await supabase.from('projects').select('owner_id').eq('id', projectId).single();
        if (proj?.owner_id === user.id) setRole('owner');
      }
    };

    fetchRole();

    const channel = supabase
      .channel(getChannelName(`my-role-${projectId}`))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members' }, fetchRole)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return role;
}

export const collaborationActions = {
  async searchUsers(query: string) {
    if (!query || query.length < 2) return [];
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', `%${query}%`)
      .limit(5);
    return (data || []) as Profile[];
  },

  async addMember(projectId: string, emailOrId: string, role: ProjectRole = 'viewer') {
    let userId = emailOrId;
    if (emailOrId.includes('@')) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', emailOrId).single();
      if (!profile) throw new Error('المستخدم غير موجود');
      userId = profile.id;
    }

    return await supabase.from('project_members').insert({
      project_id: projectId,
      user_id: userId,
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
