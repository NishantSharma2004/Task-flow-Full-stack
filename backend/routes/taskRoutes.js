import express from 'express';
import { getTasks, getTask, addTask, editTask, removeTask, markComplete, getTaskAnalytics } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/', getTasks);
router.get('/analytics', getTaskAnalytics);
router.get('/:id', getTask);
router.post('/', addTask);
router.put('/:id', editTask);
router.delete('/:id', removeTask);
router.patch('/:id/complete', markComplete);

export default router;
