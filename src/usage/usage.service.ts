import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsageService {
  FREE_TIER_LIMIT = 50;

  constructor(private supabase: SupabaseService) {}

  async getCount(userId: string): Promise<number> {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count } = await this.supabase.getClient()
      .from('usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', firstOfMonth);

    return count ?? 0;
  }

  async increment(userId: string, action: string): Promise<void> {
    await this.supabase.getClient()
      .from('usage')
      .insert({ user_id: userId, action });
  }

  async hasExceededLimit(userId: string): Promise<boolean> {
    const count = await this.getCount(userId);
    return count >= this.FREE_TIER_LIMIT;
  }
}