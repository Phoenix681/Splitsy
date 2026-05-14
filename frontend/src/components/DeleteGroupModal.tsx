import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { showSuccess, showError } from '../utils/notifications';
import { useNavigate } from 'react-router-dom';

interface DeleteGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

export const DeleteGroupModal: React.FC<DeleteGroupModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/groups/${groupId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete group');
      }

      showSuccess(`Group "${groupName}" deleted`);
      onClose();
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete group');
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
            <h2 className="text-lg font-bold mb-2 text-white">Delete Group?</h2>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete <strong>{groupName}</strong>? This will permanently remove the group and all its associated expenses. This action cannot be undone.
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
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? 'Deleting...' : 'Delete Group'}
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
