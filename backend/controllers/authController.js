import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getMongoStatus } from '../config/db.js';
import { getDB, saveDB } from '../models/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'shipms_ultra_secure_jwt_secret_2026_maritime_os';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// Seed demo users if not present
const DEMO_USERS = [
  { name: 'Capt. Vikram Solanki', email: 'commander.vikram@shipms.io', password: 'NavalCommand#2026', role: 'Fleet Commander' },
  { name: 'Officer Priya Sharma', email: 'navigator.priya@shipms.io', password: 'OceanRoute*99', role: 'Navigation Officer' },
  { name: 'Logistics Head Marcus', email: 'logistics.admin@shipms.io', password: 'CargoFleet@77', role: 'Cargo & Port Logistics' },
  { name: 'Pramendra Mishra', email: 'admin@shipms.io', password: 'password123', role: 'Fleet Commander' }
];

export const seedDemoUsersIfEmpty = async () => {
  try {
    if (getMongoStatus()) {
      for (const demo of DEMO_USERS) {
        const exists = await User.findOne({ email: demo.email.toLowerCase() });
        if (!exists) {
          await User.create({
            name: demo.name,
            email: demo.email.toLowerCase(),
            password: demo.password,
            role: demo.role
          });
        }
      }
    }
  } catch (err) {
    console.warn('Demo user seed notice:', err.message);
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. If MongoDB is connected, use Mongoose User model
    if (getMongoStatus()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Officer with this email is already registered' });
      }

      const newUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        role: role || 'Fleet Officer'
      });

      const token = generateToken(newUser._id);
      return res.status(201).json({
        success: true,
        message: 'Officer credentials registered in MongoDB successfully',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    }

    // 2. Hybrid fallback to local DB
    const db = getDB();
    const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Officer with this email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: role || 'Fleet Officer',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);

    const token = generateToken(newUser.id);
    return res.status(201).json({
      success: true,
      message: 'Officer credentials registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and passcode' });
    }

    const cleanInput = email.trim();
    const cleanEmail = cleanInput.toLowerCase();
    const nameRegex = new RegExp('^' + cleanInput.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '$', 'i');

    console.log(`[AUTH LOGIN] Attempt with identifier="${cleanInput}", passLen=${password.length}`);

    // 1. If MongoDB is connected, authenticate strictly via Mongoose
    if (getMongoStatus()) {
      let user = await User.findOne({
        $or: [
          { email: cleanEmail },
          { name: nameRegex }
        ]
      });
      
      if (!user) {
        // Check if matching a demo user by email or name
        const demoMatch = DEMO_USERS.find(d => 
          d.email.toLowerCase() === cleanEmail || 
          d.name.toLowerCase() === cleanEmail
        );

        if (demoMatch) {
          if (demoMatch.password === password) {
            // Correct demo password: auto-seed this user in MongoDB with hashed password
            try {
              user = await User.create({
                name: demoMatch.name,
                email: demoMatch.email.toLowerCase(),
                password: demoMatch.password,
                role: demoMatch.role
              });
            } catch (seedErr) {
              console.warn('Demo user auto-seed notice:', seedErr.message);
              user = {
                _id: 'demo_' + Date.now(),
                name: demoMatch.name,
                email: demoMatch.email,
                role: demoMatch.role
              };
            }
          } else {
            console.log(`[AUTH LOGIN] Wrong passcode for demo user: ${demoMatch.name}`);
            return res.status(401).json({
              success: false,
              message: `Incorrect passcode for ${demoMatch.name}! Access Denied.`
            });
          }
        } else {
          console.log(`[AUTH LOGIN] No user found for: "${cleanInput}"`);
          return res.status(401).json({
            success: false,
            message: `No officer account found with "${cleanInput}". Please check your Fleet ID/Email or register first.`
          });
        }
      } else {
        // User exists in MongoDB: compare password with bcrypt
        console.log(`[AUTH LOGIN] Found account: ${user.name} (${user.email}). Checking password...`);
        let isMatch = await user.comparePassword(password);
        if (!isMatch && typeof password === 'string' && password.trim() !== password) {
          isMatch = await user.comparePassword(password.trim());
        }
        if (!isMatch && user.password === password) {
          // If stored as plaintext from old seed, accept and upgrade to hash
          isMatch = true;
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save();
        }

        if (!isMatch) {
          console.log(`[AUTH LOGIN] Password mismatch for: ${user.name} (${user.email})`);
          return res.status(401).json({
            success: false,
            message: `Incorrect passcode for Officer ${user.name}! Access Denied.`
          });
        }
      }

      console.log(`[AUTH LOGIN] Access granted for: ${user.name} (${user.email})`);
      const token = generateToken(user._id || 'demo_officer');
      return res.json({
        success: true,
        message: 'MongoDB Bridge access authorized. Welcome aboard!',
        token,
        user: {
          id: user._id || 'demo_officer',
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // 2. Fallback to local DB
    const db = getDB();
    const user = db.users.find(u => 
      u.email.toLowerCase() === cleanEmail || 
      (u.name && u.name.toLowerCase() === cleanEmail)
    );

    if (!user) {
      // Check demo credentials
      const demoMatch = DEMO_USERS.find(d => 
        d.email.toLowerCase() === cleanEmail || 
        d.name.toLowerCase() === cleanEmail
      );
      if (demoMatch && demoMatch.password === password) {
        const token = generateToken('demo_officer');
        return res.json({
          success: true,
          message: 'Bridge access authorized. Welcome aboard!',
          token,
          user: {
            id: 'demo_officer',
            name: demoMatch.name,
            email: demoMatch.email,
            role: demoMatch.role
          }
        });
      }
      return res.status(401).json({ success: false, message: `Invalid identifier "${cleanInput}"` });
    }

    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch && typeof password === 'string' && password.trim() !== password) {
        isMatch = await bcrypt.compare(password.trim(), user.passwordHash);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: `Incorrect passcode for Officer ${user.name}! Access Denied.` });
    }

    const token = generateToken(user.id);
    return res.json({
      success: true,
      message: 'Bridge access authorized. Welcome aboard!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide Fleet ID/Email and new passcode' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New passcode must be at least 6 characters long' });
    }

    const cleanInput = email.trim();
    const cleanEmail = cleanInput.toLowerCase();
    const nameRegex = new RegExp('^' + cleanInput.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '$', 'i');

    if (getMongoStatus()) {
      let user = await User.findOne({
        $or: [
          { email: cleanEmail },
          { name: nameRegex }
        ]
      });

      if (!user) {
        return res.status(404).json({ success: false, message: `No officer account found with "${cleanInput}". Please register first.` });
      }

      user.password = newPassword.trim();
      await user.save(); // triggers pre('save') bcrypt hash!

      console.log(`[AUTH RESET] Password updated successfully for: ${user.name} (${user.email})`);
      return res.json({
        success: true,
        message: `Passcode updated successfully for Officer ${user.name}! You can now login with your new passcode.`
      });
    }

    // Local DB fallback
    const db = getDB();
    const user = db.users.find(u => 
      u.email.toLowerCase() === cleanEmail || 
      (u.name && u.name.toLowerCase() === cleanEmail)
    );
    if (!user) {
      return res.status(404).json({ success: false, message: `No officer account found with "${cleanInput}"` });
    }
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword.trim(), salt);
    saveDB(db);

    return res.json({
      success: true,
      message: `Passcode updated successfully for Officer ${user.name}! You can now login.`
    });
  } catch (err) {
    console.error('Reset Password Error:', err);
    return res.status(500).json({ success: false, message: 'Server error during passcode reset' });
  }
};

export const getMe = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};
