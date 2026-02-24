let soundEnabled = true;
let _ctx: AudioContext | null = null;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (!enabled) stopAllGameSounds();
  if (enabled) {
    const ctx = getCtx();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }
}
export function isSoundEnabled() { return soundEnabled; }

function getCtx(): AudioContext | null {
  if (!soundEnabled) return null;
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new AudioContext();
  }
  if (_ctx.state === 'suspended') {
    _ctx.resume().catch(() => {});
  }
  return _ctx;
}

interface ToneNote { freq: number; dur: number; type?: OscillatorType; gain?: number; delay?: number }

function playTones(notes: ToneNote[]) {
  const ctx = getCtx();
  if (!ctx) return;
  for (const note of notes) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = note.type ?? 'sine';
      osc.frequency.value = note.freq;
      const start = ctx.currentTime + (note.delay ?? 0);
      const g = note.gain ?? 0.25;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(g, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + note.dur);
      osc.start(start);
      osc.stop(start + note.dur + 0.05);
      // Track every oscillator so stopAllGameSounds can kill them
      _activeOscs.push(osc);
      osc.onended = () => {
        const idx = _activeOscs.indexOf(osc);
        if (idx !== -1) _activeOscs.splice(idx, 1);
      };
    } catch (_) {}
  }
}

// ─── All active oscillators for game sounds (so we can stop them) ─────────────
const _activeOscs: OscillatorNode[] = [];

function playLoopTone(freq: number, type: OscillatorType = 'sine', gainVal = 0.1): () => void {
  const ctx = getCtx();
  if (!ctx) return () => {};
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = gainVal;
    osc.start();
    _activeOscs.push(osc);
    return () => { try { osc.stop(); } catch (_) {} };
  } catch (_) { return () => {}; }
}

// ─── Stop all game sounds ─────────────────────────────────────────────────────
export function stopAllGameSounds() {
  while (_activeOscs.length > 0) {
    const osc = _activeOscs.pop();
    try {
      osc?.stop();
      // Ensure we fully detach oscillators from the graph
      osc?.disconnect();
    } catch (_) {}
  }
  // Hard reset audio context so absolutely no tails remain (e.g. after Crash)
  if (_ctx && _ctx.state !== 'closed') {
    try { _ctx.close(); } catch (_) {}
    _ctx = null;
  }
}

// ─── Sound definitions ────────────────────────────────────────────────────────
export function playClick() {
  playTones([{ freq: 800, dur: 0.08, type: 'square', gain: 0.12 }]);
}

export function playNavSwitch() {
  playTones([
    { freq: 600, dur: 0.08, type: 'sine', gain: 0.18 },
    { freq: 900, dur: 0.08, type: 'sine', gain: 0.18, delay: 0.07 },
  ]);
}

export function playWin() {
  playTones([523,659,784,1047].map((f,i) => ({ freq: f, dur: 0.2, type: 'sine' as OscillatorType, gain: 0.28, delay: i * 0.1 })));
}

export function playBigWin() {
  playTones([523,659,784,1047,1319,1568].map((f,i) => ({ freq: f, dur: 0.22, type: 'sine' as OscillatorType, gain: 0.32, delay: i * 0.08 })));
}

export function playLoss() {
  playTones([400,300,200].map((f,i) => ({ freq: f, dur: 0.25, type: 'sawtooth' as OscillatorType, gain: 0.12, delay: i * 0.12 })));
}

export function playDiceRoll() {
  playTones(Array.from({length:8},(_,i) => ({ freq: 180 + Math.random() * 220, dur: 0.05, type: 'square' as OscillatorType, gain: 0.08, delay: i * 0.06 })));
}

export function playCoinFlip() {
  playTones(Array.from({length:8},(_,i) => ({ freq: i % 2 === 0 ? 900 : 700, dur: 0.05, type: 'sine' as OscillatorType, gain: 0.18, delay: i * 0.09 })));
}

export function playSlotSpin() {
  playTones(Array.from({length:12},(_,i) => ({ freq: 100 + i * 20, dur: 0.04, type: 'square' as OscillatorType, gain: 0.06, delay: i * 0.05 })));
}

export function playSlotStop() {
  playTones([
    { freq: 440, dur: 0.15, type: 'sine', gain: 0.22 },
    { freq: 550, dur: 0.12, type: 'sine', gain: 0.18, delay: 0.1 },
  ]);
}

export function playCrash() {
  playTones([
    { freq: 600, dur: 0.6, type: 'sawtooth', gain: 0.28 },
    { freq: 60, dur: 0.4, type: 'sawtooth', gain: 0.18, delay: 0.3 },
  ]);
}

