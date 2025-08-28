import { Link } from "react-router-dom";
import { useQuizzesByCourse } from "../../hooks/useQuizzes";
import { FaClipboardList, FaRegClock, FaCalendarAlt } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Loader from "../../utils/Loader";

const QuizList = ({ id }) => {
  const { data: QuizzesData, isLoading } = useQuizzesByCourse(id);
  const quizzes = QuizzesData?.data?.data || [];

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader />
      </div>
    );
  }

  // Handle empty state
  if (quizzes.length === 0) {
    return (
      <div className="rounded-lg p-8 text-center">
        <FaClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No quizzes found
        </h3>
        <p className="text-gray-600">
          There are no quizzes available for this course yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center mb-6">
        <FaClipboardList className="w-5 h-5 text-[#014D89] mr-2" />
        <h2 className="text-2xl font-bold text-[#014D89]">Quizzes</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {quizzes.map((quiz) => (
          <Link
            key={quiz._id}
            to={`/quiz-submission/${quiz._id}`}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col group relative overflow-hidden"
          >
            <div className="flex items-start mb-3">
              <div className="bg-blue-50 p-3 rounded-full mr-3 group-hover:bg-blue-100 transition-colors">
                <FaClipboardList className="w-6 h-6 text-[#014D89]" />
              </div>
              <div>
                <h3 className="font-medium text-[#014D89]">{quiz.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {quiz.description}
                </p>
              </div>
            </div>

            <div className="mt-2 space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <FaRegClock className="w-4 h-4 mr-2 text-gray-400" />
                <span>Duration: {quiz.duration} minutes</span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                <span>Due: {formatDate(quiz.endDate)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {quiz.totalPoints} points
                </span>
                {quiz.isActive ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                    Active
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full ml-2">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-[#014D89] bg-opacity-0 group-hover:bg-opacity-80 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
              <div className="text-white text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <FaClipboardList className="w-10 h-10 mx-auto mb-2" />
                <p className="font-medium">Take Quiz</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
        <div className="text-gray-600">
          <span className="font-medium">{quizzes.length}</span> quizzes
          available
        </div>
      </div>
    </div>
  );
};

export default QuizList;
