"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "../ui/card";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { MessageSquare, Send, Hash, Lock, Pin, Paperclip, Users, Search } from "lucide-react";

export function InternalChat() {
  const { channels, messages, activeChannelId, setActiveChannelId, sendMessage } = useStore();
  const [inputMessage, setInputMessage] = useState("");

  const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const channelMessages = messages.filter((m) => m.channelId === activeChannelId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage("");
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col md:flex-row">
      {/* Left Sidebar: Channels & Conversations */}
      <div className="w-full md:w-64 border-r border-gray-200 bg-gray-50/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#F26722]" /> Internal Communication
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-2 mb-1.5">
              Agency Channels
            </p>
            <div className="space-y-1">
              {channels.map((ch) => {
                const isActive = ch.id === activeChannelId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#F26722] text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-200/60 hover:text-gray-900"
                    }`}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 opacity-70" />
                      {ch.name.replace("# ", "")}
                    </span>
                    {ch.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#F26722]">
                        {ch.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Center: Active Chat Stream */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div>
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#F26722]" /> {currentChannel?.name}
            </h3>
            {currentChannel?.description && (
              <p className="text-xs text-gray-500 mt-0.5">{currentChannel.description}</p>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {channelMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 group">
              <Avatar name={msg.senderName} src={msg.senderAvatar} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-gray-900">{msg.senderName}</span>
                  <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                  {msg.isPinned && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-extrabold flex items-center gap-0.5">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                </div>
                <div className="mt-1 p-3 rounded-2xl bg-gray-100/80 text-xs text-gray-800 leading-relaxed max-w-xl inline-block">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex items-center gap-2 bg-white">
          <button type="button" className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            placeholder={`Message ${currentChannel?.name}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-gray-100/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F26722]"
          />
          <Button type="submit" size="sm" className="bg-[#F26722] hover:bg-[#D95514]">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
