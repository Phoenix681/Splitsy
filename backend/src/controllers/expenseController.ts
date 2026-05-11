import type { Response } from 'express';
import { prisma } from '../server.js';
import type { AuthRequest, CreateExpenseBody, SplitDetail } from '../types/index.js';
import {
  validateExpenseAmount,
  validateExpenseDescription,
  validateSplitAmounts,
  validateSplitsSum,
  calculateEqualSplits,
} from '../utils/expenseValidation.js';

/**
 * Create a new expense with splits
 * POST /api/groups/:groupId/expenses
 * Body: { description, amount, paid_by, split_type, splits?, split_among? }
 * Requires: Authentication + User must be member of group
 * 
 * CRITICAL: Uses PostgreSQL transaction for atomicity
 */
export const createExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId as string;
    const groupId = req.params.groupId as string;
    const {
      description,
      amount,
      paid_by,
      split_type,
      splits: customSplits,
      split_among,
    } = req.body as CreateExpenseBody;

    // === STEP 1: Basic Validation ===
    if (!description || !amount || !paid_by || !split_type) {
      res.status(400).json({
        error: 'Description, amount, paid_by, and split_type are required',
      });
      return;
    }

    // Validate description
    const descValidation = validateExpenseDescription(description);
    if (!descValidation.isValid) {
      res.status(400).json({ error: descValidation.error });
      return;
    }

    // Validate amount
    const amountValidation = validateExpenseAmount(amount);
    if (!amountValidation.isValid) {
      res.status(400).json({ error: amountValidation.error });
      return;
    }

    // Validate split_type
    if (split_type !== 'equal' && split_type !== 'custom') {
      res.status(400).json({ error: 'split_type must be "equal" or "custom"' });
      return;
    }

    // === STEP 2: Check Authorization ===
    // Verify current user is a member of the group
    const currentUserMembership = await prisma.groupMember.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
      },
    });

    if (!currentUserMembership) {
      res.status(403).json({ error: 'You are not a member of this group' });
      return;
    }

    // Verify payer is a member of the group
    const payerMembership = await prisma.groupMember.findFirst({
      where: {
        user_id: paid_by,
        group_id: groupId,
      },
    });

    if (!payerMembership) {
      res.status(400).json({ error: 'Payer must be a member of the group' });
      return;
    }

    // === STEP 3: Process Splits ===
    let finalSplits: SplitDetail[] = [];

    if (split_type === 'equal') {
      // Equal split
      if (!split_among || split_among.length === 0) {
        res.status(400).json({
          error: 'split_among is required for equal split',
        });
        return;
      }

      // Verify all users in split_among are group members
      const membersToSplit = await prisma.groupMember.findMany({
        where: {
          group_id: groupId,
          user_id: { in: split_among },
        },
      });

      if (membersToSplit.length !== split_among.length) {
        res.status(400).json({
          error: 'All users in split_among must be members of the group',
        });
        return;
      }

      // Calculate equal splits
      finalSplits = calculateEqualSplits(amount, split_among);
    } else {
      // Custom split
      if (!customSplits || customSplits.length === 0) {
        res.status(400).json({
          error: 'splits array is required for custom split',
        });
        return;
      }

      // Validate split amounts
      const splitAmountsValidation = validateSplitAmounts(customSplits);
      if (!splitAmountsValidation.isValid) {
        res.status(400).json({ error: splitAmountsValidation.error });
        return;
      }

      // Validate splits sum to total
      const splitsSumValidation = validateSplitsSum(amount, customSplits);
      if (!splitsSumValidation.isValid) {
        res.status(400).json({ error: splitsSumValidation.error });
        return;
      }

      // Verify all users in splits are group members
      const userIdsInSplits = customSplits.map((s: SplitDetail) => s.user_id);
      const membersInSplits = await prisma.groupMember.findMany({
        where: {
          group_id: groupId,
          user_id: { in: userIdsInSplits },
        },
      });

      if (membersInSplits.length !== userIdsInSplits.length) {
        res.status(400).json({
          error: 'All users in splits must be members of the group',
        });
        return;
      }

      finalSplits = customSplits;
    }

    // === STEP 4: Create Expense + Splits in Transaction ===
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the expense
      const expense = await tx.expense.create({
        data: {
          group_id: groupId,
          paid_by: paid_by,
          amount: amount,
          description: description.trim(),
        },
      });

      // Create all splits
      const splitRecords = await Promise.all(
        finalSplits.map((split: SplitDetail) =>
          tx.expenseSplit.create({
            data: {
              expense_id: expense.id,
              user_id: split.user_id,
              amount: split.amount,
            },
          })
        )
      );

      return { expense, splits: splitRecords };
    });

    // === STEP 5: Return Response ===
    res.status(201).json({
      message: 'Expense created successfully',
      expense: {
        id: result.expense.id,
        description: result.expense.description,
        amount: result.expense.amount,
        paid_by: result.expense.paid_by,
        created_at: result.expense.created_at,
        splits: result.splits.map((split: any) => ({
          user_id: split.user_id,
          amount: split.amount,
        })),
      },
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all expenses for a group
 * GET /api/groups/:groupId/expenses
 * Query params: page (default 1), limit (default 20)
 * Requires: Authentication + User must be member of group
 */
export const getGroupExpenses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId as string;
    const groupId = req.params.groupId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({ error: 'Invalid pagination parameters' });
      return;
    }

    // Check if user is a member
    const membership = await prisma.groupMember.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this group' });
      return;
    }

    // Get total count
    const totalCount = await prisma.expense.count({
      where: { group_id: groupId },
    });

    // Get expenses with pagination
    const expenses = await prisma.expense.findMany({
      where: { group_id: groupId },
      include: {
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform response
    const transformedExpenses = expenses.map((expense: any) => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount.toString(),
      created_at: expense.created_at,
      payer: {
        id: expense.payer.id,
        name: expense.payer.name,
      },
      splits: expense.splits.map((split: any) => ({
        user_id: split.user_id,
        user_name: split.user.name,
        amount: split.amount,
      })),
    }));

    res.status(200).json({
      expenses: transformedExpenses,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get group expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get single expense details
 * GET /api/expenses/:expenseId
 * Requires: Authentication + User must be member of expense's group
 */
export const getExpenseById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId as string;
    const expenseId = req.params.expenseId as string;

    // Get expense with group info
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        group: true,
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        user_id: userId,
        group_id: expense.group_id,
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this group' });
      return;
    }

    res.status(200).json({
      expense: {
        id: expense.id,
        description: expense.description,
        amount: expense.amount.toString(),
        created_at: expense.created_at,
        group: {
          id: expense.group.id,
          name: expense.group.name,
        },
        payer: expense.payer,
        splits: expense.splits.map((split: any) => ({
          user: split.user,
          amount: split.amount.toString(),
        })),
      },
    });
  } catch (error) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete an expense
 * DELETE /api/expenses/:expenseId
 * Requires: Authentication + User must be member of group
 * Note: CASCADE deletes all splits
 */
export const deleteExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId as string;
    const expenseId = req.params.expenseId as string;

    // Get expense to check group membership
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      select: { group_id: true },
    });

    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        user_id: userId,
        group_id: expense.group_id,
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this group' });
      return;
    }

    // Delete expense (CASCADE will delete splits)
    await prisma.expense.delete({
      where: { id: expenseId },
    });

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};