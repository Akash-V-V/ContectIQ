import { Module } from '@nestjs/common';
import { UsageService } from './usage.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}