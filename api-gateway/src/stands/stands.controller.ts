import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('stands')
export class StandsController {
  constructor(
    @Inject('STANDS_SERVICE')
    private readonly standsClient: ClientProxy,
  ) {}

  // Emprendedor crea
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('emprendedor')
  @Post()
  create(@Req() req: any, @Body() dto: any) {
    return this.standsClient.send(
      { cmd: 'stands_create' },
      { user: req.user, dto },
    );
  }

  // Mis puestos
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('emprendedor')
  @Get('me')
  myStands(@Req() req: any) {
    return this.standsClient.send(
      { cmd: 'stands_list_mine' },
      { user: req.user },
    );
  }

  // Editar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('emprendedor')
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.standsClient.send(
      { cmd: 'stands_update' },
      { user: req.user, id, dto },
    );
  }

  // Activar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('emprendedor')
  @Patch(':id/activate')
  activate(@Req() req: any, @Param('id') id: string) {
    return this.standsClient.send(
      { cmd: 'stands_activate' },
      { user: req.user, id },
    );
  }

  // Inactivar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('emprendedor')
  @Patch(':id/inactivate')
  inactivate(@Req() req: any, @Param('id') id: string) {
    return this.standsClient.send(
      { cmd: 'stands_inactivate' },
      { user: req.user, id },
    );
  }

  // Aprobar (organizador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador')
  @Patch(':id/approve')
  approve(@Req() req: any, @Param('id') id: string) {
    return this.standsClient.send(
      { cmd: 'stands_approve' },
      { user: req.user, id },
    );
  }

  // Catálogo público
  @Get('active')
  listActive() {
    return this.standsClient.send(
      { cmd: 'stands_list_active' },
      {},
    );
  }
}
