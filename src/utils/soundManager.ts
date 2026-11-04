import {
  buildProsodyChunks,
  CharacterEmotion,
  CharacterGender,
  CharacterVoiceProfile,
  detectDialogueEmotion,
  EMOTION_PROSODY_MAP,
  getCharacterVoiceProfile,
} from './characterVoiceSystem';

export interface AudioEngineSettings {
  isMuted: boolean;
  masterVolume: number;
  voiceVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  isBgmPlaying: boolean;
  isAudioUnlocked: boolean;
}

export interface CharacterSpeakingState {
  isSpeaking: boolean;
  characterId: string | null;
  characterName: string | null;
  voiceId: string | null;
  gender: CharacterGender | null;
  emotion: CharacterEmotion | null;
  emotionLabel: string | null;
  mouthOpenness: number; // 0.0 to 1.0 for 3D avatar lip-sync
  gestureIntensity: number;
  headTiltRad: number;
  activeClauseText: string | null;
}

type SpeakingListener = (state: CharacterSpeakingState) => void;

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.9;
  private voiceVolume: number = 0.95;
  private bgmVolume: number = 0.22;
  private sfxVolume: number = 0.65;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;
  private isAudioUnlocked: boolean = false;

  // Speech & Lip-Sync State
  private availableVoices: SpeechSynthesisVoice[] = [];
  private activeSpeechToken: number = 0;
  private activeAudioSource: AudioBufferSourceNode | null = null;
  private activeHtmlAudio: HTMLAudioElement | null = null;
  private activeLipSyncTimer: number | null = null;
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private speakingListeners: Set<SpeakingListener> = new Set();

  private speakingState: CharacterSpeakingState = {
    isSpeaking: false,
    characterId: null,
    characterName: null,
    voiceId: null,
    gender: null,
    emotion: null,
    emotionLabel: null,
    mouthOpenness: 0,
    gestureIntensity: 0,
    headTiltRad: 0,
    activeClauseText: null,
  };

  constructor() {
    this.loadSavedSettings();
    this.setupGlobalInteractionUnlock();
    this.initSpeechVoices();
  }

  private loadSavedSettings() {
    try {
      const saved = localStorage.getItem('hematology_world_audio_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.isMuted === 'boolean') this.isMuted = parsed.isMuted;
        if (typeof parsed.masterVolume === 'number') {
          this.masterVolume = Math.max(0, Math.min(1, parsed.masterVolume));
        }
        if (typeof parsed.voiceVolume === 'number') {
          this.voiceVolume = Math.max(0, Math.min(1, parsed.voiceVolume));
        }
        if (typeof parsed.bgmVolume === 'number') {
          this.bgmVolume = Math.max(0, Math.min(1, parsed.bgmVolume));
        }
        if (typeof parsed.sfxVolume === 'number') {
          this.sfxVolume = Math.max(0, Math.min(1, parsed.sfxVolume));
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem(
        'hematology_world_audio_v3',
        JSON.stringify({
          isMuted: this.isMuted,
          masterVolume: this.masterVolume,
          voiceVolume: this.voiceVolume,
          bgmVolume: this.bgmVolume,
          sfxVolume: this.sfxVolume,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Registers first-touch / first-click listeners so Android Chrome & WebView
   * automatically resume AudioContext and unlock speech playback upon any user interaction.
   */
  private setupGlobalInteractionUnlock() {
    if (typeof window === 'undefined') return;

    const unlockHandler = () => {
      this.unlockAudioEngine(false);
    };

    const events = ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'];
    events.forEach((evt) => {
      window.addEventListener(evt, unlockHandler, { passive: true, capture: true });
    });
  }

  private initSpeechVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          this.availableVoices = voices;
        }
      } catch {
        // Ignore
      }
    };

    loadVoices();
    try {
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    } catch {
      // Ignore
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

  /**
   * Explicitly initializes and unlocks Web Audio API, HTMLAudioElement, and SpeechSynthesis
   * on Android smartphones and desktop browsers. Persists for the entire session.
   */
  public async unlockAudioEngine(playConfirmationChime = false): Promise<boolean> {
    try {
      const ctx = this.getContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        // Play a 1-sample silent buffer to unlock Android hardware audio pipeline
        const silentBuffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(ctx.destination);
        source.start(0);
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.availableVoices = voices;
        }
        // Prime Android speechSynthesis engine with a silent zero-volume utterance if not speaking
        if (!this.isAudioUnlocked && !window.speechSynthesis.speaking) {
          const warmUp = new SpeechSynthesisUtterance('');
          warmUp.volume = 0;
          window.speechSynthesis.speak(warmUp);
        }
      }

      this.isAudioUnlocked = true;
      this.emitSpeakingState();

      if (playConfirmationChime) {
        this.isMuted = false;
        this.saveSettings();
        this.playCorrect();
      }
      return true;
    } catch {
      return false;
    }
  }

  public getEffectiveSfxVolume(): number {
    if (this.isMuted) return 0;
    return this.masterVolume * this.sfxVolume;
  }

  public getEffectiveVoiceVolume(): number {
    if (this.isMuted) return 0;
    return this.masterVolume * this.voiceVolume;
  }

  public getEffectiveBgmVolume(): number {
    if (this.isMuted) return 0;
    return this.masterVolume * this.bgmVolume;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopBGM();
      this.stopSpeaking();
    }
    this.saveSettings();
    this.emitSpeakingState();
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  public setVoiceVolume(vol: number) {
    this.voiceVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  public getSettings(): AudioEngineSettings {
    return {
      isMuted: this.isMuted,
      masterVolume: this.masterVolume,
      voiceVolume: this.voiceVolume,
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume,
      isBgmPlaying: this.isBgmPlaying,
      isAudioUnlocked: this.isAudioUnlocked,
    };
  }

  public getSpeakingState(): CharacterSpeakingState {
    return this.speakingState;
  }

  public isCharacterSpeaking(characterId?: string): boolean {
    if (!this.speakingState.isSpeaking) return false;
    if (!characterId) return true;
    return this.speakingState.characterId === characterId;
  }

  public subscribeSpeakingState(listener: SpeakingListener): () => void {
    this.speakingListeners.add(listener);
    listener(this.speakingState);
    return () => {
      this.speakingListeners.delete(listener);
    };
  }

  private updateSpeakingState(patch: Partial<CharacterSpeakingState>) {
    this.speakingState = {
      ...this.speakingState,
      ...patch,
    };
    this.emitSpeakingState();
  }

  private emitSpeakingState() {
    for (const listener of this.speakingListeners) {
      try {
        listener(this.speakingState);
      } catch {
        // Ignore listener errors
      }
    }
  }

  // UI Button Click
  public playClick() {
    const effVol = this.getEffectiveSfxVolume();
    if (effVol <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.045);

    gain.gain.setValueAtTime(effVol * 0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.055);
  }

  // Menu Navigation Swoop
  public playNavigation() {
    const effVol = this.getEffectiveSfxVolume();
    if (effVol <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(effVol * 0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.095);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  // Correct Answer Chime
  public playCorrect() {
    const effVol = this.getEffectiveSfxVolume();
    if (effVol <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const startTime = ctx.currentTime + idx * 0.07;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(effVol * 0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  // Wrong Answer Soft Buzz
  public playWrong() {
    const effVol = this.getEffectiveSfxVolume();
    if (effVol <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [280, 210];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const startTime = ctx.currentTime + idx * 0.12;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(effVol * 0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }

  // Level Up / Victory Fanfare
  public playVictory() {
    const effVol = this.getEffectiveSfxVolume();
    if (effVol <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const melody = [440, 554.37, 659.25, 880, 659.25, 880];
    const durations = [0.1, 0.1, 0.1, 0.22, 0.1, 0.38];
    let offset = 0;

    melody.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const startTime = ctx.currentTime + offset;
      const dur = durations[idx];
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(effVol * 0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + dur + 0.02);
      offset += dur * 0.85;
    });
  }

  public playLevelUp() {
    this.playVictory();
  }

  public playDoor() {
    this.playNavigation();
  }

  // NPC Dialogue Greeting Beep
  public playNpcInteract() {
    const effVol = this.getEffectiveSfxVolume();
    if (effVol <= 0.001) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const freqs = [480, 640];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.06;
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(effVol * 0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.11);
    });
  }

  // Subtle Ambient Hospital / Lab Background Music Loop (Independent of Character Voice Volume)
  public startBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isBgmPlaying = true;
    const chordProgression = [
      [261.63, 329.63, 392.0], // C major
      [220.0, 261.63, 329.63], // A minor
      [174.61, 220.0, 261.63], // F major
      [196.0, 246.94, 293.66], // G major
    ];
    let step = 0;

    const playChord = () => {
      const effBgm = this.getEffectiveBgmVolume();
      if (this.isMuted || !this.isBgmPlaying || effBgm <= 0.001) return;
      const chord = chordProgression[step % chordProgression.length];
      step++;
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(effBgm * 0.09, ctx.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + 3.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 3.5);
      });
    };

    playChord();
    this.bgmInterval = window.setInterval(playChord, 3600);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  /**
   * Stops all active character voice playback and immediately resets 3D avatar lip-sync to idle.
   */
  public stopSpeaking() {
    this.activeSpeechToken++;

    if (this.activeLipSyncTimer !== null) {
      clearInterval(this.activeLipSyncTimer);
      this.activeLipSyncTimer = null;
    }

    if (this.activeAudioSource) {
      try {
        this.activeAudioSource.stop();
        this.activeAudioSource.disconnect();
      } catch {
        // Ignore if already stopped
      }
      this.activeAudioSource = null;
    }

    if (this.activeHtmlAudio) {
      try {
        this.activeHtmlAudio.pause();
        this.activeHtmlAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.activeHtmlAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }

    this.updateSpeakingState({
      isSpeaking: false,
      mouthOpenness: 0,
      gestureIntensity: 0,
      headTiltRad: 0,
      activeClauseText: null,
    });
  }

  /**
   * Selects the best available SpeechSynthesisVoice that strictly matches the character's gender
   * and target language.
   */
  private selectBestSpeechVoice(
    profile: CharacterVoiceProfile,
    lang: 'id-ID' | 'en-US'
  ): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices =
      this.availableVoices.length > 0
        ? this.availableVoices
        : window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const targetLangPrefix = lang.startsWith('id') ? 'id' : 'en';
    const langVoices = voices.filter((v) =>
      v.lang.toLowerCase().replace('_', '-').startsWith(targetLangPrefix)
    );
    const pool = langVoices.length > 0 ? langVoices : voices;

    const femalePatterns = /gadis|damayanti|putri|siti|female|woman|perempuan|wanita|samantha|victoria|karen|zira|hazel|linda|susan/i;
    const malePatterns = /ardi|budi|male|man|pria|laki|daniel|david|alex|fred|george|mark|richard|james/i;

    if (profile.gender === 'female') {
      // Strictly prefer explicit female voices, and exclude explicit male voices
      const strictFemale = pool.find((v) => femalePatterns.test(v.name) && !malePatterns.test(v.name));
      if (strictFemale) return strictFemale;
      const nonMale = pool.find((v) => !malePatterns.test(v.name));
      if (nonMale) return nonMale;
    } else {
      // Strictly prefer explicit male voices, and exclude explicit female voices
      const strictMale = pool.find((v) => malePatterns.test(v.name) && !femalePatterns.test(v.name));
      if (strictMale) return strictMale;
      const nonFemale = pool.find((v) => !femalePatterns.test(v.name));
      if (nonFemale) return nonFemale;
    }

    return pool[0] || null;
  }

  /**
   * Plays a subtle, gender-accurate vocal formant cadence via Web Audio API so that
   * even on Android WebViews without a local SpeechSynthesis engine, the student hears
   * natural syllabic vocal resonance synchronized with the character's mouth movement.
   */
  private playFormantSyllablePulse(
    profile: CharacterVoiceProfile,
    pitchFactor: number,
    volumeFactor: number
  ) {
    const effVoiceVol = this.getEffectiveVoiceVolume() * volumeFactor;
    if (effVoiceVol <= 0.005) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Authentic fundamental frequency (F0): Male 118-145 Hz, Female 215-255 Hz
    const baseF0 = profile.gender === 'female' ? 225 : 122;
    const f0 = baseF0 * pitchFactor;

    const osc = ctx.createOscillator();
    const formantFilter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = profile.gender === 'female' ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(f0, now);
    osc.frequency.exponentialRampToValueAtTime(f0 * 0.96, now + 0.075);

    formantFilter.type = 'bandpass';
    formantFilter.frequency.setValueAtTime(profile.gender === 'female' ? 820 : 540, now);
    formantFilter.Q.setValueAtTime(2.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(effVoiceVol * 0.045, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.08);

    osc.connect(formantFilter);
    formantFilter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  /**
   * Attempts to fetch and play server-synthesized neural TTS audio via Web Audio API
   * with gender-authentic pitch/formant shaping and real-time AnalyserNode 3D lip-sync.
   */
  private async tryPlayServerTtsChunk(
    chunkText: string,
    profile: CharacterVoiceProfile,
    lang: 'id-ID' | 'en-US',
    finalPitch: number,
    finalRate: number,
    finalVolume: number,
    token: number
  ): Promise<boolean> {
    const ctx = this.getContext();
    if (!ctx) return false;

    const cacheKey = `${profile.voiceId}:${lang}:${chunkText.slice(0, 180)}`;
    let audioBuffer = this.audioBufferCache.get(cacheKey) || null;

    if (!audioBuffer) {
      try {
        const res = await fetch('/api/tts/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: chunkText,
            lang,
            characterId: profile.characterId,
            voiceId: profile.voiceId,
            gender: profile.gender,
            geminiVoiceName: profile.geminiVoiceName,
          }),
        });
        if (!res.ok) return false;
        const arrayBuf = await res.arrayBuffer();
        if (!arrayBuf || arrayBuf.byteLength < 256) return false;
        audioBuffer = await ctx.decodeAudioData(arrayBuf.slice(0));
        this.audioBufferCache.set(cacheKey, audioBuffer);
      } catch {
        return false;
      }
    }

    if (token !== this.activeSpeechToken || !audioBuffer) return false;

    return new Promise<boolean>((resolve) => {
      try {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer!;

        // Apply character-specific speaking rate & gender timbre detune
        source.playbackRate.value = finalRate;
        if ('detune' in source && typeof source.detune?.value === 'number') {
          const pitchCents = (finalPitch - 1.0) * 600 + profile.formantDetuneCents;
          source.detune.value = Math.max(-450, Math.min(450, pitchCents));
        }

        // Gender vocal tract EQ shaping
        const eqFilter = ctx.createBiquadFilter();
        if (profile.gender === 'male') {
          eqFilter.type = 'lowshelf';
          eqFilter.frequency.value = 240;
          eqFilter.gain.value = 4.5; // Warm masculine chest resonance
        } else {
          eqFilter.type = 'peaking';
          eqFilter.frequency.value = 1850;
          eqFilter.gain.value = 3.5; // Clear feminine presence
        }

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const gainNode = ctx.createGain();
        gainNode.gain.value = this.getEffectiveVoiceVolume() * finalVolume;

        source.connect(eqFilter);
        eqFilter.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(ctx.destination);

        this.activeAudioSource = source;

        if (this.activeLipSyncTimer !== null) {
          clearInterval(this.activeLipSyncTimer);
        }

        this.activeLipSyncTimer = window.setInterval(() => {
          if (token !== this.activeSpeechToken) return;
          gainNode.gain.value = this.getEffectiveVoiceVolume() * finalVolume;
          analyser.getByteTimeDomainData(dataArray);
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const norm = (dataArray[i] - 128) / 128;
            sumSquares += norm * norm;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);
          const mouthOpen = Math.min(1, rms * 5.2);
          this.updateSpeakingState({
            mouthOpenness: mouthOpen,
          });
        }, 40);

        source.onended = () => {
          if (this.activeLipSyncTimer !== null) {
            clearInterval(this.activeLipSyncTimer);
            this.activeLipSyncTimer = null;
          }
          this.activeAudioSource = null;
          this.updateSpeakingState({ mouthOpenness: 0.05 });
          resolve(true);
        };

        source.start(0);
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Speaks a character's dialogue with permanent Character Voice Identity, strict gender matching,
   * contextual emotional expression, natural sentence prosody, Android compatibility, and 3D lip-sync.
   */
  public async speakCharacterDialogue(options: {
    text: string;
    characterId?: string;
    characterName?: string;
    gender?: CharacterGender;
    emotion?: CharacterEmotion;
    lang?: 'id-ID' | 'en-US';
  }): Promise<void> {
    // Always unlock AudioContext on user-initiated dialogue
    await this.unlockAudioEngine(false);

    if (this.isMuted || this.getEffectiveVoiceVolume() <= 0.005) {
      return;
    }

    // Stop any previous character speech cleanly first
    this.stopSpeaking();
    const currentToken = ++this.activeSpeechToken;

    const lang = options.lang || 'id-ID';
    const profile = getCharacterVoiceProfile(
      options.characterId || options.characterName,
      options.gender
    );
    const detectedEmotion =
      options.emotion || detectDialogueEmotion(options.text, profile);
    const emotionMod = EMOTION_PROSODY_MAP[detectedEmotion];

    const clauses = buildProsodyChunks(options.text, profile, lang, detectedEmotion);
    if (clauses.length === 0) return;

    this.updateSpeakingState({
      isSpeaking: true,
      characterId: profile.characterId,
      characterName: profile.characterName,
      voiceId: profile.voiceId,
      gender: profile.gender,
      emotion: detectedEmotion,
      emotionLabel: emotionMod.labelId,
      mouthOpenness: 0.25,
      gestureIntensity: emotionMod.gestureIntensity,
      headTiltRad: emotionMod.headTiltRad,
      activeClauseText: clauses[0].text,
    });

    for (let i = 0; i < clauses.length; i++) {
      if (currentToken !== this.activeSpeechToken) break;
      const clause = clauses[i];
      const clauseEmotionMod = EMOTION_PROSODY_MAP[clause.emotion] || emotionMod;

      this.updateSpeakingState({
        emotion: clause.emotion,
        emotionLabel: clauseEmotionMod.labelId,
        gestureIntensity: clauseEmotionMod.gestureIntensity,
        headTiltRad: clauseEmotionMod.headTiltRad,
        activeClauseText: clause.text,
      });

      // Layer 1: Try Server-Side Neural / Streamed Audio Buffer via Unlocked Web Audio API
      // (Works 100% reliably on Android smartphones & desktop browsers!)
      const playedViaServerAudio = await this.tryPlayServerTtsChunk(
        clause.spokenText,
        profile,
        lang,
        clause.finalPitch,
        clause.finalRate,
        clause.finalVolume,
        currentToken
      );

      if (currentToken !== this.activeSpeechToken) break;

      // Layer 2 & 3: If offline or server TTS unavailable, use Android-safe Web Speech API + Formant Cadence
      if (!playedViaServerAudio) {
        await this.playClientSpeechWithFormantFallback(
          clause.spokenText,
          profile,
          lang,
          clause.finalPitch,
          clause.finalRate,
          clause.finalVolume,
          currentToken
        );
      }

      if (currentToken !== this.activeSpeechToken) break;

      // Natural inter-clause breathing pause
      if (i < clauses.length - 1) {
        this.updateSpeakingState({ mouthOpenness: 0.04 });
        await new Promise((r) => setTimeout(r, clause.pauseAfterMs));
      }
    }

    if (currentToken === this.activeSpeechToken) {
      this.updateSpeakingState({
        isSpeaking: false,
        mouthOpenness: 0,
        gestureIntensity: 0,
        headTiltRad: 0,
        activeClauseText: null,
      });
    }
  }

  private playClientSpeechWithFormantFallback(
    spokenText: string,
    profile: CharacterVoiceProfile,
    lang: 'id-ID' | 'en-US',
    finalPitch: number,
    finalRate: number,
    finalVolume: number,
    token: number
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const words = spokenText.split(/\s+/).filter(Boolean);
      const estimatedDurationMs = Math.max(
        1100,
        Math.round((words.length / (2.5 * finalRate)) * 1000)
      );

      let speechResolved = false;
      const finishClause = () => {
        if (speechResolved) return;
        speechResolved = true;
        if (this.activeLipSyncTimer !== null) {
          clearInterval(this.activeLipSyncTimer);
          this.activeLipSyncTimer = null;
        }
        resolve();
      };

      const hasSpeechSynth =
        typeof window !== 'undefined' && 'speechSynthesis' in window;
      const matchedVoice = hasSpeechSynth
        ? this.selectBestSpeechVoice(profile, lang)
        : null;

      // Start rhythmic 3D lip-sync & subtle formant syllable support
      let elapsedMs = 0;
      let tickCount = 0;
      if (this.activeLipSyncTimer !== null) {
        clearInterval(this.activeLipSyncTimer);
      }

      this.activeLipSyncTimer = window.setInterval(() => {
        if (token !== this.activeSpeechToken) {
          finishClause();
          return;
        }
        elapsedMs += 65;
        tickCount++;
        const wave = Math.abs(Math.sin(tickCount * 0.65)) * 0.75 + 0.18;
        this.updateSpeakingState({ mouthOpenness: wave });

        // If browser has no TTS voices (common on bare Android WebViews), emit audible formant syllables
        if (!matchedVoice && tickCount % 2 === 0) {
          this.playFormantSyllablePulse(profile, finalPitch, finalVolume);
        }

        if (!hasSpeechSynth && elapsedMs >= estimatedDurationMs) {
          finishClause();
        }
      }, 65);

      if (hasSpeechSynth) {
        // Android Chrome workaround: wait 45ms after any previous cancel() before calling speak()
        window.setTimeout(() => {
          if (token !== this.activeSpeechToken) {
            finishClause();
            return;
          }
          try {
            const utterance = new SpeechSynthesisUtterance(spokenText);
            utterance.lang = lang;
            if (matchedVoice) {
              utterance.voice = matchedVoice;
            }
            utterance.pitch = finalPitch;
            utterance.rate = finalRate;
            utterance.volume = Math.min(1, this.getEffectiveVoiceVolume() * finalVolume);

            utterance.onboundary = () => {
              if (token === this.activeSpeechToken) {
                this.updateSpeakingState({
                  mouthOpenness: 0.45 + Math.random() * 0.5,
                });
              }
            };

            utterance.onend = () => finishClause();
            utterance.onerror = () => finishClause();

            window.speechSynthesis.speak(utterance);

            // Safety timeout in case Android speechSynthesis hangs without firing onend
            window.setTimeout(() => {
              finishClause();
            }, estimatedDurationMs + 1600);
          } catch {
            finishClause();
          }
        }, 45);
      } else {
        window.setTimeout(() => {
          finishClause();
        }, estimatedDurationMs);
      }
    });
  }

  /**
   * Plays an energetic clinical quiz start fanfare.
   */
  public playQuizStart() {
    this.playCorrect();
  }

  /**
   * Backward-compatible helper used across components to speak NPC dialogue.
   */
  public speakNpc(
    text: string,
    lang: 'id-ID' | 'en-US' = 'id-ID',
    characterId?: string,
    emotion?: CharacterEmotion
  ) {
    this.speakCharacterDialogue({
      text,
      lang,
      characterId,
      emotion,
    });
  }
}

export const soundManager = new SoundManager();

