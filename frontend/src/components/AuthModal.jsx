import React, { useEffect, useRef } from 'react';

export default function AuthModal({ isOpen, mode, onClose, onAuthSuccess }) {
  const iframeRef = useRef(null);

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

  useEffect(() => {
    if (isOpen && iframeRef.current) {
      // Send mode switch to iframe after load
      const timer = setTimeout(() => {
        try {
          if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              action: mode === 'register' ? 'OPEN_REGISTER' : 'OPEN_LOGIN'
            }, '*');
          }
        } catch (e) {
          // ignore cross-origin check if any
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[650px] max-h-[92vh] bg-[#020b18] border-2 border-[#00d2ff]/60 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,210,255,0.35)] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#030e1f] border-b border-[#174165] z-10 select-none">
          <div className="flex items-center gap-2">
            <span className="text-lg text-[#00d2ff] animate-pulse">⚓</span>
            <span className="font-['Outfit'] font-bold text-xs sm:text-sm text-[#e6f6ff] tracking-tight">
              ShipMS Bridge Command Authentication Portal
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30 font-semibold hidden sm:inline">
              MERN + AIS-4 TLS
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#091e36] hover:bg-rose-950 text-[#8cbcdb] hover:text-rose-300 border border-[#174165] hover:border-rose-500/50 flex items-center justify-center text-sm font-bold transition-all"
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
