"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { initchatSocket } from "@/configs/chat.socket";
import { useSessionContext } from "@/components/auth/AuthProvider/SessionContext";
import { getUserIdFromToken } from "@/utils/getUserIdFromToken";

type StatusPayload = {
  userId: number;
  userType: "admin" | "customer";
  status: "online" | "offline" | "away";
};

// Raw Prisma Chat object the backend emits
export interface IncomingChatMessage {
  id: number;
  fromAdminId: number | null;
  fromCustomerId: number | null;
  toAdminId: number | null;
  toCustomerId: number | null;
  message: string | null;
  file: string | null;
  createdAt: string;
  seen: string;
}

type ChatSocketContextValue = {
  socket: Socket | null;
  connected: boolean;
  onlineAdminIds: Set<number>;
  // ✅ NEW: last message received via socket — reactive, no timing issues
  lastMessage: IncomingChatMessage | null;
};

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

export const ChatSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useSessionContext();

  // ✅ useState (not useRef) so consumers re-render when socket is ready
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineAdminIds, setOnlineAdminIds] = useState<Set<number>>(new Set());

  // ✅ KEY FIX: lastMessage lives HERE in the context where socket lifecycle
  // is fully controlled. ChatApp just reads this — no timing issues at all.
  const [lastMessage, setLastMessage] = useState<IncomingChatMessage | null>(null);

  useEffect(() => {
    const customerId = Number(session?.user?.id) || getUserIdFromToken();
    if (!customerId) return;

    const s = initchatSocket(String(customerId), "customer");
    setSocket(s);

    const onConnect = () => {
      console.log("✅ SOCKET CONNECTED:", s.id);
      setConnected(true);
      s.emit("user_online", { userId: customerId, userType: "customer" });
      s.emit("get_online_users", { userType: "admin" });
    };

    const onDisconnect = (reason: any) => {
      console.log("🔌 SOCKET DISCONNECTED:", reason);
      setConnected(false);
    };

    const onOnlineUsers = (payload: any) => {
      if (payload?.userType !== "admin") return;
      const ids = (payload?.users || []).map(Number);
      setOnlineAdminIds(new Set(ids));
    };

    const onStatus = (data: StatusPayload) => {
      if (data.userType !== "admin") return;
      setOnlineAdminIds((prev) => {
        const next = new Set(prev);
        if (data.status === "online") next.add(Number(data.userId));
        else next.delete(Number(data.userId));
        return next;
      });
    };

    // ✅ CONFIRMED from backend: active room → "message", inactive → "inactiveMessage"
    // Both carry the raw Prisma Chat object
    const onMessage = (data: IncomingChatMessage) => {
      console.log("[SOCKET] 'message' received:", data);
      // Only handle messages FROM admin TO customer
      if (!data.fromAdminId) return;
      setLastMessage({ ...data }); // spread ensures new reference → triggers useEffect in ChatApp
    };

    const onInactiveMessage = (data: IncomingChatMessage) => {
      console.log("[SOCKET] 'inactiveMessage' received:", data);
      if (!data.fromAdminId) return;
      setLastMessage({ ...data });
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("online_users", onOnlineUsers);
    s.on("user_status_change", onStatus);
    s.on("message", onMessage);
    s.on("inactiveMessage", onInactiveMessage);

    if (s.connected) onConnect();

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("online_users", onOnlineUsers);
      s.off("user_status_change", onStatus);
      s.off("message", onMessage);
      s.off("inactiveMessage", onInactiveMessage);
    };
  }, [session?.user?.id]);

  const value = useMemo(
    () => ({ socket, connected, onlineAdminIds, lastMessage }),
    [socket, connected, onlineAdminIds, lastMessage]
  );

  return (
    <ChatSocketContext.Provider value={value}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export const useChatSocket = () => {
  const ctx = useContext(ChatSocketContext);
  if (!ctx) throw new Error("useChatSocket must be used within ChatSocketProvider");
  return ctx;
};