import { PipeTransform, BadRequestException } from '@nestjs/common'
import { ZodError, ZodType } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value)
      return parsedValue
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))

        throw new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          errors,
        })
      }
      throw new BadRequestException('Validation failed')
    }
  }
}
