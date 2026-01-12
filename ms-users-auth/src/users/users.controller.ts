import { Body, Controller, Post, UseGuards, Get, Req } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    //RPC Methods para microservicios

    @MessagePattern({ cmd: 'create_user' })
    create(@Payload() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @MessagePattern({ cmd: 'find_all_users' })
    findAll() {
        return this.usersService.findAll();
    }

    @MessagePattern({ cmd: 'find_user_by_id' })
    findOneById(@Payload() id: string) {
        return this.usersService.findOneById(id);
    }

    @MessagePattern({ cmd: 'update_user' })
    update(@Payload() payload: { id: string; dto: UpdateUserDto; currentUserId: string }
    ) {
        return this.usersService.update(payload.id, payload.dto, payload.currentUserId);
    }

    @MessagePattern({ cmd: 'remove_user' })
    remove(@Payload() id: string) {
        return this.usersService.remove(id);
    }

    //HTTP Methods para pruebas locales
    @Post()
    createHttp(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req) {
    return req.user;
    }

}
