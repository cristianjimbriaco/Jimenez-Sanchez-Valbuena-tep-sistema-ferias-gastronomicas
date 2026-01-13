import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StandsService } from './stands.service';
import { CreateStandDto } from './dto/create-stand.dto';
import { UpdateStandDto } from './dto/update-stand.dto';

type UserRole = 'emprendedor' | 'organizador';

function getUserContext(headers: any) {
  const userId = headers['x-user-id'];
  const role = headers['x-user-role'] as UserRole;

  return { userId, role };
}

@Controller('stands')
export class StandsController {
  constructor(private readonly standsService: StandsService) {}

  @Post()
  create(@Body() dto: CreateStandDto) {
    // Crear puesto: lo hace el emprendedor (por ahora no validamos role aquí)
    return this.standsService.create(dto);
  }

  @Get()
  findAll() {
    return this.standsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.standsService.findOne(id);
  }

  // ✅ update solo dueño (x-user-id)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStandDto,
    @Headers() headers: any,
  ) {
    const { userId } = getUserContext(headers);
    if (!userId) throw new ForbiddenException('Falta header x-user-id');

    return this.standsService.update(id, dto, userId);
  }

  // ✅ delete solo dueño (x-user-id)
  @Delete(':id')
  remove(@Param('id') id: string, @Headers() headers: any) {
    const { userId } = getUserContext(headers);
    if (!userId) throw new ForbiddenException('Falta header x-user-id');

    return this.standsService.remove(id, userId);
  }

  // ✅ aprobar: solo organizador
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Headers() headers: any) {
    const { role } = getUserContext(headers);
    if (role !== 'organizador') {
      throw new ForbiddenException('Solo organizador puede aprobar');
    }

    return this.standsService.approve(id);
  }

  // ✅ activar: solo emprendedor dueño
  @Patch(':id/activate')
  activate(@Param('id') id: string, @Headers() headers: any) {
    const { role, userId } = getUserContext(headers);

    if (!userId) throw new ForbiddenException('Falta header x-user-id');
    if (role !== 'emprendedor') {
      throw new ForbiddenException('Solo emprendedor puede activar');
    }

    return this.standsService.activate(id, userId);
  }

  // ✅ inactivar: solo emprendedor dueño
  @Patch(':id/inactivate')
  inactivate(@Param('id') id: string, @Headers() headers: any) {
    const { role, userId } = getUserContext(headers);

    if (!userId) throw new ForbiddenException('Falta header x-user-id');
    if (role !== 'emprendedor') {
      throw new ForbiddenException('Solo emprendedor puede inactivar');
    }

    return this.standsService.inactivate(id, userId);
  }
}
