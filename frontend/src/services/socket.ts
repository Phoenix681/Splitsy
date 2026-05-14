import { io as ioClient, Socket } from 'socket.io-client';

// Socket.io client instance
let socket: Socket | null = null;

/**
 * Initialize Socket.io connection with JWT token
 * @param token JWT token for authentication
 * @returns Socket instance
 */
export const initializeSocket = (token: string): Socket => {
  if (socket && socket.connected) {
    console.log('✅ Socket already connected, reusing existing connection');
    return socket;
  }

  // Get the base URL (without /api path)
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SOCKET_SERVER_URL = baseURL.replace('/api', '');

  console.log(`🔌 Initializing Socket.io at: ${SOCKET_SERVER_URL}`);
  console.log(`🔑 Token provided (first 20 chars): ${token.substring(0, 20)}...`);

  socket = ioClient(SOCKET_SERVER_URL, {
    auth: {
      token: token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket.io connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket.io disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('🔴 Socket connection error:', error);
  });

  return socket;
};

/**
 * Get the current socket instance
 * @returns Socket instance or null
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Subscribe to group events
 * @param groupId Group ID to listen for events
 * @param callbacks Object with event handlers
 */
export const subscribeToGroupEvents = (
  groupId: string,
  callbacks: {
    onExpenseCreated?: (data: any) => void;
    onSettlementRecorded?: (data: any) => void;
    onMemberAdded?: (data: any) => void;
    onGroupUpdated?: (data: any) => void;
    onBalancesUpdated?: (data: any) => void;
  }
) => {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  // Tell server to join this group's room
  socket.emit('join-group', groupId);
  console.log(`📍 Requested to join group room: ${groupId}`);

  // Listen for expense created
  if (callbacks.onExpenseCreated) {
    socket.on(`group:${groupId}:expense:created`, (data) => {
      console.log('📝 Expense created:', data);
      callbacks.onExpenseCreated?.(data);
    });
  }

  // Listen for settlement recorded
  if (callbacks.onSettlementRecorded) {
    socket.on(`group:${groupId}:settlement:recorded`, (data) => {
      console.log('💳 Settlement recorded:', data);
      callbacks.onSettlementRecorded?.(data);
    });
  }

  // Listen for member added
  if (callbacks.onMemberAdded) {
    socket.on(`group:${groupId}:member:added`, (data) => {
      console.log('👤 Member added:', data);
      callbacks.onMemberAdded?.(data);
    });
  }

  // Listen for group updated
  if (callbacks.onGroupUpdated) {
    socket.on(`group:${groupId}:updated`, (data) => {
      console.log('📋 Group updated:', data);
      callbacks.onGroupUpdated?.(data);
    });
  }

  // Listen for balances updated
  if (callbacks.onBalancesUpdated) {
    socket.on(`group:${groupId}:balances:updated`, (data) => {
      console.log('⚖️ Balances updated:', data);
      callbacks.onBalancesUpdated?.(data);
    });
  }
};

/**
 * Unsubscribe from group events
 * @param groupId Group ID to stop listening for events
 */
export const unsubscribeFromGroupEvents = (groupId: string) => {
  if (!socket) return;

  // Tell server to leave this group's room
  socket.emit('leave-group', groupId);
  console.log(`📍 Requested to leave group room: ${groupId}`);

  socket.off(`group:${groupId}:expense:created`);
  socket.off(`group:${groupId}:settlement:recorded`);
  socket.off(`group:${groupId}:member:added`);
  socket.off(`group:${groupId}:updated`);
  socket.off(`group:${groupId}:balances:updated`);
};
