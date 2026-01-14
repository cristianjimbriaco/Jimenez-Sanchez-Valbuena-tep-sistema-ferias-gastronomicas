import { Body, Controller, Get, Inject, Patch, UseGuards, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_AUTH_SERVICE')
    private readonly usersAuthClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.usersAuthClient.send(
      { cmd: 'find_user_by_id' },
      { id: req.user.userId },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: any) {
    return this.usersAuthClient.send(
      { cmd: 'update_user' },
      { id: req.user.userId, dto, currentUserId: req.user.userId },
    );
  }
  
}
