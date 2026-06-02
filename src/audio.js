// 절차적 오디오 엔진 — Web Audio로 효과음/칩튠 BGM을 코드 합성(사운드 파일 불필요).
// 모든 호출은 try/guard로 보호 → 오디오 실패가 게임을 멈추지 않는다.

const NF = { // 음이름→주파수
  rest: 0,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
};

// 트랙: tempo(BPM 기준), notes[{f:멜로디, b:베이스, d:길이(박)}]
const TRACKS = {
  title: {
    tempo: 104, type: 'square', gain: 0.16, bassGain: 0.10,
    notes: [
      { f: NF.G4, b: NF.C3, d: 1 }, { f: NF.C5, b: 0, d: 1 }, { f: NF.E5, b: NF.G3, d: 1 }, { f: NF.G5, b: 0, d: 1 },
      { f: NF.F5, b: NF.A3, d: 1 }, { f: NF.E5, b: 0, d: 1 }, { f: NF.D5, b: NF.G3, d: 1 }, { f: NF.G5, b: 0, d: 1 },
      { f: NF.E5, b: NF.F3, d: 1 }, { f: NF.C5, b: 0, d: 1 }, { f: NF.G4, b: NF.G3, d: 1 }, { f: NF.B4, b: 0, d: 1 },
      { f: NF.C5, b: NF.C3, d: 2 }, { f: NF.rest, b: 0, d: 1 }, { f: NF.G4, b: NF.G3, d: 1 },
    ],
  },
  field: {
    tempo: 144, type: 'square', gain: 0.15, bassGain: 0.11,
    notes: [
      { f: NF.C5, b: NF.C3, d: .5 }, { f: NF.E5, b: 0, d: .5 }, { f: NF.G5, b: NF.G3, d: .5 }, { f: NF.E5, b: 0, d: .5 },
      { f: NF.A5, b: NF.F3, d: .5 }, { f: NF.G5, b: 0, d: .5 }, { f: NF.E5, b: NF.C3, d: .5 }, { f: NF.C5, b: 0, d: .5 },
      { f: NF.D5, b: NF.G3, d: .5 }, { f: NF.F5, b: 0, d: .5 }, { f: NF.A5, b: NF.G3, d: .5 }, { f: NF.F5, b: 0, d: .5 },
      { f: NF.G5, b: NF.C3, d: 1 }, { f: NF.E5, b: NF.C3, d: .5 }, { f: NF.C5, b: 0, d: .5 },
      { f: NF.E5, b: NF.A3, d: .5 }, { f: NF.D5, b: 0, d: .5 }, { f: NF.C5, b: NF.G3, d: .5 }, { f: NF.D5, b: 0, d: .5 },
      { f: NF.E5, b: NF.F3, d: .5 }, { f: NF.G5, b: 0, d: .5 }, { f: NF.C5, b: NF.G3, d: 1 },
    ],
  },
  boss: {
    tempo: 132, type: 'sawtooth', gain: 0.13, bassGain: 0.13,
    notes: [
      { f: NF.A4, b: NF.A3, d: .5 }, { f: NF.A4, b: 0, d: .5 }, { f: NF.C5, b: NF.A3, d: .5 }, { f: NF.A4, b: 0, d: .5 },
      { f: NF.E5, b: NF.E3, d: .5 }, { f: NF.D5, b: 0, d: .5 }, { f: NF.C5, b: NF.F3, d: .5 }, { f: NF.B4, b: 0, d: .5 },
      { f: NF.A4, b: NF.A3, d: .5 }, { f: NF.G4, b: 0, d: .5 }, { f: NF.A4, b: NF.G3, d: .5 }, { f: NF.B4, b: 0, d: .5 },
      { f: NF.C5, b: NF.F3, d: 1 }, { f: NF.E3, b: NF.E3, d: 1 },
    ],
  },
};

class AudioEngine {
  constructor() {
    this.ctx = null; this.master = null; this.enabled = true;
    this.curTrack = null; this._track = null; this._idx = 0; this._next = 0; this._timer = null;
  }

