import React from 'react';
import type { Activity } from '../types';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, Plus, ArrowRight } from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
        <p className="text-gray-400">No activity yet</p>
      </div>
    );
  }

  // Sort by date descending (newest first)
  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = a.type === 'expense' ? a.created_at : a.settled_at;
    const dateB = b.type === 'expense' ? b.created_at : b.settled_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="space-y-0">
      {sortedActivities.map((activity, index) => {
        const isLast = index === sortedActivities.length - 1;
        const isExpense = activity.type === 'expense';
        const timestamp = isExpense ? activity.created_at : activity.settled_at;

        return (
          <div key={activity.id} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white flex-shrink-0 ${
                isExpense ? 'bg-green-500' : 'bg-green-500'
              }`}>
                {isExpense ? (
                  <Plus className="h-5 w-5" />
                ) : (
                  <ArrowRight className="h-5 w-5" />
                )}
              </div>
              {!isLast && (
                <div className="w-0.5 h-12 bg-gray-200 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="pb-8 flex-1">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    {isExpense ? (
                      <>
                        <p className="font-medium text-white">
                          {activity.payer?.name || 'Unknown'} added an expense
                        </p>
                        <p className="text-sm text-gray-300 mt-1">
                          {activity.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/30">
                            ₹{parseFloat(activity.amount).toFixed(2)}
                          </span>
                          {activity.splits && activity.splits.length > 0 && (
                            <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded border border-white/20">
                              Split among {activity.splits.length} people
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-white">
                          {activity.from?.name || 'Unknown'} settled with {activity.to?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-300 mt-1">
                          Payment recorded
                        </p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/30">
                            ₹{parseFloat(activity.amount).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(timestamp), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
