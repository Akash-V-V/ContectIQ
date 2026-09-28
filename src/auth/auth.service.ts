import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.getClient().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) throw new BadRequestException(error.message);

    // Create profile row
    await this.supabase.getClient()
      .from('profiles')
      .insert({ id: data.user.id, email: data.user.email, plan: 'free' });

    return { message: 'Account created successfully', userId: data.user.id };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.getClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new UnauthorizedException(error.message);

    return {
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }

  async updatePassword(userId: string, newPassword: string) {
    const { error } = await this.supabase.getClient().auth.admin.updateUserById(
        userId,
        { password: newPassword }
    );

    if (error) throw new BadRequestException(error.message);
    return { message: 'Password updated successfully' };
  }
}