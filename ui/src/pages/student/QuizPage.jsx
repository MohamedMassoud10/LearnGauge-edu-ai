import React from "react";
import Data from "./Data";

export default function QuizPage() {
  const [QuestionCounter, setQuestionCounter] = React.useState(0);
  const [Questions, setQuestions] = React.useState(1);
  const answerOne = React.useRef();
  const answerTwo = React.useRef();
  const answerThree = React.useRef();
  const answerFour = React.useRef();

  function handleClick() {
    if (QuestionCounter < Data.length - 1) {
      setQuestionCounter(QuestionCounter + 1);
      setQuestions(Questions + 1);
    }
    // Reset answer styles
    answerOne.current.className =
      "p-4 border rounded-3xl hover:bg-gray-50 cursor-pointer";
    answerTwo.current.className =
      "p-4 border rounded-3xl hover:bg-gray-50 cursor-pointer";
    answerThree.current.className =
      "p-4 border rounded-3xl hover:bg-gray-50 cursor-pointer";
    answerFour.current.className =
      "p-4 border rounded-3xl hover:bg-gray-50 cursor-pointer";
  }

  function handleClickedAnswer(e) {
    const selectedAnswer = e.target.innerHTML;
    const correctAnswer = Data[QuestionCounter].right_answer;

    // Remove the prefix (A), B), etc.) from the selected answer
    const selectedAnswerText = selectedAnswer.split(") ")[1];

    // Reset all answer styles
    answerOne.current.className =
      "p-4 border rounded-3xl hover:bg-gray-50 cursor-pointer";
    answerTwo.current.className =
      "p-4 border rounded-3xl hover:bg-gray-50 cursor-pointer";
    answerThree.current.className =
      "p-4 border rounded-3xl hover:bg-gray-50 cursor-pointer";
    answerFour.current.className =
      "p-4 border rounded-3xl hover:bg-gray-50 cursor-pointer";

    // Highlight the selected answer
    if (selectedAnswerText === correctAnswer) {
      e.target.className =
        "p-4 border rounded-3xl bg-green-500 text-white cursor-pointer";
    } else {
      e.target.className =
        "p-4 border rounded-3xl bg-red-500 text-white cursor-pointer";
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg border-2 border-gray-300">
        {/* Display the question number in blue */}
        <h2 className="text-lg font-semibold text-blue-600 mb-2">
          Question - {Questions}
        </h2>
        <h1 className="text-xl font-semibold mb-4">
          {Data[QuestionCounter].title}
        </h1>
        <div className="space-y-4">
          <div
            ref={answerOne}
            onClick={handleClickedAnswer}
            className="p-4 border rounded-3xl hover:bg-gray-50 cursor-pointer"
          >
            A) {Data[QuestionCounter].answer[0]}
          </div>
          <div
            ref={answerTwo}
            onClick={handleClickedAnswer}
            className="p-4 border rounded-3xl hover:bg-gray-50 cursor-pointer"
          >
            B) {Data[QuestionCounter].answer[1]}
          </div>
          <div
            ref={answerThree}
            onClick={handleClickedAnswer}
            className="p-4 border rounded-3xl hover:bg-gray-50 cursor-pointer"
          >
            C) {Data[QuestionCounter].answer[2]}
          </div>
          <div
            ref={answerFour}
            onClick={handleClickedAnswer}
            className="p-4 border rounded-3xl hover:bg-gray-50 cursor-pointer"
          >
            D) {Data[QuestionCounter].answer[3]}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          {/* "Next Question" button in green color with more rounded corners */}
          <button
            onClick={handleClick}
            className="bg-green-500 text-white px-4 py-2 rounded-3xl hover:bg-green-600"
          >
            Next Question
          </button>
        </div>
      </div>
    </div>
  );
}
