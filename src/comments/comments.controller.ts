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
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';

@Controller('api/products/:productId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCommentsByProduct(
    @Param('productId') productId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.commentsService.getCommentsByProduct(productId, pagination);
  }

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('productId') productId: string,
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(
      productId,
      req.user.id,
      createCommentDto,
    );
  }

  @Put(':commentId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateComment(
    @Param('commentId') commentId: string,
    @Request() req,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(
      commentId,
      req.user.id,
      updateCommentDto,
    );
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    return this.commentsService.deleteComment(commentId, req.user.id);
  }
}
