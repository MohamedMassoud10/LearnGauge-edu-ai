"use client";

import { useState } from "react";
import { UserPlus, Users as UsersIcon } from "react-feather";
import { useUsers } from "../../../hooks/useUsers";
import UsersList from "../../../component/admin/users/UsersList";
import UserModal from "../../../component/admin/users/UserModal";
import CreateUserForm from "../../../component/admin/users/CreateUserForm";

export default function Users() {
  const { data: usersResponse, isLoading, isError } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const usersArray = usersResponse?.data?.data || [];

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset editingUser when modal is closed
    setEditingUser(null);
  };

  const roleStats = ["manager", "student", "instructor", "admin"].reduce(
    (acc, role) => {
      acc[role] = usersArray.filter((u) => u.role === role).length || 0;
      return acc;
    },
    {}
  );

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-xl p-6 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">User Management</h1>
            <p className="opacity-90">Manage all users in the system</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
          >
            <UserPlus size={18} className="mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <UsersIcon size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-2xl font-bold text-gray-800">
            {usersArray.length}
          </p>
        </div>

        {Object.entries(roleStats).map(([role, count]) => (
          <div key={role} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center mb-2">
              <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                <UsersIcon size={20} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm capitalize">{role}s</h3>
            <p className="text-2xl font-bold text-gray-800">{count}</p>
          </div>
        ))}
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          Error loading users. Please try again.
        </div>
      ) : (
        <UsersList users={usersArray} onEdit={handleEdit} />
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? "Edit User" : "Create New User"}
      >
        <CreateUserForm onClose={handleCloseModal} editingUser={editingUser} />
      </UserModal>
    </div>
  );
}
