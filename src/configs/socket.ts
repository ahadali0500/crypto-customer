import { io, Socket } from "socket.io-client";

let notificationSocket: Socket | null = null;

export const initnotificationSocket = (userId: string): Socket => {
  // If socket already exists and is connected, return it
  if (notificationSocket && notificationSocket.connected) {
    return notificationSocket;
  }

  // If socket exists but is disconnected, clean it up
  if (notificationSocket) {
    notificationSocket.disconnect();
    notificationSocket = null;
  }

  // Create new socket connection
  if (userId) {
    notificationSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notification`, {
      query: { 
        userId, 
        type: "customer" 
      },
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Add connection event handlers
    notificationSocket.on('connect', () => {
      console.log('💬 notification socket connected for user:', userId);
      // Join user's personal notification room
      notificationSocket?.emit('join_room', userId);
    });

    notificationSocket.on('connect_error', (error) => {
      // console.error('❌ notification socket connection error:', error);
    });

    notificationSocket.on('disconnect', (reason) => {
      // console.log('🔌 notification socket disconnected:', reason);
    });

    notificationSocket.on('reconnect', (attemptNumber) => {
      // console.log(`🔄 notification socket reconnected after ${attemptNumber} attempts`);
    });

    notificationSocket.on('reconnect_error', (error) => {
      // console.error('🔄❌ notification socket reconnection error:', error);
    });

    // console.log("💬 notification socket initialized for user:", userId);
  }

  return notificationSocket as Socket;
};

// Function to disconnect socket
export const disconnectnotificationSocket = (): void => {
  if (notificationSocket) {
    notificationSocket.disconnect();
    notificationSocket = null;
    // console.log("🔌 notification socket disconnected");
  }
};

// Function to get current socket instance
export const getnotificationSocket = (): Socket | null => {
  return notificationSocket;
};

// Function to emit notification events
export const emitNotificationEvent = (event: string, data: any): void => {
  if (notificationSocket && notificationSocket.connected) {
    notificationSocket.emit(event, data);
  } else {
    // console.warn('⚠️ Socket not connected, cannot emit event:', event);
  }
};