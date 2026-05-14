import React, { useState } from 'react';
import type { BalanceResponse } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { RecordSettlementModal } from './RecordSettlementModal';

interface BalanceViewProps {
  balances: BalanceResponse;
  groupId: string;
  onSettlementRecorded?: () => void;
}

export const BalanceView: React.FC<BalanceViewProps> = ({ balances, groupId, onSettlementRecorded }) => {
  const [expandedBreakdown, setExpandedBreakdown] = useState(true);
  const [settlementModal, setSettlementModal] = useState<{
    isOpen: boolean;
    settlement?: {
      from_user_id: string;
      from_user_name: string;
      to_user_id: string;
      to_user_name: string;
      amount: number;
    };
  }>({ isOpen: false });

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
                    className="flex items-center justify-between gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        <span className="text-blue-900">{settlement.from_user_name}</span>
                        <span className="text-gray-500 mx-2">pays</span>
                        <span className="text-blue-900">{settlement.to_user_name}</span>
                      </p>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        ₹{amount.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        setSettlementModal({
                          isOpen: true,
                          settlement: {
                            from_user_id: settlement.from_user_id,
                            from_user_name: settlement.from_user_name,
                            to_user_id: settlement.to_user_id,
                            to_user_name: settlement.to_user_name,
                            amount,
                          },
                        })
                      }
                      className="whitespace-nowrap"
                    >
                      Record
                    </Button>
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
          <div
            className="cursor-pointer hover:bg-gray-50 p-6 border-b transition-colors"
            onClick={() => setExpandedBreakdown(!expandedBreakdown)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold text-base">Expense Breakdown</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    How much each person paid vs how much they owe
                  </p>
                </div>
              </div>
              {expandedBreakdown ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </div>

          {expandedBreakdown && (
            <CardContent>
              {balances.expense_breakdown.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No expense data</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Member</th>
                        <th className="text-right py-3 px-4 font-semibold">Total Paid</th>
                        <th className="text-right py-3 px-4 font-semibold">Total Owed</th>
                        <th className="text-right py-3 px-4 font-semibold">Net Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balances.expense_breakdown.map((breakdown) => {
                        const totalPaid = typeof breakdown.total_paid === 'string'
                          ? parseFloat(breakdown.total_paid)
                          : breakdown.total_paid;
                        const totalOwed = typeof breakdown.total_owed === 'string'
                          ? parseFloat(breakdown.total_owed)
                          : breakdown.total_owed;
                        const netBalance = typeof breakdown.net_balance === 'string'
                          ? parseFloat(breakdown.net_balance)
                          : breakdown.net_balance;
                        const isPositive = netBalance > 0;

                        return (
                          <tr key={breakdown.user_id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">
                              {breakdown.user_name}
                            </td>
                            <td className="text-right py-3 px-4">
                              <span className="text-green-600 font-semibold">
                                ₹{totalPaid.toFixed(2)}
                              </span>
                            </td>
                            <td className="text-right py-3 px-4">
                              <span className="text-red-600 font-semibold">
                                ₹{totalOwed.toFixed(2)}
                              </span>
                            </td>
                            <td className="text-right py-3 px-4">
                              <span className={`font-bold ${
                                isPositive ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {isPositive ? '+' : '-'}₹{Math.abs(netBalance).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Record Settlement Modal */}
      {settlementModal.settlement && (
        <RecordSettlementModal
          isOpen={settlementModal.isOpen}
          onClose={() => setSettlementModal({ isOpen: false })}
          settlement={settlementModal.settlement}
          groupId={groupId}
          onSuccess={() => {
            setSettlementModal({ isOpen: false });
            onSettlementRecorded?.();
          }}
        />
      )}
    </div>
  );
};
