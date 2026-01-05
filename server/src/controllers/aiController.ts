import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import { AppError } from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const FALLBACK_MODELS = [
  "google/gemini-3-flash",
  "google/gemini-3-pro",
  "google/gemini-2.5-flash"
];

export const askAi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, model } = req.body;
    
    // Create a list of models to try: requested model first, then fallbacks (excluding the requested one)
    const requestedModel = model || "google/gemini-3-flash";
    const modelsToTry = [
      requestedModel,
      ...FALLBACK_MODELS.filter(m => m !== requestedModel)
    ];

    let stream;
    let lastError;
    let usedModel;

    for (const currentModel of modelsToTry) {
      try {
        console.log(`Attempting to use model: ${currentModel}`);
        stream = await openai.chat.completions.create({
          model: currentModel,
          messages: [
            { role: "user", content: prompt }
          ],
          stream: true,
        });
        usedModel = currentModel;
        break; // If successful, exit the loop
      } catch (error) {
        console.warn(`Model ${currentModel} failed:`, error);
        lastError = error;
        // Continue to next model
      }
    }

    if (!stream) {
      throw lastError || new Error('All models failed to respond');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send the model name as a custom event or just log it? 
    // For now, we just stream the content. 
    // Ideally, we should inform the client which model was actually used, 
    // but the current frontend might not expect that in the stream.

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
