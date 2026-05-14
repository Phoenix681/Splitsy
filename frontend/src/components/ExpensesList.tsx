import React, { useState } from 'react';
import type { Expense } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Banknote, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { DeleteExpenseModal } from './DeleteExpenseModal';

interface ExpensesListProps {
  expenses: Expense[];
  groupId: string;
  onExpenseDeleted?: () => void;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({ expenses, groupId, onExpenseDeleted }) => {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    expenseId?: string;
    description?: string;
  }>({ isOpen: false });
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
            <div className="flex-shrink-0 text-right gap-3 flex items-center">
              <div>
                <p className="text-lg font-bold text-gray-900">₹{amount.toFixed(2)}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setDeleteModal({
                    isOpen: true,
                    expenseId: expense.id,
                    description: expense.description,
                  })
                }
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}

      {/* Delete Expense Modal */}
      {deleteModal.expenseId && (
        <DeleteExpenseModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false })}
          expenseId={deleteModal.expenseId}
          expenseDescription={deleteModal.description || ''}
          groupId={groupId}
          onSuccess={() => {
            setDeleteModal({ isOpen: false });
            onExpenseDeleted?.();
          }}
        />
      )}
    </div>
  );
};
