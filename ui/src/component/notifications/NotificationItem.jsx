"use client";

import { IoCheckmarkDoneSharp } from "react-icons/io5";

// Format date to relative time (e.g., "2 hours ago")
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export default function NotificationItem({ notification, onMarkAsRead }) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <div
      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.read ? "bg-primary/10" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          {!notification.read && (
            <span className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
          )}
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 text-sm line-clamp-1">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-gray-500">
                {formatRelativeTime(notification.createdAt)}
              </span>
              <div className="flex items-center">
                {notification.read && (
                  <IoCheckmarkDoneSharp className="mr-1 text-primary text-sm" />
                )}
                <span className="text-xs font-medium text-gray-600">
                  {notification.createdBy?.name || "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
