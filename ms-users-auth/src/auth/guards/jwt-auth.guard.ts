import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CanActivate, ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject('USERS_AUTH_SERVICE')
    private readonly usersAuthClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) throw new UnauthorizedException();

    const token = authHeader.replace('Bearer ', '');

    const user = await firstValueFrom(
      this.usersAuthClient.send(
        { cmd: 'validate_token' },
        token,
      ),
    );

    request.user = user;
    return true;
  }
}
