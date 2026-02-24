"use client";

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCircle2, Circle, Loader2, BookOpen, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string, url?: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    await fetch("/api/notifications", {
      method: "DELETE", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });

    if (url) {
      onClose();
      router.push(url);
    }
  };

  const deleteAllNotifications = async () => {
    setNotifications([]); 
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteAll: true }),
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Function to return an icon based on LMS notification type
  const getIcon = (type: string) => {
    switch (type) {
      case "COURSE_UPDATE": return <BookOpen size={16} className="text-blue-500" />;
      case "SYSTEM": return <AlertCircle size={16} className="text-orange-500" />;
      default: return <Circle size={16} className="text-gray-400" />;
    }
  };

  return (
    <>
      {/* Invisible overlay to close dropdown when clicking outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      <div className="absolute right-0 sm:-right-4 mt-3 w-80 sm:w-96 bg-[var(--background)] border border-[var(--banner-border)] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--banner-border)] flex items-center justify-between bg-[var(--start-background)]">
          <h3 className="font-semibold text-[var(--text-color)]">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={deleteAllNotifications}
              className="text-xs text-[var(--colored-text)] hover:underline flex items-center gap-1"
            >
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-[var(--colored-text)]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              You're all caught up!
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => deleteNotification(notification.id, notification.actionUrl)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors flex gap-3 items-start ${
                    notification.isRead
                      ? "hover:bg-[var(--sidebar-nav-bg-hover)] opacity-70"
                      : "bg-[var(--start-background)] hover:brightness-95"
                  }`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.isRead ? "font-medium" : "font-bold"} text-[var(--text-color)] truncate`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--colored-text)]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}