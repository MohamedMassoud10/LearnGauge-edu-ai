"use client";
import { useEffect, useState, useRef } from "react";
import {
  FaUserCircle,
  FaHome,
  FaChalkboardTeacher,
  FaBars,
  FaTimes,
  FaBell,
  FaLaptopCode,
} from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "./../hooks/useLogout";
import {
  useMyNotifications,
  useUpdateNotification,
} from "../hooks/useSendNotifications";
import NotificationsPanel from "./notifications/NotificationsPanel";
import { motion, AnimatePresence } from "framer-motion";
import ChatBot from "./chatBot/chatBot";

// Navigation items configuration
const NAV_ITEMS = [
  {
    path: "/",
    icon: <FaHome className="text-lg" />,
    label: "Home",
    role: "instructor",
  },
  {
    path: "/fer",
    icon: <FaChalkboardTeacher className="text-lg" />,
    label: "FER",
    role: "instructor",
  },
];

// Component for navigation links
const NavigationLink = ({ item, isActive, onClick }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
        isActive
          ? "text-blue-600 font-medium bg-blue-50"
          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
      }`
    }
    onClick={onClick}
  >
    {item.icon}
    <span>{item.label}</span>
  </NavLink>
);

export default function Header() {
  // Auth state
  const { user } = useAuthContext();
  const token = user?.token;
  const userRole = user?.data?.role;
  const { logout, isLoading } = useLogout();

  // UI state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);

  // Notifications state
  const { data: notificationsResponse, Loading: notificationsLoading } =
    useMyNotifications();
  const updateNotificationMutation = useUpdateNotification();
  const previousNotificationsRef = useRef([]);
  const notificationAudioRef = useRef(null);

  // Extract notifications from the response structure
  const notifications = notificationsResponse?.data?.notifications || [];
  const unreadCount = notifications.filter((notif) => !notif.read).length || 0;

  // Handlers
  const handleLogout = () => logout();

  const markAsRead = (id) => {
    updateNotificationMutation.mutate({
      id,
      updatedData: { read: true },
      token,
    });
  };

  const markAllAsRead = () => {
    if (unreadCount === 0) return;
    updateNotificationMutation.mutate({
      id: "all", // Special identifier for marking all as read
      updatedData: { read: true },
      token,
    });
  };

  const playNotificationSound = () => {
    if (notificationAudioRef.current) {
      notificationAudioRef.current.play().catch((err) => {
        console.error("Failed to play notification sound:", err);
      });
    }
  };

  // Effects

  // Detect new notifications and play sound
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    // Initialize ref if it's the first load
    if (previousNotificationsRef.current.length === 0) {
      previousNotificationsRef.current = [...notifications];
      return;
    }

    const previousIds = new Set(
      previousNotificationsRef.current.map((n) => n._id)
    );

    const hasNewNotifications = notifications.some(
      (notification) => !previousIds.has(notification._id) && !notification.read
    );

    if (hasNewNotifications) {
      playNotificationSound();
    }

    previousNotificationsRef.current = [...notifications];
  }, [notifications]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isNotificationsOpen &&
        !event.target.closest(".notifications-container")
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationsOpen]);

  // Filter navigation items based on user role
  const filteredNavItems = NAV_ITEMS.filter(
    (item) => item.role === "all" || item.role === userRole
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 px-4 sm:px-6 py-3">
        {/* Hidden audio element for notification sound */}
        <audio ref={notificationAudioRef} preload="auto">
          <source src="/notification-sound.mp3" type="audio/mpeg" />
          {/* Fallback sound URL */}
          <source
            src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
            type="audio/mpeg"
          />
        </audio>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <div className="flex items-center">
              <div className="w-26 h-14 relative overflow-hidden">
                <img
                  src="/images/logo.png"
                  alt="LearnGauge Logo"
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-lg flex-grow justify-center">
            {filteredNavItems.map((item) => (
              <NavigationLink key={item.path} item={item} />
            ))}
          </nav>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 py-3 px-4 space-y-2">
              {filteredNavItems.map((item) => (
                <NavigationLink
                  key={item.path}
                  item={item}
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}
            </div>
          )}

          {/* Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative notifications-container">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200 ${
                  isNotificationsOpen
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                title="Notifications"
                aria-label={`Notifications ${
                  unreadCount > 0 ? `(${unreadCount} unread)` : ""
                }`}
              >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <NotificationsPanel
                  notifications={notifications}
                  loading={notificationsLoading}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                />
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200 ${
                  isProfileOpen
                    ? "bg-blue-600 text-white"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md hover:scale-105"
                }`}
                title="Profile"
                aria-label="Profile menu"
              >
                <FaUserCircle className="text-2xl" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                  <NavLink
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Your Profile
                  </NavLink>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CS Support Button - Fixed at bottom of screen with higher z-index */}
      <motion.div
        className="fixed bottom-6 right-6 z-[9999]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
      >
        <motion.button
          onClick={() => setIsSupportChatOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white p-4 rounded-full shadow-lg flex items-center justify-center group transition-all duration-300"
          whileHover={{
            scale: 1.05,
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
          whileTap={{ scale: 0.95 }}
          title="CS Support - Get help with programming, algorithms, and projects"
        >
          <FaLaptopCode className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out whitespace-nowrap">
            CS Support
          </span>
        </motion.button>
      </motion.div>

      {/* Support Chat Modal */}
      <AnimatePresence>
        {isSupportChatOpen && (
          <ChatBot
            isOpen={isSupportChatOpen}
            onClose={() => setIsSupportChatOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
