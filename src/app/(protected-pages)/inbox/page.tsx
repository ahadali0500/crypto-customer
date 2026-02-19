"use client"

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import axios from "axios";
import { Button, Input, Badge } from "@/components/ui";
import {
  Send, Search, ArrowLeft, Paperclip, MessageCircle, Users, Inbox,
  CheckCheck, Check, AlertCircle, Loader
} from "lucide-react";
import { useSessionContext } from "@/components/auth/AuthProvider/SessionContext";
import { Socket } from "socket.io-client";
import { useChatSocket } from "@/contexts/ChatSocketContext";



// --------------------------------------------------
// Helper Types
// --------------------------------------------------
interface ApiUser {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  status?: "online" | "offline" | "away";
}

interface ApiMessage {
  id: number;
  message: string | null;
  file: string | null;
  fromCustomerId: number | null;
  fromAdminId: number | null;
  createdAt: string;
  seen?: string;
  readAt?: string;
}

interface User extends ApiUser {
  status: "online" | "offline" | "away";
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: Date;
  messages: Message[];
  isTyping?: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "admin";
  file?: string | null;
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read" | "pending";
  readAt?: Date;
  deliveredAt?: Date;
}

// --------------------------------------------------
// Toast Notification Component
// --------------------------------------------------
const Toast = ({ message, type = "success", duration = 3000 }: {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500"
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50`}>
      {message}
    </div>
  );
};

// --------------------------------------------------
// Typing Indicator Component
// --------------------------------------------------
const TypingIndicator = ({ userName }: { userName: string }) => (
  <div className="flex items-center space-x-2 text-sm text-gray-500">
    <span>{userName} is typing</span>
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
    </div>
  </div>
);

// --------------------------------------------------
// Message Status Indicator
// --------------------------------------------------
const MessageStatus = ({ status }: { status?: string }) => {
  switch (status) {
    case "sending":
      return <Loader className="h-4 w-4 text-gray-400 animate-spin" />;
    case "sent":
      return <Check className="h-4 w-4 text-gray-400" />;
    case "delivered":
      return <CheckCheck className="h-4 w-4 text-gray-400" />;
    case "read":
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    default:
      return null;
  }
};

// --------------------------------------------------
// Skeleton Components
// --------------------------------------------------
const UserSkeleton = () => (
  <div className="p-4 border-b border-gray-300 dark:border-gray-700 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const MessageSkeleton = ({ isOwn }: { isOwn: boolean }) => (
  <div className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-pulse`}>
    <div className={`${isOwn ? "bg-blue-200 dark:bg-blue-900" : "bg-gray-200 dark:bg-gray-800"} rounded-lg px-4 py-2 max-w-xs`}>
      <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-32"></div>
    </div>
  </div>
);

// --------------------------------------------------
// Empty State Components
// --------------------------------------------------
const EmptyUsersList = () => (
  <div className="flex flex-col items-center justify-center h-64 p-8">
    <Users className="h-16 w-16 text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No conversations</h3>
    <p className="text-sm text-gray-500 text-center">Start a conversation to begin messaging</p>
  </div>
);

const EmptyMessages = () => (
  <div className="flex flex-col items-center justify-center h-full p-8">
    <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No messages</h3>
    <p className="text-sm text-gray-500 text-center">Send a message to start the conversation</p>
  </div>
);

const SelectUserPrompt = () => (
  <div className="flex flex-col items-center justify-center h-full p-8">
    <Inbox className="h-20 w-20 text-gray-400 mb-4" />
    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Select a conversation</h3>
    <p className="text-sm text-gray-500 text-center">Choose a conversation to start messaging</p>
  </div>
);

// --------------------------------------------------
// Axios instance
// --------------------------------------------------
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "",
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// --------------------------------------------------
// Main Chat Component
// --------------------------------------------------
export default function ChatApp() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [messageOffset, setMessageOffset] = useState(0);

  const { session } = useSessionContext()
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
const { socket, onlineAdminIds } = useChatSocket();
  // Show toast notification
  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedUser?.messages, scrollToBottom]);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const { data } = await api.get("/user/chat/list");
        
        
       const mapped: User[] = data.admins.map((u: any) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatar: u.profileImageUrl ?? u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2),


  status: onlineAdminIds.has(u.id) ? "online" : "offline",

  unreadCount: u._count?.sentChats || 0,
  lastMessage: u.lastChat?.message ?? (u.lastChat?.file ? "📎 File attachment" : "No messages yet"),
  lastMessageTime: new Date(u.lastChat?.createdAt || Date.now()),
  messages: [],
  isTyping: false,
}));

