import React, { useEffect } from 'react';
import { AlertTriangleIcon } from 'lucide-react';

interface ErrorMessageProps {
  message: string | null;
  onClose?: () => void;
  timeout?: number; // Timeout duration in milliseconds
  isWarning?: boolean; // Prop to control if it's a warning style
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose, timeout, isWarning = false }) => {
  useEffect(() => {
    if (message && timeout) {
      const timer = setTimeout(() => {
        if (onClose) onClose(); // Automatically close the error message after timeout
      }, timeout);

      // Cleanup timer when component is unmounted or message changes
      return () => clearTimeout(timer);
    }
  }, [message, timeout, onClose]);

  if (!message) return null; // Don't render anything if there's no message
  const baseClass = isWarning ? "" : "error-message";
  const warningStyle = isWarning ? "bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 shadow-md rounded-xl relative" : "";
  const closeButtonStyle = isWarning ? "absolute top-1 right-3" : "close-btn";


  return (
    
    <div className={`${baseClass} flex ${warningStyle}`}>
      <AlertTriangleIcon color="red" />
      <span className="ml-2">{message}</span>
      {onClose && (
        <button className={`ml-2 ${closeButtonStyle}`} onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
