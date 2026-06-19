export interface Habit {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  timeStart?: string; // HH:mm format
  timeEnd?: string; // HH:mm format
  color: string;
  category?: string;
  order: number;
  goalCount?: number; // Monthly completion goal
  duration_minutes?: number;
  created_at?: string;
}

export interface HabitPackage {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  habits: Omit<Habit, 'id' | 'user_id' | 'created_at'>[];
  created_at?: string;
}

export interface Completion {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  timestamp?: string; // ISO string or HH:mm
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  created_at: string;
}

export interface CircleMember {
  circle_id: string;
  user_id: string;
  joined_at: string;
  role: 'admin' | 'member';
}

export type ViewMode = 'week'; // Can be extended to month later

export enum SortMode {
  TIME = 'TIME',
  MANUAL = 'MANUAL'
}
