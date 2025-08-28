"use client";

import { useState } from "react";

import { useEffect } from "react";
import notify from "./../../../hooks/useNotifaction";

import { useCreateQuiz } from "./../../../hooks/useQuizzes.js";
import { useAllStudentsRegisteredACourse } from "./../../../hooks/useCourseRegistration.js";
import { useCreateNotification } from "./../../../hooks/useSendNotifications";

const AddQuizModal = ({ isOpen, onClose, courseId }) => {
  const createNotificationMutation = useCreateNotification();
  const { mutate: createQuiz, isLoading, reset } = useCreateQuiz();
  console.log(courseId);
  const { data: AllStudentsRegisteredACourseData } =
    useAllStudentsRegisteredACourse(courseId);
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    course: courseId,
    questions: [
      {
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        points: 1,
      },
    ],
    duration: 30,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    startTime: "10:00",
    endTime: "11:00",
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      setQuizData({
        title: "",
        description: "",
        course: courseId,
        questions: [
          {
            text: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
            points: 1,
          },
        ],
        duration: 30,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        startTime: "10:00",
        endTime: "11:00",
      });
    }
  }, [isOpen, courseId, reset]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      if (field === "options") {
        const optionIndex = Number.parseInt(value.optionIndex);
        updatedQuestions[index].options[optionIndex] = value.text;
      } else {
        updatedQuestions[index][field] = value;
      }
      return { ...prev, questions: updatedQuestions };
    });
  };

  const addQuestion = () => {
    setQuizData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          points: 1,
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length === 1) {
      alert("Quiz must have at least one question");
      return;
    }

    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions.splice(index, 1);
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!quizData.title.trim()) {
      notify("Please provide a title for the quiz", "error");
      return;
    }

    // Check if all questions have text and options
    const invalidQuestion = quizData.questions.findIndex(
      (q) => !q.text.trim() || q.options.some((opt) => !opt.trim())
    );

    if (invalidQuestion !== -1) {
      notify(
        `Question ${
          invalidQuestion + 1
        } is incomplete. Please fill all fields.`,
        "error"
      );
      return;
    }

    // Format dates with time
    const formattedData = {
      ...quizData,
      startDate: `${quizData.startDate}T${quizData.startTime}:00Z`,
      endDate: `${quizData.endDate}T${quizData.endTime}:00Z`,
    };

    // Remove temporary fields
    delete formattedData.startTime;
    delete formattedData.endTime;

    createQuiz(formattedData, {
      onSuccess: () => {
        notify("Quiz created successfully", "success");

        // Send notifications to all registered students
        if (AllStudentsRegisteredACourseData?.data?.data?.length > 0) {
          AllStudentsRegisteredACourseData.data.data.forEach((registration) => {
            const studentId = registration.student._id;
            const notificationData = {
              title: `New Quiz: ${quizData.title}`,
              message: `A new quiz "${quizData.title}" has been created for your course. It will be available from ${quizData.startDate} to ${quizData.endDate}.`,
              recipient: studentId,
            };

            // Check if title and message are not empty before sending
            if (!notificationData.title || !notificationData.message) {
              console.error("Notification title and message are required");
              return;
            }

            createNotificationMutation.mutate(notificationData, {
              onError: (error) => {
                console.error("Failed to send notification:", error);
                notify("Failed to send notification to students", "error");
              },
            });
          });
        }

        onClose();
      },
      onError: (error) => {
        notify(
          error.message || "Failed to create quiz. Please try again.",
          "error"
        );
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-[800px] max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Create New Quiz</h2>
          <button
            onClick={onClose}
            className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Quiz Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Quiz Information</h3>

                <div className="grid gap-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quiz Title
                    </label>
                    <input
                      id="title"
                      name="title"
                      value={quizData.title}
                      onChange={handleChange}
                      placeholder="Enter quiz title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={quizData.description}
                      onChange={handleChange}
                      placeholder="Enter quiz description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Duration (minutes)
                      </label>
                      <input
                        id="duration"
                        name="duration"
                        type="number"
                        min="1"
                        value={quizData.duration}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Start Date
                      </label>
                      <div className="flex">
                        <input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={quizData.startDate}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          id="startTime"
                          name="startTime"
                          type="time"
                          value={quizData.startTime}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-r-md border-l-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="endDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        End Date
                      </label>
                      <div className="flex">
                        <input
                          id="endDate"
                          name="endDate"
                          type="date"
                          value={quizData.endDate}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          id="endTime"
                          name="endTime"
                          type="time"
                          value={quizData.endTime}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-r-md border-l-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Questions</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-1"
                  >
                    <span>+</span>
                    Add Question
                  </button>
                </div>

                {quizData.questions.map((question, qIndex) => (
                  <div key={qIndex} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Question {qIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center"
                      >
                        🗑️
                      </button>
                    </div>

                    <div>
                      <label
                        htmlFor={`question-${qIndex}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Question Text
                      </label>
                      <textarea
                        id={`question-${qIndex}`}
                        value={question.text}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, "text", e.target.value)
                        }
                        placeholder="Enter your question"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Answer Options
                      </label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex gap-2 items-center">
                          <div className="flex-shrink-0">
                            <input
                              type="radio"
                              name={`correct-answer-${qIndex}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() =>
                                handleQuestionChange(
                                  qIndex,
                                  "correctAnswer",
                                  oIndex
                                )
                              }
                              className="mr-2"
                            />
                          </div>
                          <input
                            value={option}
                            onChange={(e) =>
                              handleQuestionChange(qIndex, "options", {
                                optionIndex: oIndex,
                                text: e.target.value,
                              })
                            }
                            placeholder={`Option ${oIndex + 1}`}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      ))}
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="mr-1">ℹ️</span>
                        <span>
                          Select the radio button next to the correct answer
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={`points-${qIndex}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Points
                      </label>
                      <input
                        id={`points-${qIndex}`}
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            "points",
                            Number.parseInt(e.target.value)
                          )
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                {isLoading ? "Creating..." : "Create Quiz"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuizModal;
