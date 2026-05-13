import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { groupsApi, expensesApi, balancesApi } from '../services/apiService';
import type { Group, Expense, BalanceResponse } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { ArrowLeft, Plus, DollarSign, Users } from 'lucide-react';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { BalanceView } from '../components/BalanceView';
import { ExpensesList } from '../components/ExpensesList';
import { MembersList } from '../components/MembersList';

export const GroupDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  const fetchGroupData = async () => {
    if (!groupId) {
      setError('Group not found');
      setLoading(false);
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Fetch group first
      const groupRes = await groupsApi.getById(groupId);
      setGroup(groupRes.group);
      
      // Then fetch expenses
      const expensesRes = await expensesApi.getGroupExpenses(groupId);
      setExpenses(expensesRes.expenses);
      
      // Then fetch balances
      const balancesRes = await balancesApi.getGroupBalances(groupId);
      setBalances(balancesRes);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage = error.response?.data?.error || 'Failed to load group details';
      setError(errorMessage);
      console.error('Error fetching group data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const handleExpenseAdded = async () => {
    setShowAddExpenseModal(false);
    await fetchGroupData(); // Refresh data after expense added
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-lg font-semibold text-muted-foreground">Group not found</p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="mt-4"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                {group.description && (
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                )}
              </div>
            </div>
            <Button onClick={() => setShowAddExpenseModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {balances && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardDescription>Total Expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  ₹{(balances.summary.total_amount || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Members</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{group.members?.length || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Settlements Needed</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {balances.summary.settlements_needed || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Balances and Settlements */}
        {balances && <BalanceView balances={balances} />}

        {/* Members and Expenses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Members Section */}
          <div className="lg:col-span-1">
            {group.members && group.members.length > 0 && (
              <MembersList members={group.members} />
            )}
          </div>

          {/* Expenses Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Expenses</CardTitle>
                    <CardDescription>
                      {expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded
                    </CardDescription>
                  </div>
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No expenses yet</p>
                    <Button
                      size="sm"
                      onClick={() => setShowAddExpenseModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Expense
                    </Button>
                  </div>
                ) : (
                  <ExpensesList expenses={expenses} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      {showAddExpenseModal && groupId && (
        <AddExpenseModal
          groupId={groupId}
          members={group.members || []}
          currentUser={user}
          onClose={() => setShowAddExpenseModal(false)}
          onExpenseAdded={handleExpenseAdded}
        />
      )}
    </div>
  );
};
