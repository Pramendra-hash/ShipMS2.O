import jwt from 'jsonwebtoken';
import { getDB } from '../models/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'shipms_ultra_secure_jwt_secret_2026_maritime_os';

export const protect = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied: No authentication token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDB();
    const user = db.users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token: User no longer exists' });
    }

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token verification failed or expired' });
  }
};
