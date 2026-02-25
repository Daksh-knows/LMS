"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DotLottieReact, DotLottie } from '@lottiefiles/dotlottie-react';
import NotificationDropdown from './NotificationDropdown';

function NotificationButton() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Derive hasUnread from the notifications array
  // This plays the animation if there is at least one unread notification
  const hasUnread = useMemo(() => {
    return notifications.some((n) => !n.isRead);
  }, [notifications]);

  // If you want it to play simply if any notifications exist at all, use:
  // const hasNotifications = notifications.length > 0;

  const dotLottieRefCallback = useCallback((instance: DotLottie) => {
    setDotLottie(instance);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Optional: Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Control animation based on the derived unread status
  useEffect(() => {
    if (!dotLottie) return;

    if (hasUnread) {
      dotLottie.play();
    } else {
      dotLottie.pause();
      dotLottie.setFrame(0); 
    }
  }, [hasUnread, dotLottie]);

  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative rounded-full theme-transition bg-(--sidebar-nav-bg-hover) text-(--text-color) hover:opacity-80 transition-opacity flex items-center justify-center"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12">
          <DotLottieReact
            src="/icons/Notification.lottie"
            dotLottieRefCallback={dotLottieRefCallback}
            loop
            autoplay={hasUnread}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#FABD23] rounded-full border-2 border-(--sidebar-nav-bg-hover) z-10"></span>
        )}
      </button>
      
      {showNotifications && (
        <NotificationDropdown 
          notifications={notifications} // Pass data to dropdown
          onClose={() => setShowNotifications(false)} 
          refresh={fetchNotifications} // Pass refresh function to call after marking as read
          setNotifications={setNotifications}
          setLoading={setLoading}
        />
      )}
    </div>
  );
}

export default NotificationButton;