import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StandsService } from './stands.service';
import { CreateStandDto } from './dto/create-stand.dto';
import { UpdateStandDto } from './dto/update-stand.dto';

@Controller()
export class StandsController {
  constructor(private readonly standsService: StandsService) {}

  // --- CRUD del emprendedor ---
  @MessagePattern({ cmd: 'stands_create' })
  create(@Payload() payload: { user: any; dto: CreateStandDto }) {
    return this.standsService.create(payload);
  }

  @MessagePattern({ cmd: 'stands_update' })
  update(@Payload() payload: { user: any; id: string; dto: UpdateStandDto }) {
    return this.standsService.update(payload);
  }

  @MessagePattern({ cmd: 'stands_remove' })
  remove(@Payload() payload: { user: any; id: string }) {
    return this.standsService.remove(payload);
  }

  @MessagePattern({ cmd: 'stands_list_mine' })
  listMine(@Payload() payload: { user: any }) {
    return this.standsService.listMine(payload);
  }

  // --- Aprobación organizador ---
  @MessagePattern({ cmd: 'stands_approve' })
  approve(@Payload() payload: { user: any; id: string }) {
    return this.standsService.approve(payload);
  }

  // --- Activación/Inactivación emprendedor ---
  @MessagePattern({ cmd: 'stands_activate' })
  activate(@Payload() payload: { user: any; id: string }) {
    return this.standsService.activate(payload);
  }

  @MessagePattern({ cmd: 'stands_inactivate' })
  inactivate(@Payload() payload: { user: any; id: string }) {
    return this.standsService.inactivate(payload);
  }

  // --- Consultas ---
  // Compatibilidad con ms-orders (tu service usa stalls_get_by_id):
  @MessagePattern({ cmd: 'stalls_get_by_id' })
  findForOrders(@Payload() payload: { id: string }) {
    return this.standsService.findById(payload);
  }

  // patrón alternativo
  @MessagePattern({ cmd: 'stands_get_by_id' })
  findById(@Payload() payload: { id: string }) {
    return this.standsService.findById(payload);
  }

  @MessagePattern({ cmd: 'stands_list_active' })
  listActive() {
    return this.standsService.listActive();
  }
}
