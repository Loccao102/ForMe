export class TinyAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = false;

  async start(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) return;
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.16;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.chime();
  }

  stop() {
    this.enabled = false;
    if (this.master) this.master.gain.value = 0;
  }

  private tone(freq: number, duration = 0.08, type: OscillatorType = "sine", volume = 0.2, delay = 0) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  click() {
    this.tone(520, 0.05, "square", 0.12);
  }

  pop() {
    this.tone(330, 0.06, "sine", 0.12);
    this.tone(620, 0.08, "sine", 0.09, 0.04);
  }

  chime() {
    this.tone(440, 0.12, "sine", 0.1);
    this.tone(660, 0.16, "sine", 0.08, 0.08);
  }

  wrong() {
    this.tone(180, 0.11, "sawtooth", 0.08);
    this.tone(120, 0.16, "sawtooth", 0.07, 0.08);
  }

  hit() {
    this.tone(860, 0.04, "square", 0.14);
    this.tone(260, 0.08, "triangle", 0.1, 0.02);
  }

  whoosh() {
    if (!this.enabled || !this.ctx || !this.master) return;
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    filter.type = "bandpass";
    filter.frequency.value = 900;
    gain.gain.value = 0.14;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start();
  }

  typingBurst() {
    if (!this.enabled) return;
    for (let i = 0; i < 9; i++) this.tone(280 + (i % 3) * 40, 0.025, "square", 0.035, i * 0.045);
  }

  sizzle() {
    if (!this.enabled || !this.ctx || !this.master) return;
    const duration = 0.6;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.exp(-i / (bufferSize * 0.45));
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    filter.type = "highpass";
    filter.frequency.value = 1700;
    gain.gain.value = 0.09;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start();
  }
}
