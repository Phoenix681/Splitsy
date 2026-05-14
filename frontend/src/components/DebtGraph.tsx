import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import type { SettlementSuggestion, UserBalance } from '../types';

interface DebtGraphProps {
  balances: UserBalance[];
  settlements: SettlementSuggestion[];
}

export const DebtGraph: React.FC<DebtGraphProps> = ({ balances, settlements }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current || settlements.length === 0) return;

    try {
      // Create nodes from balances
      const nodes = new DataSet(
        balances.map((balance) => {
          // Color based on balance: green if owed to them, red if they owe
          const color = balance.net_balance > 0 ? '#10b981' : '#ef4444';
          const absBalance = Math.abs(balance.net_balance);

          return {
            id: balance.user_id,
            label: `${balance.user_name}\n₹${absBalance.toFixed(2)}`,
            title: `${balance.user_name}: ${balance.net_balance > 0 ? 'is owed' : 'owes'} ₹${absBalance.toFixed(2)}`,
            color: {
              background: color,
              border: '#ffffff',
              highlight: {
                background: color,
                border: '#000000',
              },
            },
            font: {
              size: 14,
              bold: {
                size: 16,
              },
              color: '#ffffff',
            },
            borderWidth: 2,
            borderWidthSelected: 4,
            shadow: {
              enabled: true,
              color: 'rgba(0,0,0,0.2)',
              size: 10,
              x: 5,
              y: 5,
            },
          };
        })
      );

      // Create edges from settlements
      const edges = new DataSet(
        settlements.map((settlement, idx) => {
          const amount = typeof settlement.amount === 'string'
            ? parseFloat(settlement.amount)
            : settlement.amount;

          return {
            id: `edge-${idx}`,
            from: settlement.from_user_id,
            to: settlement.to_user_id,
            label: `₹${amount.toFixed(2)}`,
            title: `${settlement.from_user_name} pays ${settlement.to_user_name}`,
            arrows: {
              to: {
                enabled: true,
                scaleFactor: 0.5,
              },
            },
            color: {
              color: '#3b82f6',
              highlight: '#1d4ed8',
            },
            font: {
              size: 12,
              color: '#3b82f6',
              strokeWidth: 2,
              strokeColor: '#ffffff',
            },
            smooth: {
              type: 'continuous',
              forceDirection: 'horizontal',
            },
            width: 2,
            shadow: {
              enabled: true,
              color: 'rgba(0,0,0,0.1)',
            },
          };
        })
      );

      const data = { nodes, edges };

      // Network options
      const options = {
        physics: {
          enabled: true,
          stabilization: {
            iterations: 200,
          },
          barnesHut: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 200,
            springConstant: 0.04,
          },
        },
        interaction: {
          navigationButtons: true,
          keyboard: true,
          zoomView: true,
          dragView: true,
        },
        layout: {
          randomSeed: 42,
        },
      };

      // Create or update network
      if (networkRef.current) {
        networkRef.current.setData(data);
      } else {
        networkRef.current = new Network(containerRef.current, data, options);
      }

      // Fit to view when loaded
      const fitHandler = () => {
        if (networkRef.current) {
          networkRef.current.fit({
            animation: {
              duration: 500,
              easingFunction: 'easeInOutQuad',
            },
          });
        }
      };

      if (networkRef.current) {
        networkRef.current.once('stabilizationIterationsDone', fitHandler);
        // Timeout fallback in case stabilization doesn't trigger
        setTimeout(fitHandler, 500);
      }
    } catch (error) {
      console.error('Error rendering debt graph:', error);
    }

    // Cleanup
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [balances, settlements]);

  if (settlements.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-white/5 rounded-lg border border-white/20">
        <p className="text-gray-400 text-center">
          No debts to visualize. Everyone is settled up! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>Owed money</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span>Owes money</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-green-500"></div>
          <span>Payment flow</span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="h-96 border border-white/20 rounded-lg bg-white/10 backdrop-blur-md shadow-sm"
        style={{ height: '400px' }}
      />
      <p className="text-xs text-gray-400 text-center">
        Drag nodes to reposition • Scroll to zoom • Click and drag background to pan
      </p>
    </div>
  );
};
