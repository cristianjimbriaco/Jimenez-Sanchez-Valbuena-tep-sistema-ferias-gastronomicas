import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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
}
