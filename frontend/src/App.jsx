import React, { useState, useEffect } from 'react';
import HologramViewer from './components/HologramViewer';
import AuthModal from './components/AuthModal';
import VisualEditor from './components/VisualEditor';

export default function App() {
  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shipms_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastShow(true);
    setTimeout(() => {
      setToastShow(false);
    }, 3200);
  };

  // Fleet Vessels Data
  const fleetShips = [
    {
      id: 'ship-1',
      name: 'Oceanic Explorer',
      imo: 'IMO 9821422',
      type: 'Ultra-Large Container Ship',
      teu: '24,000 TEU',
      flag: '🇸🇬 Singapore',
      status: 'Active At Sea',
      isInactive: false,
      speed: '19.4 kn',
      coordinates: '18°55\'N, 72°49\'E',
      route: 'Mumbai ➔ Dubai Jebel Ali',
      captain: 'Capt. Vikram Solanki',
      eta: '14 Nov 06:00 UTC',
      powerCore: 'MAN B&W 11G95ME (88 MW)',
      hologramIntegrity: '99.8%',
      fuelStatus: 'Bunker 82% (VLSFO)',
      cargo: '94% Manifested',
      image: '/oceanic-explorer.jpg'
    },
    {
      id: 'ship-2',
      name: 'Titan Mariner',
      imo: 'IMO 9745118',
      type: 'Capesize Bulk Carrier',
      teu: '180,000 DWT',
      flag: '🇲🇭 Marshall Islands',
      status: 'Active At Sea',
      isInactive: false,
      speed: '21.2 kn',
      coordinates: '21°12\'N, 68°34\'E',
      route: 'Singapore ➔ Rotterdam',
      captain: 'Capt. Elena Rostova',
      eta: '18 Nov 14:30 UTC',
      powerCore: 'Wärtsilä 9X82 (54 MW)',
      hologramIntegrity: '98.5%',
      fuelStatus: 'Bunker 76% (LNG Dual)',
      cargo: '88% Manifested',
      image: '/oceanic-explorer.jpg'
    },
    {
      id: 'ship-3',
      name: 'Pacific Falcon',
      imo: 'IMO 9632881',
      type: 'Q-Max LNG Carrier',
      teu: '266,000 m³',
      flag: '🇵🇦 Panama',
      status: 'Active At Sea',
      isInactive: false,
      speed: '18.5 kn',
      coordinates: '24°45\'N, 58°12\'E',
      route: 'Ras Laffan ➔ Tokyo Bay',
      captain: 'Capt. Marcus Vance',
      eta: '20 Nov 22:15 UTC',
      powerCore: 'MAN Dual Fuel 43MW',
      hologramIntegrity: '99.2%',
      fuelStatus: 'Bunker 91% (Boil-off LNG)',
      cargo: '100% Manifested',
      image: '/oceanic-explorer.jpg'
    },
    {
      id: 'ship-4',
      name: 'Royal Voyager',
      imo: 'IMO 9400192',
      type: 'Post-Panamax Container',
      teu: '9,400 TEU',
      flag: '🇱🇷 Liberia',
      status: 'Inactive / Maint.',
      isInactive: true,
      speed: '0.0 kn (STOPPED)',
      coordinates: '18°56\'N, 72°50\'E (Anchorage)',
      route: 'Mumbai Port Repair Slipway 3',
      captain: 'Capt. Aoi Tanaka (On Shore)',
      eta: 'Drydock Refit in Progress',
      powerCore: 'Sulzer 12RTA96C (Offline)',
      hologramIntegrity: '72.4% (Diagnostic)',
      fuelStatus: 'Bunker 41% (Defueled)',
      cargo: '0% (Discharged at Port)',
      image: '/oceanic-explorer.jpg'
    }
  ];

  const [selectedShipId, setSelectedShipId] = useState('ship-1');
  const selectedShip = fleetShips.find(s => s.id === selectedShipId) || fleetShips[0];

  // Motion along corridor for active ship
  const [corridorProgress, setCorridorProgress] = useState(0.35);

  useEffect(() => {
    if (selectedShip.isInactive) {
      // Royal Voyager is STOPPED at the starting point / anchorage
      setCorridorProgress(0.04);
      return;
    }

    const interval = setInterval(() => {
      setCorridorProgress(prev => {
        const next = prev + 0.003;
        return next > 0.95 ? 0.08 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [selectedShip.isInactive]);

  // Captains data
  const captains = [
    {
      name: 'Capt. Vikram Solanki',
      rank: 'Master Mariner • Unlimited',
      vessel: 'Oceanic Explorer',
      experience: '22 Years Maritime Service',
      awards: 'Lloyds Maritime Safety Shield 2025',
      status: 'On Bridge • Arabian Sea'
    },
    {
      name: 'Capt. Elena Rostova',
      rank: 'Senior Fleet Captain',
      vessel: 'Titan Mariner',
      experience: '19 Years Maritime Service',
      awards: 'IMO Exemplary Seamanship Award',
      status: 'On Bridge • Indian Ocean'
    },
    {
      name: 'Capt. Marcus Vance',
      rank: 'Chief Navigator & Master',
      vessel: 'Pacific Falcon',
      experience: '26 Years Maritime Service',
      awards: 'Global LNG Carrier Excellence 2024',
      status: 'On Bridge • Gulf of Oman'
    },
    {
      name: 'Capt. Aoi Tanaka',
      rank: 'Staff Captain & Port Liaison',
      vessel: 'Royal Voyager',
      experience: '17 Years Maritime Service',
      awards: 'Port Operations Excellence',
      status: 'Shore Control • Mumbai Dockyard'
    }
  ];

  // Upcoming Voyages Data
  const upcomingVoyages = [
    { id: 'VY-9041', vessel: 'Oceanic Explorer', origin: 'Nhava Sheva (Mumbai)', dest: 'Jebel Ali (Dubai)', cargo: '22,400 TEU Electronics', eta: '14 Nov 06:00', status: 'At Sea' },
    { id: 'VY-8820', vessel: 'Titan Mariner', origin: 'Port Hedland', dest: 'Rotterdam Port', cargo: '175,000 MT Iron Ore', eta: '18 Nov 14:30', status: 'At Sea' },
    { id: 'VY-7714', vessel: 'Pacific Falcon', origin: 'Ras Laffan', dest: 'Tokyo LNG Terminal', cargo: '260,000 m³ LNG Gas', eta: '20 Nov 22:15', status: 'At Sea' },
    { id: 'VY-0042', vessel: 'Royal Voyager', origin: 'Mumbai Anchorage', dest: 'Drydock Bay 4', cargo: 'Ballast (Refit)', eta: 'Maintenance Stop', status: 'Inactive / Maint.' }
  ];

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('shipms_token');
    localStorage.removeItem('shipms_user');
    setUser(null);
    showToast('Officer logged out successfully');
  };

  const handleAuthSuccess = (userData, message) => {
    setUser(userData);
    showToast(message);
  };

  return (
    <div className="min-h-screen bg-[#030913] text-[#e6f6ff] font-['DM_Sans',sans-serif] selection:bg-[#00d2ff] selection:text-[#020b18] overflow-x-hidden">
      
      {/* Toast Notification */}
      <div className={`fve-toast ${toastShow ? 'show' : ''}`}>
        {toastMsg}
      </div>

      {/* Floating Visual Editor (Universal Design Controller) */}
      <VisualEditor onToast={showToast} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        mode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* =========================================================================
          1. STICKY TOP NAVBAR (Single Horizontal Bar, No Screen Overlap)
          ========================================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#020b18]/90 border-b border-[#174165] px-4 sm:px-6 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left Brand: ShipMS + Subtitle */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#home" className="flex items-center gap-2 group">
              <span className="text-2xl text-[#00d2ff] group-hover:scale-110 transition-transform">⚓</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-['Outfit'] font-black text-xl text-[#e6f6ff] tracking-tight group-hover:text-[#00d2ff] transition-colors">
                    ShipMS
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#169bff]/20 text-[#00d2ff] border border-[#169bff]/40 font-bold">
                    v3.4 FLEET OS
                  </span>
                </div>
                <span className="text-[11px] text-[#8cbcdb] font-medium hidden sm:block">
                  Ship Management System
                </span>
              </div>
            </a>
          </div>

          {/* Center Navigation Links (Clean Single Horizontal Row) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#8cbcdb]">
            <a href="#home" className="hover:text-[#00d2ff] transition-colors hover-glow-text">Home</a>
            <a href="#fleet" className="hover:text-[#00d2ff] transition-colors hover-glow-text">Fleet</a>
            <a href="#captains" className="hover:text-[#00d2ff] transition-colors hover-glow-text">Captains</a>
            <a href="#routes" className="hover:text-[#00d2ff] transition-colors hover-glow-text">Routes</a>
            <a href="#hologram-section" className="hover:text-[#00d2ff] transition-colors hover-glow-text flex items-center gap-1">
              <span className="text-xs">🌐</span> 3D Hologram
            </a>
            <a href="#about" className="hover:text-[#00d2ff] transition-colors hover-glow-text">About Us</a>
            <a href="#contact" className="hover:text-[#00d2ff] transition-colors hover-glow-text">Contact</a>
          </nav>

          {/* Right Controls: Search, Live Status, Login / Register */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Input Bar */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#071323] border border-[#174165] text-xs focus-within:border-[#00d2ff] transition-all hover-glow-bar">
              <input
                type="text"
                placeholder="Search ships, IMO, routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-[#e6f6ff] text-xs outline-none w-36 lg:w-44 placeholder-[#4d7a9c]"
              />
              <span className="text-xs text-[#8cbcdb]">🔍</span>
            </div>

            {/* Live Operational Metric Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#041d33] border border-[#00d2ff]/40 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[#00d2ff] font-bold">21 / 28 AT SEA</span>
            </div>

            {/* User Session or Login/Register Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#091e36] border border-[#174165]">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#00d2ff] to-[#169bff] text-[#020b18] font-bold flex items-center justify-center text-[10px]">
                    {user.name ? user.name[0].toUpperCase() : 'O'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-[#e6f6ff] truncate max-w-[100px]">{user.name}</span>
                    <span className="text-[9px] text-[#00d2ff] font-mono">{user.role || 'Officer'}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-xl bg-[#1c0c16] hover:bg-rose-950 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-all hover-glow-btn"
                  title="Sign Out"
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#07172b] hover:bg-[#0c2444] border border-[#174165] text-xs font-bold text-[#8cbcdb] hover:text-[#00d2ff] transition-all hover-glow-btn flex items-center gap-1.5"
                >
                  <span>🔐</span>
                  <span>Login</span>
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#169bff] text-[#020b18] text-xs font-black shadow-[0_0_15px_rgba(0,210,255,0.4)] transition-all hover-glow-btn flex items-center gap-1.5"
                >
                  <span>✦</span>
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* =========================================================================
            2. COUNTER METRICS STRIP (Exact 6-Card Strip from User Screenshot)
            ========================================================================= */}
        <section id="metrics-strip" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Card 1: Total Fleet */}
          <div className="p-3.5 rounded-2xl bg-[#071323]/80 border border-[#174165] hover-glow-card transition-all">
            <div className="flex items-center justify-between text-xs text-[#8cbcdb] mb-1.5 font-medium">
              <span>Total Fleet</span>
              <span className="text-sm">🚢</span>
            </div>
            <div className="font-['Outfit'] font-black text-2xl text-[#e6f6ff]">
              28
            </div>
            <div className="text-[10px] text-[#4d7a9c] font-mono mt-0.5">
              Global AIS active
            </div>
          </div>

          {/* Card 2: Active At Sea */}
          <div className="p-3.5 rounded-2xl bg-[#071323]/80 border border-[#174165] hover-glow-card transition-all">
            <div className="flex items-center justify-between text-xs text-[#8cbcdb] mb-1.5 font-medium">
              <span>Active At Sea</span>
              <span className="text-sm">🌊</span>
            </div>
            <div className="font-['Outfit'] font-black text-2xl text-emerald-400">
              21
            </div>
            <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
              75% capacity
            </div>
          </div>

          {/* Card 3: In Port / Loading */}
          <div className="p-3.5 rounded-2xl bg-[#071323]/80 border border-[#174165] hover-glow-card transition-all">
            <div className="flex items-center justify-between text-xs text-[#8cbcdb] mb-1.5 font-medium">
              <span>In Port / Loading</span>
              <span className="text-sm text-[#00d2ff]">⚓</span>
            </div>
            <div className="font-['Outfit'] font-black text-2xl text-[#00d2ff]">
              4
            </div>
            <div className="text-[10px] text-[#00d2ff]/80 font-mono mt-0.5">
              Turnaround 14h
            </div>
          </div>

          {/* Card 4: Inactive / Maint. (Highlighted Red, Royal Voyager link) */}
          <div
            onClick={() => {
              setSelectedShipId('ship-4');
              showToast('Selected Inactive Vessel: Royal Voyager (STOPPED at port)');
            }}
            className="p-3.5 rounded-2xl bg-[#140810]/90 border border-rose-500/40 hover-glow-card transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-rose-300 mb-1.5 font-medium">
              <span>Inactive / Maint.</span>
              <span className="text-sm text-rose-400 group-hover:rotate-45 transition-transform">🔧</span>
            </div>
            <div className="font-['Outfit'] font-black text-2xl text-rose-500">
              3
            </div>
            <div className="text-[10px] text-rose-300 font-mono mt-0.5 font-semibold group-hover:underline">
              Royal Voyager ➔
            </div>
          </div>

          {/* Card 5: Nautical Miles */}
          <div className="p-3.5 rounded-2xl bg-[#071323]/80 border border-[#174165] hover-glow-card transition-all">
            <div className="flex items-center justify-between text-xs text-[#8cbcdb] mb-1.5 font-medium">
              <span>Nautical Miles</span>
              <span className="text-sm text-[#00d2ff]">🧭</span>
            </div>
            <div className="font-['Outfit'] font-black text-2xl text-[#00d2ff]">
              1.42M
            </div>
            <div className="text-[10px] text-[#4d7a9c] font-mono mt-0.5">
              Annual total
            </div>
          </div>

          {/* Card 6: Safety Index */}
          <div className="p-3.5 rounded-2xl bg-[#071323]/80 border border-[#174165] hover-glow-card transition-all">
            <div className="flex items-center justify-between text-xs text-[#8cbcdb] mb-1.5 font-medium">
              <span>Safety Index</span>
              <span className="text-sm text-amber-400">🛡</span>
            </div>
            <div className="font-['Outfit'] font-black text-2xl text-amber-400">
              99.6%
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">
              Zero Incident
            </div>
          </div>

        </section>

        {/* =========================================================================
            3. HERO SECTION & LIVE VESSEL SPOTLIGHT
            ========================================================================= */}
        <section id="home" className="relative rounded-3xl overflow-hidden border border-[#174165] bg-gradient-to-r from-[#040e1d] via-[#07172b] to-[#040e1d] p-6 lg:p-8 hover-glow-card transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-xs font-mono text-[#00d2ff]">
                <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-ping" />
                AUTOMATED FLEET INTELLIGENCE &amp; TELEMETRY
              </div>

              <h1 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[#e6f6ff] tracking-tight leading-tight">
                Intelligent Marine <br />
                <span className="bg-gradient-to-r from-[#00d2ff] via-[#169bff] to-[#a855f7] bg-clip-text text-transparent">
                  Fleet Operations
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#8cbcdb] leading-relaxed max-w-xl">
                Real-time satellite AIS vessel tracking, route corridor simulation, 3D holographic wireframe hull diagnostics, and officer bridge authentication powered by ShipMS v3.4 FLEET OS.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-xl bg-[#071323] border border-[#174165] text-xs font-mono text-[#8cbcdb]">
                  📡 AIS SAT-FEED: ONLINE
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#071323] border border-[#174165] text-xs font-mono text-[#8cbcdb]">
                  🌊 SEA STATE: BEAUFORT 3
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#071323] border border-[#174165] text-xs font-mono text-[#8cbcdb]">
                  ⚡ ENGINE OPTIMIZER: ACTIVE
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <a
                  href="#tracking"
                  className="px-5 py-2.5 rounded-xl font-['Outfit'] font-bold text-xs bg-gradient-to-r from-[#00d2ff] to-[#169bff] text-[#020b18] shadow-[0_0_20px_rgba(0,210,255,0.4)] hover-glow-btn transition-all"
                >
                  Track {selectedShip.name} ➔
                </a>
                <a
                  href="#hologram-section"
                  className="px-5 py-2.5 rounded-xl font-['Outfit'] font-bold text-xs bg-[#07172b] hover:bg-[#0e2746] border border-[#174165] text-[#00d2ff] hover-glow-btn transition-all flex items-center gap-1.5"
                >
                  <span>🌐</span>
                  <span>Open 3D Hologram</span>
                </a>
                <button
                  onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}
                  className="px-5 py-2.5 rounded-xl font-['Outfit'] font-bold text-xs bg-[#091b30] hover:bg-[#102d4f] border border-[#174165] text-[#8cbcdb] hover:text-white transition-all hover-glow-btn"
                >
                  ✦ Register Officer
                </button>
              </div>
            </div>

            {/* Right Hero Visual (Container Ship with Live HUD) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#174165] shadow-2xl group">
                <img
                  src={selectedShip.image || '/oceanic-explorer.jpg'}
                  alt={selectedShip.name}
                  className="w-full h-64 sm:h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                
                {/* Overlay Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030913] via-transparent to-[#030913]/40 pointer-events-none" />

                {/* Status Overlay HUD */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#020b18]/85 border border-[#174165] backdrop-blur-md text-[11px] font-mono text-[#00d2ff]">
                  ● {selectedShip.name} • {selectedShip.status}
                </div>

                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#020b18]/90 border border-[#174165] backdrop-blur-md flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-[#8cbcdb]">CURRENT ROUTE</div>
                    <div className="font-bold text-[#e6f6ff] truncate">{selectedShip.route}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#8cbcdb]">SPEED</div>
                    <div className={`font-mono font-bold ${selectedShip.isInactive ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedShip.speed}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            4. 3D HOLOGRAM VESSEL SIMULATION
            ========================================================================= */}
        <section id="hologram">
          <HologramViewer
            selectedShip={selectedShip}
            isInactive={selectedShip.isInactive}
          />
        </section>

        {/* =========================================================================
            5. LIVE FLEET TRACKING: MARINE CORRIDOR (Motion & Stop Behavior)
            ========================================================================= */}
        <section id="tracking" className="rounded-3xl bg-[#071323]/80 border border-[#174165] p-5 sm:p-6 hover-glow-card transition-all">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#174165]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d2ff] to-[#169bff] flex items-center justify-center text-lg text-[#020b18] font-bold shadow-[0_0_15px_rgba(0,210,255,0.4)]">
                🧭
              </div>
              <div>
                <h3 className="font-['Outfit'] font-black text-lg text-[#e6f6ff] tracking-tight flex items-center gap-2">
                  <span>Live Fleet Tracking: Marine Corridor</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    selectedShip.isInactive
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  }`}>
                    {selectedShip.isInactive ? '⛔ STOPPED AT PORT' : '● REAL-TIME MOTION'}
                  </span>
                </h3>
                <p className="text-xs text-[#8cbcdb]">
                  Arabian Sea Maritime Highway: Mumbai Port ➔ Gulf of Oman ➔ Dubai Jebel Ali
                </p>
              </div>
            </div>

            {/* Vessel Selector Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#030d1a] border border-[#174165]">
              {fleetShips.map(ship => (
                <button
                  key={ship.id}
                  onClick={() => {
                    setSelectedShipId(ship.id);
                    showToast(ship.isInactive 
                      ? `Selected ${ship.name}: VESSEL STOPPED at Mumbai Anchorage`
                      : `Tracking ${ship.name}: Underway at ${ship.speed}`
                    );
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedShipId === ship.id
                      ? (ship.isInactive ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'bg-[#00d2ff] text-[#020b18] shadow-[0_0_15px_rgba(0,210,255,0.5)]')
                      : (ship.isInactive ? 'text-rose-400 hover:bg-rose-950/40' : 'text-[#8cbcdb] hover:text-white')
                  }`}
                >
                  {ship.name} {ship.isInactive ? '(Inactive)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Banner when Royal Voyager (Inactive) is selected */}
          {selectedShip.isInactive && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-950/70 border border-rose-500/60 flex items-center gap-3 text-xs text-rose-200 animate-pulse">
              <span className="text-xl">⚠️</span>
              <div>
                <strong className="text-rose-300 font-bold">VESSEL STATUS ALERT:</strong> Royal Voyager is currently <span className="underline font-bold">STOPPED</span> at Mumbai Anchorage (Slipway 3) due to Scheduled Engine Refit &amp; Propulsion Overhaul. Live motion along maritime corridor is halted.
              </div>
            </div>
          )}

          {/* SVG Interactive Marine Corridor Map */}
          <div className="mt-4 relative rounded-2xl overflow-hidden border border-[#174165] bg-[#020712] h-72 sm:h-80 select-none">
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: 'radial-gradient(#00d2ff 1px, transparent 1px), radial-gradient(#169bff 1px, #020712 1px)',
              backgroundSize: '30px 30px',
              backgroundPosition: '0 0, 15px 15px'
            }} />

            {/* Radar Sonar Rings in Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-[#00d2ff]/10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-[#00d2ff]/15 pointer-events-none" />

            <svg viewBox="0 0 900 360" className="w-full h-full">
              <defs>
                <linearGradient id="corridorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#169bff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
                </linearGradient>
                <filter id="laserGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Coastline approximations */}
              {/* West (Arabian Peninsula) */}
              <path d="M 40 40 Q 140 120 180 200 T 260 320" fill="none" stroke="#174165" strokeWidth="2" strokeDasharray="4 4" />
              {/* East (Indian Subcontinent) */}
              <path d="M 840 40 Q 760 140 730 220 T 700 340" fill="none" stroke="#174165" strokeWidth="2" strokeDasharray="4 4" />

              {/* Waypoint Port 1: Mumbai (Start Point) */}
              <circle cx="750" cy="220" r="8" fill="#00d2ff" filter="url(#laserGlow)" />
              <circle cx="750" cy="220" r="16" fill="none" stroke="#00d2ff" strokeWidth="1" opacity="0.4" />
              <text x="750" y="248" fill="#e6f6ff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
                Mumbai Anchorage (IN)
              </text>
              <text x="750" y="262" fill="#8cbcdb" fontSize="10" textAnchor="middle" fontFamily="monospace">
                Port ID: INBOM
              </text>

              {/* Waypoint Port 2: Dubai Jebel Ali (End Point) */}
              <circle cx="160" cy="110" r="8" fill="#22c55e" filter="url(#laserGlow)" />
              <circle cx="160" cy="110" r="16" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.4" />
              <text x="160" y="85" fill="#e6f6ff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
                Dubai Jebel Ali (UAE)
              </text>
              <text x="160" y="99" fill="#8cbcdb" fontSize="10" textAnchor="middle" fontFamily="monospace">
                Port ID: AEJEA
              </text>

              {/* Intermediate Waypoint: Muscat / Gulf of Oman */}
              <circle cx="340" cy="160" r="5" fill="#8cbcdb" opacity="0.7" />
              <text x="340" y="180" fill="#8cbcdb" fontSize="10" textAnchor="middle" fontFamily="monospace">
                Muscat Corridor
              </text>

              {/* Active Shipping Corridor Path */}
              {/* Route from Mumbai (750, 220) to Muscat (340, 160) to Dubai (160, 110) */}
              <path
                id="shippingRoute"
                d="M 750 220 Q 520 230 340 160 Q 240 125 160 110"
                fill="none"
                stroke={selectedShip.isInactive ? '#f43f5e' : 'url(#corridorGlow)'}
                strokeWidth="4"
                className={selectedShip.isInactive ? '' : 'animate-route-flow'}
                opacity={selectedShip.isInactive ? 0.4 : 0.85}
              />

              {/* Moving / Stopped Vessel on the Corridor */}
              {(() => {
                // Compute current position along bezier curve
                // Start: (750, 220) -> End: (160, 110)
                const t = corridorProgress;
                // Cubic/Quadratic interpolation
                // Mumbai (750, 220) to Dubai (160, 110) with curve control at (450, 240)
                const p0 = { x: 750, y: 220 };
                const p1 = { x: 450, y: 240 };
                const p2 = { x: 160, y: 110 };

                // Quad Bezier: (1-t)^2 * p0 + 2(1-t)t * p1 + t^2 * p2
                const cx = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
                const cy = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

                if (selectedShip.isInactive) {
                  // STOPPED AT STARTING POINT / ANCHORAGE
                  return (
                    <g transform="translate(750, 220)">
                      <circle cx="0" cy="0" r="14" fill="#f43f5e" opacity="0.3" className="animate-ping" />
                      <circle cx="0" cy="0" r="9" fill="#f43f5e" filter="url(#laserGlow)" />
                      <text x="0" y="-18" fill="#fca5a5" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
                        ⛔ Royal Voyager (STOPPED)
                      </text>
                      <text x="0" y="-6" fill="#fca5a5" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        0.0 kn • Drydock Refit
                      </text>
                    </g>
                  );
                }

                return (
                  <g transform={`translate(${cx}, ${cy})`}>
                    {/* Pulsing Radar Wave */}
                    <circle cx="0" cy="0" r="16" fill="none" stroke="#00d2ff" strokeWidth="1.5" opacity="0.5" className="animate-ping" />
                    {/* Vessel Body Marker */}
                    <circle cx="0" cy="0" r="7" fill="#00d2ff" filter="url(#laserGlow)" />
                    {/* Heading Indicator Arrow */}
                    <polygon points="0,-10 -5,6 5,6" fill="#ffffff" transform="rotate(-65)" />
                    {/* Vessel Label Pill */}
                    <rect x="-65" y="-36" width="130" height="20" rx="6" fill="#020b18" stroke="#00d2ff" strokeWidth="1" opacity="0.9" />
                    <text x="0" y="-22" fill="#e6f6ff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
                      🚢 {selectedShip.name} ({selectedShip.speed})
                    </text>
                  </g>
                );
              })()}
            </svg>

            {/* Bottom HUD Bar */}
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between px-3 py-1.5 rounded-xl bg-[#020b18]/85 border border-[#174165] backdrop-blur-md text-[11px] font-mono text-[#8cbcdb]">
              <div className="flex items-center gap-3">
                <span>VESSEL: <strong className="text-[#e6f6ff]">{selectedShip.name}</strong></span>
                <span>STATUS: <strong className={selectedShip.isInactive ? 'text-rose-400' : 'text-emerald-400'}>{selectedShip.status}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span>SPEED: <strong className={selectedShip.isInactive ? 'text-rose-400' : 'text-[#00d2ff]'}>{selectedShip.speed}</strong></span>
                <span>COORDINATES: {selectedShip.coordinates}</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. POPULAR SHIPS & FLEET REGISTRY (With Royal Voyager Inactive)
            ========================================================================= */}
        <section id="fleet" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Outfit'] font-black text-2xl text-[#e6f6ff] tracking-tight">
                Fleet Registry &amp; Popular Vessels
              </h2>
              <p className="text-xs text-[#8cbcdb]">Click any ship to inspect in 3D Hologram and Live Corridor</p>
            </div>
            <span className="text-xs font-mono text-[#00d2ff] bg-[#00d2ff]/10 px-3 py-1 rounded-xl border border-[#00d2ff]/30">
              4 Highlighted Ships
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fleetShips.map(ship => (
              <div
                key={ship.id}
                onClick={() => {
                  setSelectedShipId(ship.id);
                  showToast(ship.isInactive 
                    ? `Selected Royal Voyager (INACTIVE): Motion stopped at port`
                    : `Selected ${ship.name}: Underway on ${ship.route}`
                  );
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover-glow-card relative flex flex-col justify-between ${
                  selectedShipId === ship.id
                    ? (ship.isInactive ? 'bg-[#180912] border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)]' : 'bg-[#06182c] border-[#00d2ff] shadow-[0_0_25px_rgba(0,210,255,0.3)]')
                    : (ship.isInactive ? 'bg-[#12070e] border-rose-950/60' : 'bg-[#071323]/80 border-[#174165]')
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono text-[#4d7a9c]">{ship.imo}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ship.isInactive
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    }`}>
                      {ship.status}
                    </span>
                  </div>

                  <h3 className="font-['Outfit'] font-bold text-lg text-[#e6f6ff] tracking-tight hover-glow-text mb-1">
                    {ship.name}
                  </h3>
                  <div className="text-xs text-[#8cbcdb] mb-3">{ship.type} • {ship.teu}</div>

                  <div className="space-y-1.5 text-xs font-mono border-t border-[#174165] pt-3">
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Route:</span>
                      <span className="text-[#cbd5e1] truncate max-w-[150px]">{ship.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Speed:</span>
                      <span className={ship.isInactive ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{ship.speed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Captain:</span>
                      <span className="text-[#8cbcdb]">{ship.captain.split(' ')[1] || ship.captain}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#174165] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#4d7a9c]">{ship.flag}</span>
                  <button className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedShipId === ship.id
                      ? (ship.isInactive ? 'bg-rose-600 text-white' : 'bg-[#00d2ff] text-[#020b18]')
                      : 'bg-[#0c2444] text-[#8cbcdb] hover:text-white'
                  }`}>
                    {selectedShipId === ship.id ? 'Viewing ➔' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            7. CAPTAINS & MASTER MARINERS
            ========================================================================= */}
        <section id="captains" className="rounded-3xl bg-[#071323]/80 border border-[#174165] p-5 sm:p-6 hover-glow-card transition-all">
          <div className="flex items-center justify-between pb-4 border-b border-[#174165]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d2ff] to-[#169bff] flex items-center justify-center text-lg text-[#020b18] font-bold">
                👨‍✈️
              </div>
              <div>
                <h3 className="font-['Outfit'] font-black text-lg text-[#e6f6ff] tracking-tight">
                  Bridge Command: Master Mariners &amp; Fleet Captains
                </h3>
                <p className="text-xs text-[#8cbcdb]">Certified navigational command personnel</p>
              </div>
            </div>
            <span className="text-xs font-mono text-[#00d2ff] bg-[#00d2ff]/10 px-3 py-1 rounded-xl border border-[#00d2ff]/30">
              4 Command Officers
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {captains.map((c, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#040e1d] border border-[#174165] hover-glow-card transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00d2ff]/20 to-[#169bff]/30 border border-[#00d2ff]/40 flex items-center justify-center text-2xl mb-3">
                  👨‍✈️
                </div>
                <h4 className="font-['Outfit'] font-bold text-base text-[#e6f6ff] hover-glow-text">
                  {c.name}
                </h4>
                <div className="text-xs text-[#00d2ff] font-medium">{c.rank}</div>
                <div className="mt-3 space-y-1 text-[11px] font-mono text-[#8cbcdb]">
                  <div>Vessel: <strong className="text-[#e6f6ff]">{c.vessel}</strong></div>
                  <div>Sea Time: {c.experience}</div>
                  <div className="text-amber-400 font-semibold">{c.awards}</div>
                  <div className="text-emerald-400 font-bold mt-1">● {c.status}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            8. UPCOMING VOYAGES SCHEDULE TABLE
            ========================================================================= */}
        <section id="routes" className="rounded-3xl bg-[#071323]/80 border border-[#174165] p-5 sm:p-6 hover-glow-card transition-all overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-[#174165]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d2ff] to-[#169bff] flex items-center justify-center text-lg text-[#020b18] font-bold">
                🧭
              </div>
              <div>
                <h3 className="font-['Outfit'] font-black text-lg text-[#e6f6ff] tracking-tight">
                  Upcoming Voyages &amp; Maritime Schedules
                </h3>
                <p className="text-xs text-[#8cbcdb]">Active AIS voyage tracking and berth arrival estimates</p>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#174165] text-[#8cbcdb]">
                  <th className="py-2.5 px-3">Voyage ID</th>
                  <th className="py-2.5 px-3">Vessel</th>
                  <th className="py-2.5 px-3">Departure Port</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3">Manifest</th>
                  <th className="py-2.5 px-3">ETA</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#174165]/50">
                {upcomingVoyages.map((v, i) => (
                  <tr key={i} className="hover:bg-[#0c2444]/40 transition-colors">
                    <td className="py-3 px-3 text-[#00d2ff] font-bold">{v.id}</td>
                    <td className="py-3 px-3 text-[#e6f6ff] font-['Outfit'] font-bold">{v.vessel}</td>
                    <td className="py-3 px-3 text-[#8cbcdb]">{v.origin}</td>
                    <td className="py-3 px-3 text-[#cbd5e1]">{v.dest}</td>
                    <td className="py-3 px-3 text-[#8cbcdb]">{v.cargo}</td>
                    <td className="py-3 px-3 text-[#e6f6ff]">{v.eta}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.status.includes('Inactive')
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =========================================================================
            9. ABOUT US & CONTACT
            ========================================================================= */}
        <section id="about" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#071323]/80 border border-[#174165] hover-glow-card transition-all">
            <h3 className="font-['Outfit'] font-bold text-xl text-[#e6f6ff] mb-2">
              About ShipMS v3.4 Fleet OS
            </h3>
            <p className="text-xs text-[#8cbcdb] leading-relaxed mb-4">
              ShipMS provides full-spectrum marine fleet automation: real-time AIS corridor monitoring, holographic structural integrity telemetry, ECDIS automated routing, and secure role-based bridge clearance protocols.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-[#00d2ff]">
              <div className="p-2.5 rounded-xl bg-[#030913] border border-[#174165]">
                ✓ Satellite AIS Link
              </div>
              <div className="p-2.5 rounded-xl bg-[#030913] border border-[#174165]">
                ✓ Hologram Diagnostics
              </div>
              <div className="p-2.5 rounded-xl bg-[#030913] border border-[#174165]">
                ✓ ECDIS Corridor Flow
              </div>
              <div className="p-2.5 rounded-xl bg-[#030913] border border-[#174165]">
                ✓ JWT Bridge Auth
              </div>
            </div>
          </div>

          <div id="contact" className="p-6 rounded-3xl bg-[#071323]/80 border border-[#174165] hover-glow-card transition-all">
            <h3 className="font-['Outfit'] font-bold text-xl text-[#e6f6ff] mb-2">
              Maritime Command Dispatch
            </h3>
            <p className="text-xs text-[#8cbcdb] leading-relaxed mb-3">
              Direct emergency frequency &amp; port dispatch coordination:
            </p>
            <div className="space-y-2 text-xs font-mono text-[#8cbcdb]">
              <div>VHF Channel: <strong className="text-[#00d2ff]">Ch 16 / DSC 70</strong></div>
              <div>SATCOM INMARSAT-C: <strong className="text-[#00d2ff]">441-992-019</strong></div>
              <div>Operations Email: <strong className="text-[#00d2ff]">bridge@shipms.io</strong></div>
              <div>HQ Harbor: <strong className="text-[#00d2ff]">Mumbai Marine Terminal Pier 4</strong></div>
            </div>
          </div>
        </section>

      </main>

      {/* =========================================================================
          10. MARITIME FOOTER
          ========================================================================= */}
      <footer className="mt-12 border-t border-[#174165] bg-[#020813] py-8 px-4 sm:px-6 text-xs text-[#8cbcdb]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg text-[#00d2ff]">⚓</span>
            <span className="font-['Outfit'] font-black text-sm text-[#e6f6ff]">ShipMS Fleet OS v3.4</span>
            <span>• Universal Design Controller Active</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>BACKEND: <strong className="text-emerald-400">REST API :5000</strong></span>
            <span>AIS CORRIDOR: <strong className="text-[#00d2ff]">ACTIVE</strong></span>
            <span>© 2026 ShipMS Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
