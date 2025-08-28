"use client";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import Header from "./component/Header";
import Login from "./pages/login/Login";
import { useAuthContext } from "./hooks/useAuthContext";
import { Loader } from "react-feather";
import Users from "./pages/admin/users/Users";
import Courses from "./pages/admin/courses/Courses";
import CourseDetails from "./pages/admin/courses/CourseDetailsaPage";
import QuizSubmission from "./pages/student/QuizSubmission";
import AcademicFER from "./pages/AcademicFER";
import FERReports from "./pages/FERReports";
import StudentDetailsPage from "./pages/teacher/StudentDetailsPage";

// Lazy load pages for better performance
const MainPage = lazy(() => import("./pages/teacher/TeacherHomePage"));
const Profile = lazy(() => import("./component/Profile"));

const StudentHomePage = lazy(() => import("./pages/student/StudentHomePage"));
const QuizPage = lazy(() => import("./pages/student/QuizPage"));
const CourseSinglePage = lazy(() =>
  import("./pages/student/CoursesSinglePage")
);
const TeacherQuizzesPage = lazy(() =>
  import("./pages/teacher/TeacherHomePage")
);

// Admin components
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="spinner"></div>
  </div>
);

// Protected route wrapper component
const ProtectedRoute = ({
  children,
  requiredRole,
  redirectPath = "/login",
}) => {
  const { user } = useAuthContext();
  const location = useLocation();

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (requiredRole && user.data.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {user && user.data.role !== "admin" && <Header />}

      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              !user ? (
                <Login />
              ) : (
                <Navigate to={location.state?.from?.pathname || "/"} replace />
              )
            }
          />

          {/* Home route with role-based redirection */}
          <Route
            path="/"
            element={
              user ? (
                user.data.role === "student" ? (
                  <StudentHomePage />
                ) : user.data.role === "instructor" ? (
                  <MainPage />
                ) : user.data.role === "admin" ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              ) : (
                <Navigate to="/login" state={{ from: location }} replace />
              )
            }
          />

          {/* Student routes */}
          <Route
            path="/quiz"
            element={
              <ProtectedRoute requiredRole="student">
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz-submission/:quizId"
            element={
              <ProtectedRoute requiredRole="student">
                <QuizSubmission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute requiredRole="student">
                <CourseSinglePage />
              </ProtectedRoute>
            }
          />

          {/* Instructor routes */}
          <Route
            path="/fer"
            element={
              <ProtectedRoute requiredRole="instructor">
                <AcademicFER />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fer-reports"
            element={
              <ProtectedRoute requiredRole="instructor">
                <FERReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizes"
            element={
              <ProtectedRoute requiredRole="instructor">
                <TeacherQuizzesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mainpage"
            element={
              <ProtectedRoute requiredRole="instructor">
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-details/:id"
            element={
              <ProtectedRoute requiredRole="instructor">
                <StudentDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Common protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetails />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
