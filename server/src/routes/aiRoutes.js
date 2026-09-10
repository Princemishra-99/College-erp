import express from 'express';
import { chatCampusAssistant, translateNotice, summarizeNotice } from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/chat', chatCampusAssistant);
router.post('/translate', protect, translateNotice);
router.post('/summarize', protect, summarizeNotice);

export default router;
