"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaBook,
  FaFileAlt,
  FaPlus,
  FaDownload,
  FaSearch,
  FaQuestionCircle,
  FaUserGraduate,
  FaCalendarAlt,
  FaUserFriends,
  FaEdit,
  FaTrash,
  FaSmile,
} from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiErrorCircle } from "react-icons/bi";
import MaxWidthWrapper from "../../utils/MaxWidthWrapper";
import MainTitle from "../../utils/MainTitle";
import { useInstructorCourses } from "../../hooks/useTeacherCourses";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useLectures } from "../../hooks/useLectures";
import AddLectureModal from "../../component/home/lectures/AddLectureModal";
import QuizList from "../../component/home/quizes/QuizList";
import { useAllStudentsRegisteredACourse } from "../../hooks/useCourseRegistration";
import { useStudentCourseGrade } from "../../hooks/useGrades";
import AddGradeModal from "../../component/grades/AddGradeModal";
import { useDeleteLecture } from "../../hooks/useLectures";

export default function TeacherHomePage() {
  const { user } = useAuthContext();
  const instructorId = user?.data?._id;

  const {
    data: AssignedCourses,
    isLoading: Loading,
    isError,
    refetch,
  } = useInstructorCourses(instructorId);
  const { data: lecturesArray } = useLectures();

  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("lectures");
  const [ferData, setFerData] = useState(null);
  const [ferLoading, setFerLoading] = useState(false);
  const [ferError, setFerError] = useState(null);

  const deleteLectureMutation = useDeleteLecture();

  // Fetch FER data
  useEffect(() => {
    if (activeTab === "fer" && selectedCourse && instructorId) {
      setFerLoading(true);

      const currentCourse = AssignedCourses?.data?.data?.find(
        (course) => course.name === selectedCourse
      );

      if (!currentCourse) {
        setFerLoading(false);
        return;
      }

      fetch("http://127.0.0.1:8000/api/fer", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.status === "success" && Array.isArray(data.data)) {
            const filteredData = data.data.filter((item) => {
              const sameInstructor = item.instructor?._id === user?.data._id;
              const sameCourse = item.course === currentCourse._id;

              console.log("Comparing:");
              console.log("item.course        :", item.course);
              console.log("currentCourse._id  :", currentCourse._id);
              console.log("Match (==)         :", sameCourse);
              console.log("--------------------------------");

              return sameInstructor && sameCourse;
            });
            console.log("filteredData", filteredData);
            setFerData(filteredData);
          } else {
            setFerData([]);
          }

          setFerLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching FER data:", error);
          setFerError("Failed to load FER data.");
          setFerLoading(false);
        });
    }
  }, [activeTab, selectedCourse, instructorId, AssignedCourses, user?.token]);

  const assignedCourseIds =
    AssignedCourses?.data?.data?.map((course) => course._id) || [];

  const lectures = lecturesArray?.data?.data || [];

  const instructorLectures = lectures.filter((lecture) =>
    assignedCourseIds.includes(lecture.course)
  );

  const filteredLectures = instructorLectures.filter((lecture) => {
    const courseMatch =
      selectedCourse === "" ||
      AssignedCourses?.data?.data?.find(
        (course) =>
          course._id === lecture.course && course.name === selectedCourse
      );

    const searchMatch = lecture.pdf
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return courseMatch && searchMatch;
  });

  if (selectedCourse === "" && AssignedCourses?.data?.data?.length > 0) {
    setSelectedCourse(AssignedCourses.data.data[0].name);
  }

  const currentCourse = AssignedCourses?.data?.data?.find(
    (course) => course.name === selectedCourse
  );

  const handleAddLecture = () => {
    if (!currentCourse) {
      alert("Please select a course first");
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleAddGrade = (student) => {
    setSelectedStudent(student);
    setIsGradeModalOpen(true);
  };

  const handleDeleteLecture = async (lectureId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this lecture? This action cannot be undone."
      )
    ) {
      try {
        await deleteLectureMutation.mutateAsync(lectureId);
      } catch (error) {
        console.error("Error deleting lecture:", error);
        alert("Failed to delete lecture. Please try again.");
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const courseButtonVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    tap: { scale: 0.95 },
    hover: { y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" },
  };

  const lectureCardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
      },
    },
    tap: { scale: 0.98 },
  };

  if (Loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AiOutlineLoading3Quarters className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-lg font-medium text-gray-700">
          Loading your courses...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <BiErrorCircle className="w-12 h-12 text-red-600" />
        <p className="mt-4 text-lg font-medium text-gray-700">
          Error loading courses. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-gradient-to-br from-indigo-700 to-purple-900 py-10">
        <MaxWidthWrapper>
          <MainTitle
            titleColor="text-white"
            title="Teacher Dashboard"
            subtitle="Manage your courses, lectures, quizzes, and FER"
          />

          <motion.div
            className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 mt-6 flex items-center border border-white border-opacity-20"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          >
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FaChalkboardTeacher className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-white">
                {user.data.name || "Instructor"}
              </h3>
              <p className="text-sm text-indigo-100">
                {AssignedCourses?.data?.data?.length || 0} Courses Assigned
              </p>
            </div>
            <div className="ml-auto bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-xs font-medium text-white">
                {instructorLectures.length || 0} Total Lectures
              </span>
            </div>
          </motion.div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-white rounded-lg shadow-md p-4 flex items-center"
            variants={itemVariants}
          >
            <div className="bg-indigo-100 p-3 rounded-full">
              <FaBook className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Assigned Courses</p>
              <h3 className="text-xl font-bold text-gray-800">
                {AssignedCourses?.data?.data?.length || 0}
              </h3>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-md p-4 flex items-center"
            variants={itemVariants}
          >
            <div className="bg-purple-100 p-3 rounded-full">
              <FaFileAlt className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Lectures</p>
              <h3 className="text-xl font-bold text-gray-800">
                {instructorLectures.length || 0}
              </h3>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-10 mb-6"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaBook className="mr-2 text-indigo-600" />
            Your Courses
          </h2>

          <motion.div
            className="flex flex-wrap gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {AssignedCourses?.data?.data?.length > 0 ? (
              AssignedCourses.data.data.map((course, index) => (
                <motion.button
                  key={course._id}
                  onClick={() => setSelectedCourse(course.name)}
                  className={`px-6 py-2 rounded-full transition-all duration-200 font-medium text-sm flex items-center gap-2 focus:ring-2 focus:ring-indigo-500 ${
                    course.name === selectedCourse
                      ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300 shadow-sm"
                      : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-400"
                  }`}
                  variants={courseButtonVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  transition={{ delay: index * 0.05 }}
                >
                  <FaBook
                    className={`text-lg ${
                      course.name === selectedCourse
                        ? "text-indigo-600"
                        : "text-gray-500"
                    }`}
                  />
                  {course.name}
                </motion.button>
              ))
            ) : (
              <motion.p
                className="text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                No courses assigned yet.
              </motion.p>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="flex border-b border-gray-200 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "lectures"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("lectures")}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <div className="flex items-center gap-2">
              <FaFileAlt />
              <span>Lectures</span>
            </div>
          </motion.button>
          <motion.button
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "quizzes"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("quizzes")}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <div className="flex items-center gap-2">
              <FaQuestionCircle />
              <span>Quizzes</span>
            </div>
          </motion.button>
          <motion.button
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "students"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("students")}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <div className="flex items-center gap-2">
              <FaUserFriends />
              <span>Students</span>
            </div>
          </motion.button>
          <motion.button
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "fer"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("fer")}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <div className="flex items-center gap-2">
              <FaSmile />
              <span>FER</span>
            </div>
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "lectures" ? (
            <motion.div
              key="lectures"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <motion.div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
                variants={itemVariants}
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Lectures</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {selectedCourse} course • {filteredLectures.length} lectures
                  </p>
                </div>

                <motion.div
                  className="flex gap-3 w-full sm:w-auto"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <div className="relative flex-grow sm:flex-grow-0">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <motion.input
                      type="text"
                      placeholder="Search lectures..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.2)",
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {filteredLectures.map((lecture, index) => (
                    <motion.div
                      key={lecture._id}
                      className="group flex flex-col items-center bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:border-indigo-200 cursor-pointer relative"
                      variants={lectureCardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      whileTap="tap"
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.03 }}
                      layout
                    >
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLecture(lecture._id);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete lecture"
                      >
                        <FaTrash className="w-3 h-3" />
                      </motion.button>

                      <div className="relative mb-3">
                        <motion.div
                          className="w-20 h-20 bg-indigo-50 rounded-lg flex items-center justify-center"
                          whileHover={{ rotate: -5 }}
                        >
                          <FaFileAlt className="text-indigo-500 text-3xl" />
                        </motion.div>
                        <motion.div
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <div className="flex gap-2">
                            <motion.a
                              href={lecture.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white rounded-full shadow-sm hover:bg-indigo-50"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaFileAlt className="text-indigo-600" />
                            </motion.a>
                            <motion.a
                              href={lecture.pdf}
                              download
                              className="p-2 bg-white rounded-full shadow-sm hover:bg-indigo-50"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaDownload className="text-indigo-600" />
                            </motion.a>
                          </div>
                        </motion.div>
                      </div>
                      <h3 className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                        Lecture {lecture.number || "Unknown"}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <FaCalendarAlt className="mr-1" />
                        <span>
                          {new Date(lecture.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    onClick={handleAddLecture}
                    className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-4 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200 cursor-pointer h-full min-h-[160px]"
                    variants={lectureCardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(238, 242, 255, 1)",
                      borderColor: "rgba(165, 180, 252, 1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2"
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaPlus className="text-indigo-600 text-xl" />
                    </motion.div>
                    <p className="font-medium text-gray-700 text-center">
                      Add New Lecture
                    </p>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Upload PDF or document
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <AnimatePresence>
                {filteredLectures.length === 0 && (
                  <motion.div
                    className="flex flex-col items-center justify-center py-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: 0.2,
                      }}
                    >
                      <FaFileAlt className="text-indigo-400 text-2xl" />
                    </motion.div>
                    <motion.h3
                      className="text-lg font-medium text-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      No lectures found
                    </motion.h3>
                    <motion.p
                      className="text-gray-500 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {assignedCourseIds.length === 0
                        ? "No courses have been assigned to you yet"
                        : "Try adjusting your search or filters"}
                    </motion.p>
                    <motion.button
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      onClick={handleAddLecture}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaPlus />
                      Add New Lecture
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : activeTab === "quizzes" ? (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <motion.div className="mb-6" variants={itemVariants}>
                <h2 className="text-2xl font-bold text-gray-800">Quizzes</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedCourse} course quizzes
                </p>
              </motion.div>

              {currentCourse && (
                <QuizList
                  courseId={currentCourse._id}
                  courseName={currentCourse.name}
                />
              )}
            </motion.div>
          ) : activeTab === "students" ? (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <motion.div className="mb-6" variants={itemVariants}>
                <h2 className="text-2xl font-bold text-gray-800">
                  Registered Students
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedCourse} course students
                </p>
              </motion.div>

              {currentCourse && (
                <RegisteredStudentsList
                  courseId={currentCourse._id}
                  onAddGrade={handleAddGrade}
                  courseName={currentCourse.name}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="fer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <motion.div className="mb-6" variants={itemVariants}>
                <h2 className="text-2xl font-bold text-gray-800">
                  Facial Emotion Recognition
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedCourse} course FER analysis
                </p>
              </motion.div>

              {ferLoading ? (
                <div className="flex justify-center items-center py-12">
                  <AiOutlineLoading3Quarters className="w-8 h-8 text-indigo-600 animate-spin" />
                  <span className="ml-2 text-gray-600">
                    Loading FER data...
                  </span>
                </div>
              ) : ferError ? (
                <div className="flex justify-center items-center py-12 text-red-500">
                  <BiErrorCircle className="w-8 h-8 mr-2" />
                  <span>{ferError}</span>
                </div>
              ) : ferData?.length > 0 ? (
                <FERResults data={ferData} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <FaSmile className="text-indigo-400 text-2xl" />
                  </motion.div>
                  <h3 className="text-lg font-medium text-gray-700">
                    No FER data available
                  </h3>
                  <p className="text-gray-500 mt-1">
                    No facial emotion recognition data found for this course.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {currentCourse && (
          <motion.div
            className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.6,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Course Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-100"
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">
                  {currentCourse.name}
                </h3>

                <div className="space-y-2">
                  {currentCourse.department && (
                    <div className="flex items-center text-gray-600">
                      <FaGraduationCap className="mr-2 text-indigo-500" />
                      <span>Department: {currentCourse.department}</span>
                    </div>
                  )}

                  {currentCourse.duration && (
                    <div className="flex items-center text-gray-600">
                      <IoTimeOutline className="mr-2 text-indigo-500" />
                      <span>Duration: {currentCourse.duration} hours/week</span>
                    </div>
                  )}

                  {currentCourse.code && (
                    <div className="flex items-center text-gray-600">
                      <FaBook className="mr-2 text-indigo-500" />
                      <span>Course Code: {currentCourse.code}</span>
                    </div>
                  )}
                </div>

                {currentCourse.description && (
                  <div className="mt-4 pt-4 border-t border-indigo-100">
                    <p className="text-gray-700">{currentCourse.description}</p>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </MaxWidthWrapper>

      <AddLectureModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        courseId={currentCourse?._id}
        courseNumber={currentCourse?.number}
      />

      <AddGradeModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        student={selectedStudent}
        courseId={currentCourse?._id}
        courseName={currentCourse?.name}
      />
    </div>
  );
}

function FERResults({ data }) {
  return (
    <div className="space-y-6">
      {data.map((session) => (
        <motion.div
          key={session._id}
          className="bg-gray-50 rounded-lg p-5 border border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Lecture: {session.lectureName}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Captured on {new Date(session.createdAt).toLocaleString()} by{" "}
            {session.instructor.name}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Emotion Distribution
              </h4>
              <div className="space-y-2">
                {Object.entries(session.sessionSummary.emotionDistribution).map(
                  ([emotion, count]) => (
                    <div key={emotion} className="flex items-center">
                      <span className="w-24 text-sm capitalize text-gray-600">
                        {emotion}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{
                            width: `${
                              (count / session.sessionSummary.totalCaptures) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {count}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Session Summary
              </h4>
              <p className="text-sm text-gray-600">
                Total Captures: {session.sessionSummary.totalCaptures}
              </p>
              <p className="text-sm text-gray-600">
                Average Faces per Capture:{" "}
                {session.sessionSummary.avgFacesPerCapture}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Emotion Captures
            </h4>
            <div className="space-y-2">
              {session.emotionCaptures.map((capture) => (
                <div
                  key={capture._id}
                  className="bg-white p-3 rounded-lg border border-gray-100"
                >
                  <p className="text-sm text-gray-600">
                    Capture Time:{" "}
                    {new Date(capture.captureTime).toLocaleString()}
                  </p>
                  {capture.faces.map((face) => (
                    <p key={face._id} className="text-sm text-gray-600">
                      Face {face.faceId}: {face.emotion} (
                      {(face.confidence * 100).toFixed(2)}% confidence)
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RegisteredStudentsList({ courseId, onAddGrade, courseName }) {
  const {
    data: studentsData,
    isLoading,
    isError,
  } = useAllStudentsRegisteredACourse(courseId);

  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    }),
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <AiOutlineLoading3Quarters className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading students...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center py-12 text-red-500">
        <BiErrorCircle className="w-8 h-8 mr-2" />
        <span>Error loading student data. Please try again.</span>
      </div>
    );
  }

  const students = studentsData?.data?.data || [];

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <FaUserGraduate className="text-indigo-400 text-2xl" />
        </motion.div>
        <h3 className="text-lg font-medium text-gray-700">
          No students registered
        </h3>
        <p className="text-gray-500 mt-1">
          No students have registered for this course yet
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Student
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Major
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Academic Level
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              GPA
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Semester
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Grade
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((registration, index) => (
            <StudentRow
              key={registration._id}
              registration={registration}
              index={index}
              courseId={courseId}
              onAddGrade={onAddGrade}
              tableRowVariants={tableRowVariants}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StudentRow({
  registration,
  index,
  courseId,
  onAddGrade,
  tableRowVariants,
}) {
  const { data: gradeData, isLoading: gradeLoading } = useStudentCourseGrade(
    registration?.student?._id,
    courseId
  );

  const existingGrade = gradeData?.data?.data;

  return (
    <motion.tr
      custom={index}
      variants={tableRowVariants}
      initial="hidden"
      animate="visible"
      className="hover:bg-gray-50"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <FaUserGraduate className="text-indigo-500" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {registration?.student?.name}
            </div>
            <div className="text-sm text-gray-500">
              {registration?.student?.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {registration?.student?.studentId}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {registration?.student?.major}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {registration?.student?.academicLevel}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {registration?.student?.gpa}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {registration?.semester} ({registration?.academicYear})
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {gradeLoading ? (
          <AiOutlineLoading3Quarters className="animate-spin text-indigo-600" />
        ) : existingGrade ? (
          <div className="flex items-center">
            <span className="font-medium text-gray-900 mr-2">
              {existingGrade.totalGrade}%
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                existingGrade.letterGrade?.includes("A")
                  ? "bg-green-100 text-green-800"
                  : existingGrade.letterGrade?.includes("B")
                  ? "bg-blue-100 text-blue-800"
                  : existingGrade.letterGrade?.includes("C")
                  ? "bg-yellow-100 text-yellow-800"
                  : existingGrade.letterGrade?.includes("D")
                  ? "bg-orange-100 text-orange-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {existingGrade.letterGrade}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">Not graded</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <motion.button
          onClick={() => onAddGrade(registration?.student)}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={existingGrade ? "Edit Grade" : "Add Grade"}
        >
          <FaEdit className="w-4 h-4" />
        </motion.button>
      </td>
    </motion.tr>
  );
}
