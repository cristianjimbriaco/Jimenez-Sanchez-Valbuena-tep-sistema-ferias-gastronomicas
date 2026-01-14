import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_AUTH_HOST || 'localhost',
          port: Number(process.env.USERS_AUTH_PORT) || 3001,
        },
      },
      {
        name: 'STANDS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3002, // ms-stands
        },
      },
      {
        name: 'PRODUCTS_SERVICE',
<<<<<<< HEAD
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3003 },
      },
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3004,
        },
=======
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCTS_HOST || 'localhost',
          port: Number(process.env.PRODUCTS_PORT) || 3003,
        },
      },
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3004,
        },
>>>>>>> 700271c816e22ac838cda55868d6ed07e858f8da
      }
    ]),
  ],
  exports: [ClientsModule],
})
export class MicroservicesModule {}
