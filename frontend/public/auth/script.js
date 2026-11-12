/**
 * ShipMS Maritime Command - Interactive Authentication & Animation Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const authContainer = document.getElementById('authContainer');
  const signUpBtn = document.getElementById('signUpBtn');
  const signInBtn = document.getElementById('signInBtn');
  
  // Mobile Tabs
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');

  // Forms
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Inputs
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const regPassword = document.getElementById('regPassword');
  const pwdMeterBar = document.getElementById('pwdMeterBar');
  const pwdStrengthLabel = document.getElementById('pwdStrengthLabel');

  // Modal & Toast
  const scanModal = document.getElementById('scanModal');
  const scanBarFill = document.getElementById('scanBarFill');
  const scanPercent = document.getElementById('scanPercent');
  const scanModalTitle = document.getElementById('scanModalTitle');
  const scanModalDesc = document.getElementById('scanModalDesc');

  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  // Sound Controls
  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  let soundEnabled = true;

  // Audio Context (Synthesizer for Sci-Fi UI feedback)
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playUiTone(type) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'switch') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.2);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'scan') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 1.2);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.setValueAtTime(110, now + 0.12);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Sound Toggle Listener
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        soundIcon.className = 'fa-solid fa-volume-high';
        soundToggle.style.color = '#00d2ff';
        playUiTone('click');
        showToast('System Audio Enabled', 'Tactile UI telemetry synthesis active');
      } else {
        soundIcon.className = 'fa-solid fa-volume-xmark';
        soundToggle.style.color = '#507d9e';
        showToast('System Audio Muted', 'Terminal audio silenced');
      }
    });
  }

  // ---------------------------------------------------------
  // SLIDING OVERLAY PANEL SWITCH (DESKTOP)
  // ---------------------------------------------------------
  if (signUpBtn && signInBtn && authContainer) {
    signUpBtn.addEventListener('click', () => {
      authContainer.classList.add('right-panel-active');
      playUiTone('switch');
    });

    signInBtn.addEventListener('click', () => {
      authContainer.classList.remove('right-panel-active');
      playUiTone('switch');
    });
  }

  // ---------------------------------------------------------
  // MOBILE TABS SWITCH
  // ---------------------------------------------------------
  if (tabSignIn && tabSignUp && authContainer) {
    tabSignIn.addEventListener('click', () => {
      tabSignIn.classList.add('active');
      tabSignUp.classList.remove('active');
      authContainer.classList.remove('mobile-register');
      playUiTone('click');
    });

    tabSignUp.addEventListener('click', () => {
      tabSignUp.classList.add('active');
      tabSignIn.classList.remove('active');
      authContainer.classList.add('mobile-register');
      playUiTone('click');
    });
  }

  // Direct Switch Links inside forms
  const switchLinkToSignIn = document.getElementById('switchLinkToSignIn');
  if (switchLinkToSignIn) {
    switchLinkToSignIn.addEventListener('click', (e) => {
      e.preventDefault();
      if (signInBtn) signInBtn.click();
      if (tabSignIn) tabSignIn.click();
      if (authContainer) authContainer.classList.remove('right-panel-active');
    });
  }

  const switchLinkToSignUp = document.getElementById('switchLinkToSignUp');
  if (switchLinkToSignUp) {
    switchLinkToSignUp.addEventListener('click', (e) => {
      e.preventDefault();
      if (signUpBtn) signUpBtn.click();
      if (tabSignUp) tabSignUp.click();
      if (authContainer) authContainer.classList.add('right-panel-active');
    });
  }

  // Parent React Window postMessage listener (OPEN_LOGIN / OPEN_REGISTER)
  window.addEventListener('message', (e) => {
    if (e.data && e.data.action) {
      if (e.data.action === 'OPEN_LOGIN') {
        if (authContainer) authContainer.classList.remove('right-panel-active');
        if (tabSignIn) tabSignIn.click();
      } else if (e.data.action === 'OPEN_REGISTER') {
        if (authContainer) authContainer.classList.add('right-panel-active');
        if (tabSignUp) tabSignUp.click();
      }
    }
  });

  // ---------------------------------------------------------
  // PASSWORD VISIBILITY TOGGLE
  // ---------------------------------------------------------
  document.querySelectorAll('.eye-toggle').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = button.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);
      const icon = button.querySelector('i');

      if (targetInput.type === 'password') {
        targetInput.type = 'text';
        icon.className = 'fa-regular fa-eye-slash';
        button.style.color = '#00d2ff';
      } else {
        targetInput.type = 'password';
        icon.className = 'fa-regular fa-eye';
        button.style.color = '';
      }
      playUiTone('click');
    });
  });

  // ---------------------------------------------------------
  // LIVE PASSWORD STRENGTH METER
  // ---------------------------------------------------------
  if (regPassword && pwdMeterBar && pwdStrengthLabel) {
    regPassword.addEventListener('input', () => {
      const val = regPassword.value;
      let score = 0;

      if (!val) {
        pwdMeterBar.style.width = '0%';
        pwdMeterBar.style.backgroundColor = 'transparent';
        pwdStrengthLabel.textContent = 'Enter Password';
        pwdStrengthLabel.style.color = '#8cbcdb';
        return;
      }

      if (val.length >= 6) score += 20;
      if (val.length >= 10) score += 20;
      if (/[A-Z]/.test(val)) score += 20;
      if (/[0-9]/.test(val)) score += 20;
      if (/[^A-Za-z0-9]/.test(val)) score += 20;

      pwdMeterBar.style.width = `${score}%`;

      if (score <= 40) {
        pwdMeterBar.style.backgroundColor = '#f43f5e';
        pwdStrengthLabel.textContent = 'Weak Clearance';
        pwdStrengthLabel.style.color = '#f43f5e';
      } else if (score <= 60) {
        pwdMeterBar.style.backgroundColor = '#f59e0b';
        pwdStrengthLabel.textContent = 'Standard';
        pwdStrengthLabel.style.color = '#f59e0b';
      } else if (score <= 80) {
        pwdMeterBar.style.backgroundColor = '#10b981';
        pwdStrengthLabel.textContent = 'Strong Maritime Key';
        pwdStrengthLabel.style.color = '#10b981';
      } else {
        pwdMeterBar.style.backgroundColor = '#00d2ff';
        pwdStrengthLabel.textContent = 'Military Grade ⚓';
        pwdStrengthLabel.style.color = '#00d2ff';
      }
    });
  }

  // ---------------------------------------------------------
  // QUICK DEMO ROLE AUTO-FILL
  // ---------------------------------------------------------
  document.querySelectorAll('.role-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const email = chip.getAttribute('data-email');
      const pass = chip.getAttribute('data-pass');
      const role = chip.getAttribute('data-role');

      loginEmail.value = email;
      loginPassword.value = pass;
      playUiTone('click');

      // Visual flash effect on inputs
      [loginEmail, loginPassword].forEach(input => {
        input.style.borderColor = '#00d2ff';
        input.style.boxShadow = '0 0 15px rgba(0, 210, 255, 0.4)';
        setTimeout(() => {
          input.style.borderColor = '';
          input.style.boxShadow = '';
        }, 1000);
      });

      showToast('Demo Credentials Loaded', `Selected profile: ${role}`);
    });
  });

  // ---------------------------------------------------------
  // FORGOT PASSWORD MODAL / PROMPT
  // ---------------------------------------------------------
  const forgotLink = document.getElementById('forgotLink');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      playUiTone('click');
      const email = loginEmail.value.trim() || 'officer@shipms.io';
      showToast('Clearance Reset Dispatched', `Recovery link sent to ${email} via secure AIS frequency.`);
    });
  }

  // ---------------------------------------------------------
  // FORM SUBMISSION & SIMULATED AIS HANDSHAKE
  // ---------------------------------------------------------
  function triggerAisHandshake(title, desc, onSuccess) {
    scanModalTitle.textContent = title;
    scanModalDesc.textContent = desc;
    scanBarFill.style.width = '0%';
    scanPercent.textContent = '0%';
    scanModal.classList.add('active');

    playUiTone('scan');

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 10;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        scanBarFill.style.width = '100%';
        scanPercent.textContent = '100%';

        setTimeout(() => {
          scanModal.classList.remove('active');
          playUiTone('success');
          onSuccess();
        }, 350);
      } else {
        scanBarFill.style.width = `${current}%`;
        scanPercent.textContent = `${current}%`;
      }
    }, 100);
  }

  // Sign In Submission (Integrated with Backend REST API & Parent React Window)
  const btnLogin = document.getElementById('btnLogin');
  const btnRegister = document.getElementById('btnRegister');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginEmail.value.trim();
      const pass = loginPassword.value.trim();

      if (!email || !pass) {
        playUiTone('error');
        showToast('Access Denied ❌', 'Please supply valid Fleet ID & Passcode', true);
        return;
      }

      // Visual loading on login button
      if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span class="btn-text">Verifying Passcode...</span>';
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          // STRICT ACCESS REJECTION: Invalid credentials!
          playUiTone('error');
          showToast('Access Denied ❌', data.message || 'Incorrect passcode! Access Denied.', true);
          loginPassword.value = '';
          loginPassword.focus();
          if (btnLogin) {
            btnLogin.disabled = false;
            btnLogin.innerHTML = '<span class="btn-text">Authorize Bridge Access</span><i class="fa-solid fa-arrow-right-to-bracket"></i>';
          }
          return;
        }

        // Access Granted! Run AIS Handshake animation
        if (btnLogin) {
          btnLogin.innerHTML = '<span class="btn-text">Access Authorized</span><i class="fa-solid fa-check"></i>';
        }

        triggerAisHandshake(
          'Authorizing Bridge Access...',
          `Connecting with ShipMS MERN MongoDB Server for ${data.user.name}`,
          () => {
            if (data.token) localStorage.setItem('shipms_token', data.token);
            localStorage.setItem('shipms_user', JSON.stringify(data.user));

            showToast(
              'Bridge Clearance Granted ⚓',
              `Welcome aboard ${data.user.name}. Loading fleet command dashboard...`
            );

            setTimeout(() => {
              if (window.parent) {
                window.parent.postMessage({ type: 'SHIPMS_AUTH_SUCCESS', user: data.user }, '*');
              }
            }, 800);
          }
        );
      } catch (err) {
        console.error('Login error:', err);
        playUiTone('error');
        showToast(
          'Connection Failed ❌',
          'ShipMS Backend server is offline on port 5000. Please start backend.',
          true
        );
        if (btnLogin) {
          btnLogin.disabled = false;
          btnLogin.innerHTML = '<span class="btn-text">Authorize Bridge Access</span><i class="fa-solid fa-arrow-right-to-bracket"></i>';
        }
      }
    });
  }

  // Register Submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const role = document.getElementById('regRole').value;
      const port = document.getElementById('regPort').value.trim();
      const pass = regPassword.value.trim();
      const terms = document.getElementById('regTerms').checked;

      if (!name || !email || !role || !port || !pass) {
        playUiTone('error');
        showToast('Registration Incomplete', 'Please fill in all maritime clearance fields', true);
        return;
      }

      if (pass.length < 6) {
        playUiTone('error');
        showToast('Security Requirement', 'Clearance passcode must be at least 6 characters long', true);
        return;
      }

      if (!terms) {
        playUiTone('error');
        showToast('IMO Compliance Required', 'You must agree to maritime SOLAS telemetry terms', true);
        return;
      }

      if (btnRegister) {
        btnRegister.disabled = true;
        btnRegister.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span class="btn-text">Registering Officer...</span>';
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password: pass, role })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          playUiTone('error');
          showToast('Registration Denied ❌', data.message || 'Unable to register credentials in MongoDB.', true);
          if (btnRegister) {
            btnRegister.disabled = false;
            btnRegister.innerHTML = '<span class="btn-text">Initialize Clearance</span><i class="fa-solid fa-chevron-right"></i>';
          }
          return;
        }

        // Registration Successful! Run AIS Handshake animation
        triggerAisHandshake(
          'Commissioning Officer Clearance...',
          `Registering ${data.user.name} (${data.user.role}) in MongoDB Database`,
          () => {
            if (data.token) localStorage.setItem('shipms_token', data.token);
            localStorage.setItem('shipms_user', JSON.stringify(data.user));

            showToast(
              'Commission Complete ⚓',
              `Officer ${data.user.name} registered. Entering Bridge...`
            );
            
            setTimeout(() => {
              if (window.parent) {
                window.parent.postMessage({ type: 'SHIPMS_AUTH_SUCCESS', user: data.user }, '*');
              }
            }, 800);
          }
        );
      } catch (err) {
        console.error('Registration error:', err);
        playUiTone('error');
        showToast(
          'Connection Failed ❌',
          'ShipMS Backend server is offline on port 5000. Please start backend.',
          true
        );
        if (btnRegister) {
          btnRegister.disabled = false;
          btnRegister.innerHTML = '<span class="btn-text">Initialize Clearance</span><i class="fa-solid fa-chevron-right"></i>';
        }
      }
    });
  }

  // ---------------------------------------------------------
  // TOAST NOTIFICATION UTILITY
  // ---------------------------------------------------------
  let toastTimer = null;
  function showToast(title, message, isError = false) {
    if (toastTimer) clearTimeout(toastTimer);

    toastTitle.textContent = title;
    toastMsg.textContent = message;

    if (isError) {
      toastIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #f43f5e;"></i>';
      toast.style.borderColor = '#f43f5e';
    } else {
      toastIcon.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #10b981;"></i>';
      toast.style.borderColor = '#00d2ff';
    }

    toast.classList.add('show');

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // ---------------------------------------------------------
  // LIVE UTC CLOCK
  // ---------------------------------------------------------
  const utcClock = document.getElementById('utcClock');
  function updateUtcClock() {
    if (!utcClock) return;
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');
    utcClock.textContent = `${h}:${m}:${s} UTC`;
  }
  updateUtcClock();
  setInterval(updateUtcClock, 1000);

  // ---------------------------------------------------------
  // INTERACTIVE MARITIME SEA ROUTE CANVAS (CONSTELLATION)
  // ---------------------------------------------------------
  const canvas = document.getElementById('seaCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    });

    const mouse = { x: null, y: null, maxDist: 140 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class RouteNode {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1.2;
        this.isBeacon = Math.random() < 0.15; // special beacon node
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse avoidance/attraction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.maxDist) {
            this.x -= (dx / dist) * 0.8;
            this.y -= (dy / dist) * 0.8;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.isBeacon) {
          ctx.fillStyle = '#00ffaa';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00ffaa';
        } else {
          ctx.fillStyle = '#00d2ff';
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#00d2ff';
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    let nodes = [];
    function initNodes() {
      nodes = [];
      const count = Math.floor((width * height) / 14000);
      for (let i = 0; i < count; i++) {
        nodes.push(new RouteNode());
      }
    }
    initNodes();

    function animateCanvas() {
      ctx.clearRect(0, 0, width, height);

      // Draw lines between proximate nodes (Shipping Routes)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = 1 - dist / 110;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 210, 255, ${alpha * 0.22})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // Draw cursor connection lines
      if (mouse.x !== null && mouse.y !== null) {
        for (let i = 0; i < nodes.length; i++) {
          const dx = nodes[i].x - mouse.x;
          const dy = nodes[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.maxDist) {
            const alpha = 1 - dist / mouse.maxDist;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(0, 255, 170, ${alpha * 0.45})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // Draw & update nodes
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].update();
        nodes[i].draw();
      }

      requestAnimationFrame(animateCanvas);
    }
    animateCanvas();
  }
});
