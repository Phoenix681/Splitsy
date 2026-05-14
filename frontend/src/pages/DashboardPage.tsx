import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { groupsApi } from '../services/apiService';
import type { Group } from '../types';
import { Button } from '../components/ui/button';
import { Users, Plus, LogOut, Zap, TrendingUp } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGroups = async () => {
    try {
      const response = await groupsApi.getAll();
      setGroups(response.groups);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchGroups();
    })();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Splitsy
              </h1>
              <p className="text-sm text-gray-300 mt-1">
                Welcome back, <span className="font-semibold text-white">{user?.name}!</span>
              </p>
            </div>
            <Button 
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Your Groups</h2>
            <p className="text-lg text-gray-300">
              Manage expenses seamlessly with friends and family
            </p>
          </div>
          <Button 
            onClick={() => navigate('/groups/create')}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Group
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
            {error}
          </div>
        )}

        {groups.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 text-center max-w-md hover:border-white/30 transition-all">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No groups yet</h3>
              <p className="text-gray-300 mb-8">
                Create your first group to start splitting expenses with your friends and family.
              </p>
              <Button 
                onClick={() => navigate('/groups/create')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 h-full group-hover:shadow-xl">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-emerald-400 group-hover:bg-clip-text transition-all">
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Users className="h-4 w-4 text-green-400" />
                        <span>{group.memberCount || 0} members</span>
                      </div>
                      <span className="text-xs bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};