import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './Dto/signin.dto';
import { SignUpDto } from './Dto/signup.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignUpDto) {
    return await this.authService.signup(
      dto.firstName,
      dto.lastName,
      dto.email,
      dto.password,
      dto.confirmPassword,
    );
  }

  @Post('signin')
  async login(@Body() dto: SignInDto) {
    return await this.authService.signin(dto.email, dto.password);
  }

  // add this endpoint so frontend /auth/me works
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Request() req) {
    const u = req.user;
    if (!u) return null;
    const safeUser = {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
    };
    return { user: safeUser };
  }
}
