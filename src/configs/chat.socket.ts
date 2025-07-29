import { io, Socket } from "socket.io-client";

let chatSocket: Socket | null = null;

export const initchatSocket = (userId: string): Socket => {
  // If socket already exists and is connected, return it
  if (chatSocket && chatSocket.connected) {
    return chatSocket;
  }

  // If socket exists but is disconnected, clean it up
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }

  // Create new socket connection
  if (userId) {
    chatSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
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
    chatSocket.on('connect', () => {
      console.log('💬 Chat socket connected for user:', userId);
      // Join user's personal notification room
    });

    chatSocket.on('connect_error', (error) => {
      console.error('❌ Chat socket connection error:', error);
    });

    chatSocket.on('disconnect', (reason) => {
      console.log('🔌 Chat socket disconnected:', reason);
    });

    chatSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Chat socket reconnected after ${attemptNumber} attempts`);
    });

    chatSocket.on('reconnect_error', (error) => {
      console.error('🔄❌ Chat socket reconnection error:', error);
    });

    console.log("💬 Chat socket initialized for user:", userId);
  }

  return chatSocket as Socket;
};

// Function to disconnect socket
export const disconnectChatSocket = (): void => {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
    console.log("🔌 Chat socket disconnected");
  }
};

// Function to get current socket instance
export const getChatSocket = (): Socket | null => {
  return chatSocket;
};

// Function to emit notification events
export const emitNotificationEvent = (event: string, data: any): void => {
  if (chatSocket && chatSocket.connected) {
    chatSocket.emit(event, data);
  } else {
    console.warn('⚠️ Socket not connected, cannot emit event:', event);
  }
};