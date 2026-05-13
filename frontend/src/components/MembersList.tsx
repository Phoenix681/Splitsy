import React from 'react';
import type { GroupMember } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Users, Check } from 'lucide-react';

interface MembersListProps {
  members: GroupMember[];
}

export const MembersList: React.FC<MembersListProps> = ({ members }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
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
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Joined: {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
