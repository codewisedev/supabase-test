import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AttributeTypeDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  displayName!: string;
}

export class CreateAttributeTypeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  displayName!: string;
}

export class UpdateAttributeTypeDto {
  @IsString()
  @IsNotEmpty()
  displayName!: string;
}
