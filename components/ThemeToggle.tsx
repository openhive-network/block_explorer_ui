import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon } from "@fortawesome/free-solid-svg-icons";
import { Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex items-center">
      <button
        onClick={toggleTheme}
        className="h-[34px] w-[34px] p-2 border-navbar-border border-[1px] bg-navbar rounded-full shadow-sm hover:bg-navbar-hover transition-colors duration-200 flex items-center justify-center"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? (
          <Sun 
            strokeWidth={3}/>
        ) : (
          <FontAwesomeIcon
          icon={faMoon}
          className="text-lg" size="lg"
        />        )}

      </button>
    </div>
  );
};

export default ThemeToggle;
