import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

// validateRequest.ts
export function validateRequest<T extends object>(dtoClass: new () => T) {
    return async (req: Request, res: Response, next: NextFunction) => {
      // 将 req.body 转换为 DTO 实例
      const dto = plainToInstance(dtoClass, req.body);
  
      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.map(e => ({
            property: e.property,
            constraints: e.constraints,
          })),
        });
      }
  
      // 挂载到 req 上，方便 controller 使用
      (req as any).validatedBody = dto;
      next();
    };
  }
  