import React, { useState } from 'react';
import type { BalanceResponse } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';

interface BalanceViewProps {
  balances: BalanceResponse;
}

export const BalanceView: React.FC<BalanceViewProps> = ({ balances }) => {
  const [expandedBreakdown, setExpandedBreakdown] = useState(false);

  if (!balances) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Settlement Suggestions */}
      {balances.settlements && balances.settlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Settlement Suggestions
            </CardTitle>
            <CardDescription>
              Simplified transactions to settle all debts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {balances.settlements.map((settlement, idx) => {
                const amount = typeof settlement.amount === 'string'
                  ? parseFloat(settlement.amount)
                  : settlement.amount;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        <span className="text-blue-900">{settlement.from_user_name}</span>
                        <span className="text-gray-500 mx-2">pays</span>
                        <span className="text-blue-900">{settlement.to_user_name}</span>
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      ₹{amount.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Balances */}
      {balances.balances && balances.balances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Individual Balances
            </CardTitle>
            <CardDescription>
              Positive means they're owed money, negative means they owe money
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {balances.balances.map((balance) => {
                const isPositive = balance.net_balance > 0;
                const balanceAmount = typeof balance.net_balance === 'string'
                  ? parseFloat(balance.net_balance)
                  : balance.net_balance;

                return (
                  <div
                    key={balance.user_id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isPositive
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        isPositive ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">{balance.user_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {isPositive ? 'is owed' : 'owes'}
                        </p>
                      </div>
                    </div>
                    <p className={`text-lg font-bold ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₹{balanceAmount.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense Breakdown */}
      {balances.expense_breakdown && balances.expense_breakdown.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => setExpandedBreakdown(!expandedBreakdown)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Expense Breakdown</CardTitle>
              {expandedBreakdown ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>

          {expandedBreakdown && (
            <CardContent>
              <div className="space-y-4">
                {balances.expense_breakdown.map((breakdown) => {
                  const totalPaid = typeof breakdown.total_paid === 'string'
                    ? parseFloat(breakdown.total_paid)
                    : breakdown.total_paid;
                  const totalOwed = typeof breakdown.total_owed === 'string'
                    ? parseFloat(breakdown.total_owed)
                    : breakdown.total_owed;

                  return (
                    <div key={breakdown.user_id} className="border-b pb-4 last:border-b-0">
                      <p className="font-medium mb-3">{breakdown.user_name}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Paid</p>
                          <p className="text-lg font-semibold text-green-600">
                            ₹{totalPaid.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Owed</p>
                          <p className="text-lg font-semibold text-red-600">
                            ₹{totalOwed.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};
