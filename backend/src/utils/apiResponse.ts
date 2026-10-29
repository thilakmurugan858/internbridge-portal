import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
  errors?: any;
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
  meta?: ApiResponseData<T>['meta']
): Response => {
  const payload: ApiResponseData<T> = {
    success: true,
  };
  if (message) payload.message = message;
  if (data !== undefined) payload.data = data;
  if (meta) payload.meta = meta;

  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  message = 'An unexpected error occurred',
  statusCode = 500,
  errors?: any
): Response => {
  const payload: ApiResponseData = {
    success: false,
    message,
  };
  if (errors) payload.errors = errors;

  return res.status(statusCode).json(payload);
};
