import { z } from 'zod';

export const askAiSchema = z.object({
  body: z.object({
    prompt: z.string({
      required_error: 'Prompt is required',
    }).min(1, 'Prompt cannot be empty'),
  }),
});

export const saveFlowSchema = z.object({
  body: z.object({
    prompt: z.string({
      required_error: 'Prompt is required',
    }).min(1, 'Prompt cannot be empty'),
    response: z.string({
      required_error: 'Response is required',
    }).min(1, 'Response cannot be empty'),
  }),
});
