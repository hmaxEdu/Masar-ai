import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avsgxigoruwrglihqsfg.supabase.co';
const supabaseAnonKey = 'sb_publishable_ybLXkDzc9Z0UYZDkUXWw2w_vBCFUOEb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ProjectRole = 'owner' | 'editor' | 'viewer';
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
