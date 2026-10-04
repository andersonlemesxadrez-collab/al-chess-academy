class RealisticSoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Som seco e sólido (estilo Chess.com / Lichess)
  playMove() {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Batida principal (impacto da base)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(450, t);
    clickOsc.frequency.exponentialRampToValueAtTime(150, t + 0.02);
    clickGain.gain.setValueAtTime(0.6, t);
    clickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
    
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(t);
    clickOsc.stop(t + 0.04);

    // Corpo ressonante (eco da madeira do tabuleiro)
    const woodOsc = ctx.createOscillator();
    const woodGain = ctx.createGain();
    woodOsc.type = 'triangle';
    woodOsc.frequency.setValueAtTime(220, t);
    woodOsc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
    woodGain.gain.setValueAtTime(0.3, t);
    woodGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    woodOsc.connect(woodGain);
    woodGain.connect(ctx.destination);
    woodOsc.start(t);
    woodOsc.stop(t + 0.08);
  }

  // Captura mais agressiva (duas batidas rápidas)
  playCapture() {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Primeiro impacto forte (Peça atacante acertando a outra)
    const hitOsc = ctx.createOscillator();
    const hitGain = ctx.createGain();
    hitOsc.type = 'square';
    hitOsc.frequency.setValueAtTime(800, t);
    hitOsc.frequency.exponentialRampToValueAtTime(200, t + 0.03);
    hitGain.gain.setValueAtTime(0.4, t);
    hitGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
    hitOsc.connect(hitGain);
    hitGain.connect(ctx.destination);
    hitOsc.start(t);
    hitOsc.stop(t + 0.04);

    // Segundo impacto (peça capturada saindo e atacante caindo na casa)
    setTimeout(() => {
      this.playMove(); // Reutiliza o som de movimento para finalizar a captura
    }, 25);
  }

  playCheck() {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, t); 
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08); 

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.07);
      osc.stop(ctx.currentTime + idx * 0.07 + 0.28);
    });
  }

  playError() {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.16);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }
}

export const sounds = new RealisticSoundManager();