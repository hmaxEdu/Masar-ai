import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase Environment Variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ProjectRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type ProjectVisibility = 'private' | 'public';
export type TaskStatus = 'To Do' | 'Doing' | 'Done' | 'Blocked';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Project {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
  visibility: ProjectVisibility;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
}

export interface Task {
  id: string;
  project_id: string;
  parent_id?: string;
  title: string;
  description: string;
  started_at: string;
  finished_at?: string;
  priority: number;
  status: TaskStatus;
  previous_status?: TaskStatus;
  assignee_id?: string;
  created_at: string;
}

export interface Dependency {
  id: string;
  blocking_task_id: string;
  blocked_task_id: string;
}
