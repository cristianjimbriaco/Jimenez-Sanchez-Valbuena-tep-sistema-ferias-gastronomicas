import { Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// si ya tienes RolesGuard y @Roles:
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(@Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @Post()
  create(@Req() req: any, @Body() dto: any) {
    return this.ordersClient.send({ cmd: 'orders_create' }, { user: req.user, dto });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @Get('me')
  myOrders(@Req() req: any) {
    return this.ordersClient.send({ cmd: 'orders_list_by_customer' }, { user: req.user });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('emprendedor', 'organizador')
  @Get('stall/:stallId')
  byStall(@Req() req: any, @Param('stallId') stallId: string) {
    return this.ordersClient.send({ cmd: 'orders_list_by_stall' }, { user: req.user, stallId });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('emprendedor', 'organizador')
  @Patch(':id/status')
  updateStatus(@Req() req: any, @Param('id') orderId: string, @Body() dto: any) {
    return this.ordersClient.send({ cmd: 'orders_update_status' }, { user: req.user, orderId, dto });
  }
}
