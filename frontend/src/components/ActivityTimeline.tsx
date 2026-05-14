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
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No activity yet</p>
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
                isExpense ? 'bg-blue-500' : 'bg-green-500'
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
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    {isExpense ? (
                      <>
                        <p className="font-medium text-gray-900">
                          {activity.payer?.name || 'Unknown'} added an expense
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            ₹{parseFloat(activity.amount).toFixed(2)}
                          </span>
                          {activity.splits && activity.splits.length > 0 && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              Split among {activity.splits.length} people
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-gray-900">
                          {activity.from?.name || 'Unknown'} settled with {activity.to?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Payment recorded
                        </p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            ₹{parseFloat(activity.amount).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
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
