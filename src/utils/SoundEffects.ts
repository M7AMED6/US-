// Web Audio API Synthesizer for Romantic Scrapbook UI
// This enables premium, instant haptic sound effects without loading heavy audio assets over the network.

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check if window is defined (for server-side rendering safety)
    if (typeof window !== "undefined") {
      this.isMuted = localStorage.getItem("scrapbook-muted") === "true";
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      // Lazy initialize audio context on user interaction
      const AudioContextClass = window.AudioContext || (window as unknown as Record<string, typeof AudioContext>).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    // Resume context if suspended (common browser security state)
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("scrapbook-muted", String(this.isMuted));
    }
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Synthesizes a beautiful romantic wind chime bell sound.
   * Utilizes two frequency layers (fundamental and octave/fifth harmonies) 
   * with an exponential volume decay envelope.
   */
  public playChime() {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // We layer three sound components to create a rich, crystal-clear glass bell sound:
      // 1. A crystal chime (1200 Hz, sine wave, very high pitch, fast decay)
      // 2. A warm root bell (600 Hz, triangle wave, medium pitch, longer decay)
      // 3. A soft sub/fifth harmony (900 Hz, sine wave, soft)
      
      const frequencies = [1200, 600, 900];
      const types: OscillatorType[] = ["sine", "triangle", "sine"];
      const gains = [0.08, 0.05, 0.04];
      const decays = [0.4, 0.9, 0.6];

      frequencies.forEach((freq, i) => {
        if (!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = types[i];
        osc.frequency.setValueAtTime(freq, now);
        
        // Slightly detune to add natural chorus warmth
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

        // Amplitude Envelope: Instant attack, exponential decay
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(gains[i], now + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decays[i]);

        // Connect nodes
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        // Start and stop oscillator
        osc.start(now);
        osc.stop(now + decays[i]);
      });
    } catch (e) {
      console.warn("Audio chime playback failed or is blocked by browser policies:", e);
    }
  }

  /**
   * Synthesizes a tiny tick/pop sound for quick interactions (like numbers clicking, tabs shifting)
   */
  public playTick() {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1500, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.015, now + 0.002);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Fail silently
    }
  }
}

export const SoundEffects = new SoundEffectsManager();
