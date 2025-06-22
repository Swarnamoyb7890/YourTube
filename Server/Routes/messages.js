import express from 'express';
import { sendMessage, getMessages, updateMessage, deleteMessage } from '../Controllers/messageController.js';

const router = express.Router();

router.post('/', sendMessage);
router.get('/:groupId', getMessages);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);

export default router; 