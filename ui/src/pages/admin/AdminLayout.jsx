import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAuthContext } from "../../hooks/useAuthContext";

const AdminLayout = () => {
  const { user } = useAuthContext();

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">
                  Welcome, {user?.data?.name}
                </span>
                <div className="bg-blue-100 p-2 rounded-full">
                  <span className="text-blue-600 font-medium">
                    {user?.data?.name?.charAt(0) || "A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
