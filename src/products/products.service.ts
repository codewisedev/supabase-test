import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { supabase } from '../config/supabase';
import { supabaseAdmin } from '../config/supabase-admin';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsService {
  async getAllProducts(pagination: PaginationDto) {
    const { offset = 0, limit = 10 } = pagination;

    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      data,
      offset,
      limit,
      total: count,
    };
  }

  async getProductById(id: string) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (
          id,
          sku,
          price,
          discount_price,
          stock_quantity,
          is_default,
          variant_attributes (
            attribute_value_id,
            attribute_values (
              id,
              value,
              display_value,
              metadata,
              attribute_type_id,
              attribute_types (
                id,
                name,
                display_name
              )
            )
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (productError) {
      throw new BadRequestException(productError.message);
    }

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        rating,
        created_at,
        updated_at,
        user_id
      `)
      .eq('product_id', id)
      .order('created_at', { ascending: false });

    if (commentsError) {
      throw new BadRequestException(commentsError.message);
    }

    const totalReviews = comments ? comments.length : 0;
    let averageRating = 0;

    if (totalReviews > 0) {
      const totalRating = comments.reduce((sum, comment) => {
        return sum + (comment.rating || 0);
      }, 0);
      averageRating = totalRating / totalReviews;
      averageRating = Math.round(averageRating * 100) / 100;
    }

    if (!product.product_variants || product.product_variants.length === 0) {
      return {
        ...product,
        product_variants: [],
        attribute_types: [],
        variant_combinations: {},
        comments: comments || [],
        average_rating: averageRating,
        total_reviews: totalReviews,
      };
    }

    const attributeTypesMap = new Map();

    product.product_variants.forEach(variant => {
      if (variant.variant_attributes) {
        variant.variant_attributes.forEach(attr => {
          if (attr && attr.attribute_values) {
            const attrValue = attr.attribute_values;
            if (attrValue && attrValue.attribute_types) {
              const attrType = attrValue.attribute_types;

              if (!attributeTypesMap.has(attrType.id)) {
                attributeTypesMap.set(attrType.id, {
                  id: attrType.id,
                  name: attrType.name,
                  displayName: attrType.display_name,
                  values: [],
                });
              }

              const typeEntry = attributeTypesMap.get(attrType.id);
              if (!typeEntry.values.some(v => v.id === attrValue.id)) {
                typeEntry.values.push({
                  id: attrValue.id,
                  value: attrValue.value,
                  displayValue: attrValue.display_value,
                  metadata: attrValue.metadata,
                });
              }
            }
          }
        });
      }
    });

    const variantCombinations = {};
    product.product_variants.forEach(variant => {
      if (variant.variant_attributes && variant.variant_attributes.length > 0) {
        const variantAttributes = {};
        variant.variant_attributes.forEach(attr => {
          if (
            attr &&
            attr.attribute_values &&
            attr.attribute_values.attribute_types
          ) {
            const attrValue = attr.attribute_values;
            const attrType = attrValue.attribute_types;
            variantAttributes[attrType.name] = attrValue.value;
          }
        });

        if (Object.keys(variantAttributes).length > 0) {
          const key = Object.entries(variantAttributes)
            .sort(([typeA], [typeB]) => typeA.localeCompare(typeB))
            .map(([type, value]) => `${type}:${value}`)
            .join('|');

          variantCombinations[key] = variant.id;
        }
      }
    });

    const structuredProduct = {
      ...product,
      product_variants: product.product_variants,
      attribute_types: Array.from(attributeTypesMap.values()),
      variant_combinations: variantCombinations,
      comments: comments || [],
      average_rating: averageRating,
      total_reviews: totalReviews,
    };

    return structuredProduct;
  }

  async createProduct(createProductDto: CreateProductDto) {
    const {
      name,
      description,
      price,
      discountPrice,
      images,
      stockQuantity,
      category,
      variants = [],
    } = createProductDto;

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert([
        {
          name,
          description,
          price,
          discount_price: discountPrice,
          images: images || [],
          stock_quantity: stockQuantity || 0,
          category,
        },
      ])
      .select()
      .single();

    if (productError) {
      throw new BadRequestException(productError.message);
    }

    if (variants.length === 0) {
      const { error: variantError } = await supabaseAdmin
        .from('product_variants')
        .insert([
          {
            product_id: product.id,
            sku: `${product.name.substring(0, 10).toUpperCase().replace(/\s+/g, '-')}-DEFAULT`,
            price: price,
            discount_price: discountPrice,
            stock_quantity: stockQuantity || 0,
            is_default: true,
          },
        ]);

      if (variantError) {
        console.error('Failed to create default variant:', variantError);
      }
    } else {
      const variantsToInsert = variants.map((variant, index) => ({
        product_id: product.id,
        sku:
          variant.sku ||
          `${product.name.substring(0, 10).toUpperCase().replace(/\s+/g, '-')}-${index + 1}`,
        price: variant.price !== undefined ? variant.price : price,
        discount_price:
          variant.discountPrice !== undefined
            ? variant.discountPrice
            : discountPrice,
        stock_quantity:
          variant.stockQuantity !== undefined
            ? variant.stockQuantity
            : stockQuantity || 0,
        is_default: index === 0,
      }));

      const { data: createdVariants, error: variantsError } =
        await supabaseAdmin
          .from('product_variants')
          .insert(variantsToInsert)
          .select();

      if (variantsError) {
        console.error('Failed to create variants:', variantsError);
      } else {
        for (let i = 0; i < createdVariants.length; i++) {
          const variant = createdVariants[i];
          const variantDto = variants[i];

          if (
            variantDto.attributeValueIds &&
            variantDto.attributeValueIds.length > 0
          ) {
            const variantAttributes = variantDto.attributeValueIds.map(
              attributeValueId => ({
                variant_id: variant.id,
                attribute_value_id: attributeValueId,
              }),
            );

            const { error: attrError } = await supabaseAdmin
              .from('variant_attributes')
              .insert(variantAttributes);

            if (attrError) {
              console.error(
                `Failed to create attributes for variant ${variant.id}:`,
                attrError,
              );
            }
          }
        }
      }
    }

    return this.getProductById(product.id);
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const { data: existingProduct, error: existingError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      throw new BadRequestException(existingError.message);
    }

    if (!existingProduct) {
      throw new HttpException('Product not found!!', HttpStatus.NOT_FOUND);
    }

    const { variants, ...productData } = updateProductDto;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (productData.name !== undefined) updateData.name = productData.name;
    if (productData.description !== undefined)
      updateData.description = productData.description;
    if (productData.price !== undefined) updateData.price = productData.price;
    if (productData.discountPrice !== undefined)
      updateData.discount_price = productData.discountPrice;
    if (productData.images !== undefined)
      updateData.images = productData.images;
    if (productData.stockQuantity !== undefined)
      updateData.stock_quantity = productData.stockQuantity;
    if (productData.category !== undefined)
      updateData.category = productData.category;

    const { data: updatedProduct, error: updateError } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException(updateError.message);
    }

    if (variants && variants.length > 0) {
      for (const variant of variants) {
        if (variant.id) {
          const variantUpdateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
          };

          if (variant.sku !== undefined) variantUpdateData.sku = variant.sku;
          if (variant.price !== undefined)
            variantUpdateData.price = variant.price;
          if (variant.discountPrice !== undefined)
            variantUpdateData.discount_price = variant.discountPrice;
          if (variant.stockQuantity !== undefined)
            variantUpdateData.stock_quantity = variant.stockQuantity;

          await supabaseAdmin
            .from('product_variants')
            .update(variantUpdateData)
            .eq('id', variant.id)
            .eq('product_id', id);

          if (
            variant.attributeValueIds &&
            variant.attributeValueIds.length > 0
          ) {
            await supabaseAdmin
              .from('variant_attributes')
              .delete()
              .eq('variant_id', variant.id);

            const variantAttributes = variant.attributeValueIds.map(
              attributeValueId => ({
                variant_id: variant.id,
                attribute_value_id: attributeValueId,
              }),
            );

            await supabaseAdmin
              .from('variant_attributes')
              .insert(variantAttributes);
          }
        } else {
          const { data: newVariant, error: newVariantError } =
            await supabaseAdmin
              .from('product_variants')
              .insert([
                {
                  product_id: id,
                  sku:
                    variant.sku ||
                    `${updatedProduct.name.substring(0, 10).toUpperCase().replace(/\s+/g, '-')}-${Date.now()}`,
                  price:
                    variant.price !== undefined
                      ? variant.price
                      : updatedProduct.price,
                  discount_price:
                    variant.discountPrice !== undefined
                      ? variant.discountPrice
                      : updatedProduct.discount_price,
                  stock_quantity:
                    variant.stockQuantity !== undefined
                      ? variant.stockQuantity
                      : updatedProduct.stock_quantity || 0,
                  is_default: false,
                },
              ])
              .select()
              .single();

          if (
            !newVariantError &&
            variant.attributeValueIds &&
            variant.attributeValueIds.length > 0
          ) {
            const variantAttributes = variant.attributeValueIds.map(
              attributeValueId => ({
                variant_id: newVariant.id,
                attribute_value_id: attributeValueId,
              }),
            );

            await supabaseAdmin
              .from('variant_attributes')
              .insert(variantAttributes);
          }
        }
      }
    } else if (
      productData.price !== undefined ||
      productData.discountPrice !== undefined ||
      productData.stockQuantity !== undefined
    ) {
      const variantUpdateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (productData.price !== undefined)
        variantUpdateData.price = productData.price;
      if (productData.discountPrice !== undefined)
        variantUpdateData.discount_price = productData.discountPrice;
      if (productData.stockQuantity !== undefined)
        variantUpdateData.stock_quantity = productData.stockQuantity;

      await supabaseAdmin
        .from('product_variants')
        .update(variantUpdateData)
        .eq('product_id', id)
        .eq('is_default', true);
    }

    return this.getProductById(id);
  }

  async deleteProduct(id: string) {
    const { data: existingProduct, error: existingError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      throw new BadRequestException(existingError.message);
    }

    if (!existingProduct) {
      throw new HttpException('Product not found!!', HttpStatus.NOT_FOUND);
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Product deleted successfully',
      id,
    };
  }
}
