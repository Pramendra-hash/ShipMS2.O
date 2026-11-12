import express from 'express';
import { getFleet, getShipById, updateShipStatus, getMetrics, getHologramSpecs } from '../controllers/fleetController.js';

const router = express.Router();

router.get('/ships', getFleet);
router.get('/ships/:id', getShipById);
router.put('/ships/:id/status', updateShipStatus);
router.get('/metrics', getMetrics);
router.get('/hologram/:id?', getHologramSpecs);

export default router;
