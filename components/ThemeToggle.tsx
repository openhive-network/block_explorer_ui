import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

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
          <Moon
            fill="currentColor"
            stroke="currentColor"
            className="transform rotate-12 transition-transform duration-300" // Added !important
            strokeWidth={1}
          />
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
