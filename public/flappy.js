(function () {
  const openBtn  = document.getElementById('flappy-btn');
  const closeBtn = document.getElementById('flappy-close');
  const modal    = document.getElementById('flappy-overlay');
  const canvas   = document.getElementById('flappy-canvas');
  const ctx      = canvas.getContext('2d');

  const W = canvas.width;
  const H = canvas.height;

  /* ── Colours ── */
  const SKY_TOP    = '#0d0d1a';
  const SKY_BOT    = '#16213e';
  const PIPE_COL   = '#1f4068';
  const PIPE_EDGE  = '#e8c55a';
  const GROUND_COL = '#1a1a2e';
  const BIRD_BODY  = '#e8c55a';
  const BIRD_EYE   = '#fff';
  const BIRD_PUP   = '#0d0d1a';
  const BIRD_WING  = '#d4a017';
  const SCORE_COL  = '#ffffff';
  const BEST_COL   = '#e8c55a';

  /* ── Audio Engine ── */
  let audioCtx = null;
  let soundOn = true;
  let musicPlaying = false;
  let melodyTimer = null;
  let bassTimer = null;

  function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playTone(freq, type, duration, vol, delay = 0, detune = 0) {
    if (!soundOn) return;
    try {
      const ac = getAudio();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const start = ac.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.start(start);
      osc.stop(start + duration + 0.05);
    } catch (e) {}
  }

  /* ── Sound Effects ── */
  function soundFlap() {
    if (!soundOn) return;
    playTone(520, 'sine', 0.12, 0.18);
    playTone(780, 'sine', 0.08, 0.08, 0.04);
  }

  function soundScore() {
    if (!soundOn) return;
    playTone(880,  'square', 0.08, 0.12);
    playTone(1100, 'square', 0.08, 0.12, 0.09);
    playTone(1320, 'square', 0.12, 0.14, 0.18);
  }

  function soundDie() {
    if (!soundOn) return;
    try {
      const ac = getAudio();
      [400, 280, 180, 100].forEach((f, i) => {
        playTone(f, 'sawtooth', 0.18, 0.22, i * 0.07, -20);
      });
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, ac.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(30, ac.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ac.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6);
      osc.start(ac.currentTime + 0.1);
      osc.stop(ac.currentTime + 0.7);
    } catch (e) {}
  }

  /* ── Chiptune Music ── */
  // [frequency (Hz), duration (s)]  — freq 0 = rust
  const MELODY = [
    [659, 0.2], [0, 0.1], [659, 0.2], [0, 0.1],
    [523, 0.2], [659, 0.2], [784, 0.4], [0, 0.4],
    [392, 0.4], [0, 0.4],
    [523, 0.3], [0, 0.2], [392, 0.3], [0, 0.2],
    [330, 0.3], [0, 0.1], [440, 0.2], [494, 0.2],
    [466, 0.2], [440, 0.2], [0, 0.1],
    [392, 0.25], [659, 0.25], [784, 0.25], [880, 0.25],
    [698, 0.2],  [784, 0.2], [0, 0.1],
    [659, 0.3],  [0, 0.1],
    [523, 0.2],  [494, 0.2], [440, 0.3], [0, 0.3],
  ];

  const BASS = [
    [130, 0.4], [0, 0.4], [130, 0.4], [0, 0.4],
    [110, 0.4], [0, 0.4], [98,  0.4], [0, 0.4],
    [130, 0.8], [110, 0.8],
    [98,  0.4], [0,   0.4], [130, 0.8],
  ];

  function scheduleNote(notes, idx, type, vol, callback) {
    if (!soundOn || !musicPlaying) return null;
    const [freq, dur] = notes[idx];
    if (freq > 0) playTone(freq, type, dur * 0.85, vol);
    return setTimeout(() => {
      if (!musicPlaying) return;
      callback((idx + 1) % notes.length);
    }, dur * 1000);
  }

  function playMelody(idx) {
    melodyTimer = scheduleNote(MELODY, idx, 'square', 0.09, playMelody);
  }

  function playBass(idx) {
    bassTimer = scheduleNote(BASS, idx, 'triangle', 0.13, playBass);
  }

  function startMusic() {
    if (musicPlaying || !soundOn) return;
    musicPlaying = true;
    playMelody(0);
    playBass(0);
  }

  function stopMusic() {
    musicPlaying = false;
    clearTimeout(melodyTimer);
    clearTimeout(bassTimer);
  }

  /* ── Sound toggle knop (optioneel — zet in je HTML: <button id="flappy-sound">🔊</button>) ── */
  const soundBtn = document.getElementById('flappy-sound');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundOn = !soundOn;
      soundBtn.textContent = soundOn ? '🔊' : '🔇';
      if (!soundOn) stopMusic();
      else if (state === 'playing' || state === 'idle') startMusic();
    });
  }

  /* ── Game state ── */
  let state; // 'idle' | 'playing' | 'dead'
  let bird, pipes, score, best, frameId;
  let lastTime = 0;

  const GRAVITY       = 1800;  // px/s²
  const FLAP_VEL      = -440;  // px/s
  const PIPE_SPEED    = 180;   // px/s
  const PIPE_GAP      = 130;
  const PIPE_W        = 52;
  const BIRD_R        = 16;
  const GROUND_H      = 50;
  const PIPE_INTERVAL = 1.6;   // seconds between pipes

  function initGame() {
    bird = { x: 80, y: H / 2, vy: 0, angle: 0, wingAng: 0 };
    pipes = [];
    score = 0;
    state = 'idle';
    lastTime = 0;
  }

  function flap() {
    if (state === 'idle') {
      state = 'playing';
      startMusic();
    }
    if (state === 'playing') {
      bird.vy = FLAP_VEL;
      soundFlap();
    }
    if (state === 'dead') {
      initGame();
      startMusic();
    }
  }

  /* ── Input ── */
  canvas.addEventListener('click', flap);
  document.addEventListener('keydown', function (e) {
    if ((e.code === 'Space' || e.code === 'ArrowUp') && modal.style.display === 'flex') {
      e.preventDefault();
      flap();
    }
  });

  /* ── Pipe helpers ── */
  let timeSincePipe = 0;

  function spawnPipe() {
    const minTop = 60;
    const maxTop = H - GROUND_H - PIPE_GAP - 60;
    const top = minTop + Math.random() * (maxTop - minTop);
    pipes.push({ x: W + 10, top, passed: false });
  }

  /* ── Update ── */
  function update(dt) {
    if (state !== 'playing') return;

    /* Bird physics */
    bird.vy    += GRAVITY * dt;
    bird.y     += bird.vy  * dt;
    bird.angle  = Math.max(-30, Math.min(90, bird.vy * 0.06));
    bird.wingAng = (bird.wingAng + dt * 8) % (Math.PI * 2);

    /* Pipes */
    timeSincePipe += dt;
    if (timeSincePipe >= PIPE_INTERVAL) { spawnPipe(); timeSincePipe = 0; }

    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].x -= PIPE_SPEED * dt;
      if (!pipes[i].passed && pipes[i].x + PIPE_W < bird.x) {
        pipes[i].passed = true;
        score++;
        soundScore();
      }
      if (pipes[i].x + PIPE_W < -10) pipes.splice(i, 1);
    }

    /* Collision */
    const bx = bird.x, by = bird.y;
    if (by + BIRD_R >= H - GROUND_H || by - BIRD_R <= 0) { die(); return; }
    for (const p of pipes) {
      const inX = bx + BIRD_R > p.x + 4 && bx - BIRD_R < p.x + PIPE_W - 4;
      const inY = by - BIRD_R < p.top   || by + BIRD_R > p.top + PIPE_GAP;
      if (inX && inY) { die(); return; }
    }
  }

  function die() {
    state = 'dead';
    if (score > best) best = score;
    stopMusic();
    soundDie();
  }

  /* ── Draw ── */
  function draw(ts) {
    ctx.clearRect(0, 0, W, H);

    /* Sky gradient */
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, SKY_TOP);
    grad.addColorStop(1, SKY_BOT);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    /* Stars (static) */
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 137.5) % W;
      const sy = (i * 97.3)  % (H - GROUND_H - 20);
      const r  = 0.8 + (i % 3) * 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Pipes */
    for (const p of pipes) {
      drawPipe(p.x, p.top);
    }

    /* Ground */
    ctx.fillStyle = GROUND_COL;
    ctx.fillRect(0, H - GROUND_H, W, GROUND_H);
    ctx.strokeStyle = PIPE_EDGE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, H - GROUND_H);
    ctx.lineTo(W, H - GROUND_H);
    ctx.stroke();

    /* Bird */
    drawBird();

    /* Score */
    ctx.fillStyle = SCORE_COL;
    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(score, W / 2, 44);

    if (best > 0) {
      ctx.fillStyle = BEST_COL;
      ctx.font = '13px "Space Grotesk", sans-serif';
      ctx.fillText('Best: ' + best, W / 2, 64);
    }

    /* Idle screen */
    if (state === 'idle') {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚽  Tap om te starten', W / 2, H / 2);
      ctx.font = '13px "Space Grotesk", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('Klik · Spatie · ↑', W / 2, H / 2 + 28);
    }

    /* Dead screen */
    if (state === 'dead') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#e8c55a';
      ctx.font = 'bold 26px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W / 2, H / 2 - 20);

      ctx.fillStyle = '#fff';
      ctx.font = '18px "Space Grotesk", sans-serif';
      ctx.fillText('Score: ' + score, W / 2, H / 2 + 14);

      if (score === best && score > 0) {
        ctx.fillStyle = '#e8c55a';
        ctx.font = '13px "Space Grotesk", sans-serif';
        ctx.fillText('🏆 Nieuw record!', W / 2, H / 2 + 38);
      }

      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '13px "Space Grotesk", sans-serif';
      ctx.fillText('Tap om opnieuw te spelen', W / 2, H / 2 + 64);
    }
  }

  function drawPipe(x, topHeight) {
    const capH = 18, capExtra = 6;

    ctx.fillStyle = PIPE_COL;
    ctx.fillRect(x, 0, PIPE_W, topHeight);
    ctx.fillStyle = PIPE_EDGE;
    ctx.fillRect(x - capExtra, topHeight - capH, PIPE_W + capExtra * 2, capH);

    const botY = topHeight + PIPE_GAP;
    ctx.fillStyle = PIPE_COL;
    ctx.fillRect(x, botY, PIPE_W, H - GROUND_H - botY);
    ctx.fillStyle = PIPE_EDGE;
    ctx.fillRect(x - capExtra, botY, PIPE_W + capExtra * 2, capH);

    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(x + 6, 0, 10, topHeight);
    ctx.fillRect(x + 6, botY + capH, 10, H - GROUND_H - botY - capH);
  }

  function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate((bird.angle * Math.PI) / 180);

    const wingY = Math.sin(bird.wingAng) * 5;
    ctx.fillStyle = BIRD_WING;
    ctx.beginPath();
    ctx.ellipse(-4, wingY + 6, 10, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = BIRD_BODY;
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = BIRD_EYE;
    ctx.beginPath();
    ctx.arc(6, -5, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = BIRD_PUP;
    ctx.beginPath();
    ctx.arc(7.5, -4.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f0a500';
    ctx.beginPath();
    ctx.moveTo(BIRD_R - 2, -2);
    ctx.lineTo(BIRD_R + 9, 0);
    ctx.lineTo(BIRD_R - 2, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /* ── Game loop ── */
  function loop(ts) {
    const dt = Math.min((ts - (lastTime || ts)) / 1000, 0.05);
    lastTime = ts;
    update(dt);
    draw(ts);
    frameId = requestAnimationFrame(loop);
  }

  /* ── Open / Close ── */
  openBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    initGame();
    best = best || 0;
    timeSincePipe = 0;
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(loop);
    // Heractiveer AudioContext na browser autoplay-blokkering
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  });

  function closeGame() {
    modal.style.display = 'none';
    cancelAnimationFrame(frameId);
    stopMusic();
  }

  closeBtn.addEventListener('click', closeGame);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeGame(); });

  best = 0;
})();