export function playCrashTick() {
  playTones([{ freq: 350, dur: 0.03, type: 'square', gain: 0.05 }]);
}

export function playCashout() {
  playTones([523,784,1047].map((f,i) => ({ freq: f, dur: 0.15, type: 'sine' as OscillatorType, gain: 0.28, delay: i * 0.07 })));
}

export function playRouletteSpin() {
  playTones(Array.from({length:18},(_,i) => ({ freq: 140 + i * 10, dur: 0.04, type: 'square' as OscillatorType, gain: 0.06, delay: i * 0.09 })));
}

export function playCardDeal() {
  playTones([
    { freq: 900, dur: 0.06, type: 'square', gain: 0.16 },
    { freq: 650, dur: 0.06, type: 'square', gain: 0.12, delay: 0.05 },
  ]);
}

export function playCardFlip() {
  playTones([{ freq: 1050, dur: 0.05, type: 'sine', gain: 0.18 }]);
}

export function playBlackjack() {
  playTones([784,988,1175,1568].map((f,i) => ({ freq: f, dur: 0.2, type: 'sine' as OscillatorType, gain: 0.35, delay: i * 0.1 })));
}

export function playCountdown() {
  playTones([{ freq: 440, dur: 0.15, type: 'sine', gain: 0.18 }]);
}

export function playDeposit() {
  playTones([523,659,784,1047,1319].map((f,i) => ({ freq: f, dur: 0.18, type: 'sine' as OscillatorType, gain: 0.28, delay: i * 0.08 })));
}

// ─── Crash Engine Sound ───────────────────────────────────────────────────────
// Multi-layered dynamic engine: bass rumble + mid drive + high whistle + tremolo
export function startCrashLoop() {
  const ctx = getCtx();
  if (!ctx) return () => {};
  try {
    const t = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, t);
    master.gain.linearRampToValueAtTime(1, t + 0.4);
    master.connect(ctx.destination);

    // --- Layer 1: Bass rumble (low sawtooth) ---
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassFilter = ctx.createBiquadFilter();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(45, t);
    bassOsc.frequency.exponentialRampToValueAtTime(120, t + 15);
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(120, t);
    bassFilter.frequency.linearRampToValueAtTime(400, t + 15);
    bassFilter.Q.value = 2;
    bassGain.gain.value = 0.12;
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(master);
    bassOsc.start(t);
    _activeOscs.push(bassOsc);

    // --- Layer 2: Mid engine drive (square, gritty) ---
    const midOsc = ctx.createOscillator();
    const midGain = ctx.createGain();
    const midFilter = ctx.createBiquadFilter();
    midOsc.type = 'square';
    midOsc.frequency.setValueAtTime(80, t);
    midOsc.frequency.exponentialRampToValueAtTime(500, t + 12);
    midFilter.type = 'bandpass';
    midFilter.frequency.setValueAtTime(300, t);
    midFilter.frequency.linearRampToValueAtTime(1200, t + 12);
    midFilter.Q.value = 1.5;
    midGain.gain.value = 0.07;
    midOsc.connect(midFilter);
    midFilter.connect(midGain);
    midGain.connect(master);
    midOsc.start(t);
    _activeOscs.push(midOsc);

    // --- Layer 3: High whistle (sine, rising pitch) ---
    const hiOsc = ctx.createOscillator();
    const hiGain = ctx.createGain();
    hiOsc.type = 'sine';
    hiOsc.frequency.setValueAtTime(400, t);
    hiOsc.frequency.exponentialRampToValueAtTime(2400, t + 15);
    hiGain.gain.setValueAtTime(0, t);
    hiGain.gain.linearRampToValueAtTime(0.06, t + 2);
    hiGain.gain.linearRampToValueAtTime(0.1, t + 15);
    hiOsc.connect(hiGain);
    hiGain.connect(master);
    hiOsc.start(t);
    _activeOscs.push(hiOsc);

    // --- LFO: Tremolo for pulsating engine feel ---
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(4, t);
    lfo.frequency.linearRampToValueAtTime(12, t + 15);
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start(t);
    _activeOscs.push(lfo);

    return () => {
      try {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0, now + 0.15);
        const stopTime = now + 0.2;
        bassOsc.stop(stopTime);
        midOsc.stop(stopTime);
        hiOsc.stop(stopTime);
        lfo.stop(stopTime);
      } catch (_) {}
    };
  } catch (_) { return () => {}; }
}

export const stopCrashLoop = stopAllGameSounds;
