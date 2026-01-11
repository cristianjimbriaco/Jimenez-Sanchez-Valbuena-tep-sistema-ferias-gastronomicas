import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async create(dto: CreateUserDto): Promise<User> {
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
        return user;
    }

    async update(id: string, dto: UpdateUserDto): Promise<User> {
        const user = await this.findOneById(id);
        Object.assign(user, dto);
        return this.usersRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOneById(id);
        await this.usersRepository.softRemove(user);
    }
}
