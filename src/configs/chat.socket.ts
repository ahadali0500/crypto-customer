import { io, Socket } from "socket.io-client";

let chatSocket: Socket | null = null;

type UserType = "admin" | "customer";

export const initchatSocket = (userId: string, type: UserType = "customer"): Socket => {
  // If socket already exists and is connected, return it
  if (chatSocket && chatSocket.connected) return chatSocket;

  // If socket exists but is disconnected, clean it up
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }

  if (!userId) {
    throw new Error("initchatSocket: userId is required");
  }

  chatSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
    query: { userId, type },
    transports: ["websocket","polling"],
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  chatSocket.on("connect", () => console.log("✅ connected", chatSocket?.id));
chatSocket.on("connect_error", (e) => console.log("❌ connect_error", e.message));
chatSocket.io.on("reconnect_attempt", (n) => console.log("🔄 reconnect_attempt", n));
chatSocket.io.on("reconnect_failed", () => console.log("🛑 reconnect_failed"));

  // ✅ Helpers (important for refresh/reconnect)
  const announceOnlineAndSync = () => {
    chatSocket?.emit("user_online", { userId: Number(userId), userType: type });

    // customer should know which admins are online after refresh
    if (type === "customer") {
      chatSocket?.emit("get_online_users", { userType: "admin" });
    }

    // admin can request online customers for dashboard
    if (type === "admin") {
      chatSocket?.emit("get_online_users", { userType: "customer" });
    }
  };

  chatSocket.on("connect", () => {
    console.log("💬 Chat socket connected:", { userId, type });
    announceOnlineAndSync();
  });

  // ✅ When socket reconnects, we must re-announce + re-sync
  chatSocket.on("reconnect", (attempt) => {
    console.log(`🔄 Chat socket reconnected after ${attempt} attempts`);
    announceOnlineAndSync();
  });

  chatSocket.on("connect_error", (error) => {
    console.error("❌ Chat socket connection error:", error);
  });

  chatSocket.on("disconnect", (reason) => {
    console.log("🔌 Chat socket disconnected:", reason);
  });

  chatSocket.on("reconnect_error", (error) => {
    console.error("🔄❌ Chat socket reconnection error:", error);
  });

  console.log("💬 Chat socket initialized:", { userId, type });

  return chatSocket;
};

export const disconnectChatSocket = (): void => {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
    console.log("🔌 Chat socket disconnected");
  }
};

export const getChatSocket = (): Socket | null => chatSocket;

export const emitNotificationEvent = (event: string, data: any): void => {
  if (chatSocket && chatSocket.connected) {
    chatSocket.emit(event, data);
  } else {
    console.warn("⚠️ Socket not connected, cannot emit event:", event);
  }
};
