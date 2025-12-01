import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { supabase } from '../config/supabase';
import { supabaseAdmin } from '../config/supabase-admin';
import {
  CreateAttributeTypeDto,
  UpdateAttributeTypeDto,
} from './dtos/attribute-type.dto';
import {
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
} from './dtos/attribute-value.dto';

@Injectable()
export class AttributesService {
  async getAllAttributeTypes() {
    const { data, error } = await supabase
      .from('attribute_types')
      .select('*')
      .order('name');

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async getAttributeTypeById(id: string) {
    const { data, error } = await supabase
      .from('attribute_types')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException('Attribute type not found');
    }

    return data;
  }

  async createAttributeType(createDto: CreateAttributeTypeDto) {
    const { data, error } = await supabaseAdmin
      .from('attribute_types')
      .insert([
        {
          name: createDto.name,
          display_name: createDto.displayName,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async updateAttributeType(id: string, updateDto: UpdateAttributeTypeDto) {
    await this.getAttributeTypeById(id);

    const { data, error } = await supabaseAdmin
      .from('attribute_types')
      .update({
        display_name: updateDto.displayName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async deleteAttributeType(id: string) {
    await this.getAttributeTypeById(id);

    const { error } = await supabaseAdmin
      .from('attribute_types')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: 'Attribute type deleted successfully', id };
  }

  async getAttributeValuesByType(typeId: string) {
    const { data, error } = await supabase
      .from('attribute_values')
      .select('*')
      .eq('attribute_type_id', typeId)
      .order('value');

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async getAttributeValueById(id: string) {
    const { data, error } = await supabase
      .from('attribute_values')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException('Attribute value not found');
    }

    return data;
  }

  async createAttributeValue(createDto: CreateAttributeValueDto) {
    const { data, error } = await supabaseAdmin
      .from('attribute_values')
      .insert([
        {
          attribute_type_id: createDto.attributeTypeId,
          value: createDto.value,
          display_value: createDto.displayValue,
          metadata: createDto.metadata || {},
        },
      ])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async updateAttributeValue(id: string, updateDto: UpdateAttributeValueDto) {
    await this.getAttributeValueById(id);

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updateDto.displayValue !== undefined) {
      updateData.display_value = updateDto.displayValue;
    }

    if (updateDto.metadata !== undefined) {
      updateData.metadata = updateDto.metadata;
    }

    const { data, error } = await supabaseAdmin
      .from('attribute_values')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async deleteAttributeValue(id: string) {
    await this.getAttributeValueById(id);

    const { error } = await supabaseAdmin
      .from('attribute_values')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: 'Attribute value deleted successfully', id };
  }
}
