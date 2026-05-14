import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { groupsApi, expensesApi, balancesApi } from '../services/apiService';
import type { Group, Expense, BalanceResponse } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Tabs, TabContent } from '../components/ui/tabs';
import { ArrowLeft, Plus, DollarSign, Users, Clock } from 'lucide-react';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { AddMemberModal } from '../components/AddMemberModal';
import { BalanceView } from '../components/BalanceView';
import { ExpensesList } from '../components/ExpensesList';
import { ExpensesFilters } from '../components/ExpensesFilters';
import { MembersList } from '../components/MembersList';
import { ActivityTimeline } from '../components/ActivityTimeline';

export const GroupDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

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

  const handleMemberAdded = async () => {
    setShowAddMemberModal(false);
    await fetchGroupData(); // Refresh data after member added
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddMemberModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
              <Button onClick={() => setShowAddExpenseModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
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

        {/* Tabs */}
        <Card>
          <Tabs
            tabs={[
              { id: 'expenses', label: 'Expenses', icon: <DollarSign className="h-4 w-4" /> },
              { id: 'balances', label: 'Balances', icon: <Users className="h-4 w-4" /> },
              { id: 'activity', label: 'Activity', icon: <Clock className="h-4 w-4" /> },
            ]}
            defaultTab="expenses"
          >
            {/* Expenses Tab */}
            <TabContent tabId="expenses">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Filters */}
                  {group?.members && (
                    <ExpensesFilters
                      expenses={expenses}
                      members={group.members}
                      onFiltered={setFilteredExpenses}
                    />
                  )}

                  {/* Expenses List */}
                  {filteredExpenses.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-4">
                        {expenses.length === 0 ? 'No expenses yet' : 'No expenses match your filters'}
                      </p>
                      {expenses.length === 0 && (
                        <Button
                          size="sm"
                          onClick={() => setShowAddExpenseModal(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Expense
                        </Button>
                      )}
                    </div>
                  ) : (
                    <ExpensesList expenses={filteredExpenses} />
                  )}
                </div>
              </CardContent>
            </TabContent>

            {/* Balances Tab */}
            <TabContent tabId="balances">
              <CardContent className="pt-6">
                {balances ? (
                  <BalanceView balances={balances} />
                ) : (
                  <p className="text-muted-foreground">Loading balances...</p>
                )}
              </CardContent>
            </TabContent>

            {/* Activity Tab */}
            <TabContent tabId="activity">
              <CardContent className="pt-6">
                <ActivityTimeline expenses={expenses} />
              </CardContent>
            </TabContent>
          </Tabs>
        </Card>

        {/* Members Section */}
        {group?.members && group.members.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">
                      Members ({group.members.length})
                    </CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddMemberModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <MembersList members={group.members} />
              </CardContent>
            </Card>
          </div>
        )}
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

      {/* Add Member Modal */}
      {showAddMemberModal && groupId && (
        <AddMemberModal
          groupId={groupId}
          onClose={() => setShowAddMemberModal(false)}
          onMemberAdded={handleMemberAdded}
        />
      )}
    </div>
  );
};
