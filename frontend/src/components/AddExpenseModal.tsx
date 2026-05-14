import React, { useState, useEffect } from 'react';
import { expensesApi } from '../services/apiService';
import type { GroupMember, User } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X } from 'lucide-react';

interface AddExpenseModalProps {
  groupId: string;
  members: GroupMember[];
  currentUser: User | null;
  onClose: () => void;
  onExpenseAdded: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  groupId,
  members,
  currentUser,
  onClose,
  onExpenseAdded,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser?.id || '');
  const [splitType, setSplitType] = useState<'equal' | 'custom' | 'percentage'>('equal');
  const [splits, setSplits] = useState<{ [key: string]: string }>({});
  const [percentages, setPercentages] = useState<{ [key: string]: string }>({});
  const [splitAmong, setSplitAmong] = useState<string[]>(members.map(m => m.id));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize splits based on selected members
    const newSplits: { [key: string]: string } = {};
    const newPercentages: { [key: string]: string } = {};
    const numMembers = splitAmong.length;

    splitAmong.forEach(memberId => {
      if (splitType === 'equal') {
        newSplits[memberId] = (parseFloat(amount) / numMembers || 0).toFixed(2);
      } else if (splitType === 'percentage') {
        const equalPercentage = (100 / numMembers).toFixed(2);
        newPercentages[memberId] = equalPercentage;
        newSplits[memberId] = ((parseFloat(amount) * parseFloat(equalPercentage)) / 100 || 0).toFixed(2);
      } else {
        newSplits[memberId] = splits[memberId] || '0.00';
      }
    });
    
    setSplits(newSplits);
    setPercentages(newPercentages);
  }, [amount, splitType, splitAmong]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!paidBy) {
      setError('Please select who paid');
      return;
    }

    if (splitAmong.length === 0) {
      setError('Select at least one person for the split');
      return;
    }

    if (splitType === 'custom') {
      const totalSplit = Object.values(splits)
        .reduce((sum, val) => sum + parseFloat(val || '0'), 0);
      const totalAmount = parseFloat(amount);
      const diff = Math.abs(totalSplit - totalAmount);
      if (diff > 0.01) {
        setError(
          `Split amounts (₹${totalSplit.toFixed(2)}) must equal total (₹${totalAmount.toFixed(2)})`
        );
        return;
      }
    }

    if (splitType === 'percentage') {
      const totalPercentage = Object.values(percentages)
        .reduce((sum, val) => sum + parseFloat(val || '0'), 0);
      const diff = Math.abs(totalPercentage - 100);
      if (diff > 0.01) {
        setError(
          `Percentages (${totalPercentage.toFixed(2)}%) must equal 100%`
        );
        return;
      }
    }

    setLoading(true);
    try {
      await expensesApi.create(groupId, {
        description: description.trim(),
        amount: parseFloat(amount),
        paid_by: paidBy,
        split_type: splitType,
        split_among: splitType === 'equal' ? splitAmong : undefined,
        splits: (splitType === 'custom' || splitType === 'percentage')
          ? splitAmong.map(memberId => ({
            user_id: memberId,
            amount: splitType === 'percentage' 
              ? parseFloat(percentages[memberId] || '0')
              : parseFloat(splits[memberId] || '0'),
          }))
          : undefined,
      });

      onExpenseAdded();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to add expense');
      setLoading(false);
    }
  };

  const handleSplitAmongToggle = (memberId: string) => {
    setSplitAmong(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCustomSplitChange = (memberId: string, value: string) => {
    setSplits(prev => ({
      ...prev,
      [memberId]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 sticky top-0 bg-white/10 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white">Add Expense</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Description */}
          <Input
            label="Description *"
            type="text"
            placeholder="e.g., Dinner, Groceries"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />

          {/* Amount */}
          <Input
            label="Amount (₹) *"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />

          {/* Paid By */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Paid By *</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              disabled={loading}
              className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 text-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" className="bg-slate-900">Select member...</option>
              {members.map(member => (
                <option key={member.id} value={member.id} className="bg-slate-900 text-white">
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Split Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Split Type</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="equal"
                  checked={splitType === 'equal'}
                  onChange={(e) => setSplitType(e.target.value as 'equal' | 'custom' | 'percentage')}
                  disabled={loading}
                />
                <span className="text-gray-300">Equal split</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="percentage"
                  checked={splitType === 'percentage'}
                  onChange={(e) => setSplitType(e.target.value as 'equal' | 'custom' | 'percentage')}
                  disabled={loading}
                />
                <span className="text-gray-300">Percentage split</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="custom"
                  checked={splitType === 'custom'}
                  onChange={(e) => setSplitType(e.target.value as 'equal' | 'custom' | 'percentage')}
                  disabled={loading}
                />
                <span className="text-gray-300">Custom amounts</span>
              </label>
            </div>
          </div>

          {/* Split Among */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Split Among</label>
            <div className="space-y-2 bg-white/10 border border-white/20 p-3 rounded-md max-h-40 overflow-y-auto">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={splitAmong.includes(member.id)}
                    onChange={() => handleSplitAmongToggle(member.id)}
                    disabled={loading}
                    className="w-4 h-4"
                  />
                  <span className="flex-1 text-sm">{member.name}</span>
                  
                  {splitType === 'percentage' && splitAmong.includes(member.id) && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={percentages[member.id] || '0.00'}
                        onChange={(e) => {
                          const newPercentages = { ...percentages };
                          newPercentages[member.id] = e.target.value;
                          setPercentages(newPercentages);
                          // Update splits based on percentage
                          const newSplits = { ...splits };
                          newSplits[member.id] = ((parseFloat(amount) * parseFloat(e.target.value)) / 100 || 0).toFixed(2);
                          setSplits(newSplits);
                        }}
                        disabled={loading}
                        className="w-16 h-8 rounded-md border border-input px-2 py-1 text-sm"
                      />
                      <span className="text-xs text-gray-500 w-4">%</span>
                    </div>
                  )}

                  {splitType === 'custom' && splitAmong.includes(member.id) && (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={amount}
                      value={splits[member.id] || '0.00'}
                      onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                      disabled={loading}
                      className="w-20 h-8 rounded-md border border-white/20 bg-white/10 text-white px-2 py-1 text-sm placeholder:text-gray-500"
                      placeholder="0.00"
                    />
                  )}

                  {splitType === 'equal' && splitAmong.includes(member.id) && (
                    <span className="text-sm text-gray-400">₹{splits[member.id] || '0.00'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/20">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
