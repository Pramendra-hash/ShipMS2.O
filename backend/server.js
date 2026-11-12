import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import fleetRoutes from './routes/fleet.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fleet', fleetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'ShipMS Maritime Intelligence Server',
    timestamp: new Date().toISOString(),
    version: '3.4.0'
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.json({
    message: 'ShipMS Fleet OS Backend API',
    endpoints: {
      auth: ['/api/auth/register', '/api/auth/login', '/api/auth/me'],
      fleet: ['/api/fleet/ships', '/api/fleet/metrics', '/api/fleet/hologram'],
      health: '/api/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`⚓ ShipMS Backend Server running on port ${PORT}`);
  console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
});
