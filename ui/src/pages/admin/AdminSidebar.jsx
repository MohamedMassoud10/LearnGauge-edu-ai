"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLogout } from "../../hooks/useLogout";
import {
  Users,
  BookOpen,
  BarChart2,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "react-feather";
import { useAuthContext } from "../../hooks/useAuthContext";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { path: "/admin", icon: <Home size={20} />, label: "Dashboard" },
    {
      path: "/admin/users",
      icon: <Users size={20} />,
      label: "Users Management",
    },
    { path: "/admin/courses", icon: <BookOpen size={20} />, label: "Courses" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className={`bg-gradient-to-br from-blue-700 to-indigo-900 text-white h-full flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white border-opacity-20 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <User size={20} className="text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="text-xs text-blue-100 opacity-80">
                {user?.data?.name || "Admin"}
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto bg-white bg-opacity-20 p-2 rounded-full">
            <User size={20} className="text-white" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="px-2 space-y-1">
          {menuItems.map((item) => (
            <li key={item.path} className="relative group">
              <Link
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-white bg-opacity-20 text-white"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <span className={`${collapsed ? "mx-auto" : "mr-3"}`}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>

              {/* Tooltip that appears on hover when sidebar is collapsed */}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {item.label}
                  {/* Triangle pointer */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-solid border-transparent border-r-gray-900 border-4"></div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white border-opacity-20">
        <div className="relative group">
          <button
            onClick={logout}
            className={`flex items-center w-full px-3 py-3 rounded-lg text-blue-100 hover:bg-white hover:bg-opacity-10 transition-all duration-200 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut size={20} className={collapsed ? "mx-auto" : "mr-3"} />
            {!collapsed && <span>Logout</span>}
          </button>

          {/* Tooltip for logout button when collapsed */}
          {collapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              Logout
              {/* Triangle pointer */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-solid border-transparent border-r-gray-900 border-4"></div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Button (Mobile) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-10">
        <button
          onClick={toggleSidebar}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
        >
          {collapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
