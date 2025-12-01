import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { supabase } from '../config/supabase';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';

@Injectable()
export class CartService {
  async getCartItems(userId: string) {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id, 
        quantity, 
        created_at,
        updated_at,
        products:product_id (*),
        variants:variant_id (
          id,
          sku,
          price,
          discount_price,
          stock_quantity,
          is_default,
          variant_attributes (
            attribute_value_id,
            attribute_values (*)
          )
        )
      `)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, variantId, quantity = 1 } = addToCartDto;

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .maybeSingle();

    if (productError || !product) {
      throw new NotFoundException('Product not found');
    }

    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('id, stock_quantity')
      .eq('id', variantId)
      .eq('product_id', productId)
      .maybeSingle();

    if (variantError || !variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (variant.stock_quantity < quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    const { data: existingItem, error: cartError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('variant_id', variantId)
      .maybeSingle();

    if (cartError) {
      throw new BadRequestException(cartError.message);
    }

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > variant.stock_quantity) {
        throw new BadRequestException('Not enough stock available');
      }

      const { data, error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity, updated_at: new Date() })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (updateError) {
        throw new BadRequestException(updateError.message);
      }

      return data;
    } else {
      const { data, error: insertError } = await supabase
        .from('cart_items')
        .insert([
          {
            user_id: userId,
            product_id: productId,
            variant_id: variantId,
            quantity,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new BadRequestException(insertError.message);
      }

      return data;
    }
  }

  async updateCartItem(
    userId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const { data: existingItem, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        id, 
        product_id,
        variant_id
      `)
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .maybeSingle();

    if (cartError || !existingItem) {
      throw new NotFoundException('Cart item not found');
    }

    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', existingItem.variant_id)
      .maybeSingle();

    if (variantError || !variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (
      updateCartItemDto.quantity !== undefined &&
      variant.stock_quantity < updateCartItemDto.quantity
    ) {
      throw new BadRequestException('Not enough stock available');
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity: updateCartItemDto.quantity,
        updated_at: new Date(),
      })
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const { data: existingItem, error: cartError } = await supabase
      .from('cart_items')
      .select('id')
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .maybeSingle();

    if (cartError || !existingItem) {
      throw new NotFoundException('Cart item not found');
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Item removed from cart',
      id: cartItemId,
    };
  }

  async clearCart(userId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Cart cleared successfully',
    };
  }
}
