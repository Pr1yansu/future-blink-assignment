import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../models/User';

interface JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in', StatusCodes.UNAUTHORIZED));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists', StatusCodes.UNAUTHORIZED));
    }

    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    next();
  } catch (error) {
    return next(new AppError('Invalid token', StatusCodes.UNAUTHORIZED));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', StatusCodes.FORBIDDEN));
    }
    next();
  };
};
