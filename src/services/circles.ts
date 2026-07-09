import { supabase } from '../lib/supabase';
import { Circle, CircleMember } from '../types';

export const circlesService = {
  async getCircles(): Promise<Circle[]> {
    const { data, error } = await supabase
      .from('circles')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  async createCircle(name: string, description?: string): Promise<Circle> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('circles')
      .insert({ name, description, creator_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async joinCircle(circleId: string): Promise<CircleMember> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('circle_members')
      .insert({ circle_id: circleId, user_id: user.id, role: 'member' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
