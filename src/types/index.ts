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
}

export type ViewMode = 'week'; // Can be extended to month later

export enum SortMode {
  TIME = 'TIME',
  MANUAL = 'MANUAL'
}
