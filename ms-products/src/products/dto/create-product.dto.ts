import { IsUUID, IsString, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsUUID()
  standId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
