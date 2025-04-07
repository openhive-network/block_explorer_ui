import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface TitleProps {
  title: string;
  className?: string;
  info?: React.ReactNode;
}

const Title: React.FC<TitleProps> = ({ title, className = '', info }) => {
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const toggleInfoVisibility = () => {
    setIsInfoVisible(!isInfoVisible);
  };

  return (
    <div className="md:flex md:items-start md:justify-between mb-4 flex-col md:flex-row">
      <div className="flex items-center">
        <h1 className={`text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100 ${className} mr-2 min-w-max`}>
          {title}
        </h1>
        {info && (
          <button aria-label="Information about the title" onClick={toggleInfoVisibility}>
            <Info color="red" size={20} className="cursor-pointer" />
          </button>
        )}
      </div>
      {info && (
        <div
          className={`mt-2 text-gray-700 dark:text-gray-300 transition-all duration-300 ease-in-out overflow-auto  ${
            isInfoVisible ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0'
          }`}
        >
          {info}
        </div>
      )}
    </div>
  );
};

export default Title;