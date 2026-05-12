// Balance for a single user
export interface UserBalance {
  user_id: string;
  user_name: string;
  net_balance: number; // Positive = owed to them, Negative = they owe
}

// Settlement suggestion (who should pay whom)
export interface SettlementSuggestion {
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  amount: number;
}

// Transaction record for algorithm
interface Transaction {
  paid_by: string;
  amount: number;
  splits: Array<{ user_id: string; amount: number }>;
}

/**
 * Calculate net balance for each user in a group
 * 
 * Algorithm:
 * 1. For each expense, payer gets +amount
 * 2. For each split, user gets -amount
 * 3. Net balance = sum of all credits - sum of all debits
 * 
 * Example:
 * - Alice paid ₹300, owes ₹100 → net: +₹200 (others owe her)
 * - Bob paid ₹0, owes ₹100 → net: -₹100 (he owes others)
 */
export const calculateNetBalances = (
  transactions: Transaction[],
  userNames: Map<string, string>
): UserBalance[] => {
  const balances = new Map<string, number>();

  // Initialize all users with 0 balance
  userNames.forEach((name, userId) => {
    balances.set(userId, 0);
  });

  // Process each transaction
  transactions.forEach((transaction) => {
    // Payer gets positive balance (they spent money)
    const currentPayerBalance = balances.get(transaction.paid_by) || 0;
    balances.set(
      transaction.paid_by,
      currentPayerBalance + transaction.amount
    );

    // Each person in split gets negative balance (they owe)
    transaction.splits.forEach((split) => {
      const currentBalance = balances.get(split.user_id) || 0;
      balances.set(split.user_id, currentBalance - split.amount);
    });
  });

  // Convert to array and round to 2 decimals
  const result: UserBalance[] = [];
  balances.forEach((balance, userId) => {
    const roundedBalance = Math.round(balance * 100) / 100;
    result.push({
      user_id: userId,
      user_name: userNames.get(userId) || 'Unknown',
      net_balance: roundedBalance,
    });
  });

  return result.sort((a, b) => b.net_balance - a.net_balance);
};

/**
 * Simplify debts to minimum number of transactions
 * 
 * Algorithm (Greedy Approach):
 * 1. Separate users into creditors (positive balance) and debtors (negative balance)
 * 2. Sort creditors descending, debtors ascending
 * 3. Match largest creditor with largest debtor
 * 4. Settle the minimum of their absolute balances
 * 5. Repeat until all settled
 * 
 * Time Complexity: O(n log n) for sorting
 * Space Complexity: O(n)
 * 
 * Example:
 * Alice: +₹200
 * Bob: -₹100
 * Charlie: -₹100
 * 
 * Result:
 * Bob pays Alice ₹100
 * Charlie pays Alice ₹100
 * (2 transactions instead of potentially more complex chains)
 */
export const simplifyDebts = (
  balances: UserBalance[]
): SettlementSuggestion[] => {
  // Separate creditors and debtors
  const creditors = balances
    .filter((b) => b.net_balance > 0.01) // Ignore tiny balances
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net_balance - a.net_balance); // Largest first

  const debtors = balances
    .filter((b) => b.net_balance < -0.01) // Ignore tiny balances
    .map((b) => ({ ...b, net_balance: -b.net_balance })) // Make positive for easier math
    .sort((a, b) => b.net_balance - a.net_balance); // Largest debt first

  const settlements: SettlementSuggestion[] = [];

  let i = 0; // Creditor index
  let j = 0; // Debtor index

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    if (!creditor || !debtor) break;

    // Settle the minimum of what's owed and what's due
    const settleAmount = Math.min(creditor.net_balance, debtor.net_balance);
    const roundedAmount = Math.round(settleAmount * 100) / 100;

    if (roundedAmount > 0.01) {
      settlements.push({
        from_user_id: debtor.user_id,
        from_user_name: debtor.user_name,
        to_user_id: creditor.user_id,
        to_user_name: creditor.user_name,
        amount: roundedAmount,
      });
    }

    // Update balances
    creditor.net_balance -= settleAmount;
    debtor.net_balance -= settleAmount;

    // Move to next if fully settled
    if (creditor.net_balance < 0.01) i++;
    if (debtor.net_balance < 0.01) j++;
  }

  return settlements;
};

/**
 * Calculate what each user has paid vs what they owe
 * Useful for detailed breakdowns
 */
export interface UserExpenseBreakdown {
  user_id: string;
  user_name: string;
  total_paid: number;
  total_owed: number;
  net_balance: number;
}

export const calculateExpenseBreakdown = (
  transactions: Transaction[],
  userNames: Map<string, string>
): UserExpenseBreakdown[] => {
  const breakdown = new Map<string, { paid: number; owed: number }>();

  // Initialize all users
  userNames.forEach((name, userId) => {
    breakdown.set(userId, { paid: 0, owed: 0 });
  });

  // Calculate totals
  transactions.forEach((transaction) => {
    // Add to payer's total_paid
    const payerData = breakdown.get(transaction.paid_by);
    if (payerData) {
      payerData.paid += transaction.amount;
    }

    // Add to each person's total_owed
    transaction.splits.forEach((split) => {
      const userData = breakdown.get(split.user_id);
      if (userData) {
        userData.owed += split.amount;
      }
    });
  });

  // Convert to array
  const result: UserExpenseBreakdown[] = [];
  breakdown.forEach((data, userId) => {
    const net = data.paid - data.owed;
    result.push({
      user_id: userId,
      user_name: userNames.get(userId) || 'Unknown',
      total_paid: Math.round(data.paid * 100) / 100,
      total_owed: Math.round(data.owed * 100) / 100,
      net_balance: Math.round(net * 100) / 100,
    });
  });

  return result.sort((a, b) => b.net_balance - a.net_balance);
};

/**
 * Validate that all balances sum to zero
 * (Total paid = Total owed across all users)
 * This is a sanity check for data integrity
 */
export const validateBalancesSum = (balances: UserBalance[]): boolean => {
  const sum = balances.reduce((acc, b) => acc + b.net_balance, 0);
  const roundedSum = Math.round(sum * 100) / 100;
  return Math.abs(roundedSum) < 0.01; // Allow tiny floating point errors
};