import React, { useRef, useEffect, useState } from 'react';

export default function HologramViewer({ selectedShip, isInactive }) {
  const canvasRef = useRef(null);
  const [hologramColor, setHologramColor] = useState('cyan');
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [isScanning, setIsScanning] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const rotRef = useRef({ x: 0.22, y: -0.65 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  const scanYRef = useRef(0);
  const scanDirRef = useRef(1);

  const colorMap = {
    cyan: { primary: '#00e5ff', secondary: '#0077b6', glow: 'rgba(0, 229, 255, 0.45)', laser: '#38bdf8' },
    violet: { primary: '#c084fc', secondary: '#7c3aed', glow: 'rgba(192, 132, 252, 0.45)', laser: '#e879f9' },
    emerald: { primary: '#34d399', secondary: '#059669', glow: 'rgba(52, 211, 153, 0.45)', laser: '#6ee7b7' },
    amber: { primary: '#fbbf24', secondary: '#d97706', glow: 'rgba(251, 191, 36, 0.45)', laser: '#fde68a' },
  };

  const activeColor = isInactive 
    ? { primary: '#f43f5e', secondary: '#9f1239', glow: 'rgba(244, 63, 94, 0.45)', laser: '#fda4af' }
    : colorMap[hologramColor];

  // 3D Ship Vertices
  const shipVertices = [
    [-120, -18, -18], [100, -18, -18], [130, -18, 0], [100, -18, 18], [-120, -18, 18], [-128, -14, 0],
    [-125, 6, -26], [90, 6, -26], [140, 8, 0], [90, 6, 26], [-125, 6, 26], [-130, 8, 0],
    [-80, 6, -16], [-50, 6, -16], [-50, 6, 16], [-80, 6, 16],
    [-80, 36, -14], [-50, 36, -14], [-50, 36, 14], [-80, 36, 14],
    [-68, 30, -28], [-68, 30, 28],
    [-65, 36, 0], [-65, 52, 0],
    [-72, 48, -10], [-58, 48, 10],
    [0, 6, -18], [75, 6, -18], [75, 6, 18], [0, 6, 18],
    [0, 26, -18], [75, 26, -18], [75, 26, 18], [0, 26, 18],
    [-42, 6, -18], [-8, 6, -18], [-8, 6, 18], [-42, 6, 18],
    [-42, 28, -18], [-8, 28, -18], [-8, 28, 18], [-42, 28, 18],
  ];

  const shipEdges = [
    [0,1], [1,2], [2,3], [3,4], [4,5], [5,0],
    [6,7], [7,8], [8,9], [9,10], [10,11], [11,6],
    [0,6], [1,7], [2,8], [3,9], [4,10], [5,11],
    [1,8], [3,8],
    [12,13], [13,14], [14,15], [15,12],
    [16,17], [17,18], [18,19], [19,16],
    [12,16], [13,17], [14,18], [15,19],
    [16,20], [19,21],
    [22,23], [24,25],
    [26,27], [27,28], [28,29], [29,26],
    [30,31], [31,32], [32,33], [33,30],
    [26,30], [27,31], [28,32], [29,33],
    [30,32], [31,33],
    [34,35], [35,36], [36,37], [37,34],
    [38,39], [39,40], [40,41], [41,38],
    [34,38], [35,39], [36,40], [37,41],
    [38,40], [39,41],
  ];

  const project3D = (x, y, z, rotX, rotY, w, h, zoom) => {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = z * cosY + x * sinY;

    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    const distance = 420;
    const scale = (distance / (distance + z2)) * zoom;
    const projX = w / 2 + x1 * scale;
    const projY = h / 2 - y2 * scale;

    return { x: projX, y: projY, z: z2, scale };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (!isDraggingRef.current) {
        rotRef.current.y += 0.007 * rotationSpeed;
      }

      const rotX = rotRef.current.x;
      const rotY = rotRef.current.y;

      // Base Pedestal
      ctx.save();
      const numPoints = 32;
      const baseRadius = 145;

      ctx.beginPath();
      for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;
        const bx = Math.cos(theta) * baseRadius;
        const bz = Math.sin(theta) * baseRadius;
        const p = project3D(bx, -36, bz, rotX, rotY, w, h, zoomLevel);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = activeColor.primary;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.35;
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;
        const bx = Math.cos(theta) * (baseRadius * 0.65);
        const bz = Math.sin(theta) * (baseRadius * 0.65);
        const p = project3D(bx, -36, bz, rotX, rotY, w, h, zoomLevel);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = activeColor.laser;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.25;
      ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const theta = (i / 8) * Math.PI * 2;
        const p1 = project3D(0, -36, 0, rotX, rotY, w, h, zoomLevel);
        const p2 = project3D(Math.cos(theta) * baseRadius, -36, Math.sin(theta) * baseRadius, rotX, rotY, w, h, zoomLevel);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = activeColor.primary;
        ctx.lineWidth = 0.6;
        ctx.globalAlpha = 0.15;
        ctx.stroke();
      }
      ctx.restore();

      // Scan Laser Plane
      if (isScanning) {
        scanYRef.current += 0.8 * scanDirRef.current;
        if (scanYRef.current > 55) scanDirRef.current = -1;
        if (scanYRef.current < -30) scanDirRef.current = 1;

        ctx.save();
        ctx.beginPath();
        const laserW = 140;
        const laserD = 35;
        const lp1 = project3D(-laserW, scanYRef.current, -laserD, rotX, rotY, w, h, zoomLevel);
        const lp2 = project3D(laserW, scanYRef.current, -laserD, rotX, rotY, w, h, zoomLevel);
        const lp3 = project3D(laserW, scanYRef.current, laserD, rotX, rotY, w, h, zoomLevel);
        const lp4 = project3D(-laserW, scanYRef.current, laserD, rotX, rotY, w, h, zoomLevel);

        ctx.moveTo(lp1.x, lp1.y);
        ctx.lineTo(lp2.x, lp2.y);
        ctx.lineTo(lp3.x, lp3.y);
        ctx.lineTo(lp4.x, lp4.y);
        ctx.closePath();

        const grad = ctx.createLinearGradient(lp1.x, lp1.y, lp3.x, lp3.y);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, activeColor.glow);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = activeColor.laser;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.restore();
      }

      // Project vertices
      const projected = shipVertices.map(v => 
        project3D(v[0], v[1], v[2], rotX, rotY, w, h, zoomLevel)
      );

      // Render wireframe mesh
      ctx.save();
      ctx.shadowColor = activeColor.primary;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = activeColor.primary;
      ctx.lineWidth = 1.3;
      ctx.globalAlpha = isInactive ? 0.75 : 0.9;

      shipEdges.forEach(([startIdx, endIdx]) => {
        const p1 = projected[startIdx];
        const p2 = projected[endIdx];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Nodes
      projected.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = activeColor.laser;
        ctx.fill();
      });
      ctx.restore();

      // Scanline effect
      ctx.save();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.015)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [hologramColor, rotationSpeed, isScanning, zoomLevel, isInactive]);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    rotRef.current.y += dx * 0.008;
    rotRef.current.x = Math.max(-0.6, Math.min(0.7, rotRef.current.x + dy * 0.008));
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoomLevel(prev => Math.max(0.6, Math.min(1.8, prev - e.deltaY * 0.001)));
  };

  return (
    <div id="hologram-section" className="relative rounded-3xl bg-[#030913]/90 border border-[#174165] overflow-hidden shadow-2xl p-5 sm:p-6 transition-all duration-300 hover-glow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#174165]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d2ff] to-[#a855f7] flex items-center justify-center text-lg text-[#020b18] font-bold shadow-[0_0_20px_rgba(0,210,255,0.4)]">
            🌐
          </div>
          <div>
            <h3 className="font-['Outfit'] font-black text-lg text-[#e6f6ff] tracking-tight flex items-center gap-2">
              <span>3D Hologram Vessel Simulation</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                isInactive ? 'bg-rose-950 text-rose-300 border border-rose-500/50' : 'bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30'
              }`}>
                {isInactive ? '⛔ INACTIVE DIAGNOSTIC' : '● REAL-TIME MATRIX'}
              </span>
            </h3>
            <p className="text-xs text-[#8cbcdb]">Interactive 360° Perspective • Drag to Rotate • Scroll to Zoom</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#071323] border border-[#174165]">
          {['cyan', 'violet', 'emerald', 'amber'].map(c => (
            <button
              key={c}
              onClick={() => setHologramColor(c)}
              className={`w-6 h-6 rounded-lg transition-transform hover:scale-110 flex items-center justify-center ${
                hologramColor === c ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: c === 'cyan' ? '#00e5ff' : c === 'violet' ? '#c084fc' : c === 'emerald' ? '#34d399' : '#fbbf24'
              }}
              title={`Hologram ${c}`}
            />
          ))}
        </div>
      </div>

      <div
        className="mt-4 relative rounded-2xl overflow-hidden border border-[#174165] bg-gradient-to-b from-[#02060d] via-[#040e1a] to-[#02060d] cursor-grab active:cursor-grabbing select-none h-80 sm:h-96"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          width={750}
          height={380}
          className="w-full h-full block"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          <div className="px-2.5 py-1 rounded bg-[#071323]/80 border border-[#174165] text-[10px] font-mono text-[#00d2ff] backdrop-blur-md">
            VESSEL: {selectedShip.name}
          </div>
          <div className="px-2.5 py-1 rounded bg-[#071323]/80 border border-[#174165] text-[10px] font-mono text-[#8cbcdb] backdrop-blur-md">
            HULL INTEGRITY: <strong className={isInactive ? 'text-rose-400' : 'text-emerald-400'}>{selectedShip.hologramIntegrity || '99.8%'}</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#071323]/80 border border-[#174165] text-[10px] font-mono text-[#8cbcdb] backdrop-blur-md">
            POWER: {selectedShip.powerCore || 'Triple-E 88MW'}
          </div>
        </div>

        <div className="absolute top-3 right-3 flex flex-col items-end gap-1 pointer-events-none">
          <span className="px-2.5 py-1 rounded bg-[#071323]/80 border border-[#174165] text-[10px] font-mono text-emerald-400 backdrop-blur-md">
            RADAR: 9.41 GHz ACTIVE
          </span>
          <span className="px-2.5 py-1 rounded bg-[#071323]/80 border border-[#174165] text-[10px] font-mono text-[#8cbcdb] backdrop-blur-md">
            VERTICES: 1,420 POINTS
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-[#8cbcdb] px-3 py-1.5 rounded-xl bg-[#07172b]/80 border border-[#174165] backdrop-blur-md pointer-events-none">
          <span>🖱 Drag mouse to rotate 3D vessel</span>
          <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
          <span>Mode: Hologram Wireframe</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScanning(!isScanning)}
            className={`px-3 py-1.5 rounded-xl font-mono font-semibold transition-all border ${
              isScanning
                ? 'bg-[#00d2ff]/20 text-[#00d2ff] border-[#00d2ff]/50'
                : 'bg-[#091b30] text-[#8cbcdb] border-[#174165]'
            }`}
          >
            {isScanning ? '⚡ Laser Scan: ON' : 'Laser Scan: OFF'}
          </button>

          <button
            onClick={() => setRotationSpeed(prev => (prev === 1 ? 2 : prev === 2 ? 0 : 1))}
            className="px-3 py-1.5 rounded-xl bg-[#091b30] text-[#8cbcdb] hover:text-[#00e5ff] border border-[#174165] font-mono"
          >
            Speed: {rotationSpeed === 0 ? 'Paused' : `${rotationSpeed}x`}
          </button>

          <button
            onClick={() => {
              rotRef.current = { x: 0.22, y: -0.65 };
              setZoomLevel(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#091b30] text-[#8cbcdb] hover:text-[#00e5ff] border border-[#174165] font-mono"
          >
            ↺ Reset View
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-[#8cbcdb]">
          <span>Length: 399.2m</span>
          <span>•</span>
          <span>Beam: 59.0m</span>
          <span>•</span>
          <span>Draft: 16.5m</span>
        </div>
      </div>
    </div>
  );
}
