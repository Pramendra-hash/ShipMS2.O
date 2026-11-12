import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

// Initial seed data
const INITIAL_DATA = {
  users: [
    {
      id: 'usr_admin_1',
      name: 'Pramendra Mishra',
      email: 'admin@shipms.io',
      // password: password123 hashed with bcryptjs
      passwordHash: '.v4B6LwJg0kF8oX3QeSjD4O9A4o7T4V5Z1L2m8N9O1P2Q3R4S',
      role: 'Fleet Commander',
      createdAt: new Date().toISOString()
    }
  ],
  ships: [
    {
      id: 'oceanic-explorer',
      name: 'Oceanic Explorer',
      imo: 'IMO 9811000',
      type: 'Ultra Large Container Vessel',
      status: 'Active',
      speed: '21.4 kn',
      course: '084° ENE',
      destination: 'Dubai (Port Rashid)',
      origin: 'Mumbai (JNPT)',
      captain: 'Capt. Rajesh Sharma',
      eta: 'Today, 21:40 UTC',
      fuel: '92%',
      cargo: '18,450 TEU',
      coordinates: '19.0760° N, 72.8777° E',
      progress: 68,
      hologramIntegrity: '99.8%',
      powerCore: 'Triple-E Hybrid 88MW',
      image: '/oceanic-explorer.jpg',
      description: 'Flagship Triple-E container vessel currently navigating the central Arabian Sea maritime corridor.'
    },
    {
      id: 'royal-voyager',
      name: 'Royal Voyager',
      imo: 'IMO 9745210',
      type: 'Luxury Cruise Liner / VIP Freight',
      status: 'Inactive',
      speed: '0.0 kn',
      course: '000° Docked',
      destination: 'Docked - Berth 4B',
      origin: 'Mumbai Port JNPT',
      captain: 'Capt. Sarah Jenkins',
      eta: 'Transit Suspended',
      fuel: '42%',
      cargo: 'Docked / Inspection',
      coordinates: '18.9438° N, 72.8353° E',
      progress: 0,
      hologramIntegrity: '84.2%',
      powerCore: 'Auxiliary Shore Power (Engines Offline)',
      image: '/oceanic-explorer.jpg',
      description: 'Vessel marked INACTIVE due to scheduled drydock inspection and engine recalibration at Mumbai Port.'
    },
    {
      id: 'neptune-pioneer',
      name: 'Neptune Pioneer',
      imo: 'IMO 9654120',
      type: 'VLCC Supertanker',
      status: 'Active',
      speed: '18.2 kn',
      course: '142° SE',
      destination: 'Singapore (Jurong Port)',
      origin: 'Ras Tanura Terminal',
      captain: 'Capt. Hiroshi Tanaka',
      eta: 'Tomorrow, 08:15 UTC',
      fuel: '88%',
      cargo: '2,100,000 bbl Crude',
      coordinates: '12.8797° N, 80.2244° E',
      progress: 45,
      hologramIntegrity: '97.4%',
      powerCore: 'Dual-Fuel LNG 64MW',
      image: '/oceanic-explorer.jpg',
      description: 'Double-hull supertanker carrying crude oil cargo across the southern Indian Ocean sea lane.'
    },
    {
      id: 'titan-horizon',
      name: 'Titan Horizon',
      imo: 'IMO 9901452',
      type: 'Capesize Bulk Carrier',
      status: 'Active',
      speed: '16.8 kn',
      course: '260° WSW',
      destination: 'Rotterdam (Europoort)',
      origin: 'Dampier Port',
      captain: 'Capt. Elena Rostova',
      eta: '14 Sep, 14:00 UTC',
      fuel: '76%',
      cargo: '175,000 DWT Iron Ore',
      coordinates: '15.2993° N, 73.9260° E',
      progress: 82,
      hologramIntegrity: '95.1%',
      powerCore: 'MAN B&W 2-Stroke 52MW',
      image: '/oceanic-explorer.jpg',
      description: 'Heavy ore bulk carrier en route to Northern Europe via the Cape route.'
    }
  ]
};

export const getDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
    return INITIAL_DATA;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json, returning defaults:', err);
    return INITIAL_DATA;
  }
};

export const saveDB = (data) => {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
};
