// ============================================================
// SYNAPSA — Audio Service
// Web Audio API synthesizer for ambient and interaction sounds
// ============================================================

class AudioServiceImpl {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  public isEnabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Soft hover pop
  public playHover() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Satisfying tap/click
  public playTap() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Beautiful reward chime (Kopou Phool)
  public playReward() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.ctx) return;
    
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (C Major arpeggio)
    
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = this.ctx!.currentTime + i * 0.1;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  }

  // Ambient drone for calm space
  public startAmbient() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ambientOsc) return;

    this.ambientOsc = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();
    
    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.value = 110; // Low A
    
    this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 2); // Slow fade in
    
    this.ambientOsc.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
    
    this.ambientOsc.start();
  }

  public stopAmbient() {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
      setTimeout(() => {
        if (this.ambientOsc) {
          this.ambientOsc.stop();
          this.ambientOsc.disconnect();
          this.ambientOsc = null;
        }
        if (this.ambientGain) {
          this.ambientGain.disconnect();
          this.ambientGain = null;
        }
      }, 2100);
    }
  }
}

export const AudioService = new AudioServiceImpl();
