import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CartService } from './cart.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';

@Controller('api/cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCartItems(@Request() req) {
    return this.cartService.getCartItems(req.user.id);
  }

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Put(':cartItemId')
  @HttpCode(HttpStatus.OK)
  async updateCartItem(
    @Param('cartItemId') cartItemId: string,
    @Request() req,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      req.user.id,
      cartItemId,
      updateCartItemDto,
    );
  }

  @Delete(':cartItemId')
  @HttpCode(HttpStatus.OK)
  async removeFromCart(
    @Param('cartItemId') cartItemId: string,
    @Request() req,
  ) {
    return this.cartService.removeFromCart(req.user.id, cartItemId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
