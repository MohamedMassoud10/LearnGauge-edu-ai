import React from "react";
const SectionList = () => {
  const sectionsData = [
    { id: 1, title: "Section - 1", number: "PDF" },
    { id: 2, title: "Section - 2", number: "PDF" },
    { id: 3, title: "Section - 3", number: "PDF" },
    { id: 4, title: "Section - 4", number: "PDF" },
    { id: 5, title: "Section - 5", number: "PDF" },
    { id: 6, title: "Section - 6", number: "PDF" },
    { id: 7, title: "Section - 7", number: "PDF" },
    { id: 8, title: "Section - 8", number: "PDF" },
    { id: 9, title: "Section - 9", number: "PDF" },
    { id: 10, title: "Section - 10", number: "PDF" },
    { id: 11, title: "Section - 11", number: "PDF" },
    { id: 12, title: "Section - 12", number: "PDF" },
    { id: 13, title: "Section - 13", number: "PDF" },
    { id: 14, title: "Section - 1", number: "PDF" },
  ];
  return (
    <div>
      <div className="text-[#014D89] text-3xl border-b-2">Sections</div>

      <div className="grid grid-cols-7 gap-[2px] mt-8">
        {sectionsData.map((section) => (
          <div
            key={section.id}
            className=" rounded-lg p-1 flex flex-col items-center"
          >
            <img
              src="/images/section.png"
              alt="section Icon"
              className="w-24 h-24 mb-2"
            />
            <p className="text-lg font-medium text-[#014D89] text-opacity-50">
              {section.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionList;
