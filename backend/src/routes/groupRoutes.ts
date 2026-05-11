import { Router } from 'express';
import {
  createGroup,
  getUserGroups,
  getGroupById,
  addMemberToGroup,
  removeMemberFromGroup,
  deleteGroup,
} from '../controllers/groupController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All group routes require authentication
router.use(authMiddleware);

// Group CRUD
router.post('/', createGroup);           // Create group
router.get('/', getUserGroups);          // List user's groups
router.get('/:groupId', getGroupById);   // Get group details
router.delete('/:groupId', deleteGroup); // Delete group

// Member management
router.post('/:groupId/members', addMemberToGroup);              // Add member
router.delete('/:groupId/members/:memberId', removeMemberFromGroup); // Remove member

export default router;