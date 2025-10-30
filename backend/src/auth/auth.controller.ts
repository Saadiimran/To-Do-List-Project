import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './Dto/signin.dto';
import { SignUpDto } from './Dto/signup.dto';

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

  @Post('login')
  async login(@Body() dto: SignInDto) {
    return await this.authService.signin(dto.email, dto.password);
  }
}
