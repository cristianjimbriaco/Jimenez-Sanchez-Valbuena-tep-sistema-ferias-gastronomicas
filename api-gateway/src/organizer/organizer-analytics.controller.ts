import { Controller, Get, Inject, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('organizer/analytics')
export class OrganizerAnalyticsController {
  constructor(@Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador')
  @Get('sales-by-stall')
  salesByStall(@Req() req: any, @Query() filter: any) {
    return this.ordersClient.send(
      { cmd: 'orders_analytics_sales_by_stall' },
      { user: req.user, filter },
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador')
  @Get('top-product')
  topProduct(@Req() req: any, @Query() filter: any) {
    return this.ordersClient.send(
      { cmd: 'orders_analytics_top_product' },
      { user: req.user, filter },
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador')
  @Get('daily-volume')
  dailyVolume(@Req() req: any, @Query() filter: any) {
    return this.ordersClient.send(
      { cmd: 'orders_analytics_daily_volume' },
      { user: req.user, filter },
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador')
  @Get('completed-count')
  completedCount(@Req() req: any, @Query() filter: any) {
    return this.ordersClient.send(
      { cmd: 'orders_analytics_completed_count' },
      { user: req.user, filter },
    );
  }
}
