import React from "react";

export default function CoursesCard({ title, bgColor }) {
  return (
    <div className={`flex flex-col justify-end w-64 h-44 rounded-b-lg cursor-pointer border-2 border-gray ${bgColor}`}>
      <div className="flex items-center bg-white w-full h-12 pl-4 rounded-b-lg">
        <div className="text-sky-700 font-semibold text-left">{title}</div>
      </div>
    </div>
  );
}


