import { Body, Controller, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('USERS_AUTH_SERVICE')
    private readonly usersAuthClient: ClientProxy,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return firstValueFrom(
      this.usersAuthClient.send(
        { cmd: 'login' },
        body,
      ),
    );
  }
}