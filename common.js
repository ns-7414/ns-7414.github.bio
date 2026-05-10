/* ═══════════════════════════════════════════════
   GK的雜物堆 — common.js
   Shared scripts: cursor, theme, sound, sysPanel, Konami
═══════════════════════════════════════════════ */

(function () {
  /* ── Custom Cursor ─────────────────────────── */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('expanded');
      ring.classList.add('expanded');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('expanded');
      ring.classList.remove('expanded');
    });
  });

  /* ── Theme Toggle ──────────────────────────── */
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme  = localStorage.getItem('gk_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '☽' : '☀';

  themeToggle.addEventListener('click', () => {
    const curr = document.documentElement.getAttribute('data-theme');
    const next = curr === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('gk_theme', next);
    themeToggle.textContent = next === 'dark' ? '☽' : '☀';
  });

  /* ── Ambient Sound Toggle ──────────────────── */
  let audioCtx = null, soundOn = false;
  let rainSource = null, rainGain = null;

  function createRainSound() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const sr  = audioCtx.sampleRate;
    const buf = audioCtx.createBuffer(1, 2 * sr, sr);
    const raw = buf.getChannelData(0);
    for (let i = 0; i < raw.length; i++) raw[i] = Math.random() * 2 - 1;

    rainSource = audioCtx.createBufferSource();
    rainSource.buffer = buf;
    rainSource.loop   = true;

    const lpf = audioCtx.createBiquadFilter();
    lpf.type            = 'bandpass';
    lpf.frequency.value = 350;
    lpf.Q.value         = 0.22;

    rainGain = audioCtx.createGain();
    rainGain.gain.setValueAtTime(0, audioCtx.currentTime);
    rainGain.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 1.5);

    rainSource.connect(lpf);
    lpf.connect(rainGain);
    rainGain.connect(audioCtx.destination);
    rainSource.start();
  }

  const soundBtn = document.getElementById('soundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (!soundOn) {
        createRainSound();
        soundOn = true;
        soundBtn.classList.add('active');
        soundBtn.textContent = '♪';
        soundBtn.title = '關閉環境音';
      } else {
        if (rainGain && audioCtx) {
          rainGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
          setTimeout(() => {
            if (rainSource) { try { rainSource.stop(); } catch(e){} }
            rainSource = null;
          }, 900);
        }
        soundOn = false;
        soundBtn.classList.remove('active');
        soundBtn.textContent = '♩';
        soundBtn.title = '開啟環境音';
      }
    });
  }

  /* ── System Monitor Panel ──────────────────── */
  const sysPanelToggle = document.getElementById('sysPanelToggle');
  const sysContent     = document.getElementById('sysContent');

  if (sysPanelToggle && sysContent) {
    sysPanelToggle.addEventListener('click', () => {
      sysContent.classList.toggle('open');
    });

    function updateSysPanel() {
      const now  = new Date();
      const time = now.toTimeString().slice(0, 8);
      const el   = document.getElementById('sysTime');
      if (el) el.textContent = time;

      const temp    = 58 + Math.floor(Math.random() * 18);
      const cpuEl   = document.getElementById('sysCpu');
      const cpuBar  = document.getElementById('sysCpuBar');
      if (cpuEl) {
        cpuEl.textContent = temp + '°C';
        cpuEl.className   = 'sys-val' + (temp > 70 ? ' warn' : '');
      }
      if (cpuBar) cpuBar.style.width = Math.min(100, temp - 30) + '%';

      const mem    = (4.5 + Math.random() * 3).toFixed(1);
      const memEl  = document.getElementById('sysMem');
      const memBar = document.getElementById('sysMemBar');
      if (memEl) memEl.textContent = mem + ' GB';
      if (memBar) memBar.style.width = (parseFloat(mem) / 16 * 100).toFixed(0) + '%';
    }

    updateSysPanel();
    setInterval(updateSysPanel, 3000);
  }

  /* ── Konami Code Easter Egg ────────────────── */
  const KONAMI = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'b','a'
  ];
  let ki = 0;

  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[ki]) {
      ki++;
      if (ki === KONAMI.length) {
        const egg = document.getElementById('easterEgg');
        if (egg) egg.classList.add('active');
        ki = 0;
      }
    } else {
      ki = 0;
    }
  });

  const eggClose = document.getElementById('eggClose');
  if (eggClose) {
    eggClose.addEventListener('click', () => {
      document.getElementById('easterEgg').classList.remove('active');
    });
  }

})();
