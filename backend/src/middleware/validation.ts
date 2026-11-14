import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

export function validate(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.');
          if (!errors[path]) errors[path] = [];
          errors[path].push(issue.message);
        }
        throw ApiError.badRequest('Validation failed', errors);
      }
      throw error;
    }
  };
}

export function validateBody(schema: AnyZodObject) {
  return validate(schema);
}

export function validateQuery(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.');
          if (!errors[path]) errors[path] = [];
          errors[path].push(issue.message);
        }
        throw ApiError.badRequest('Invalid query parameters', errors);
      }
      throw error;
    }
  };
}

export function validateParams(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.');
          if (!errors[path]) errors[path] = [];
          errors[path].push(issue.message);
        }
        throw ApiError.badRequest('Invalid route parameters', errors);
      }
      throw error;
    }
  };
}