import React, { useEffect } from 'react';
import { AlertTriangleIcon } from 'lucide-react';

interface ErrorMessageProps {
  message: string | null;
  onClose?: () => void;
  timeout?: number; // Timeout duration in milliseconds
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose, timeout = 3000 }) => {
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

  return (
    <div className="error-message flex">
      <AlertTriangleIcon color="red" />
      <span className="ml-2">{message}</span>
      {onClose && (
        <button className="ml-2 close-btn" onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
