"use client";
import { useLectures } from "../../hooks/useLectures";
import { FaFilePdf, FaBookOpen, FaRobot } from "react-icons/fa";
import Loader from "../../utils/Loader";

import { useState } from "react";
import QuizGenerator from "../home/quizes/QuizGenerator";
import ChatBot from "../home/quizes/ChatBot";

const LectureList = ({ id }) => {
  const { data: lectures, isLoading } = useLectures();
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);

  console.log(lectures.data.data);
  // Filter lectures by course ID
  const filteredLectures =
    lectures?.data?.data?.filter((lecture) => lecture.course === id) || [];
  console.log(filteredLectures);

  const handleCreateQuestions = () => {
    if (filteredLectures.length > 0) {
      // Pass all filtered lectures to QuizGenerator
      setShowQuizGenerator(true);
    } else {
      alert("No lectures available for this course");
    }
  };

  // Handle empty state
  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-6">
          <FaBookOpen className="w-5 h-5 text-[#014D89] mr-2" />
          <h2 className="text-2xl font-bold text-[#014D89]">Lectures</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
          {filteredLectures.map((lecture) => (
            <a
              key={lecture._id}
              href={lecture.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col items-center group relative overflow-hidden"
            >
              <div className="bg-blue-50 p-4 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                <FaFilePdf className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm font-medium text-[#014D89] text-center">
                Lecture {lecture.number}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(lecture.createdAt).toLocaleDateString()}
              </p>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-[#014D89] bg-opacity-0 group-hover:bg-opacity-80 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                <div className="text-white text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <FaFilePdf className="w-10 h-10 mx-auto mb-2" />
                  <p className="font-medium">View Lecture</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleCreateQuestions}
              disabled={filteredLectures.length === 0}
              className="bg-[#014D89] hover:bg-[#01396a] disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center"
            >
              <FaBookOpen className="mr-2" />
              Create Questions from {filteredLectures.length} Lecture
              {filteredLectures.length !== 1 ? "s" : ""}
            </button>

            <button
              onClick={() => setShowChatBot(true)}
              disabled={filteredLectures.length === 0}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto justify-center"
            >
              <FaRobot className="w-4 h-4" />
              <span className="hidden sm:inline">Chat with AI Instructor</span>
              <span className="sm:hidden">AI Chat</span>
            </button>
          </div>
        </div>
      </div>

      {showQuizGenerator && (
        <QuizGenerator
          lectures={filteredLectures} // Pass the entire array of filtered lectures
          courseId={id}
          onClose={() => {
            setShowQuizGenerator(false);
          }}
        />
      )}
      {showChatBot && (
        <ChatBot
          lectures={filteredLectures}
          isOpen={showChatBot}
          onClose={() => {
            setShowChatBot(false);
          }}
        />
      )}
    </>
  );
};

export default LectureList;
