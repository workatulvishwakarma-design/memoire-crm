"use client";

import React, { useState } from "react";
import { useStore, ContentPost } from "@/lib/store";
import { exportToCSV } from "@/lib/export";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { ActionMenu } from "@/components/ui/action-menu";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Share2,
  Video,
  Globe,
  MessageSquare,
  CheckCircle2,
  Image as ImageIcon,
  Film,
  Sparkles,
} from "lucide-react";

export interface ExtendedContentPost extends ContentPost {
  contentType?: "Static Post" | "Reel" | "Story" | "Carousel";
}

const INITIAL_EXTENDED_POSTS: ExtendedContentPost[] = [];

export default function ContentCalendarPage() {
  const { contentPosts: posts, addContentPost, updateContentPost, deleteContentPost, clients } = useStore();

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedContentType, setSelectedContentType] = useState<string>("ALL");

  // Month Navigation (August 2026 default)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 0-indexed (7 = August)

  // Modals & Detail State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ExtendedContentPost | null>(null);
  const [editingPost, setEditingPost] = useState<ExtendedContentPost | null>(null);

  // Form State
  const [clientName, setClientName] = useState(clients[0]?.companyName || "UrbanNest Realty");
  const [platform, setPlatform] = useState<any>("Instagram");
  const [contentType, setContentType] = useState<any>("Static Post");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [creativeUrl, setCreativeUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80");
  const [scheduledDate, setScheduledDate] = useState("2026-08-25 18:00");
  const [hashtags, setHashtags] = useState("#MemoireCreative #BrandGrowth");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calendar Day Calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Filtered Posts
  const filteredPosts = posts.filter((p) => {
    const matchesBrand = selectedBrand === "ALL" || p.clientName === selectedBrand;
    const matchesType = selectedContentType === "ALL" || (p.contentType || "Static Post") === selectedContentType;
    return matchesBrand && matchesType;
  });

  const openCreateModal = (prefillDate?: string) => {
    setEditingPost(null);
    setTitle("");
    setCaption("");
    if (prefillDate) {
      setScheduledDate(`${prefillDate} 18:00`);
    }
    setModalOpen(true);
  };

  const openEditModal = (post: ExtendedContentPost) => {
    setEditingPost(post);
    setClientName(post.clientName);
    setPlatform(post.platform);
    setContentType(post.contentType || "Static Post");
    setTitle(post.title);
    setCaption(post.caption);
    setCreativeUrl(post.creativeUrl);
    setScheduledDate(post.scheduledDate);
    setHashtags(post.hashtags);
    setSelectedPost(null);
    setModalOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (editingPost) {
      updateContentPost(editingPost.id, {
        clientName,
        platform,
        contentType,
        title,
        caption,
        creativeUrl,
        scheduledDate,
        hashtags,
      });
    } else {
      addContentPost({
        clientName,
        platform,
        contentType,
        title,
        caption,
        creativeUrl,
        scheduledDate,
        status: "CLIENT_REVIEW",
        hashtags,
      });
    }
    setModalOpen(false);
  };

  const updatePostStatus = (id: string, status: ExtendedContentPost["status"]) => {
    updateContentPost(id, { status });
    if (selectedPost && selectedPost.id === id) {
      setSelectedPost({ ...selectedPost, status });
    }
  };

  const deletePost = (id: string) => {
    deleteContentPost(id);
    setSelectedPost(null);
  };

  const exportMonthlyCalendar = () => {
    const exportData = filteredPosts.map((p) => ({
      Brand: p.clientName,
      Platform: p.platform,
      ContentType: p.contentType || "Static Post",
      Title: p.title,
      ScheduledDate: p.scheduledDate,
      Status: p.status,
      Caption: p.caption,
      Hashtags: p.hashtags,
    }));
    exportToCSV(`Memoire_Content_Calendar_${monthNames[currentMonth]}_${currentYear}`, exportData);
  };

  const getTypeBadgeStyle = (type?: string) => {
    switch (type) {
      case "Reel": return "bg-pink-100 text-pink-700 border-pink-200";
      case "Story": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Carousel": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-indigo-100 text-indigo-700 border-indigo-200";
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarIcon className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Social Media Operations</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Interactive Content Calendar — {monthNames[currentMonth]} {currentYear}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Scheduled client creatives, Reels, Stories, Carousels, and approval workflows.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={exportMonthlyCalendar}>
              <Download className="w-4 h-4" /> Export Calendar
            </Button>
            <Button size="sm" onClick={() => openCreateModal()}>
              <Plus className="w-4 h-4" /> Schedule Post
            </Button>
          </div>
        </div>

        {/* Brand Name Pills Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter By Client Brand</span>
            <span className="text-xs font-bold text-[#F26722]">{filteredPosts.length} Scheduled Posts</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedBrand("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBrand === "ALL"
                  ? "bg-[#F26722] text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Brands ({posts.length})
            </button>
            {clients.map((client) => {
              const brandPostsCount = posts.filter((p) => p.clientName === client.companyName).length;
              const isSelected = selectedBrand === client.companyName;

              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedBrand(client.companyName)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#F26722] text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{client.companyName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                    {brandPostsCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content Type Filter Pills */}
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs">
            <span className="font-bold text-gray-400 mr-2">Format:</span>
            {["ALL", "Static Post", "Reel", "Story", "Carousel"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedContentType(type)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedContentType === type
                    ? "bg-slate-900 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {type === "ALL" ? "All Formats" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Month Navigation & Grid */}
        <Card className="overflow-hidden">
          {/* Calendar Header */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base font-bold text-gray-900">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCurrentMonth(7); // August
                setCurrentYear(2026);
              }}
            >
              Today (August 2026)
            </Button>
          </div>

          {/* 7 Days of Week Header */}
          <div className="grid grid-cols-7 bg-gray-100/80 text-center font-bold text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2.5">
                {day}
              </div>
            ))}
          </div>

          {/* Monthly Calendar Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px">
            {/* Empty Offset Cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`offset-${idx}`} className="bg-gray-50/50 min-h-[120px] p-2" />
            ))}

            {/* Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

              // Posts scheduled on this specific date
              const dayPosts = filteredPosts.filter((p) => p.scheduledDate.startsWith(dateString));

              return (
                <div
                  key={dayNum}
                  onClick={(e) => {
                    // Open create modal for this day if clicked on empty cell
                    if (e.target === e.currentTarget) {
                      openCreateModal(dateString);
                    }
                  }}
                  className="bg-white min-h-[120px] p-2 hover:bg-gray-50/80 transition-colors flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-[#F26722]">
                      {dayNum}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] font-extrabold text-[#F26722] bg-orange-50 px-1.5 py-0.2 rounded-full">
                        {dayPosts.length}
                      </span>
                    )}
                  </div>

                  {/* Scheduled Posts Badges */}
                  <div className="space-y-1.5 mt-1.5 flex-1">
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(post);
                        }}
                        className={`p-1.5 rounded-lg border text-[11px] font-medium leading-tight shadow-2xs transition-all hover:scale-[1.02] cursor-pointer ${getTypeBadgeStyle(
                          post.contentType
                        )}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold truncate">{post.clientName}</span>
                          <span className="text-[9px] uppercase font-extrabold">{post.platform}</span>
                        </div>
                        <p className="text-[10px] truncate opacity-90 mt-0.5">{post.title}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateModal(dateString);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-gray-400 hover:text-[#F26722] text-center pt-1 transition-opacity cursor-pointer"
                  >
                    + Schedule
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Post Detail & Approval Modal */}
        {selectedPost && (
          <Modal
            isOpen={!!selectedPost}
            onClose={() => setSelectedPost(null)}
            title={selectedPost.title}
            description={`${selectedPost.clientName} • ${selectedPost.platform} (${selectedPost.contentType || "Static Post"})`}
          >
            <div className="space-y-4">
              <div className="h-56 relative rounded-2xl overflow-hidden bg-gray-900">
                <img src={selectedPost.creativeUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold">
                  {selectedPost.platform} • {selectedPost.contentType || "Static Post"}
                </div>
                <div className="absolute top-3 right-3">
                  <Badge status={selectedPost.status} />
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-[#F26722]">{selectedPost.clientName}</span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{selectedPost.title}</h3>
                <p className="text-xs text-gray-600 mt-2 whitespace-pre-line leading-relaxed">{selectedPost.caption}</p>
                <p className="text-xs font-mono text-gray-400 mt-2">{selectedPost.hashtags}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Scheduled: {selectedPost.scheduledDate}</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(selectedPost)}>
                    Edit Post
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deletePost(selectedPost.id)} className="text-rose-600 border-rose-200">
                    Delete
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updatePostStatus(selectedPost.id, "APPROVED")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Post
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updatePostStatus(selectedPost.id, "REVISION")}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Request Revision
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Schedule / Edit Post Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingPost ? "Edit Social Content Post" : "Schedule Content Post"}
          description="Select brand, posting format, creative asset, and scheduled date"
        >
          <form onSubmit={handleSavePost} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select label="Client Brand" value={clientName} onChange={(e) => setClientName(e.target.value)} options={clients.map((c) => ({ label: c.companyName, value: c.companyName }))} />
              <Select
                label="Platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                options={[
                  { label: "Instagram", value: "Instagram" },
                  { label: "Facebook", value: "Facebook" },
                  { label: "LinkedIn", value: "LinkedIn" },
                  { label: "YouTube", value: "YouTube" },
                  { label: "X / Twitter", value: "X" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Content Format"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as any)}
                options={[
                  { label: "Static Post", value: "Static Post" },
                  { label: "Reel / Video", value: "Reel" },
                  { label: "Story", value: "Story" },
                  { label: "Carousel", value: "Carousel" },
                ]}
              />
              <Input label="Scheduled Date & Time" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} required />
            </div>
            <Input label="Post Title" placeholder="e.g. Kharghar Tower A Launch Reel" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="Caption Text" placeholder="Write social caption..." value={caption} onChange={(e) => setCaption(e.target.value)} required />
            <Input label="Creative Image / Thumbnail URL" value={creativeUrl} onChange={(e) => setCreativeUrl(e.target.value)} required />
            <Input label="Hashtags" value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingPost ? "Save Post Changes" : "Schedule Content Post"}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
