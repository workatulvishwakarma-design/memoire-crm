"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { Calendar as CalendarIcon, Clock, Users, Plus, Video } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  time: string;
  client: string;
  type: string;
  link: string;
}

const DEFAULT_MEETINGS: Meeting[] = [];

export default function CalendarPage() {
  const { clients } = useStore();
  const [meetings, setMeetings] = useState<Meeting[]>(DEFAULT_MEETINGS);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState(clients[0]?.companyName || "Internal Agency Sync");
  const [type, setType] = useState("Client Meeting");
  const [time, setTime] = useState("03:00 PM");
  const [link, setLink] = useState("https://meet.google.com/memoire-sync");

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.length) {
          setMeetings(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newMeeting: Meeting = {
      id: `m-${Date.now()}`,
      title,
      client,
      type,
      time,
      link: link || "https://meet.google.com/memoire-sync",
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setModalOpen(false);
    setTitle("");

    try {
      await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMeeting),
      });
    } catch {}
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarIcon className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agency Calendar</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Meetings & Client Schedule</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Client pitches, campaign reviews, and internal team syncs.
            </p>
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> Schedule Meeting
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Upcoming Meetings Today</CardTitle>
              <CardDescription>Scheduled operational & client calls</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {meetings.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-900 text-sm">No meetings scheduled</p>
                <p className="text-xs text-gray-400 mt-0.5">Click Schedule Meeting to add a new client or team call.</p>
              </div>
            ) : (
              meetings.map((m) => (
                <div key={m.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{m.title}</span>
                      <Badge variant="orange">{m.type}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#F26722]" /> {m.time} • Client: <strong className="text-gray-800">{m.client}</strong>
                    </p>
                  </div>
                  <a href={m.link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">
                      <Video className="w-4 h-4 text-emerald-600" /> Join Call
                    </Button>
                  </a>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Schedule Meeting Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Schedule Client or Team Meeting"
          description="Create Google Meet sync in Memoire OS"
        >
          <form onSubmit={handleSchedule} className="space-y-4">
            <Input
              label="Meeting Title"
              placeholder="e.g. UrbanNest Tower A Campaign Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              {clients.length > 0 ? (
                <Select
                  label="Client / Partner"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  options={clients.map((c) => ({ label: c.companyName, value: c.companyName }))}
                />
              ) : (
                <Input
                  label="Client / Partner"
                  placeholder="e.g. Internal Agency Sync or Client Name"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  required
                />
              )}
              <Select
                label="Meeting Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { label: "Client Meeting", value: "Client Meeting" },
                  { label: "Design Review", value: "Design Review" },
                  { label: "Sales Pitch", value: "Sales Pitch" },
                  { label: "Internal Team Sync", value: "Internal" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Scheduled Time"
                placeholder="e.g. 03:30 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
              <Input
                label="Meeting Link"
                placeholder="https://meet.google.com/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm & Schedule</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
