import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stand, StandStatus } from './stand.entity';
import { CreateStandDto } from './dto/create-stand.dto';
import { UpdateStandDto } from './dto/update-stand.dto';

@Injectable()
export class StandsService {
  constructor(
    @InjectRepository(Stand)
    private readonly repo: Repository<Stand>,
  ) {}

  create(dto: CreateStandDto) {
    const stand = this.repo.create(dto);
    return this.repo.save(stand);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const stand = await this.repo.findOne({ where: { id } });
    if (!stand) {
      throw new NotFoundException('Stand no encontrado');
    }
    return stand;
  }

  private ensureOwner(stand: Stand, userId: string) {
    if (stand.entrepreneurId !== userId) {
      throw new ForbiddenException('Solo el dueño puede gestionar este puesto');
    }
  }

  async update(id: string, dto: UpdateStandDto, userId: string) {
    const stand = await this.findOne(id);
    this.ensureOwner(stand, userId);

    // Reglas opcionales: no permitir cambiar status por update normal
    // (status se maneja por approve/activate/inactivate)
    if ((dto as any).status) {
      throw new BadRequestException(
        'No puedes cambiar status por update. Usa approve/activate/inactivate.',
      );
    }

    Object.assign(stand, dto);
    return this.repo.save(stand);
  }

  async remove(id: string, userId: string) {
    const stand = await this.findOne(id);
    this.ensureOwner(stand, userId);

    await this.repo.remove(stand);
    return { deleted: true, id };
  }

  // ✅ Solo organizador: pendiente -> aprobado
  async approve(id: string) {
    const stand = await this.findOne(id);

    if (stand.status !== StandStatus.PENDING) {
      throw new BadRequestException('Solo se puede aprobar un puesto pendiente');
    }

    stand.status = StandStatus.APPROVED;
    return this.repo.save(stand);
  }

  // ✅ Solo dueño emprendedor: aprobado/inactivo -> activo
  async activate(id: string, userId: string) {
    const stand = await this.findOne(id);
    this.ensureOwner(stand, userId);

    if (
      stand.status !== StandStatus.APPROVED &&
      stand.status !== StandStatus.INACTIVE
    ) {
      throw new BadRequestException(
        'Solo se puede activar un puesto aprobado o inactivo',
      );
    }

    stand.status = StandStatus.ACTIVE;
    return this.repo.save(stand);
  }

  // ✅ Solo dueño emprendedor: activo -> inactivo
  async inactivate(id: string, userId: string) {
    const stand = await this.findOne(id);
    this.ensureOwner(stand, userId);

    if (stand.status !== StandStatus.ACTIVE) {
      throw new BadRequestException('Solo se puede inactivar un puesto activo');
    }

    stand.status = StandStatus.INACTIVE;
    return this.repo.save(stand);
  }
}

