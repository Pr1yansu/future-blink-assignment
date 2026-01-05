import express from 'express';
import { login, register } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = express.Router();

const authSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    password: z.string().min(6),
  }),
});

router.post('/register', validate(authSchema), register);
router.post('/login', validate(authSchema), login);

export default router;
