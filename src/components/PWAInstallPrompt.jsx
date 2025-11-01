import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed (optional - could save to localStorage)
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if dismissed before
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-700">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <img src="/logo.png" alt="Vertinova Logo" className="w-10 h-10 object-contain" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">
              Install Vertinova Finance
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              Install aplikasi untuk Pengalaman Terbaik!
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Install Sekarang
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-slate-300 hover:text-white font-medium transition-colors"
              >
                Nanti
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
