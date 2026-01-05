import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from '../utils/apiResponse';

const signToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '90d',
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return next(new AppError('Username already exists', StatusCodes.BAD_REQUEST));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: role || 'user',
    });

    const token = signToken(newUser._id.toString(), newUser.role);

    sendResponse(res, StatusCodes.CREATED, 'User registered successfully', {
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError('Please provide username and password', StatusCodes.BAD_REQUEST));
    }

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Incorrect username or password', StatusCodes.UNAUTHORIZED));
    }

    const token = signToken(user._id.toString(), user.role);

    sendResponse(res, StatusCodes.OK, 'Login successful', {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
