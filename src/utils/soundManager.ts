class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmMuted: boolean = false;
  private sfxVolume: number = 0.7;
  private bgmVolume: number = 0.25;
  private bgmInterval: number | null = null;
  private bgmPlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('hw_sound_muted');
      const savedSfx = localStorage.getItem('hw_sfx_volume');
      const savedBgm = localStorage.getItem('hw_bgm_volume');
      if (savedMute !== null) this.isMuted = savedMute === 'true';
      if (savedSfx !== null) this.sfxVolume = parseFloat(savedSfx);
      if (savedBgm !== null) this.bgmVolume = parseFloat(savedBgm);
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getSettings() {
    return {
      isMuted: this.isMuted,
      bgmMuted: this.bgmMuted,
      sfxVolume: this.sfxVolume,
      bgmVolume: this.bgmVolume,
      bgmPlaying: this.bgmPlaying,
    };
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hw_sound_muted', String(muted));
    }
    if (muted) {
      this.stopBGM();
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('hw_sfx_volume', String(this.sfxVolume));
    }
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('hw_bgm_volume', String(this.bgmVolume));
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    delay: number = 0,
    gainMultiplier: number = 1
  ) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    const peakGain = Math.max(0.001, this.sfxVolume * 0.25 * gainMultiplier);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick() {
    this.playTone(660, 0.06, 'sine', 0, 0.6);
  }

  public playNavigation() {
    this.playTone(523.25, 0.07, 'triangle', 0, 0.5);
    this.playTone(659.25, 0.09, 'triangle', 0.05, 0.5);
  }

  public playDoor() {
    this.playTone(320, 0.12, 'sine', 0, 0.7);
    this.playTone(480, 0.16, 'sine', 0.09, 0.7);
  }

  public playNpcInteract() {
    this.playTone(587.33, 0.08, 'sine', 0, 0.65);
    this.playTone(880, 0.12, 'sine', 0.07, 0.65);
  }

  public playQuizStart() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.15, 'triangle', idx * 0.08, 0.85);
    });
  }

  public playCorrect() {
    this.playTone(587.33, 0.11, 'triangle', 0, 0.9);
    this.playTone(880, 0.22, 'triangle', 0.09, 1.0);
  }

  public playWrong() {
    this.playTone(260, 0.16, 'sawtooth', 0, 0.6);
    this.playTone(195, 0.24, 'sawtooth', 0.12, 0.6);
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, 'triangle', idx * 0.11, 0.95);
    });
  }

  public playTrophy() {
    const notes = [659.25, 783.99, 987.77, 1318.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.2, 'sine', idx * 0.09, 0.9);
    });
  }

  public playLevelUp() {
    const notes = [440, 523.25, 659.25, 783.99, 880];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.14, 'triangle', idx * 0.07, 0.8);
    });
  }

  public startBGM() {
    if (this.isMuted || this.bgmMuted || this.bgmPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.bgmPlaying = true;
    const chordProgression = [
      [261.63, 329.63, 392.0],
      [220.0, 261.63, 329.63],
      [174.61, 220.0, 261.63],
      [196.0, 246.94, 293.66],
    ];
    let step = 0;

    const playAmbientChord = () => {
      if (this.isMuted || this.bgmMuted || !this.bgmPlaying) return;
      const activeCtx = this.getContext();
      if (!activeCtx) return;

      const chord = chordProgression[step % chordProgression.length];
      step++;

      chord.forEach((freq) => {
        const now = activeCtx.currentTime;
        const osc = activeCtx.createOscillator();
        const gain = activeCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const vol = Math.max(0.001, this.bgmVolume * 0.06);
        gain.gain.setValueAtTime(0.0005, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 3.4);

        osc.connect(gain);
        gain.connect(activeCtx.destination);
        osc.start(now);
        osc.stop(now + 3.5);
      });
    };

    playAmbientChord();
    this.bgmInterval = window.setInterval(playAmbientChord, 3600);
  }

  public stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public speakNpc(text: string, lang: 'id-ID' | 'en-US' = 'id-ID') {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.02;
      utterance.pitch = 1.05;
      utterance.volume = Math.max(0.1, Math.min(1, this.sfxVolume));
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors on browsers without voice packs
    }
  }
}

export const soundManager = new SoundManager();
