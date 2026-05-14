import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { showSuccess, showError } from '../utils/notifications';

interface RemoveMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  groupId: string;
  onSuccess: () => void;
}

export const RemoveMemberModal: React.FC<RemoveMemberModalProps> = ({
  isOpen,
  onClose,
  memberId,
  memberName,
  groupId,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleRemove = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/groups/${groupId}/members/${memberId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      showSuccess(`${memberName} removed from group`);
      onSuccess();
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to remove member');
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
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg z-50 w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-2 text-white">Remove Member?</h2>
            <p className="text-gray-300 mb-4">
              Are you sure you want to remove <strong>{memberName}</strong> from this group? They will no longer be able to see or participate in this group's expenses.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleRemove}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
};
