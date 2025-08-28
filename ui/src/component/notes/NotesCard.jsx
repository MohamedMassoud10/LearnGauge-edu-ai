import React from "react";

export default function NotesCard() {
  return (
    <div className="flex flex-col justify-between bg-teal-400 w-64 h-64 rounded-lg  p-4 shadow-md ">
      <textarea
        className="w-full h-56   focus:outline-none resize-none bg-teal-400 placeholder-neutral-500 text-gray-800 font-semibold rounded-md border-none"
        placeholder="Type  to  add  a  note . ."
        maxLength={200}
      ></textarea>

      <div className="flex justify-between items-center">
        <p className="text-black font-semibold text-sm">200 Remaining</p>
        <button className="bg-amber-100 hover:bg-amber-200 text-black font-semibold px-3 py-0.5 rounded-full ">
          Save
        </button>
      </div>
    </div>
  );
}
