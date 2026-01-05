import express from 'express';
import { askAi } from '../controllers/aiController';
import { getFlows, saveFlow, deleteFlow } from '../controllers/flowController';
import { validate } from '../middleware/validate';
import { askAiSchema, saveFlowSchema } from '../validations/flowValidation';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/ask-ai', validate(askAiSchema), askAi);
router.get('/flows', protect, getFlows);
router.post('/save-flow', protect, validate(saveFlowSchema), saveFlow);
router.delete('/flows/:id', protect, deleteFlow);

export default router;

