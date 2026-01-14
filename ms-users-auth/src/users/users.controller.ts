import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() dto: CreateUserDto) {
    try {
      return await this.usersService.create(dto);
    } catch (e: any) {
      throw new RpcException(e?.message || 'Error registrando usuario');
    }
  }

  @MessagePattern({ cmd: 'find_user_by_id' })
  async findById(@Payload() payload: { id: string }) {
    try {
      return await this.usersService.findById(payload.id);
    } catch (e: any) {
      throw new RpcException(e?.message || 'Error buscando usuario');
    }
  }

  @MessagePattern({ cmd: 'update_user' })
  async update(
    @Payload()
    payload: { id: string; dto: UpdateUserDto; currentUserId: string },
  ) {
    try {
      return await this.usersService.update(payload.id, payload.dto, payload.currentUserId);
    } catch (e: any) {
      throw new RpcException(e?.message || 'Error actualizando usuario');
    }
  }

  @MessagePattern({ cmd: 'remove_user' })
  async remove(@Payload() payload: { id: string }) {
    try {
      await this.usersService.remove(payload.id);
      return { ok: true };
    } catch (e: any) {
      throw new RpcException(e?.message || 'Error eliminando usuario');
    }
  }

  @MessagePattern({ cmd: 'find_all_users' })
  async findAll() {
    try {
      return await this.usersService.findAll();
    } catch (e: any) {
      throw new RpcException(e?.message || 'Error listando usuarios');
    }
  }
}