setUsers(mapped);


        setUsers(mapped);
        showToast("Conversations loaded", "success");
      } catch (err) {
        console.error("Fetch users failed", err);
        showToast("Failed to load conversations", "error");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [showToast,onlineAdminIds]);

  // Fetch messages when user selected
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const formData = new FormData();
        formData.append("adminId", selectedUser.id.toString());
        formData.append("limit", "50");
        formData.append("offset", messageOffset.toString());

        const { data } = await api.post("/user/chat/fetch", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const mapped: Message[] = data.data.map((m: ApiMessage) => ({
          id: m.id,
          text: m.message ?? "",
          file: m.file,
          sender: m.fromAdminId ? "admin" : "user",
          timestamp: new Date(m.createdAt),
          status: m.seen === "yes" ? "read" : "delivered",
          readAt: m.readAt ? new Date(m.readAt) : undefined,
        }));

        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, messages: mapped } : u)),
        );

        setSelectedUser((prev) =>
          prev ? { ...prev, messages: mapped } : null
        );
      } catch (err) {
        console.error("Fetch messages failed", err);
        showToast("Failed to load messages", "error");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedUser?.id, messageOffset, showToast]);

  // Format time
  const formatTime = (date: Date) =>
    date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  // Send message
  const sendMessage = async () => {
    if (!selectedUser) return;
    if (!newMessage.trim() && !newFile) return;
    if (isSendingMessage) return;

    const form = new FormData();
    form.append("receiverId", String(selectedUser.id));
    form.append("type", newFile ? "File" : "Text");
    if (newMessage.trim()) form.append("message", newMessage);
    if (newFile) form.append("file", newFile);

    setIsSendingMessage(true);

    // Add optimistic message
    const optimisticMsg: Message = {
      id: Date.now(),
      text: newMessage,
      sender: "admin",
      file: newFile ? URL.createObjectURL(newFile) : null,
      timestamp: new Date(),
      status: "sending",
    };

    setSelectedUser((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimisticMsg] } : null
    );

    try {
      const { data } = await api.post("/user/chat/send", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const payload: ApiMessage = data.chat;
      const msg: Message = {
        id: payload.id,
        text: payload.message ?? "",
        file: payload.file,
        sender: "admin",
        timestamp: new Date(payload.createdAt),
        status: "delivered",
      };

      // Update with real message
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
              ...u,
              lastMessage: payload?.message ?? (payload?.file ? "📎 File" : "No messages"),
              messages: u.messages.map(m => m.id === optimisticMsg.id ? msg : m)
            }
            : u
        ),
      );

      setSelectedUser((prev) =>
        prev
          ? {
            ...prev,
            messages: prev.messages.map(m => m.id === optimisticMsg.id ? msg : m)
          }
          : null
      );

      setNewMessage("");
      setNewFile(null);
      showToast("Message sent", "success");



      // Stop typing indicator
      if (socket.connected) {
        socket.emit("user_typing", {
          room: `chat-room-customer-${session!.user!.id}-to-${selectedUser.id}`,
          typingStatus: false,
        });
      }

    } catch (err) {
      console.error("Send message failed", err);
      showToast("Failed to send message", "error");

      // Remove optimistic message on error
      setSelectedUser((prev) =>
        prev
          ? { ...prev, messages: prev.messages.filter(m => m.id !== optimisticMsg.id) }
          : null
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showToast("File too large (max 10MB)", "error");
        return;
      }
      setNewFile(file);
      showToast(`File selected: ${file.name}`, "info");
    }
  };

  // Handle typing
  const handleTyping = useCallback((value: string) => {
    setNewMessage(value);

    if (!selectedUser || !socket?.connected) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing indicator
    socket.emit("user_typing", {
      room: `chat-room-customer-${session!.user!.id}-to-${selectedUser.id}`,
      typingStatus: value.length > 0,
    });

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (socket?.connected) {
        socket.emit("user_typing", {
          room: `chat-room-customer-${session!.user!.id}-to-${selectedUser.id}`,
          typingStatus: false,
        });
      }
    }, 2000);
  }, [selectedUser, session]);

  // Filtered users
  const filteredUsers = useMemo(
    () => users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [users, searchQuery],
  );

  const showEmptySearch = searchQuery.trim() && filteredUsers.length === 0;

  // Socket setup
  
