import express from 'express';
import { createGroup, getGroups, updateGroup, deleteGroup, joinGroup, getGroupById, regenerateInviteLink } from '../Controllers/groupController.js';

const router = express.Router();

router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:groupId', getGroupById);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.post('/join/:groupId', joinGroup);
router.post('/:groupId/regenerate-invite', regenerateInviteLink);

export default router; 