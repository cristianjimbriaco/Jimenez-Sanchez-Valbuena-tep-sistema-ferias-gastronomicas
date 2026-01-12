import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export enum UserRole {
  cliente = 'cliente',
  emprendedor = 'emprendedor',
  organizador = 'organizador',
}

export class CreateUserDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