useEffect(() => {
  if (!socket || !session?.user?.id) return;

  
  socket.emit("user_online", { userId: session.user.id, userType: "customer" });

  const handleStatus = (data: any) => {
    if (data.userType !== "admin") return;

    setUsers((prev) =>
      prev.map((u) => (u.id === data.userId ? { ...u, status: data.status } : u))
    );

    setSelectedUser((prev) => {
      if (!prev || prev.id !== data.userId) return prev;
      return { ...prev, status: data.status };
    });
  };

  socket.on("user_status_change", handleStatus);

  return () => {
    socket.off("user_status_change", handleStatus);
  };
}, [socket, session?.user?.id]);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="flex h-[82vh] max-h-[82vh] bg-white dark:bg-[#18212F]">
      {toast && <Toast {...toast} />}

      {/* Sidebar */}
      <div className={`${showChat ? "hidden" : "flex"} md:flex bg-white dark:bg-[#18212F] w-full md:w-80 border-r border-gray-200 dark:border-gray-800 flex-col h-full`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h1 className="text-xl font-bold mb-4 dark:text-white">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 dark:bg-[#18212F] dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingUsers ? (
            <>{[...Array(5)].map((_, i) => <UserSkeleton key={i} />)}</>
          ) : showEmptySearch ? (
            <EmptyUsersList />
          ) : filteredUsers.length === 0 ? (
            <EmptyUsersList />
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  if (selectedUser?.id) {
                    socket?.emit(
                      "leave_room",
                      `chat-room-customer-${session!.user!.id}-to-${selectedUser.id}`
                    );
                  }
                  const room = `chat-room-customer-${session!.user!.id}-to-${user.id}`;
                  socket?.emit("join_room", {
                    room,
                    adminId: session!.user!.id,
                    CustomerId: user.id,
                    type: "customer",
                  });

                  setUsers((prev) =>
                    prev.map((u) =>
                      u.id === user.id ? { ...u, unreadCount: 0 } : u
                    ),
                  );

                  if (window.innerWidth < 768) {
                    setShowChat(true);
                  }
                }}
                className={`p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:bg-[#18212F] transition-colors ${selectedUser?.id === user.id ? "bg-blue-50 dark:bg-[#18212F]" : ""
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.avatar}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${user.status === "online" ? "bg-green-500" : "bg-gray-400"
                        }`}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold dark:text-white truncate">{user.name}</h3>
                      {user.lastMessageTime && (
                        <span className="text-xs text-gray-500 ml-2">{formatTime(user.lastMessageTime)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {user.isTyping ? (
                        <TypingIndicator userName={user.name.split(" ")[0]} />
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {user.lastMessage || "No messages"}
                        </p>
                      )}
                      {user.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center ml-2">
                          {user.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Pane */}
      <div className={`${showChat ? "flex" : "hidden"} md:flex flex-1 flex-col h-full`}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="bg-white dark:bg-[#18212F] border-b border-gray-200 dark:border-gray-600 px-4 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <Button
                  className="md:hidden"
                  onClick={() => setShowChat(false)}
                  variant="ghost"
                  size="sm"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {selectedUser.avatar}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${selectedUser.status === "online" ? "bg-green-500" : "bg-gray-400"
                      }`}
                  ></div>
                </div>
                <div>
                  <h2 className="font-semibold dark:text-white">{selectedUser.name}</h2>
                  <p className="text-xs text-gray-500 capitalize">
                    {selectedUser.status === "online" ? "🟢 Online" : "🔴 Offline"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#18212F]">
              {isLoadingMessages ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <MessageSkeleton key={i} isOwn={i % 2 === 0} />
                  ))}
                </div>
              ) : selectedUser.messages.length === 0 ? (
                <EmptyMessages />
              ) : (
                <>
                  {selectedUser.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs sm:max-w-md rounded-lg px-4 py-2 flex items-end space-x-2 ${m.sender === "admin"
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white dark:bg-[#18212F] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-none"
                          }`}
                      >
                        <div className="flex-1">
                          {m.text && <p className="text-sm leading-relaxed break-words">{m.text}</p>}
                          {m.file && (
                            <a
                              href={m.file}
                              target="_blank"
                              rel="noreferrer"
                              className={`text-sm underline hover:opacity-80 transition-opacity ${m.sender === "admin" ? "text-blue-100" : "text-blue-600"
                                }`}
                            >
                              📎 Download file
                            </a>
                          )}
                          <span
                            className={`text-xs ${m.sender === "admin" ? "text-blue-100" : "text-gray-500"
                              } mt-1 block`}
                          >
                            {formatTime(m.timestamp)}
                          </span>
                        </div>
                        {m.sender === "admin" && <MessageStatus status={m.status} />}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {selectedUser.isTyping && (
                    <div className="flex justify-start">
                      <TypingIndicator userName={selectedUser.name.split(" ")[0]} />
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-[#18212F] border-t border-gray-200 dark:border-gray-600 p-3 flex flex-col gap-2 flex-shrink-0">
              {newFile && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-sm flex items-center justify-between">
                  <span>📎 {newFile.name}</span>
                  <button
                    onClick={() => setNewFile(null)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <label htmlFor="fileInput" className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </label>
                <input
                  ref={fileInputRef}
                  id="fileInput"
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                />
                <Input
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 dark:bg-[#18212F] text-white"
                  disabled={isSendingMessage}
                />
                <Button
                  onClick={sendMessage}
                  className="rounded-full p-3"
                  disabled={isSendingMessage || (!newMessage.trim() && !newFile)}
                >
                  {isSendingMessage ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <SelectUserPrompt />
        )}
      </div>
    </div>
  );
}