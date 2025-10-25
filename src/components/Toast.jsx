import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Toast({ message, type, onClose, duration = 3000 }) {
  useEffect(() => {
    console.log('Toast rendered:', { message, type });
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  console.log('Toast component - message:', message, 'type:', type);
  
  if (!message) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
  const borderColor = isSuccess ? 'border-green-500' : 'border-red-500';
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const iconColor = isSuccess ? 'text-green-500' : 'text-red-500';

  return (
    <div className="fixed top-4 right-4 animate-slide-in-right" style={{ zIndex: 99999 }}>
      <div className={`${bgColor} ${borderColor} border-l-4 rounded-lg shadow-2xl p-4 max-w-md flex items-start space-x-3`}>
        <div className="flex-shrink-0">
          {isSuccess ? (
            <CheckCircleIcon className={`h-6 w-6 ${iconColor}`} />
          ) : (
            <XCircleIcon className={`h-6 w-6 ${iconColor}`} />
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {isSuccess ? 'Berhasil!' : 'Gagal!'}
          </p>
          <p className={`text-sm ${textColor} mt-1`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${textColor} hover:opacity-75 transition-opacity`}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
