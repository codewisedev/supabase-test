import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsUUID()
  @IsNotEmpty()
  variantId!: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
