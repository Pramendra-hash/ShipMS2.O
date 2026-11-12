import React, { useEffect, useRef, useState } from 'react';

export default function AuthModal({ isOpen, mode = 'login', onClose, onAuthSuccess }) {
  const iframeRef = useRef(null);
  const [currentMode, setCurrentMode] = useState(mode);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (e) => {
      if (e.data && e.data.type === 'SHIPMS_AUTH_SUCCESS' && e.data.user) {
        onAuthSuccess(e.data.user, `Bridge Access Authorized: Welcome Aboard, ${e.data.user.name}!`);
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, onAuthSuccess, onClose]);

  const postModeToIframe = (targetMode) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          action: targetMode === 'register' ? 'OPEN_REGISTER' : 'OPEN_LOGIN'
        }, '*');
      }
    } catch (e) {
      // ignore cross-origin check if any
    }
  };

  const handleSwitchMode = (newMode) => {
    setCurrentMode(newMode);
    postModeToIframe(newMode);
  };

  useEffect(() => {
    if (isOpen && iframeRef.current) {
      const timer = setTimeout(() => {
        postModeToIframe(currentMode);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[670px] max-h-[94vh] bg-[#020b18] border-2 border-[#00d2ff]/60 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,210,255,0.35)] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-[#030e1f] border-b border-[#174165] z-10 select-none gap-2">
          {/* Brand & Title */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg text-[#00d2ff] animate-pulse">⚓</span>
            <span className="font-['Outfit'] font-bold text-xs sm:text-sm text-[#e6f6ff] tracking-tight hidden sm:inline">
              ShipMS Maritime Portal
            </span>
          </div>

          {/* Direct Switch Tabs: Login vs Register */}
          <div className="flex items-center gap-1 bg-[#061527] p-1 rounded-xl border border-[#174165]">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentMode === 'login'
                  ? 'bg-gradient-to-r from-[#00d2ff] to-[#169bff] text-[#020b18] shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                  : 'text-[#8cbcdb] hover:text-[#00d2ff]'
              }`}
            >
              <span>🔐</span>
              <span>Sign In / Login</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentMode === 'register'
                  ? 'bg-gradient-to-r from-[#00d2ff] to-[#169bff] text-[#020b18] shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                  : 'text-[#8cbcdb] hover:text-[#00d2ff]'
              }`}
            >
              <span>✦</span>
              <span>Register</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#091e36] hover:bg-rose-950 text-[#8cbcdb] hover:text-rose-300 border border-[#174165] hover:border-rose-500/50 flex items-center justify-center text-sm font-bold transition-all shrink-0 cursor-pointer"
            title="Close Authentication Dialog"
          >
            ✕
          </button>
        </div>

        {/* Embedded shipms-auth Portal */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-[#030913]">
          <iframe
            ref={iframeRef}
            src="/auth/index.html"
            title="ShipMS Maritime Command Authentication"
            className="w-full h-full border-0 block"
            allow="autoplay; encrypted-media"
          />
        </div>

      </div>
    </div>
  );
}
