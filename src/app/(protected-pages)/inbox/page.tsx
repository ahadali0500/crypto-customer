"use client"

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
// import { io, Socket } from "socket.io-client";
import { Button, Input, Badge } from "@/components/ui";
import { Send, Search, ArrowLeft, Paperclip, MessageCircle, Users, Inbox } from "lucide-react";
import { useSessionContext } from "@/components/auth/AuthProvider/SessionContext";
import { initchatSocket } from '@/configs/chat.socket'
import { Socket } from "socket.io-client";

// --------------------------------------------------
// Helper Types
// --------------------------------------------------
interface ApiUser {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
}

interface ApiMessage {
  id: number;
  message: string | null;
  file: string | null;
  fromCustomerId: number | null;
  fromAdminId: number | null;
  createdAt: string; // ISO string
}

interface User extends ApiUser {
  status: "online" | "offline" | "away";
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: Date;
  messages: Message[];
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "admin";
  file?: string | null;
  timestamp: Date;
}

// --------------------------------------------------
// Skeleton Components
// --------------------------------------------------
const UserSkeleton = () => (
  <div className="p-4 border-b border-gray-300 dark:border-gray-700 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
        </div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
      </div>
    </div>
  </div>
);

const MessageSkeleton = ({ isOwn }: { isOwn: boolean }) => (
  <div className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-pulse`}>
    <div className={`${isOwn ? "bg-gray-300 dark:bg-gray-700" : "bg-gray-200 dark:bg-gray-800"} rounded-lg px-4 py-2 max-w-xs sm:max-w-md`}>
      <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-full"></div>
      <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4 mt-1"></div>
    </div>
  </div>
);

// --------------------------------------------------
// Empty State Components
// --------------------------------------------------
const EmptyUsersList = () => (
  <div className="flex flex-col items-center justify-center h-64 p-8">
    <Users className="h-16 w-16 text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No conversations yet</h3>
    <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
      Start chatting with team members to see conversations here
    </p>
  </div>
);

const EmptyMessages = () => (
  <div className="flex flex-col items-center justify-center h-full p-8">
    <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No messages yet</h3>
    <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
      Send a message to start the conversation
    </p>
  </div>
);

const EmptySearchResults = () => (
  <div className="flex flex-col items-center justify-center h-32 p-8">
    <Search className="h-12 w-12 text-gray-400 mb-3" />
    <h3 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-1">No results found</h3>
    <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
      Try searching with different keywords
    </p>
  </div>
);

const SelectUserPrompt = () => (
  <div className="flex flex-col items-center justify-center h-full p-8">
    <Inbox className="h-20 w-20 text-gray-400 mb-4" />
    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Select a conversation</h3>
    <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
      Choose a conversation from the sidebar to start messaging
    </p>
  </div>
);

// --------------------------------------------------
// Axios instance with token
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
// Main Component
// --------------------------------------------------
export default function ChatApp() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(true); // For mobile - default open
  const { session } = useSessionContext()
  const socketRef = useRef<Socket | null>(null);

  // Loading states
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedUser?.messages]);

  // ----------------- Fetch Users Once -----------------
  useEffect(() => {
    async function fetchUsers() {
      setIsLoadingUsers(true);
      try {
        const { data } = await api.get("/user/chat/list");
        const mapped: User[] = data.admins.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.profileImageUrl ?? u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2),
          status: "online",
          unreadCount: u._count.sentChats,
          lastMessage: u.lastChat?.message ?? (u.lastChat?.file ? "📎 File attachment" : "No messages yet"),
          lastMessageTime: new Date(u.lastChat?.createdAt),
          messages: [],
        }));

        console.log(mapped);

        setUsers(mapped);
        // if (mapped.length) setSelectedUser(mapped[0]);
      } catch (err) {
        console.error("Fetch users failed", err);
      } finally {
        setIsLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);
  console.log(users);

  // ----------------- Fetch Messages -----------------
  useEffect(() => {
    if (!selectedUser) return;
    async function fetchMessages() {
      setIsLoadingMessages(true);
      try {
        // Use FormData instead of JSON
        const formData = new FormData();
        formData.append("adminId", selectedUser.id.toString());

        const { data } = await api.post("/user/chat/fetch", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const mapped: Message[] = data.data.map((m: ApiMessage) => ({
          id: m.id,
          text: m.message ?? "",
          file: m.file,
          sender: m.fromAdminId ? "admin" : "other",
          timestamp: new Date(m.createdAt),
        }));

        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, messages: mapped } : u)),
        );

        const updated = users.find((u) => u.id === selectedUser.id);

        setSelectedUser({ ...updated, messages: mapped });

      } catch (err) {
        console.error("Fetch messages failed", err);
      } finally {
        setIsLoadingMessages(false);
      }
    }
    fetchMessages();
  }, [selectedUser?.id]);

  // ----------------- Helpers -----------------
  const formatTime = (date: Date) =>
    date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });


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
      };

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, lastMessage: payload?.message ?? (payload?.file ? "📎 File attachment" : "No messages yet"), messages: [...u.messages, msg] } : u)),
      );
      setSelectedUser((prev) =>
        prev ? { ...prev, messages: [...prev.messages, msg] } : null
      );
      setNewMessage("");
      setNewFile(null);
    } catch (err) {
      console.error("Send message failed", err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewFile(e.target.files[0]);
    }
  };

  // ----------------- Derived -----------------
  const filteredUsers = useMemo(
    () => users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [users, searchQuery],
  );

  const showEmptySearch = searchQuery.trim() && filteredUsers.length === 0;


  useEffect(() => {
    if (!session?.user?.id) return;

    socketRef.current = initchatSocket(session.user.id);

    const handleNewMessage = (msg: any) => {
      console.log("📩", msg)
      const mapped: Message = {
        id: Number(msg.id),
        text: msg.message ?? "",
        file: msg.file,
        sender: msg.fromAdminId ? "user" : "admin",
        timestamp: new Date(msg.createdAt),
      };

      // Update users list
      setUsers((prevUsers) => {
        return prevUsers.map((u) => {
          const isMessageForThisUser = msg.fromAdminId === u.id || msg.toAdminId === u.id;

          if (isMessageForThisUser) {
            return {
              ...u,
              messages: [...u.messages, mapped],
              lastMessage: mapped.text || (mapped.file ? "📎 File attachment" : "No messages yet"),
              lastMessageTime: mapped.timestamp
            };
          }
          return u;
        });
      });

      // Update selected user if the message is for them
      setSelectedUser((prevSelected) => {
        if (!prevSelected) return null;

        const isMessageForSelected = msg.fromAdminId === prevSelected.id || msg.toAdminId === prevSelected.id;

        if (isMessageForSelected) {
          return {
            ...prevSelected,
            messages: [...prevSelected.messages, mapped]
          };
        }
        return prevSelected;
      });
    };

    const handleInactiveMessage = (msg: any) => {
      console.log("📩", msg)
      const mapped: Message = {
        id: Number(msg.id),
        text: msg.message ?? "",
        file: msg.file,
        sender: msg.fromAdminId ? "user" : "admin",
        timestamp: new Date(msg.createdAt),
      };

      // Update users list
      setUsers((prevUsers) => {
        return prevUsers.map((u) => {
          const isMessageForThisUser = msg.fromAdminId === u.id || msg.toAdminId === u.id;

          if (isMessageForThisUser) {
            return {
              ...u,
              messages: [...u.messages, mapped],
              lastMessage: mapped.text || (mapped.file ? "📎 File attachment" : "No messages yet"),
              lastMessageTime: mapped.timestamp,
              unreadCount: u.unreadCount + 1,
            };
          }
          return u;
        });
      });

    };

    socketRef.current.on("message", handleNewMessage);

    socketRef.current.on("inactiveMessage", handleInactiveMessage);

    return () => {
      socketRef.current?.off("message", handleNewMessage);
      socketRef.current?.off("inactiveMessage", handleInactiveMessage);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [session?.user?.id]);


  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="flex h-[82vh] max-h-[82vh]">
      {/* Sidebar */}
      <div className={`${showChat ? "hidden" : "flex"} md:flex bg-white dark:bg-gray-900 w-full md:w-80 border-r border-gray-300 dark:border-gray-700 flex-col h-full`}>
        <div className="p-4 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingUsers ? (
            // Loading skeleton
            <>
              {[...Array(5)].map((_, i) => (
                <UserSkeleton key={i} />
              ))}
            </>
          ) : showEmptySearch ? (
            <EmptySearchResults />
          ) : filteredUsers.length === 0 ? (
            <EmptyUsersList />
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  if (selectedUser?.id) {
                    socketRef.current.emit("leave_room", `chat-room-customer-${session!.user!.id}-to-${selectedUser.id}`);
                  }
                  const room = `chat-room-customer-${session!.user!.id}-to-${user.id}`;
                  socketRef.current.emit("join_room", { room, adminId: session.user.id, CustomerId: user.id, type: "customer" });

                  setUsers((prevUsers) => {
                    return prevUsers.map((u) => {
                      const isMessageForThisUser = user.id === u.id

                      if (isMessageForThisUser) {
                        return {
                          ...u,
                          unreadCount: 0,
                        };
                      }
                      return u;
                    });
                  });

                  // Only set showChat to true on mobile, keep it open on desktop
                  if (window.innerWidth < 768) {
                    setShowChat(true);
                  }
                }}
                className={`p-4 border-b border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${selectedUser?.id === user.id ? "bg-gray-200 dark:bg-gray-700" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.avatar}
                    </div>
                    {/* <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${user.status === 'online' ? 'bg-green-500' :
                      user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></div> */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                      {user.lastMessageTime && <span className="text-xs text-gray-500">{formatTime(user.lastMessageTime)}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.lastMessage || "No messages yet"}</p>
                      {user.unreadCount > 0 && (
                        <Badge className="bg-white dark:bg-gray-400 border-b border-gray-300 dark:border-gray-700  dark:text-gray-100 text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
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
            <div className="bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 px-4 py-4 flex items-center space-x-3 flex-shrink-0">
              <Button
                className="md:hidden"
                onClick={() => setShowChat(false)}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUser.avatar}
                </div>
                {/* <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${selectedUser.status === 'online' ? 'bg-green-500' :
                  selectedUser.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div> */}
              </div>
              <div>
                <h2 className="font-semibold">{selectedUser.name}</h2>
                {/* <p className="text-xs text-gray-500 capitalize">{selectedUser.status}</p> */}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {isLoadingMessages ? (
                // Loading skeleton for messages
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
                      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 max-w-xs sm:max-w-md relative">
                        {m.text && <p className="text-sm leading-relaxed">{m.text}</p>}
                        {m.file && (
                          <a
                            href={m.file}
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-sm hover:opacity-80 transition-opacity"
                          >
                            📎 Download file
                          </a>
                        )}
                        <span className={`text-xs ${m.sender === "user" ? "text-blue-100" : "text-gray-500"
                          } mt-1 block`}>
                          {formatTime(m.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 p-3 flex items-center space-x-2 flex-shrink-0">
              {newFile && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-sm">
                  📎 {newFile.name}
                  <button
                    onClick={() => setNewFile(null)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              )}
              <label htmlFor="fileInput" className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <Paperclip className="h-5 w-5 text-gray-500" />
              </label>
              <input id="fileInput" type="file" hidden onChange={handleFileSelect} />
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="flex-1"
                disabled={isSendingMessage}
              />
              <Button
                onClick={sendMessage}
                variant="solid"
                className="rounded-full p-3 transition-opacity"
                disabled={isSendingMessage || (!newMessage.trim() && !newFile)}
              >
                <Send className={`h-4 w-4 ${isSendingMessage ? 'animate-pulse' : ''}`} />
              </Button>
            </div>
          </>
        ) : (
          <SelectUserPrompt />
        )}
      </div>
    </div>
  );
}