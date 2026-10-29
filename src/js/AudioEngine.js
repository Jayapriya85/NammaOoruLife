// ══════════════════════════════════════════════════════════════════════════════
// AUDIOWEB SYNTHESIZER — Luxury Ambient Temple Atmosphere (432Hz)
// Zero external mp3 dependencies; synthesized live via Web Audio API
// ══════════════════════════════════════════════════════════════════════════════

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.oscillators = [];
    this.chimeTimeout = null;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    // Master volume with smooth gain envelope
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

    // Warm Lowpass Filter (simulates acoustic stone temple resonance)
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(480, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.masterGain.connect(this.filter);
    this.filter.connect(this.ctx.destination);
  }

  toggle() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  play() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Stop existing oscillators if any
    this.stopOscillators();

    // Fundamental 432Hz meditative scale frequencies
    const freqs = [108, 216, 324, 432];
    this.oscillators = freqs.map((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : idx === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Micro detuning for lush, warm chorus texture
      const detune = (idx - 1.5) * 4.2;
      osc.detune.setValueAtTime(detune, this.ctx.currentTime);

      const amp = idx === 0 ? 0.35 : idx === 1 ? 0.22 : 0.08;
      gain.gain.setValueAtTime(amp, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      return osc;
    });

    // Smooth fade in
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 1.6);
    this.isPlaying = true;

    // Trigger initial bell chime
    this.playTempleChime();
    this.startPeriodicChime();
  }

  pause() {
    if (!this.ctx) return;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
    setTimeout(() => {
      this.stopOscillators();
      this.isPlaying = false;
    }, 850);
    if (this.chimeTimeout) clearTimeout(this.chimeTimeout);
  }

  stopOscillators() {
    this.oscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    this.oscillators = [];
  }

  playTempleChime(pitch = 864) {
    if (!this.ctx || !this.isPlaying) return;
    try {
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

      chimeGain.gain.setValueAtTime(0, this.ctx.currentTime);
      chimeGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.04);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.2);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);

      chimeOsc.start();
      chimeOsc.stop(this.ctx.currentTime + 3.3);
    } catch (e) {}
  }

  startPeriodicChime() {
    const nextInterval = 9000 + Math.random() * 6000;
    this.chimeTimeout = setTimeout(() => {
      if (this.isPlaying) {
        const tones = [648, 864, 1080];
        const tone = tones[Math.floor(Math.random() * tones.length)];
        this.playTempleChime(tone);
        this.startPeriodicChime();
      }
    }, nextInterval);
  }
}
