import { Filter } from "lucide-react";
import { Button } from "../ui/button";

interface FilterSectionToggleProps {
  toggleFilters: () => void;
  isFiltersActive: boolean;
}

const FilterSectionToggle: React.FC<FilterSectionToggleProps> = ({
  toggleFilters,
  isFiltersActive,
}) => {
  return (
    <span className="relative">
      {isFiltersActive ? (
        <span className="absolute -top-4 right-1 flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
        </span>
      ) : null}
      <Button
        className="bg-inherit hover:bg-inherit"
        onClick={toggleFilters}
      >
        <Filter />
      </Button>
    </span>
  );
};

export default FilterSectionToggle;