  _ensure() {
    if (this.ctx) return true;
    if (!this.enabled) return false;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { this.enabled = false; return false; }
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.28;
      this.master.connect(this.ctx.destination);
    } catch { this.enabled = false; return false; }
    return true;
  }

  // 사용자 제스처(첫 키 입력) 후 호출 — 브라우저 자동재생 정책 해제
  resume() {
    if (this._ensure() && this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch {} }
  }

  _tone(freq, start, dur, type = 'square', gain = 0.3, slideTo = null) {
    if (!freq) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(this.master);
    o.start(start); o.stop(start + dur + 0.02);
  }

  _noise(start, dur, gain = 0.3) {
    const n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const g = this.ctx.createGain(); g.gain.value = gain;
    src.connect(g); g.connect(this.master); src.start(start);
  }

  sfx(name) {
    if (!this.enabled || !this._ensure()) return;
    const t = this.ctx.currentTime;
    try {
      switch (name) {
        case 'confirm': this._tone(660, t, .07, 'square', .3); this._tone(990, t + .07, .09, 'square', .3); break;
        case 'jump':    this._tone(300, t, .18, 'square', .28, 760); break;
        case 'swing':   this._tone(820, t, .09, 'square', .22, 240); this._noise(t, .05, .12); break;
        case 'hit':     this._tone(180, t, .09, 'square', .3, 90); this._noise(t, .06, .18); break;
        case 'coin':    this._tone(NF.B5, t, .06, 'square', .25); this._tone(NF.E5, t + .06, .12, 'square', .25); break;
        case 'enemydown': this._tone(440, t, .08, 'square', .25, 110); this._noise(t, .12, .15); break;
        case 'hurt':    this._tone(400, t, .25, 'sawtooth', .3, 80); break;
        case 'bossdown': [880, 660, 523, 392, 262].forEach((f, i) => this._tone(f, t + i * .1, .14, 'square', .28)); this._noise(t + .5, .3, .2); break;
        case 'clear':   [523, 659, 784, 1047].forEach((f, i) => this._tone(f, t + i * .09, .2, 'square', .28)); break;
        case 'roomlock': this._tone(120, t, .3, 'sawtooth', .3, 60); this._noise(t, .2, .15); break;
        case 'magic_fly':     this._tone(700, t, .18, 'sawtooth', .26, 1200); this._noise(t, .08, .1); break;
        case 'magic_roll':    this._tone(160, t, .2, 'square', .24, 80); break;
        case 'magic_tornado': this._tone(420, t, .32, 'sawtooth', .2, 900); this._noise(t, .3, .08); break;
        case 'magic_thunder': this._noise(t, .4, .3); [1200, 800, 400].forEach((f, i) => this._tone(f, t + i * .05, .22, 'square', .28)); break;
        case 'magic_empty':   this._tone(200, t, .08, 'square', .14, 150); break;
      }
    } catch {}
  }

  playMusic(track) {
    if (this.curTrack === track) return;
    this.curTrack = track;
    this._track = TRACKS[track] || null;
    this._idx = 0;
    if (!this._track) return;
    if (!this.enabled || !this._ensure()) return;
    if (this._timer) clearInterval(this._timer);
    this._next = this.ctx.currentTime + 0.06;
    this._timer = setInterval(() => this._schedule(), 25);
  }

  stopMusic() {
    this.curTrack = null; this._track = null;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }

  _schedule() {
    if (!this._track || !this.ctx) return;
    if (this.ctx.state !== 'running') return;                  // 제스처 전엔 대기
    if (this._next < this.ctx.currentTime) this._next = this.ctx.currentTime + 0.05; // 따라잡기
    const tr = this._track, beat = 60 / tr.tempo;
    while (this._next < this.ctx.currentTime + 0.2) {
      const note = tr.notes[this._idx];
      const dur = note.d * beat;
      if (note.f) this._tone(note.f, this._next, dur * 0.92, tr.type, tr.gain);
      if (note.b) this._tone(note.b, this._next, dur * 0.92, 'triangle', tr.bassGain);
      this._next += dur;
      this._idx = (this._idx + 1) % tr.notes.length;
    }
  }
}

export const audio = new AudioEngine();
