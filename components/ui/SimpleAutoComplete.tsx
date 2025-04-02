import React, { useState, useRef, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import useOnClickOutside from "@/hooks/common/useOnClickOutside";

interface SimpleAutocompleteProps {
  values: string[];
  className?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  value: string;
}

const SimpleAutocomplete: React.FC<SimpleAutocompleteProps> = ({
  values,
  className,
  placeholder = "Search...",
  onChange,
  value
}) => {
  const [inputFocus, setInputFocus] = useState(false);
  const [filteredValues, setFilteredValues] = useState<string[]>([]);
  const searchContainerRef = useRef(null);

  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Close the search when clicking outside of the container
  useOnClickOutside(searchContainerRef, () => closeSearchBar());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    setInputFocus(true);
    setHighlightedIndex(-1); // Reset highlight on input change

    if (inputValue) {
      const filtered = values.filter((item) =>
        item.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredValues(filtered);
    } else {
      // Show all values when input is empty and focused
      setFilteredValues(values);
    }
  };

  const handleSelectValue = (selectedValue: string) => {
    onChange(selectedValue);
    setFilteredValues([]);
    setInputFocus(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const closeSearchBar = () => {
    setInputFocus(false);
    setFilteredValues([]);
    setHighlightedIndex(-1);
  };

  const resetSearchBar = () => {
    onChange("");
    setFilteredValues(values);
    setInputFocus(true);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const validItemsExist = inputFocus && filteredValues.length > 0;

    if (event.key === "Enter") {
        event.preventDefault();
      if (highlightedIndex !== -1 && validItemsExist) {
        handleSelectValue(filteredValues[highlightedIndex]);
      } else if (filteredValues.length === 1 && value === filteredValues[0]) {
        handleSelectValue(filteredValues[0]);
      }
    } else if (event.key === "Escape") {
      closeSearchBar();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (validItemsExist) {
        setHighlightedIndex((prev) => (prev < filteredValues.length - 1 ? prev + 1 : 0));
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (validItemsExist) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredValues.length - 1));
      }
    } else if (event.key === "Tab") {
       event.preventDefault();
       if (validItemsExist) {
          if (highlightedIndex === -1) {
            setHighlightedIndex(0);
          } else if (highlightedIndex < filteredValues.length - 1) {
            setHighlightedIndex(highlightedIndex + 1); 
          } else {
            setHighlightedIndex(0); 
          }
       } else {
        inputRef.current?.blur();
       }
    }
  };

  const handleInputFocus = () => {
    setInputFocus(true);
    setHighlightedIndex(-1);
    if (!value) {
      setFilteredValues(values);
    } else {
       const filtered = values.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredValues(filtered);
    }
  };

  // Effect for scrolling the highlighted item into view
  useEffect(() => {
    if (highlightedIndex !== -1 && scrollableContainerRef.current) {
      const highlightedElement = scrollableContainerRef.current.children[highlightedIndex] as HTMLElement;

      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          behavior: "smooth", 
          block: "nearest", 
        });
      }
    }
  }, [highlightedIndex]); 

  return (
    <div ref={searchContainerRef} className={cn("relative", className)}>
      <div className="relative flex items-center z-10">
        <Input
          ref={inputRef}
          className="autocomplete_input pr-10"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
          {value && value.length > 0 ? (
            <X className="cursor-pointer h-5 w-5 text-gray-500" onClick={resetSearchBar} />
          ) : (
            <Search className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>
      {inputFocus && filteredValues.length > 0 && (
        <div
          ref={resultsContainerRef} 
          className="absolute mt-1 bg-white dark:bg-gray-800 w-full max-h-[150px] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden" // overflow-hidden on outer is fine
          id="autocomplete-results"
        >
          <div
            ref={scrollableContainerRef} 
            className="autocomplete-result-container scrollbar-autocomplete h-full overflow-y-auto"
          >
            {filteredValues.map((item, index) => (
              <div
                key={index}
                id={`autocomplete-item-${index}`}
                className={cn(
                  "autocomplete-result-item px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                  {
                    "bg-rowHover": highlightedIndex === index,
                  }
                )}
                onClick={() => handleSelectValue(item)}
               
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleAutocomplete;