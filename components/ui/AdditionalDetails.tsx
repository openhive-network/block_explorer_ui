import { useState, ReactNode, useEffect, useRef } from "react";
import { Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdditionalDetailsProps {
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const AdditionalDetails: React.FC<AdditionalDetailsProps> = ({
  children,
  isOpen,
  onToggle,
  className,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [insetStyle, setInsetStyle] = useState({});
  const detailsHeight = 340;
  const [isMobile, setIsMobile] = useState(false); // State for mobile detection

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen) {
      onToggle();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onToggle]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); 
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const buttonTop = rect.top;
      const buttonBottom = rect.bottom;
      const windowHeight = window.innerHeight;

      const potentialBottomTop = buttonBottom + 5;
      const potentialTopTop = buttonTop - detailsHeight + 70;

      let top;

      if (buttonBottom + detailsHeight <= windowHeight) {
        top = buttonBottom;
      } else if (potentialTopTop >= 0) {
        top = potentialTopTop;
      } else {
        top = 5;
      }

      setInsetStyle({
        top: isMobile ? '6%' : `${top}px`,
        left: isMobile ? '10%' : `${rect.left + 15}px`,
        width: isMobile ? '80%' : 'auto',
        transform: isMobile ? 'translateX(0)' : 'none',
      });
    } else {
      setInsetStyle({});
    }
  }, [isOpen, children, isMobile]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className={cn(
          "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full p-1 transition-colors duration-150 relative",
          className
        )}
      >
        <Eye className="w-4 h-4" />
      </button>

      {isOpen && buttonRef.current && (
        <div
          className="fixed z-50 bg-theme  rounded-xl shadow-xl dark:shadow-md"
          style={{
            zIndex: 600,
            ...insetStyle,
          }}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <h2>Additional Info</h2>
            <button onClick={onToggle} className="ml-4">
              <X className="fill-current w-4 h-4" />
            </button>
          </div>
          <div
            className="p-4 overflow-wrap bg-theme text-xs rounded-xl shadow-xl"
            style={{
              maxHeight: isMobile ? '70vh' : 'none',
              overflowY: 'auto', 
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalDetails;