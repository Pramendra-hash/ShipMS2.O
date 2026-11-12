import { getDB, saveDB } from '../models/db.js';

export const getFleet = (req, res) => {
  const db = getDB();
  return res.json({ success: true, count: db.ships.length, data: db.ships });
};

export const getShipById = (req, res) => {
  const db = getDB();
  const ship = db.ships.find(s => s.id === req.params.id);
  if (!ship) {
    return res.status(404).json({ success: false, message: 'Ship not found' });
  }
  return res.json({ success: true, data: ship });
};

export const updateShipStatus = (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  const db = getDB();
  const ship = db.ships.find(s => s.id === req.params.id);
  if (!ship) {
    return res.status(404).json({ success: false, message: 'Ship not found' });
  }

  ship.status = status;
  if (status === 'Inactive') {
    ship.speed = '0.0 kn';
    ship.progress = 0;
    ship.powerCore = 'Auxiliary Shore Power (Engines Offline)';
  } else if (status === 'Active') {
    ship.speed = '21.4 kn';
    ship.progress = 68;
    ship.powerCore = 'Triple-E Hybrid 88MW';
  }

  saveDB(db);
  return res.json({ success: true, message: `Status updated to ${status}`, data: ship });
};

export const getMetrics = (req, res) => {
  return res.json({
    success: true,
    data: [
      { label: 'Total Fleet', value: '28', change: '+3 this yr', icon: '🚢', highlight: 'text-[#e6f6ff]' },
      { label: 'Active At Sea', value: '21', change: '75% capacity', icon: '🌊', highlight: 'text-emerald-400' },
      { label: 'In Port / Loading', value: '4', change: 'Turnaround 14h', icon: '⚓', highlight: 'text-[#00d2ff]' },
      { label: 'Inactive / Maint.', value: '3', change: 'Royal Voyager', icon: '🔧', highlight: 'text-rose-400' },
      { label: 'Nautical Miles', value: '1.42M', change: 'Annual total', icon: '🧭', highlight: 'text-[#38bdf8]' },
      { label: 'Safety Index', value: '99.6%', change: 'Zero incident', icon: '🛡️', highlight: 'text-amber-400' },
    ]
  });
};

export const getHologramSpecs = (req, res) => {
  const shipId = req.params.id || 'oceanic-explorer';
  const db = getDB();
  const ship = db.ships.find(s => s.id === shipId) || db.ships[0];

  return res.json({
    success: true,
    hologram: {
      vesselId: ship.id,
      vesselName: ship.name,
      hullIntegrity: ship.hologramIntegrity || '99.8%',
      powerCore: ship.powerCore || 'Triple-E Hybrid 88MW',
      radarFrequency: '9.41 GHz X-Band Marine',
      scanningPlane: 'Active 360° Horizontal Sweeper',
      sonarArray: 'Dual Multi-Beam Phased Array',
      dimensions: { length: 399.2, beam: 59.0, draft: 16.5 },
      wireframeVerticesCount: 1420,
      mode: 'Holographic Matrix Sonar',
      status: ship.status
    }
  });
};
