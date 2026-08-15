// ======================= THEME TOGGLE =======================
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = 'dark'; // change to 'light' to default light
  root.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    playTone(current === 'dark' ? 520 : 380, 0.05);
  });

  // ======================= SOUND ENGINE =======================
  // Synthesized click sound via Web Audio API — no external audio file needed.
  let audioCtx = null;
  let soundEnabled = true;

  function getCtx(){
    if(!audioCtx){
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playTone(freq = 440, duration = 0.09){
    if(!soundEnabled) return;
    const ctx = getCtx();
    if(ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, ctx.currentTime + duration);

    filter.type = 'lowpass';
    filter.frequency.value = 2200;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  const soundToggle = document.getElementById('soundToggle');
  const soundLabel = document.getElementById('soundLabel');
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundLabel.textContent = soundEnabled ? 'Sound on' : 'Sound off';
    if(soundEnabled) playTone(660, 0.06);
  });

  // ======================= LINK CLICK: RIPPLE + SOUND =======================
  document.querySelectorAll('.link-btn').forEach((btn, i) => {
    btn.addEventListener('click', (e) => {
      // ripple
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);

      // sound — slightly different pitch per link for a musical feel
      playTone(420 + i * 28, 0.09);

      // tiny press animation
      btn.animate(
        [{ transform:'scale(1)' }, { transform:'scale(0.97)' }, { transform:'scale(1)' }],
        { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' }
      );
    });
  });