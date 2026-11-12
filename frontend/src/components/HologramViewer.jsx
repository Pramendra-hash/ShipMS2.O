import React, { useRef, useState } from 'react';

export default function HologramViewer({ selectedShip, isInactive, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div
      id="hologram-section"
      className={`relative rounded-3xl bg-[#030913]/95 border border-[#174165] overflow-hidden shadow-2xl transition-all duration-300 hover-glow-card ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : 'p-4 sm:p-6'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#174165]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d2ff] to-[#a855f7] flex items-center justify-center text-lg text-[#020b18] font-bold shadow-[0_0_20px_rgba(0,210,255,0.4)]">
            🌐
          </div>
          <div>
            <h3 className="font-['Outfit'] font-black text-lg text-[#e6f6ff] tracking-tight flex items-center gap-2">
              <span>ShipMS — 3D Holographic Container Vessel Matrix</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                isInactive ? 'bg-rose-950 text-rose-300 border border-rose-500/50' : 'bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30'
              }`}>
                {isInactive ? '⛔ INACTIVE DIAGNOSTIC' : '● CORE v4.8 ACTIVE'}
              </span>
            </h3>
            <p className="text-xs text-[#8cbcdb]">
              Interactive Three.js 3D Wireframe • Coherent Laser Scan • OrbitControls • Hotspots Telemetry
            </p>
          </div>
        </div>

        {/* Quick Hologram Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            className="px-3 py-1.5 rounded-xl bg-[#07172b] hover:bg-[#0c2444] border border-[#174165] text-xs font-mono text-[#8cbcdb] hover:text-[#00d2ff] transition-all hover-glow-btn flex items-center gap-1.5"
            title="Reload Hologram"
          >
            <span>↺</span>
            <span className="hidden sm:inline">Reset Matrix</span>
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-xl bg-[#07172b] hover:bg-[#0c2444] border border-[#174165] text-xs font-mono text-[#8cbcdb] hover:text-[#00d2ff] transition-all hover-glow-btn flex items-center gap-1.5"
            title={isFullscreen ? "Exit Fullscreen" : "Expand Fullscreen"}
          >
            <span>{isFullscreen ? '↙ Exit' : '⤢ Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Embedded 3D Hologram Application Container (hologram 2.o) */}
      <div className={`mt-4 relative rounded-2xl overflow-hidden border border-[#174165] bg-[#010610] shadow-inner ${
        isFullscreen ? 'flex-1 min-h-[500px]' : 'h-[480px] sm:h-[580px] lg:h-[640px]'
      }`}>
        <iframe
          ref={iframeRef}
          src="/hologram/index.html"
          title="ShipMS 3D Holographic Container Vessel Matrix"
          className="w-full h-full border-0 block"
          allow="accelerometer; autoplay; encrypted-media; gyroscope"
        />

        {/* Diagnostic Floating Ribbon if Inactive */}
        {isInactive && (
          <div className="absolute top-4 left-4 right-4 pointer-events-none flex justify-center">
            <div className="px-4 py-2 rounded-2xl bg-rose-950/90 border border-rose-500/70 text-rose-200 text-xs font-mono backdrop-blur-md shadow-2xl flex items-center gap-2 animate-pulse">
              <span>⚠️</span>
              <span><strong>DIAGNOSTIC MODE:</strong> {selectedShip.name} is currently docked at port repair bay. Holographic propulsion offline.</span>
            </div>
          </div>
        )}
      </div>

      {/* Telemetry Footer Info */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#8cbcdb]">
        <div className="flex items-center gap-3">
          <span>VESSEL: <strong className="text-[#00d2ff]">{selectedShip.name}</strong></span>
          <span>HULL INTEGRITY: <strong className={isInactive ? "text-rose-400" : "text-emerald-400"}>{selectedShip.hologramIntegrity || "99.8%"}</strong></span>
          <span>POWER CORE: <strong className="text-[#e6f6ff]">{selectedShip.powerCore || "Triple-E 88MW"}</strong></span>
        </div>
        <div className="text-[11px] text-[#4d7a9c]">
          3D Engine: Three.js + PostProcessing UnrealBloomPass • Shader: 480nm Coherent Laser
        </div>
      </div>
    </div>
  );
}
