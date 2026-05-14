import React, { useState } from 'react';
import type { GroupMember } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Users, Check, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { RemoveMemberModal } from './RemoveMemberModal';

interface MembersListProps {
  members: GroupMember[];
  groupId: string;
  onMemberRemoved?: () => void;
  isOwner?: boolean;
}

export const MembersList: React.FC<MembersListProps> = ({ members, groupId, onMemberRemoved, isOwner = true }) => {
  const [removeModal, setRemoveModal] = useState<{
    isOpen: boolean;
    memberId?: string;
    memberName?: string;
  }>({ isOpen: false });
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-400" />
          <CardTitle className="text-lg">
            Members ({members.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 p-3 border border-white/20 bg-white/5 rounded-lg hover:bg-white/15 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white">{member.name}</p>
                  <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Joined: {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Check className="h-4 w-4 text-green-600" />
                {isOwner && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setRemoveModal({
                        isOpen: true,
                        memberId: member.id,
                        memberName: member.name,
                      })
                    }
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Remove Member Modal */}
        {removeModal.memberId && (
          <RemoveMemberModal
            isOpen={removeModal.isOpen}
            onClose={() => setRemoveModal({ isOpen: false })}
            memberId={removeModal.memberId}
            memberName={removeModal.memberName || ''}
            groupId={groupId}
            onSuccess={() => {
              setRemoveModal({ isOpen: false });
              onMemberRemoved?.();
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};
