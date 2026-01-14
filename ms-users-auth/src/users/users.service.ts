import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email ya registrado');
    }

    // Validar role (por si DTO no lo está validando bien)
    const allowedRoles = Object.values(UserRole);
    if (!allowedRoles.includes(dto.role as any)) {
      throw new BadRequestException(
        `Rol inválido. Debe ser uno de: ${allowedRoles.join(', ')}`,
      );
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      email: dto.email,
      passwordHash: hashed,
      role: dto.role as any,
      fullName: (dto as any).fullName ?? (dto as any).full_name ?? dto['full_name'],
    });

    if (!user.fullName) {
      throw new BadRequestException('fullName es obligatorio');
    }

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // Alias por compatibilidad si algún archivo viejo lo llama
  async findOneById(id: string): Promise<User> {
    return this.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Update de perfil:
   * - Solo se puede actualizar a sí mismo
   * - No se permite cambiar email/role/password aquí (perfil básico)
   */
  async update(
    id: string,
    dto: UpdateUserDto,
    currentUserId: string,
  ): Promise<User> {
    if (id !== currentUserId) {
      throw new ForbiddenException('No puedes modificar el perfil de otro usuario');
    }

    const user = await this.findById(id);

    // Bloqueamos campos sensibles aunque el DTO los incluya
    const { email, role, password, passwordHash, ...safeDto } = (dto as any) ?? {};

    // Permitimos solo fullName (y otros campos futuros si existen)
    if (safeDto.fullName !== undefined) user.fullName = safeDto.fullName;

    // Si tu UpdateUserDto trae full_name por error, lo soportamos igual
    if (safeDto.full_name !== undefined) user.fullName = safeDto.full_name;

    return this.usersRepository.save(user);
  }

  /**
   * El modelo de la profe NO tiene deleted_at ni isActive,
   * así que hacemos borrado duro (delete).
   */
  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
  }
}
