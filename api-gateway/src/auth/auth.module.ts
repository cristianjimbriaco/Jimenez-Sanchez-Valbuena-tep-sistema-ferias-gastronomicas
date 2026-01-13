import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3001, // puerto RPC del microservicio users-auth
        },
      },
    ]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
