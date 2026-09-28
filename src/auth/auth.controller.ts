import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { JwtGuard } from './jwt.guard';

class AuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

class UpdatePasswordDto {
  @IsString()
  @MinLength(6)
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() dto: AuthDto) {
    return this.authService.signUp(dto.email, dto.password);
  }

  @Post('signin')
  signIn(@Body() dto: AuthDto) {
    return this.authService.signIn(dto.email, dto.password);
  }

  @Post('update-password')
  @UseGuards(JwtGuard)
  updatePassword(@Body() dto: UpdatePasswordDto, @Req() req: any) {
    return this.authService.updatePassword(req.user.id, dto.newPassword);
  }
}