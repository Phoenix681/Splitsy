import React from 'react';
import type { Expense } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Banknote } from 'lucide-react';

interface ExpensesListProps {
  expenses: Expense[];
}

export const ExpensesList: React.FC<ExpensesListProps> = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const amount = typeof expense.amount === 'string'
          ? parseFloat(expense.amount)
          : expense.amount;

        return (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Banknote className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{expense.description}</p>
                <p className="text-xs text-muted-foreground">
                  Paid by {expense.payer?.name || 'Unknown'}
                  {expense.splits && expense.splits.length > 0 && (
                    <> • Split among {expense.splits.length} people</>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(expense.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-lg font-bold text-gray-900">₹{amount.toFixed(2)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
