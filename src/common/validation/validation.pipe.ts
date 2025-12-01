import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value, metadata: ArgumentMetadata) {
    if (!metadata.type || metadata.type === 'custom' || !metadata.metatype) {
      return value;
    }

    if (this.isPrimitive(metadata.metatype)) {
      return value;
    }

    if (metadata.type === 'param' && typeof value === 'string') {
      return value;
    }

    const object = plainToInstance(metadata.metatype, value);

    if (!object) {
      return value;
    }

    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => ({
        field: error.property,
        constraints: error.constraints,
      }));
      throw new BadRequestException({
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    return value;
  }

  private isPrimitive(metatype: Function): boolean {
    const primitives = [String, Boolean, Number, Array, Object];
    return primitives.includes(metatype as any);
  }
}
