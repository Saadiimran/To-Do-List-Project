import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) {
    const user = await this.usersService.createUser({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });
    if (!user) throw new InternalServerErrorException('Failed to create user');
    // create token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    return { access_token: token, user };
  }

  async signin(email: string, password: string) {
    const user = await this.usersService.validateCredentials(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    const full = await this.usersService.findById(user.id);
    if (!full)
      throw new InternalServerErrorException(
        'Failed to load user after signin',
      );
    const safeUser = {
      id: full.id,
      firstName: full.firstName,
      lastName: full.lastName,
      email: full.email,
    };
    return { access_token: token, user: safeUser };
  }

  // optionally helper to decode/verify token
  verifyToken(token: string) {
    return this.jwtService.verify(token);
  }
}
