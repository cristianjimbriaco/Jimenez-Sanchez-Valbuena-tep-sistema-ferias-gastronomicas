import { Body, Controller, Get, Inject, Param, Post, UseGuards, Req} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() dto: any) {
    return firstValueFrom(
      this.usersClient.send({ cmd: 'create_user' }, dto),
    );
  }

  @Get()
  async findAll() {
    return firstValueFrom(
      this.usersClient.send({ cmd: 'find_all_users' }, {}),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.usersClient.send({ cmd: 'find_user_by_id' }, id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador')
  @Get('organizador-only')
  onlyOrganizador() {
    return { message: 'Acceso permitido solo a organizadores' };
  }
  
}
