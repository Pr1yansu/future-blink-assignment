import { Request, Response, NextFunction } from 'express';
import { Flow } from '../models/Flow';
import { sendResponse } from '../utils/apiResponse';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';

export const getFlows = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query = {};
    // If not admin, only show own flows
    if (req.user?.role !== 'admin') {
      query = { userId: req.user?.id };
    }
    
    const flows = await Flow.find(query).sort({ createdAt: -1 }).limit(20).populate('userId', 'username');
    sendResponse(res, StatusCodes.OK, 'Flows retrieved successfully', flows);
  } catch (error) {
    next(new AppError('Failed to fetch flows', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const saveFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, response } = req.body;
    const newFlow = new Flow({ 
      userId: req.user?.id,
      prompt, 
      response 
    });
    await newFlow.save();
    sendResponse(res, StatusCodes.CREATED, 'Flow saved successfully', newFlow);
  } catch (error) {
    next(new AppError('Failed to save flow', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const deleteFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const flow = await Flow.findById(id);

    if (!flow) {
      return next(new AppError('Flow not found', StatusCodes.NOT_FOUND));
    }

    // Check permissions: Admin or Owner
    if (req.user?.role !== 'admin' && flow.userId.toString() !== req.user?.id) {
      return next(new AppError('You do not have permission to delete this flow', StatusCodes.FORBIDDEN));
    }

    await Flow.findByIdAndDelete(id);
    sendResponse(res, StatusCodes.OK, 'Flow deleted successfully', null);
  } catch (error) {
    next(new AppError('Failed to delete flow', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};
