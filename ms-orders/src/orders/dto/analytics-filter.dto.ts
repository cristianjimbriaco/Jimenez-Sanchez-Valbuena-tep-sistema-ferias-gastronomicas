import { IsOptional, IsUUID, IsISO8601 } from 'class-validator';

export class AnalyticsFilterDto {
  @IsOptional()
  @IsISO8601()
  from?: string; // "2026-01-01T00:00:00.000Z"

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsUUID()
  stallId?: string;
}
