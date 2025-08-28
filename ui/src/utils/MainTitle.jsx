import React from "react";

const MainTitle = ({ title, subtitle, titleColor = "text-primary" }) => {
  return (
    <div className="text-center my-8">
      <h1 className={`text-4xl font-bold ${titleColor}`}>{title}</h1>
      <p className="text-lg text-primary-hover mt-2">{subtitle}</p>
    </div>
  );
};

export default MainTitle;
