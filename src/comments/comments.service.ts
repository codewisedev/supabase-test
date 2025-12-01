import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { supabase } from '../config/supabase';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';

@Injectable()
export class CommentsService {
  async getCommentsByProduct(productId: string, pagination: PaginationDto) {
    const { offset = 0, limit = 10 } = pagination;

    const { data, error, count } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
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

  async createComment(
    productId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const { content, rating } = createCommentDto;

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .maybeSingle();

    if (productError || !product) {
      throw new NotFoundException('Product not found');
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          product_id: productId,
          user_id: userId,
          content,
          rating,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async updateComment(
    commentId: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ) {
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .maybeSingle();

    if (commentError || !comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updateCommentDto.content !== undefined)
      updateData.content = updateCommentDto.content;
    if (updateCommentDto.rating !== undefined)
      updateData.rating = updateCommentDto.rating;

    const { data, error } = await supabase
      .from('comments')
      .update(updateData)
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async deleteComment(commentId: string, userId: string) {
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .maybeSingle();

    if (commentError || !comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Comment deleted successfully',
      id: commentId,
    };
  }
}
