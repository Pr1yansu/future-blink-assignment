import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import { AppError } from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const askAi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, model } = req.body;

    const stream = await openai.chat.completions.create({
      model: model || "google/gemini-2.0-flash-exp:free",
      messages: [
        { role: "user", content: prompt }
      ],
      stream: true,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      let content = chunk.choices[0]?.delta?.content || '';
      
      // Filter out special tokens that might leak from some models
      content = content.replace(/<s>/g, '').replace(/<\/s>/g, '');
      
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('OpenRouter API Error:', error);
    // If headers are already sent, we can't send a JSON error
    if (!res.headersSent) {
      if (error.status === 429) {
        return next(new AppError('Rate limit exceeded. Please try a different model or wait.', StatusCodes.TOO_MANY_REQUESTS));
      }
      next(new AppError('Failed to fetch AI response', StatusCodes.BAD_GATEWAY));
    } else {
      res.end();
    }
  }
};
