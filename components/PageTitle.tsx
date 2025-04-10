import React, { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import pageTitlesInfo from "@/utils/PageTitlesInfo";

interface TitleProps {
  title: string;
  className?: string;
}

const PageTitle: React.FC<TitleProps> = ({ title, className = "" }) => {
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const info = pageTitlesInfo[title] || null; // Dynamically fetch the info

  const toggleInfoVisibility = () => {
    setIsInfoVisible(!isInfoVisible);
  };

  return (
    <div className="md:flex md:items-start md:justify-start flex-col md:flex-row w-full items-start justify-start bg-theme">
      <div className="flex items-center ">
        <h1
          className={`text-xl min-h-16 font-bold leading-tight ${className} mr-2 min-w-max`}
        >
          {title}
        </h1>
        {info && (
          <div className="h-9 align-top">
            <button
              aria-label="Information about the title"
              onClick={toggleInfoVisibility}
            >
              <Info color="red" size={18} className="cursor-pointer" />
            </button>
          </div>
        )}
      </div>
      {info && (
        <div
          className={`ml-4 mt-2 text-gray-700 dark:text-gray-300 transition-all duration-300 ease-in-out overflow-auto shadow-md mb-2 rounded-lg  ${
            isInfoVisible ? "opacity-100 max-h-screen p-4" : "opacity-0 max-h-0"
          }`}
        >
          {info}
        </div>
      )}
    </div>
  );
};

export default PageTitle;
