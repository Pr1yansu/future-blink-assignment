import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T | null = null
) => {
  res.status(statusCode).json({
    status: statusCode >= 200 && statusCode < 300 ? 'success' : 'fail',
    message,
    data,
  });
};
