import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';

import { Stand, StandStatus } from './stand.entity';
import { CreateStandDto } from './dto/create-stand.dto';
import { UpdateStandDto } from './dto/update-stand.dto';

type JwtUser = { userId: string; role: string; email?: string };

@Injectable()
export class StandsService {
  constructor(
    @InjectRepository(Stand)
    private readonly repo: Repository<Stand>,
  ) {}

  private ensureRole(user: JwtUser, allowed: string[]) {
    if (!allowed.includes(user.role)) {
      throw new RpcException({ statusCode: 403, message: 'Forbidden (rol no permitido)' });
    }
  }

  private ensureOwner(stand: Stand, userId: string) {
    if (stand.entrepreneurId !== userId) {
      throw new RpcException({ statusCode: 403, message: 'Solo el dueño puede gestionar este puesto' });
    }
  }

  private async getOr404(id: string) {
    const stand = await this.repo.findOne({ where: { id } });
    if (!stand) throw new RpcException({ statusCode: 404, message: 'Puesto no encontrado' });
    return stand;
  }

  // Emprendedor crea: queda pendiente
  async create(payload: { user: JwtUser; dto: CreateStandDto }) {
    const { user, dto } = payload;
    this.ensureRole(user, ['emprendedor']);

    const stand = this.repo.create({
      name: dto.name,
      description: dto.description,
      entrepreneurId: user.userId,
      status: StandStatus.PENDING,
    });

    return this.repo.save(stand);
  }

  async findById(payload: { id: string }) {
    return this.getOr404(payload.id);
  }

  // Catálogo público: solo activos
  async listActive() {
    return this.repo.find({
      where: { status: StandStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  // (Útil) listar por emprendedor (dueño)
  async listMine(payload: { user: JwtUser }) {
    this.ensureRole(payload.user, ['emprendedor']);
    return this.repo.find({
      where: { entrepreneurId: payload.user.userId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(payload: { user: JwtUser; id: string; dto: UpdateStandDto }) {
    const { user, id, dto } = payload;
    this.ensureRole(user, ['emprendedor']);

    const stand = await this.getOr404(id);
    this.ensureOwner(stand, user.userId);

    // No permitir cambiar status/owner por dto (solo name/description)
    if (dto.name !== undefined) stand.name = dto.name;
    if (dto.description !== undefined) stand.description = dto.description;

    return this.repo.save(stand);
  }

  async remove(payload: { user: JwtUser; id: string }) {
    const { user, id } = payload;
    this.ensureRole(user, ['emprendedor']);

    const stand = await this.getOr404(id);
    this.ensureOwner(stand, user.userId);

    await this.repo.remove(stand);
    return { ok: true, id };
  }

  // Organizador: pendiente -> aprobado
  async approve(payload: { user: JwtUser; id: string }) {
    this.ensureRole(payload.user, ['organizador']);

    const stand = await this.getOr404(payload.id);
    if (stand.status !== StandStatus.PENDING) {
      throw new RpcException({ statusCode: 400, message: 'Solo se puede aprobar un puesto pendiente' });
    }

    stand.status = StandStatus.APPROVED;
    return this.repo.save(stand);
  }

  // Emprendedor dueño: aprobado/inactivo -> activo
  async activate(payload: { user: JwtUser; id: string }) {
    this.ensureRole(payload.user, ['emprendedor']);

    const stand = await this.getOr404(payload.id);
    this.ensureOwner(stand, payload.user.userId);

    if (![StandStatus.APPROVED, StandStatus.INACTIVE].includes(stand.status)) {
      throw new RpcException({ statusCode: 400, message: 'Solo se puede activar un puesto aprobado o inactivo' });
    }

    stand.status = StandStatus.ACTIVE;
    return this.repo.save(stand);
  }

  // Emprendedor dueño: activo -> inactivo
  async inactivate(payload: { user: JwtUser; id: string }) {
    this.ensureRole(payload.user, ['emprendedor']);

    const stand = await this.getOr404(payload.id);
    this.ensureOwner(stand, payload.user.userId);

    if (stand.status !== StandStatus.ACTIVE) {
      throw new RpcException({ statusCode: 400, message: 'Solo se puede inactivar un puesto activo' });
    }

    stand.status = StandStatus.INACTIVE;
    return this.repo.save(stand);
  }
}
