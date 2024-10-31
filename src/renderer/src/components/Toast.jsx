// src/components/Toast.jsx
import React, { useEffect } from 'react';

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 left-4 bg-stone-300 text-black p-4 rounded-sm shadow-lg z-50">
      <span className="loading loading-spinner loading-xs text-main mr-2"></span>
      {message}
    </div>
  );
};

export default Toast;
