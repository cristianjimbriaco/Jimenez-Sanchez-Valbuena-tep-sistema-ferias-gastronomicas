import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

export const USERS_AUTH_SERVICE = 'USERS_AUTH_SERVICE';
export const PRODUCTS_SERVICE = 'PRODUCTS_SERVICE';
export const ORDERS_SERVICE = 'ORDERS_SERVICE';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USERS_AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_AUTH_HOST || 'localhost',
          port: Number(process.env.USERS_AUTH_PORT) || 3001,
        },
      },
      {
        name: PRODUCTS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCTS_HOST || 'localhost',
          port: Number(process.env.PRODUCTS_PORT) || 3002,
        },
      },
      {
        name: ORDERS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.ORDERS_HOST || 'localhost',
          port: Number(process.env.ORDERS_PORT) || 3004, // o el puerto real del ms-orders
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MicroservicesModule {}
