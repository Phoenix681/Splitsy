import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { showSuccess, showError } from '../utils/notifications';

interface RecordSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: {
    from_user_id: string;
    from_user_name: string;
    to_user_id: string;
    to_user_name: string;
    amount: number;
  };
  groupId: string;
  onSuccess: () => void;
}

export const RecordSettlementModal: React.FC<RecordSettlementModalProps> = ({
  isOpen,
  onClose,
  settlement,
  groupId,
  onSuccess,
}) => {
  const [amount, setAmount] = useState(settlement.amount.toString());
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/groups/${groupId}/settlements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            from_user_id: settlement.from_user_id,
            to_user_id: settlement.to_user_id,
            amount: parseFloat(amount),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to record settlement');
      }

      showSuccess(`Settlement recorded: ${settlement.from_user_name} paid ${settlement.to_user_name}`);
      onSuccess();
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to record settlement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Record Settlement</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{settlement.from_user_name}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{settlement.to_user_name}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount (₹)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Recording...' : 'Record Settlement'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
