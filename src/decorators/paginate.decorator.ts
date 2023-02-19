import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Paginate = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const page = parseInt(request.query.page) || 1,
    pageSize = parseInt(request.query.pageSize) || 10,
    skip = (page - 1) * pageSize,
    take = pageSize;

  return {
    page,
    pageSize,
    skip,
    take,
  };
});
