import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { groupsApi, expensesApi, balancesApi } from '../services/apiService';
import { initializeSocket, subscribeToGroupEvents, unsubscribeFromGroupEvents, disconnectSocket } from '../services/socket';
import type { Group, Expense, BalanceResponse, Activity, SettlementRecord } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Tabs, TabContent } from '../components/ui/tabs';
import { ArrowLeft, Plus, DollarSign, Users, Clock, Trash2 } from 'lucide-react';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { AddMemberModal } from '../components/AddMemberModal';
import { DeleteGroupModal } from '../components/DeleteGroupModal';
import { BalanceView } from '../components/BalanceView';
import { DebtGraph } from '../components/DebtGraph';
import { ExpensesList } from '../components/ExpensesList';
import { ExpensesFilters } from '../components/ExpensesFilters';
import { MembersList } from '../components/MembersList';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { showInfo } from '../utils/notifications';

export const GroupDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [balances, setBalances] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);

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
      
      // Fetch settlement history
      const settlementRes = await balancesApi.getSettlementHistory(groupId);
      setSettlements(settlementRes.settlements);
      
      // Then fetch balances
      const balancesRes = await balancesApi.getGroupBalances(groupId);
      setBalances(balancesRes);
      
      // Combine expenses and settlements into unified activity feed
      const combinedActivities: Activity[] = [
        ...expensesRes.expenses.map(e => ({ ...e, type: 'expense' as const })),
        ...settlementRes.settlements.map(s => ({ ...s, type: 'settlement' as const })),
      ];
      setActivities(combinedActivities);
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
    
    // Initialize Socket.io if we have a token
    const token = localStorage.getItem('token');
    if (token && groupId) {
      try {
        initializeSocket(token);
        
        // Subscribe to group events
        subscribeToGroupEvents(groupId, {
          onExpenseCreated: (data) => {
            showInfo('New expense added by ' + (data.expense?.payer?.name || 'someone'));
            fetchGroupData(); // Refresh data
          },
          onSettlementRecorded: (data) => {
            showInfo('Settlement recorded: ' + (data.settlement?.from?.name || 'Someone') + ' paid ' + (data.settlement?.to?.name || 'someone'));
            fetchGroupData(); // Refresh data
          },
          onMemberAdded: (data) => {
            showInfo('New member added: ' + (data.member?.name || 'Someone'));
            fetchGroupData(); // Refresh data
          },
          onBalancesUpdated: () => {
            console.log('📊 Balances updated, refreshing...');
            fetchGroupData(); // Refresh data
          },
        });
      } catch (err) {
        console.error('Socket.io initialization error:', err);
      }
    }

    // Cleanup: Unsubscribe from events and disconnect when component unmounts
    return () => {
      if (groupId) {
        unsubscribeFromGroupEvents(groupId);
      }
      // Don't disconnect on unmount since we might use it on other pages
      // disconnectSocket();
    };
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white/10 rounded-md transition-colors text-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="py-16 text-center">
              <p className="text-lg font-semibold text-gray-300">Group not found</p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-white/10 rounded-md transition-colors text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{group.name}</h1>
                {group.description && (
                  <p className="text-sm text-gray-300">{group.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddMemberModal(true)}
                className="border-white/20 text-gray-300 hover:bg-white/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
              <Button 
                onClick={() => setShowAddExpenseModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteGroupModal(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-md mb-6 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {balances && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardDescription className="text-gray-300">Total Expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  ₹{(balances.summary.total_amount || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardDescription className="text-gray-300">Members</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{group.members?.length || 0}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardDescription className="text-gray-300">Settlements Needed</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {balances.summary.settlements_needed || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
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
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-400 mb-4">
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
                    <ExpensesList 
                      expenses={filteredExpenses}
                      groupId={groupId}
                      onExpenseDeleted={() => fetchGroupData()}
                    />
                  )}
                </div>
              </CardContent>
            </TabContent>

            {/* Balances Tab */}
            <TabContent tabId="balances">
              <CardContent className="pt-6">
                {balances ? (
                  <div className="space-y-8">
                    {/* Debt Graph */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Debt Graph</h3>
                      <DebtGraph 
                        balances={balances.balances || []} 
                        settlements={balances.settlements || []}
                      />
                    </div>

                    {/* Balance Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Balance Details</h3>
                      <BalanceView 
                        balances={balances} 
                        groupId={groupId}
                        onSettlementRecorded={() => fetchGroupData()}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">Loading balances...</p>
                )}
              </CardContent>
            </TabContent>

            {/* Activity Tab */}
            <TabContent tabId="activity">
              <CardContent className="pt-6">
                <ActivityTimeline activities={activities} />
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
                    <Users className="h-5 w-5 text-gray-400" />
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
                <MembersList 
                  members={group.members}
                  groupId={groupId}
                  onMemberRemoved={() => fetchGroupData()}
                />
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

      {/* Delete Group Modal */}
      {group && (
        <DeleteGroupModal
          isOpen={showDeleteGroupModal}
          onClose={() => setShowDeleteGroupModal(false)}
          groupId={groupId || ''}
          groupName={group.name}
        />
      )}
    </div>
  );
};
