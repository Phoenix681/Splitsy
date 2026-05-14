import { Router } from 'express';
import {
  createExpense,
  getGroupExpenses,
  getExpenseById,
  deleteExpense,
} from '../controllers/expenseController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All expense routes require authentication
router.use(authMiddleware);

// Group expenses
router.post('/groups/:groupId/expenses', createExpense);      // Create expense
router.get('/groups/:groupId/expenses', getGroupExpenses);    // List group expenses
router.delete('/groups/:groupId/expenses/:expenseId', deleteExpense); // Delete expense

// Individual expense operations
router.get('/expenses/:expenseId', getExpenseById);           // Get expense details
router.delete('/expenses/:expenseId', deleteExpense);         // Delete expense

export default router;