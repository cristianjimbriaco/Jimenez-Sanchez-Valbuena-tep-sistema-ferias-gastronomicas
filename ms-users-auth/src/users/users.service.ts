import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async create(dto: CreateUserDto): Promise<User> {

        //Validacion: Email duplicado
        const existingUser = await this.usersRepository.findOne({
            where: {email: dto.email}});

        if (existingUser) {
            throw new BadRequestException('Email ya registrado');
        }

        //Validacion: No permitir crear organizadores directamente
        if (dto.role === UserRole.ORGANIZADOR) {//Mas adelante se cambiara este error por una exepcion RPC
            throw new BadRequestException('No esta permitido registrar organizadores directamente');
        }
        const user = this.usersRepository.create(dto);
        return this.usersRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOneById(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({where: {id}});
        if (!user) {
            throw new NotFoundException(`Usuario no encontrado`);
        }

        if (!user.isActive) {
            throw new BadRequestException('Usuario inactivo');
        }

        return user;
    }

    async update(
        id: string, 
        dto: UpdateUserDto,
        currentUserId: string
    ): Promise<User> {
        //Validacion: Un usuario solo puede modificarse a si mismo
        if (id !== currentUserId) {
            throw new ForbiddenException('No tiene permisos para modificar este usuario');
        }

        const user = await this.findOneById(id);

        if (!user.isActive) {
            throw new BadRequestException('No se puede modificar un usuario inactivo');
        }

        Object.assign(user, dto);
        return this.usersRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOneById(id);
        user.isActive = false;
        await this.usersRepository.save(user);
        await this.usersRepository.softRemove(user);
    }
}
