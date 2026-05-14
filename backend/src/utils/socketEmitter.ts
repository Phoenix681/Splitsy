import { io } from '../server.js';

/**
 * Socket.io event emitter utility
 * Broadcasts events to specific group rooms
 * Only members of the group receive the events
 */

/**
 * Emit expense created event to a specific group
 * Only group members receive this event
 */
export const emitExpenseCreated = (groupId: string, expenseData: any) => {
  const room = `group:${groupId}`;
  io.to(room).emit(`group:${groupId}:expense:created`, {
    type: 'expense:created',
    groupId,
    expense: expenseData,
    timestamp: new Date().toISOString(),
  });
  console.log(`📤 Broadcast expense:created to room: ${room}`);
};

/**
 * Emit settlement recorded event to a specific group
 * Only group members receive this event
 */
export const emitSettlementRecorded = (groupId: string, settlementData: any) => {
  const room = `group:${groupId}`;
  io.to(room).emit(`group:${groupId}:settlement:recorded`, {
    type: 'settlement:recorded',
    groupId,
    settlement: settlementData,
    timestamp: new Date().toISOString(),
  });
  console.log(`📤 Broadcast settlement:recorded to room: ${room}`);
};

/**
 * Emit member added event to a specific group
 * Only group members receive this event
 */
export const emitMemberAdded = (groupId: string, memberData: any) => {
  const room = `group:${groupId}`;
  io.to(room).emit(`group:${groupId}:member:added`, {
    type: 'member:added',
    groupId,
    member: memberData,
    timestamp: new Date().toISOString(),
  });
  console.log(`📤 Broadcast member:added to room: ${room}`);
};

/**
 * Emit group updated event
 * Only group members receive this event
 */
export const emitGroupUpdated = (groupId: string, groupData: any) => {
  const room = `group:${groupId}`;
  io.to(room).emit(`group:${groupId}:updated`, {
    type: 'group:updated',
    groupId,
    group: groupData,
    timestamp: new Date().toISOString(),
  });
  console.log(`📤 Broadcast group:updated to room: ${room}`);
};

/**
 * Emit balances updated event to a specific group
 * Only group members receive this event
 */
export const emitBalancesUpdated = (groupId: string, balanceData: any) => {
  const room = `group:${groupId}`;
  io.to(room).emit(`group:${groupId}:balances:updated`, {
    type: 'balances:updated',
    groupId,
    balances: balanceData,
    timestamp: new Date().toISOString(),
  });
  console.log(`📤 Broadcast balances:updated to room: ${room}`);
};
