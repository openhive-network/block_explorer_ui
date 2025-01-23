import { Search } from "lucide-react";
import React from "react";

interface NoResultProps {
  title?: string;
  description?: string;

}

const NoResult: React.FC<NoResultProps> = ({
  title = "No Results Found",
  description = "We could not find anything matching your search. Try refining your filters or starting a new search.",

}) => {
  return (
    <div className="mt-2 flex flex-col items-center justify-center bg-theme p-6 w-full text-center space-y-3">
      <div className="flex items-center justify-center w-12 h-12 bg-explorer-bg-start rounded-full">
        <Search className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-semibold">
        {title}
      </h2>
      <p className="text-sm">{description}</p>     
    </div>
  );
};

export default NoResult;
