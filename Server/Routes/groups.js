import express from 'express';
import { createGroup, getGroups, updateGroup, deleteGroup } from '../Controllers/groupController.js';

const router = express.Router();

router.post('/', createGroup);
router.get('/', getGroups);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

export default router; 