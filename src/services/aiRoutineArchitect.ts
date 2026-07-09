import { Habit, HabitPackage } from '@/types';

export interface AIRequest {
  goal: string;
  constraints?: string[];
}

export interface AIResponse {
  packageName: string;
  description: string;
  habits: Omit<Habit, 'id' | 'user_id' | 'created_at'>[];
}

export const aiRoutineArchitect = {
  async generatePackage(request: AIRequest): Promise<AIResponse> {
    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    const prompt = request.goal.toLowerCase();
    
    // Sophisticated Mock: Return different routines based on intent
    if (prompt.includes('marathon') || prompt.includes('5k') || prompt.includes('running')) {
      return {
        packageName: 'Athlete\'s Foundation',
        description: 'A high-performance routine designed for endurance and recovery.',
        habits: [
          { title: 'Morning Run', description: 'Zone 2 heart rate training', timeStart: '06:00', timeEnd: '07:00', color: '#EF4444', category: 'Fitness', order: 1, duration_minutes: 60 },
          { title: 'Hydration Boost', description: '500ml water with electrolytes', timeStart: '07:00', timeEnd: '07:15', color: '#3B82F6', category: 'Health', order: 2, duration_minutes: 15 },
          { title: 'Dynamic Stretching', description: 'Prepare muscles for the day', timeStart: '07:15', timeEnd: '07:30', color: '#EF4444', category: 'Fitness', order: 3, duration_minutes: 15 },
          { title: 'Post-Run Protein', description: 'High protein meal/shake', timeStart: '07:30', timeEnd: '08:00', color: '#3B82F6', category: 'Health', order: 4, duration_minutes: 30 },
          { title: 'Evening Foam Rolling', description: 'Recovery and muscle release', timeStart: '21:00', timeEnd: '21:30', color: '#EF4444', category: 'Fitness', order: 5, duration_minutes: 30 },
        ]
      };
    }

    if (prompt.includes('typescript') || prompt.includes('coding') || prompt.includes('developer')) {
      return {
        packageName: 'Deep Work Developer',
        description: 'Optimized for cognitive load and technical growth.',
        habits: [
          { title: 'Deep Work: Coding', description: 'Focus on core project features', timeStart: '09:00', timeEnd: '12:00', color: '#8B5CF6', category: 'Work', order: 1, duration_minutes: 180 },
          { title: 'TS Study / Documentation', description: 'Learn a new TS pattern or read RFCs', timeStart: '13:00', timeEnd: '14:00', color: '#8B5CF6', category: 'Learning', order: 2, duration_minutes: 60 },
          { title: 'Code Review / PRs', description: 'Review teammates work', timeStart: '14:00', timeEnd: '15:00', color: '#8B5CF6', category: 'Work', order: 3, duration_minutes: 60 },
          { title: 'Digital Detox', description: 'No screens for 1 hour', timeStart: '18:00', timeEnd: '19:00', color: '#10B981', category: 'Health', order: 4, duration_minutes: 60 },
          { title: 'Daily Journal', description: 'Reflect on today\'s logic hurdles', timeStart: '22:00', timeEnd: '22:20', color: '#F59E0B', category: 'Mindset', order: 5, duration_minutes: 20 },
        ]
      };
    }

    // Default Generic Routine
    return {
      packageName: 'Balanced Life Starter',
      description: 'A general purpose routine to build consistency across all areas.',
      habits: [
        { title: 'Wake Up & Hydrate', description: 'Drink water and wake up the brain', timeStart: '07:00', timeEnd: '07:15', color: '#3B82F6', category: 'Health', order: 1, duration_minutes: 15 },
        { title: 'Mindfulness / Meditation', description: 'Clear the mental clutter', timeStart: '07:15', timeEnd: '07:30', color: '#10B981', category: 'Mindset', order: 2, duration_minutes: 15 },
        { title: 'Deep Work Block', description: 'Tackle the hardest task first', timeStart: '08:00', timeEnd: '11:00', color: '#8B5CF6', category: 'Work', order: 3, duration_minutes: 180 },
        { title: 'Active Break', description: 'Walk or light stretching', timeStart: '12:00', timeEnd: '12:30', color: '#EF4444', category: 'Fitness', order: 4, duration_minutes: 30 },
        { title: 'Reading / Learning', description: 'Expand your knowledge base', timeStart: '21:00', timeEnd: '22:00', color: '#F59E0B', category: 'Learning', order: 5, duration_minutes: 60 },
      ]
    };
  }
};
