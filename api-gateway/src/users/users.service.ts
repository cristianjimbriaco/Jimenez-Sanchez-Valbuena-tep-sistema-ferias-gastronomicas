import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) {}

  create(dto: CreateUserDto) {
    return this.usersClient.send(
      { cmd: 'create_user' },
      dto,
    );
  }

  findAll() {
    return this.usersClient.send(
      { cmd: 'find_all_users' },
      {},
    );
  }

  findOne(id: string) {
    return this.usersClient.send(
      { cmd: 'find_user_by_id' },
      id,
    );
  }
}
