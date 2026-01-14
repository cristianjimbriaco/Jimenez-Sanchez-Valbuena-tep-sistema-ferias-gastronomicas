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
        name: 'ORDERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3004,
        },
      }
    ]),
  ],
  exports: [ClientsModule],
})
export class MicroservicesModule {}
