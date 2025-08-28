import React from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useCourses } from "./../../hooks/useCourse";
import { useUsers } from "./../../hooks/useUsers";
import {
  Users,
  BookOpen,
  UserCheck,
  UserPlus,
  UserMinus,
  User,
} from "react-feather";

const Dashboard = () => {
  const { user } = useAuthContext();
  const { data: coursesArray } = useCourses();
  const { data: usersArray } = useUsers();
  const rolesEnum = ["manager", "student", "instructor", "admin"];
  const roleStats = rolesEnum.reduce((acc, role) => {
    acc[role] =
      usersArray?.data?.data?.filter((u) => u.role === role).length || 0;
    return acc;
  }, {});
  const stats = [
    {
      title: "Total Users",
      value: usersArray?.data?.data?.length || 0,
      icon: <Users size={20} />,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Courses",
      value: coursesArray?.data?.data?.length || 0,
      icon: <BookOpen size={20} />,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    ...rolesEnum.map((role) => ({
      title: `${role.charAt(0).toUpperCase() + role.slice(1)}s`,
      value: roleStats[role],
      icon:
        role === "manager" ? (
          <UserCheck size={20} />
        ) : role === "student" ? (
          <UserPlus size={20} />
        ) : role === "instructor" ? (
          <UserMinus size={20} />
        ) : (
          <User size={20} />
        ),
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
    })),
  ];

  return (
    <div>
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-xl p-6 text-white mb-8">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user?.data?.name}!
        </h2>
        <p className="opacity-90 mb-4">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div
                className={`${stat.bgColor} p-3 rounded-full ${stat.textColor}`}
              >
                {stat.icon}
              </div>
            </div>
            <h3 className="text-gray-500 text-sm">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: "Add User",
              icon: <Users size={20} />,
              color: "bg-blue-100 text-blue-600",
            },
            {
              title: "New Course",
              icon: <BookOpen size={20} />,
              color: "bg-green-100 text-green-600",
            },
          ].map((action, index) => (
            <button
              key={index}
              className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 flex flex-col items-center"
            >
              <div className={`${action.color} p-3 rounded-full mb-2`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {action.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
