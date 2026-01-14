import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  register(@Payload() data: CreateUserDto) {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  login(@Payload() data: LoginDto) {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'validate_token' })
  validateToken(@Payload() token: string) {
    return this.authService.validateToken(token);
  }

  @MessagePattern({ cmd: 'validate_role' })
  validateRole(@Payload() data: { userId: string; roles: string[] }) {
    return this.authService.validateRole(data);
  }
}
