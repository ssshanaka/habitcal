export interface WeatherData {
  temp: string;
  condition: string;
  isRainy: boolean;
  isSunny: boolean;
  isCloudy: boolean;
  isWindy: boolean;
}

export enum HabitFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY'
}

export interface Habit {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  timeStart?: string; // HH:mm format
  timeEnd?: string; // HH:mm format
  color: string;
  category?: string;
  dependencyId?: string; // ID of the habit this one depends on
  order: number;
  goalCount?: number; // Monthly completion goal
  duration_minutes?: number;
  frequency: HabitFrequency;
  daysOfWeek?: number[]; // 0-6, for WEEKLY
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

export interface CircleChallenge {
  id: string;
  circle_id: string;
  title: string;
  description: string;
  target_habit_id: string;
  goal_streak: number;
  created_at: string;
}

export type ViewMode = 'week'; // Can be extended to month later

export enum SortMode {
  TIME = 'TIME',
  MANUAL = 'MANUAL'
}
