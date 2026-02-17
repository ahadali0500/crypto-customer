"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { initchatSocket } from "@/configs/chat.socket";
import { useSessionContext } from "@/components/auth/AuthProvider/SessionContext";
import { getUserIdFromToken } from "@/utils/getUserIdFromToken";

type StatusPayload = { userId: number; userType: "admin" | "customer"; status: "online" | "offline" | "away" };

type ChatSocketContextValue = {
  socket: Socket | null;
  connected: boolean;
  onlineAdminIds: Set<number>;
};

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

export const ChatSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useSessionContext();
  const socketRef = useRef<Socket | null>(null);

  const [connected, setConnected] = useState(false);
  const [onlineAdminIds, setOnlineAdminIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    
    const customerId = Number(session?.user?.id) || getUserIdFromToken();

    if (!customerId) {
      console.log("⚠️ No customerId yet, waiting...");
      return;
    }

 

    const s = initchatSocket(String(customerId), "customer");
    socketRef.current = s;

    const onConnect = () => {
      console.log("✅ SOCKET CONNECTED:", s.id);
      setConnected(true);

      // mark online + sync online admins
      s.emit("user_online", { userId: customerId, userType: "customer" });
      s.emit("get_online_users", { userType: "admin" });
    };

    const onDisconnect = (reason: any) => {
      console.log("🔌 SOCKET DISCONNECTED:", reason);
      setConnected(false);
    };

    const onOnlineUsers = (payload: any) => {
      console.log("📡 online_users payload:", payload);

      if (payload?.userType !== "admin") return;

      // ✅ backend sends: { userType: "admin", users: [31, 1] }
      const ids = (payload?.users || []).map(Number);
      setOnlineAdminIds(new Set(ids));

      console.log("✅ onlineAdminIds updated:", ids);
    };

    const onStatus = (data: StatusPayload) => {
      // realtime admin online/offline updates
      if (data.userType !== "admin") return;

      setOnlineAdminIds((prev) => {
        const next = new Set(prev);
        if (data.status === "online") next.add(Number(data.userId));
        else next.delete(Number(data.userId));
        return next;
      });
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("online_users", onOnlineUsers);
    s.on("user_status_change", onStatus);

    if (s.connected) onConnect();

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("online_users", onOnlineUsers);
      s.off("user_status_change", onStatus);
      // ❌ do not disconnect here (global provider)
    };
  }, [session?.user?.id]); // ok; token fallback handles null

  const value = useMemo(
    () => ({ socket: socketRef.current, connected, onlineAdminIds }),
    [connected, onlineAdminIds]
  );

  return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>;
};

export const useChatSocket = () => {
  const ctx = useContext(ChatSocketContext);
  if (!ctx) throw new Error("useChatSocket must be used within ChatSocketProvider");
  return ctx;
};
