import React, { useState } from 'react';
import type { Expense, GroupMember } from '../types';
import { Input } from './ui/input';
import { X } from 'lucide-react';

interface ExpensesFiltersProps {
  expenses: Expense[];
  members: GroupMember[];
  onFiltered: (filtered: Expense[]) => void;
}

export const ExpensesFilters: React.FC<ExpensesFiltersProps> = ({
  expenses,
  members,
  onFiltered,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const applyFilters = () => {
    let filtered = [...expenses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((exp) =>
        exp.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Person filter
    if (selectedPerson) {
      filtered = filtered.filter((exp) => exp.payer.id === selectedPerson);
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      filtered = filtered.filter(
        (exp) => new Date(exp.created_at) >= from
      );
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(
        (exp) => new Date(exp.created_at) <= to
      );
    }

    onFiltered(filtered);
  };

  // Apply filters whenever any filter changes
  React.useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedPerson, dateFrom, dateTo]);

  const hasActiveFilters = !!(searchQuery || selectedPerson || dateFrom || dateTo);

  return (
    <div className="space-y-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Search</label>
          <Input
            placeholder="Search by description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Person filter */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Member</label>
          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
            className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All members</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                Paid by {member.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedPerson('');
            setDateFrom('');
            setDateTo('');
          }}
          className="flex items-center gap-2 text-sm text-green-500 hover:text-green-400 transition-colors"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </button>
      )}
    </div>
  );
};
