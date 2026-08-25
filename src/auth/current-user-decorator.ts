import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserPayload } from './jwt.strategy'

export interface AuthenticatedRequest extends Request {
  user: UserPayload
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    return request.user
  },
)
