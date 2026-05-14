import React from 'react';
import type { Expense } from '../types';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, Plus } from 'lucide-react';

interface ActivityTimelineProps {
  expenses: Expense[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  // Sort by date descending (newest first)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-0">
      {sortedExpenses.map((expense, index) => {
        const amount = typeof expense.amount === 'string'
          ? parseFloat(expense.amount)
          : expense.amount;
        const isLast = index === sortedExpenses.length - 1;

        return (
          <div key={expense.id} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white flex-shrink-0">
                <Plus className="h-5 w-5" />
              </div>
              {!isLast && (
                <div className="w-0.5 h-12 bg-gray-200 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="pb-8 flex-1">
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {expense.payer?.name || 'Unknown'} added an expense
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {expense.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        ₹{amount.toFixed(2)}
                      </span>
                      {expense.splits && expense.splits.length > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Split among {expense.splits.length} people
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(expense.created_at), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(expense.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
