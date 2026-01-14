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
 * Calculate the current streak for a habit
 * Loops from today backwards counting consecutive completed days
 * @param habitId - The ID of the habit to calculate streak for
 * @param completions - Record of completions (key format: "habitId_YYYY-MM-DD")
 * @returns Number of consecutive days with completions
 */
export const calculateStreak = (
  habitId: string,
  completions: Record<string, boolean>
): number => {
  let streak = 0;
  let currentDate = new Date();
  const maxDaysToCheck = 365; // Prevent infinite loops
  
  for (let i = 0; i < maxDaysToCheck; i++) {
    const dateKey = formatDateKey(currentDate);
    const completionKey = `${habitId}_${dateKey}`;
    
    if (completions[completionKey]) {
      streak++;
      currentDate = getPreviousDay(currentDate);
    } else {
      // Hit a missing day, stop counting
      break;
    }
  }
  
  return streak;
};
