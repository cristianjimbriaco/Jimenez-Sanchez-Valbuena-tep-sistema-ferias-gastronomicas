import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { OrganizerModule } from './organizer/organizer.module';
import { StandsModule } from './stands/stands.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    OrdersModule,
    OrganizerModule,
    StandsModule,
  ],
})
export class AppModule {}
