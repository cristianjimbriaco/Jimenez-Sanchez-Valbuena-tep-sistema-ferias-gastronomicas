import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: CreateUserDto) {
    const user = await this.usersService.create(data);

    // Importante: no devuelvas passwordHash
    const { passwordHash, ...safeUser } = user as any;

    return { message: 'User created', user: safeUser };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Incluimos email en el token porque tú lo devuelves en validateToken()
    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return {
        userId: payload.sub,
        role: payload.role,
        email: payload.email,
      };
    } catch (e) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async validateRole(data: { userId: string; roles: string[] }) {
    const user = await this.usersService.findById(data.userId);
    if (!user) return false;

    return data.roles.includes(user.role);
  }
}
