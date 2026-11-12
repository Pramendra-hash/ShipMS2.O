import mongoose from 'mongoose';

const shipSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  imo: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  teu: {
    type: String
  },
  flag: {
    type: String
  },
  status: {
    type: String,
    default: 'Active At Sea'
  },
  isInactive: {
    type: Boolean,
    default: false
  },
  speed: {
    type: String,
    default: '18.0 kn'
  },
  coordinates: {
    type: String
  },
  route: {
    type: String
  },
  captain: {
    type: String
  },
  eta: {
    type: String
  },
  powerCore: {
    type: String
  },
  hologramIntegrity: {
    type: String,
    default: '99.5%'
  },
  fuelStatus: {
    type: String
  },
  cargo: {
    type: String
  },
  image: {
    type: String,
    default: '/oceanic-explorer.jpg'
  }
}, {
  timestamps: true
});

export default mongoose.models.Ship || mongoose.model('Ship', shipSchema);
