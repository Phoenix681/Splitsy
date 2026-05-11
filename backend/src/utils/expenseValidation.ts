import type { SplitDetail } from '../types/index.js';

/**
 * Validate expense amount
 * Must be positive and reasonable
 */
export const validateExpenseAmount = (
  amount: number
): { isValid: boolean; error?: string } => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  if (amount > 10000000) {
    return { isValid: false, error: 'Amount exceeds maximum limit (10,000,000)' };
  }

  // Check for reasonable decimal places (max 2)
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, error: 'Amount can have maximum 2 decimal places' };
  }

  return { isValid: true };
};

/**
 * Validate that splits sum to total amount
 * Allows small floating point differences (< 0.01)
 */
export const validateSplitsSum = (
  totalAmount: number,
  splits: SplitDetail[]
): { isValid: boolean; error?: string } => {
  if (!splits || splits.length === 0) {
    return { isValid: false, error: 'At least one split is required' };
  }

  // Calculate sum of all splits
  const splitsSum = splits.reduce((sum, split) => sum + split.amount, 0);

  // Round to 2 decimal places for comparison
  const roundedTotal = Math.round(totalAmount * 100) / 100;
  const roundedSum = Math.round(splitsSum * 100) / 100;

  // Allow tiny floating point differences (< 0.01)
  const difference = Math.abs(roundedTotal - roundedSum);

  if (difference > 0.01) {
    return {
      isValid: false,
      error: `Splits sum (${roundedSum}) does not match total amount (${roundedTotal})`,
    };
  }

  return { isValid: true };
};

/**
 * Validate individual split amounts
 */
export const validateSplitAmounts = (
  splits: SplitDetail[]
): { isValid: boolean; error?: string } => {
  for (const split of splits) {
    if (typeof split.amount !== 'number' || isNaN(split.amount)) {
      return { isValid: false, error: 'All split amounts must be valid numbers' };
    }

    if (split.amount < 0) {
      return { isValid: false, error: 'Split amounts cannot be negative' };
    }

    // Check decimal places
    const decimalPlaces = (split.amount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return {
        isValid: false,
        error: 'Split amounts can have maximum 2 decimal places',
      };
    }
  }

  return { isValid: true };
};

/**
 * Calculate equal splits for given amount and number of people
 * Returns array with amounts rounded to 2 decimals
 * Handles rounding by giving the difference to the first person
 */
export const calculateEqualSplits = (
  totalAmount: number,
  userIds: string[]
): SplitDetail[] => {
  if (!userIds || userIds.length === 0) {
    return [];
  }

  const numberOfPeople = userIds.length;
  const amountPerPerson = totalAmount / numberOfPeople;

  // Round to 2 decimal places
  const roundedAmount = Math.round(amountPerPerson * 100) / 100;

  // Create splits
  const splits: SplitDetail[] = userIds.map((userId) => ({
    user_id: userId,
    amount: roundedAmount,
  }));

  // Calculate rounding difference
  const totalSplit = roundedAmount * numberOfPeople;
  const difference = Math.round((totalAmount - totalSplit) * 100) / 100;

  // Add difference to first person's split
  if (difference !== 0) {
    splits[0]!.amount = Math.round((splits[0]!.amount + difference) * 100) / 100;
  }

  return splits;
};

/**
 * Validate expense description
 */
export const validateExpenseDescription = (
  description: string
): { isValid: boolean; error?: string } => {
  if (!description || description.trim().length === 0) {
    return { isValid: false, error: 'Description is required' };
  }

  if (description.length > 200) {
    return {
      isValid: false,
      error: 'Description must be less than 200 characters',
    };
  }

  return { isValid: true };
};