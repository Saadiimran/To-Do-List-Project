import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async signup(firstName:string, lastName:string, email: string, password: string, confirmPassword: string) {
    // create user (throws ConflictException if exists)
    const user = await this.usersService.createUser({ firstName, lastName, email, password, confirmPassword });
    if (!user) throw new InternalServerErrorException('Failed to create user');
    // create token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { access_token: token, user };
  }

  async signin(email: string, password: string) {
    const user = await this.usersService.validateCredentials(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { access_token: token, user };
  }

  // optionally helper to decode/verify token
  verifyToken(token: string) {
    return this.jwtService.verify(token);
  }
}
