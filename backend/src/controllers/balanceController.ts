import type { Response } from 'express';
import { prisma } from '../server.js';
import type { AuthRequest } from '../types/index.js';
import {
  calculateNetBalances,
  simplifyDebts,
  calculateExpenseBreakdown,
  validateBalancesSum,
} from '../utils/balanceCalculation.js';

/**
 * Get balances and settlement suggestions for a group
 * GET /api/groups/:groupId/balances
 * Requires: Authentication + User must be member of group
 * 
 * Returns:
 * - Individual balances for each member
 * - Simplified settlement suggestions (who should pay whom)
 * - Expense breakdown (total paid vs total owed per user)
 */
export const getGroupBalances = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const groupId = Array.isArray(req.params.groupId)
      ? req.params.groupId[0]
      : req.params.groupId;

    if (!userId || !groupId) {
      res.status(400).json({ error: 'User ID and Group ID are required' });
      return;
    }

    // === STEP 1: Authorization ===
    // Check if user is a member of this group
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

    // === STEP 2: Fetch All Group Data ===
    // Get all group members
    const members = await prisma.groupMember.findMany({
      where: { group_id: groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create user name map
    const userNames = new Map<string, string>();
    members.forEach((member: any) => {
      userNames.set(member.user.id, member.user.name);
    });

    // Get all expenses for this group
    const expenses = await prisma.expense.findMany({
      where: { group_id: groupId },
      include: {
        splits: true,
      },
    });

    // === STEP 3: Transform Data for Algorithm ===
    const transactions = expenses.map((expense: any) => ({
      paid_by: expense.paid_by,
      amount: parseFloat(expense.amount.toString()),
      splits: expense.splits.map((split: any) => ({
        user_id: split.user_id,
        amount: parseFloat(split.amount.toString()),
      })),
    }));

    // === STEP 4: Calculate Balances ===
    const netBalances = calculateNetBalances(transactions, userNames);

    // === STEP 5: Simplify Debts ===
    const settlements = simplifyDebts(netBalances);

    // === STEP 6: Get Detailed Breakdown ===
    const expenseBreakdown = calculateExpenseBreakdown(transactions, userNames);

    // === STEP 7: Validate (Sanity Check) ===
    const isValid = validateBalancesSum(netBalances);

    if (!isValid) {
      console.error('Balance validation failed! Sum of balances is not zero');
      res.status(500).json({
        error: 'Balance calculation error - data integrity issue',
      });
      return;
    }

    // === STEP 8: Return Response ===
    res.status(200).json({
      group_id: groupId,
      balances: netBalances,
      settlements: settlements,
      expense_breakdown: expenseBreakdown,
      summary: {
        total_expenses: expenses.length,
        total_amount: expenses.reduce(
          (sum: number, exp: any) => sum + parseFloat(exp.amount.toString()),
          0
        ),
        settlements_needed: settlements.length,
      },
    });
  } catch (error) {
    console.error('Get group balances error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Record a settlement (user paid their debt)
 * POST /api/groups/:groupId/settlements
 * Body: { from_user_id, to_user_id, amount }
 * Requires: Authentication + User must be member of group
 * 
 * Note: This doesn't modify expenses, just records that a debt was settled
 */
export const recordSettlement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const groupId = Array.isArray(req.params.groupId)
      ? req.params.groupId[0]
      : req.params.groupId;
    const { from_user_id, to_user_id, amount } = req.body;

    if (!userId || !groupId) {
      res.status(400).json({ error: 'User ID and Group ID are required' });
      return;
    }

    // === STEP 1: Validation ===
    if (!from_user_id || !to_user_id || !amount) {
      res.status(400).json({
        error: 'from_user_id, to_user_id, and amount are required',
      });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({ error: 'Amount must be greater than 0' });
      return;
    }

    if (from_user_id === to_user_id) {
      res.status(400).json({ error: 'Cannot settle with yourself' });
      return;
    }

    // === STEP 2: Authorization ===
    // Check if current user is a member
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

    // Check if from_user is a member
    const fromUserMembership = await prisma.groupMember.findFirst({
      where: {
        user_id: from_user_id,
        group_id: groupId,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    }) as any;

    if (!fromUserMembership) {
      res.status(400).json({
        error: 'from_user must be a member of this group',
      });
      return;
    }

    // Check if to_user is a member
    const toUserMembership = await prisma.groupMember.findFirst({
      where: {
        user_id: to_user_id,
        group_id: groupId,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    }) as any;

    if (!toUserMembership) {
      res.status(400).json({ error: 'to_user must be a member of this group' });
      return;
    }

    // === STEP 3: Record Settlement ===
    const settlement = await prisma.settlement.create({
      data: {
        group_id: groupId,
        from_user: from_user_id,
        to_user: to_user_id,
        amount: parseFloat(amount.toString()),
      },
    });

    res.status(201).json({
      message: 'Settlement recorded successfully',
      settlement: {
        id: settlement.id,
        from: {
          id: from_user_id,
          name: fromUserMembership.user.name,
        },
        to: {
          id: to_user_id,
          name: toUserMembership.user.name,
        },
        amount: settlement.amount.toString(),
        settled_at: settlement.settled_at,
      },
    });
  } catch (error) {
    console.error('Record settlement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get settlement history for a group
 * GET /api/groups/:groupId/settlements
 * Requires: Authentication + User must be member of group
 */
export const getSettlementHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const groupId = Array.isArray(req.params.groupId)
      ? req.params.groupId[0]
      : req.params.groupId;

    if (!userId || !groupId) {
      res.status(400).json({ error: 'User ID and Group ID are required' });
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

    // Get all settlements
    const settlements = await prisma.settlement.findMany({
      where: { group_id: groupId },
      include: {
        from: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        to: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        settled_at: 'desc',
      },
    });

    // Transform response
    const transformedSettlements = settlements.map((settlement: any) => ({
      id: settlement.id,
      from: settlement.from,
      to: settlement.to,
      amount: settlement.amount.toString(),
      settled_at: settlement.settled_at,
    }));

    res.status(200).json({
      settlements: transformedSettlements,
      count: transformedSettlements.length,
    });
  } catch (error) {
    console.error('Get settlement history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};