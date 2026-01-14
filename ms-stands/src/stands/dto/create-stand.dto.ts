import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStandDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
