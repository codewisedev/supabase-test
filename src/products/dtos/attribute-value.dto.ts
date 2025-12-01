import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AttributeValueDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @IsUUID()
  @IsNotEmpty()
  attributeTypeId!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsNotEmpty()
  displayValue!: string;

  @IsOptional()
  metadata?: Record<string, string>;
}

export class CreateAttributeValueDto {
  @IsUUID()
  @IsNotEmpty()
  attributeTypeId!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsNotEmpty()
  displayValue!: string;

  @IsOptional()
  metadata?: Record<string, string>;
}

export class UpdateAttributeValueDto {
  @IsString()
  @IsOptional()
  displayValue?: string;

  @IsOptional()
  metadata?: Record<string, string>;
}
