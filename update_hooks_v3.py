import re

with open('src/hooks/use-masar.ts', 'r') as f:
    content = f.read()

# I will just write the hooks manually to be safe, they are simple.

hooks_code = """import { useState, useEffect } from 'react';
import { supabase, type Project, type Task, type Dependency, type ProjectMember, type Profile, type ProjectRole, type ProjectVisibility } from '@/lib/supabase';

const getChannelName = (base: string) => `${base}-${Math.random().toString(36).substring(2, 9)}`;

export function useProjects(userId?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setProjects(data as Project[]);
      setLoading(false);
    };

    setLoading(true);
    fetchProjects();

    const channel = supabase
      .channel(getChannelName('projects-all'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { projects, loading };
}

export function useProject(projectId?: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId || projectId === 'all') {
      setProject(null);
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (data) setProject(data as Project);
      setLoading(false);
    };

    setLoading(true);
    fetchProject();

    const channel = supabase
      .channel(getChannelName(`project-${projectId}`))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, fetchProject)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { project, loading };
}

export function useTasks(projectId?: string | 'all') {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      let query = supabase.from('tasks').select('*');
      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      const { data } = await query.order('priority', { ascending: true });
      if (data) setTasks(data);
      setLoading(false);
    };

    setLoading(true);
    fetchTasks();

    const channel = supabase
      .channel(getChannelName('tasks-all'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { tasks, loading };
}

export function useTopLevelTasks(projectId?: string | 'all') {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      let query = supabase.from('tasks').select('*').is('parent_id', null);
      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      const { data } = await query.order('priority', { ascending: true });
      if (data) setTasks(data);
      setLoading(false);
    };

    setLoading(true);
    fetchTasks();

    const channel = supabase
      .channel(getChannelName('top-tasks'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { tasks, loading };
}

export function useChildTasks(parentId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('parent_id', parentId)
        .order('priority', { ascending: true });

      if (data) setTasks(data);
      setLoading(false);
    };

    setLoading(true);
    fetchTasks();

    const channel = supabase
      .channel(getChannelName(`child-tasks-${parentId}`))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `parent_id=eq.${parentId}` }, fetchTasks)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parentId]);

  return { tasks, loading };
}

export function useTask(taskId?: string | null) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) {
      setTask(null);
      setLoading(false);
      return;
    }

    const fetchTask = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (data) setTask(data);
      setLoading(false);
    };

    setLoading(true);
    fetchTask();

    const channel = supabase
      .channel(getChannelName(`task-${taskId}`))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `id=eq.${taskId}` }, fetchTask)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  return { task, loading };
}
"""

# Keep the rest of the file
rest_of_file = re.search(r"export function useDependencies.*", content, re.DOTALL).group(0)

with open('src/hooks/use-masar.ts', 'w') as f:
    f.write(hooks_code + "\n" + rest_of_file)
