import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SidebarModal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-96',  // 384px
    md: 'w-[32rem]',  // 512px
    lg: 'w-[48rem]',  // 768px
    xl: 'w-[64rem]'   // 1024px
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Sidebar Modal */}
      <div 
        className={`fixed ${sizeClasses[size]} shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          top: 0,
          bottom: 0,
          right: 0,
          height: '100vh',
          zIndex: 9999,
          backgroundColor: 'white',
          borderTopLeftRadius: '20px',
          borderBottomLeftRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(to right, #1e293b, #334155)',
            borderTopLeftRadius: '20px',
            flexShrink: 0
          }}
        >
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: 'white',
            margin: 0,
            display: 'flex',
            alignItems: 'center'
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded-xl transition-colors"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div 
          style={{ 
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#f9fafb',
            borderBottomLeftRadius: '20px'
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default SidebarModal;