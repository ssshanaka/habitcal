import { Habit, HabitFrequency } from '../types';

export const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = d.getDate() - day; // adjust when day is sunday
  return new Date(d.setDate(diff));
};

export const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  const start = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const formatTime = (time?: string): string => {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${suffix}`;
};

export const generateId = (): string => self.crypto.randomUUID();

export const colors = [
  '#8ab4f8', // Blue
  '#f28b82', // Red
  '#fdd663', // Yellow
  '#81c995', // Green
  '#c58af9', // Purple
  '#f6bfbc', // Pink
  '#e8eaed', // Grey
];

export const categories = [
  'Health',
  'Work',
  'Mind',
  'Finance',
  'Personal',
  'Social',
  'Other'
];

export const calculateMonthlyCompletion = (
  habitId: string,
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>
): number => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let count = 0;

  // Iterate through all completions and count those for the current month/year
  Object.keys(completions).forEach(key => {
    if (key.startsWith(`${habitId}_`)) {
      const datePart = key.split('_')[1];
      const date = new Date(datePart);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const comp = completions[key];
        if (typeof comp === 'boolean' ? comp : comp?.completed) {
          count++;
        }
      }
    }
  });

  return count;
};

// --- Streak Calculation Utilities ---

/**
 * Get the previous day from a given date
 */
export const getPreviousDay = (date: Date): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d;
};

/**
 * Calculate the current streak for a habit.
 * This function counts backwards from today.
 * If today is not completed, we check yesterday.
 * If yesterday is not completed, streak is 0.
 * @param habitId - The ID of the habit to calculate streak for
 * @param completions - Record of completions (key format: "habitId_YYYY-MM-DD")
 * @returns Number of consecutive days with completions
 */
export const calculateStreak = (
  habit: Habit,
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>
): number => {
  let streak = 0;
  let checkDate = new Date();
  
  const maxDaysToCheck = 365;
  
  for (let i = 0; i < maxDaysToCheck; i++) {
    const dayOfWeek = checkDate.getDay();
    const isRequiredDay = habit.frequency === HabitFrequency.DAILY || 
                           (habit.frequency === HabitFrequency.WEEKLY && habit.daysOfWeek?.includes(dayOfWeek));

    if (isRequiredDay) {
      const dateKey = formatDateKey(checkDate);
      const completionKey = `${habit.id}_${dateKey}`;
      const comp = completions[completionKey];
      const isCompleted = typeof comp === 'boolean' ? comp : comp?.completed;
      
      if (isCompleted) {
        streak++;
      } else {
        // Only break if this day is actually past due (not today)
        if (!isSameDay(checkDate, new Date())) {
          break;
        }
      }
    }
    checkDate = getPreviousDay(checkDate);
  }
  
/**
 * Returns a history of completion status for the last N days.
 * @param habitId - The ID of the habit
 * @param completions - Record of completions
 * @param daysCount - Number of days to look back
 * @returns Array of booleans representing completion status
 */
export const getRecentCompletionHistory = (
  habitId: string,
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>,
  daysCount: number = 7
): boolean[] => {
  const history: boolean[] = [];
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = formatDateKey(d);
    const completionKey = `${habitId}_${dateKey}`;
    const comp = completions[completionKey];
    const isCompleted = typeof comp === 'boolean' ? comp : comp?.completed;
    history.push(!!isCompleted);
  }
  // Return in chronological order (oldest to newest)
  return history.reverse();
};
