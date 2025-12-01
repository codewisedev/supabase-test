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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/guards/role.guard';
import { AttributesService } from './attributes.service';
import {
  CreateAttributeTypeDto,
  UpdateAttributeTypeDto,
} from './dtos/attribute-type.dto';
import {
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
} from './dtos/attribute-value.dto';

@Controller('api/attributes')
export class AttributesController {
  constructor(private attributesService: AttributesService) {}

  @Get('types')
  @HttpCode(HttpStatus.OK)
  async getAllAttributeTypes() {
    return this.attributesService.getAllAttributeTypes();
  }

  @Get('types/:id')
  @HttpCode(HttpStatus.OK)
  async getAttributeTypeById(@Param('id') id: string) {
    return this.attributesService.getAttributeTypeById(id);
  }

  @Post('types')
  @Roles('admin')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createAttributeType(@Body() createDto: CreateAttributeTypeDto) {
    return this.attributesService.createAttributeType(createDto);
  }

  @Put('types/:id')
  @Roles('admin')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateAttributeType(
    @Param('id') id: string,
    @Body() updateDto: UpdateAttributeTypeDto,
  ) {
    return this.attributesService.updateAttributeType(id, updateDto);
  }

  @Delete('types/:id')
  @Roles('admin')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAttributeType(@Param('id') id: string) {
    return this.attributesService.deleteAttributeType(id);
  }

  @Get('types/:typeId/values')
  @HttpCode(HttpStatus.OK)
  async getAttributeValuesByType(@Param('typeId') typeId: string) {
    return this.attributesService.getAttributeValuesByType(typeId);
  }

  @Get('values/:id')
  @HttpCode(HttpStatus.OK)
  async getAttributeValueById(@Param('id') id: string) {
    return this.attributesService.getAttributeValueById(id);
  }

  @Post('values')
  @Roles('admin')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createAttributeValue(@Body() createDto: CreateAttributeValueDto) {
    return this.attributesService.createAttributeValue(createDto);
  }

  @Put('values/:id')
  @Roles('admin')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateAttributeValue(
    @Param('id') id: string,
    @Body() updateDto: UpdateAttributeValueDto,
  ) {
    return this.attributesService.updateAttributeValue(id, updateDto);
  }

  @Delete('values/:id')
  @Roles('admin')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAttributeValue(@Param('id') id: string) {
    return this.attributesService.deleteAttributeValue(id);
  }
}
