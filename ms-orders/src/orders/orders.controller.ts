import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'orders_create' })
  create(@Payload() payload: { user: any; dto: CreateOrderDto }) {
    return this.ordersService.create(payload);
  }

  @MessagePattern({ cmd: 'orders_list_by_customer' })
  listByCustomer(@Payload() payload: { user: any }) {
    return this.ordersService.listByCustomer(payload);
  }

  @MessagePattern({ cmd: 'orders_list_by_stall' })
  listByStall(@Payload() payload: { user: any; stallId: string }) {
    return this.ordersService.listByStall(payload);
  }

  @MessagePattern({ cmd: 'orders_update_status' })
  updateStatus(@Payload() payload: { user: any; orderId: string; dto: UpdateOrderStatusDto }) {
    return this.ordersService.updateStatus(payload);
  }
}
