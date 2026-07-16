import type { NextFunction, Request, Response } from "express";
import { z, type ZodType } from "zod";
import { AppError } from "../errors/app-error.js";

export function validate(schema: ZodType) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    if (!result.success) {
      next(
        new AppError(
          "Dados da requisição inválidos.",
          400,
          "VALIDATION_ERROR",
          z.flattenError(result.error),
        ),
      );
      return;
    }

    const data = result.data as {
      body?: Request["body"];
      params?: Request["params"];
    };

    if (data.body !== undefined) request.body = data.body;
    if (data.params !== undefined) request.params = data.params;
    next();
  };
}
