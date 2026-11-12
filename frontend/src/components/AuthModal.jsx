import React, { useState } from 'react';

export default function AuthModal({ isOpen, mode, onClose, onAuthSuccess }) {
  const [currentMode, setCurrentMode] = useState(mode || 'login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Fleet Officer',
    clearancePin: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const endpoint = currentMode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('shipms_token', data.token);
        localStorage.setItem('shipms_user', JSON.stringify(data.user));
        onAuthSuccess(data.user, `${currentMode === 'login' ? 'Bridge Login Successful!' : 'Officer Registered Successfully!'}`);
        onClose();
      } else {
        setErrorMsg(data.message || 'Authentication error');
      }
    } catch (err) {
      console.warn('Backend server not detected at localhost:5000, using local session fallback');
      const fallbackUser = {
        name: formData.name || (formData.email ? formData.email.split('@')[0] : 'Officer'),
        email: formData.email,
        role: formData.role || 'Fleet Commander'
      };
      localStorage.setItem('shipms_user', JSON.stringify(fallbackUser));
      onAuthSuccess(fallbackUser, `${currentMode === 'login' ? 'Offline Bridge Login Successful!' : 'Officer Registered Locally!'}`);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#07172b] border-2 border-[#00d2ff]/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,210,255,0.3)] relative font-['DM_Sans',sans-serif]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8cbcdb] hover:text-rose-400 text-lg w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#0e2746]"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d2ff] to-[#169bff] flex items-center justify-center text-xl text-[#020b18] font-bold shadow-[0_0_15px_rgba(0,210,255,0.5)]">
            ⚓
          </div>
          <div>
            <h3 className="font-['Outfit'] font-bold text-lg text-[#e6f6ff]">ShipMS Command Bridge</h3>
            <p className="text-xs text-[#8cbcdb]">Fleet Operations Access Control</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#030d1a] border border-[#174165] mb-5">
          <button
            type="button"
            onClick={() => { setCurrentMode('login'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              currentMode === 'login'
                ? 'bg-[#00d2ff] text-[#020b18] shadow-[0_0_15px_rgba(0,210,255,0.5)]'
                : 'text-[#8cbcdb] hover:text-white'
            }`}
          >
            🔐 Sign In
          </button>
          <button
            type="button"
            onClick={() => { setCurrentMode('register'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              currentMode === 'register'
                ? 'bg-[#00d2ff] text-[#020b18] shadow-[0_0_15px_rgba(0,210,255,0.5)]'
                : 'text-[#8cbcdb] hover:text-white'
            }`}
          >
            ✦ Register Officer
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {currentMode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-[#8cbcdb] block mb-1">Officer Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Capt. Vikram Solanki"
                className="w-full px-3 py-2 rounded-xl bg-[#091e36] border border-[#174165] focus:border-[#00d2ff] text-xs text-[#e6f6ff] outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#8cbcdb] block mb-1">Email / Fleet ID</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. officer@shipms.io"
              className="w-full px-3 py-2 rounded-xl bg-[#091e36] border border-[#174165] focus:border-[#00d2ff] text-xs text-[#e6f6ff] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8cbcdb] block mb-1">Bridge Security Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-xl bg-[#091e36] border border-[#174165] focus:border-[#00d2ff] text-xs text-[#e6f6ff] outline-none"
            />
          </div>

          {currentMode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-[#8cbcdb] block mb-1">Assigned Operational Rank</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#091e36] border border-[#174165] focus:border-[#00d2ff] text-xs text-[#e6f6ff] outline-none cursor-pointer"
              >
                <option value="Fleet Commander">Fleet Commander</option>
                <option value="Master Mariner / Captain">Master Mariner / Captain</option>
                <option value="AIS Navigation Controller">AIS Navigation Controller</option>
                <option value="Logistics Officer">Logistics Officer</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded-xl font-['Outfit'] font-bold text-xs bg-gradient-to-r from-[#00d2ff] to-[#169bff] text-[#020b18] shadow-[0_0_20px_rgba(0,210,255,0.4)] hover-glow-btn transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (currentMode === 'login' ? 'Authenticate & Enter Bridge ➜' : 'Complete Officer Registration ➜')}
          </button>
        </form>
      </div>
    </div>
  );
}
