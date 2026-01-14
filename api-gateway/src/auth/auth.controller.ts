import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('USERS_AUTH_SERVICE')
    private readonly usersAuthClient: ClientProxy,
  ) {}

  @Post('login')
  login(@Body() body: any) {
    return this.usersAuthClient.send(
      { cmd: 'login' },
      body,
    );
  }

  @Post('register')
  register(@Body() body: any) {
    return this.usersAuthClient.send(
      { cmd: 'register' },
      body,
    );
  }

  @Post('validate')
  validate(@Body('token') token: string) {
    return this.usersAuthClient.send(
      { cmd: 'validate_token' },
      token, // 👈 solo el string
    );
  }

}
