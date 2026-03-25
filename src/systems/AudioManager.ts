/**
 * AudioManager – Web Audio API synthesizer for SNES-style chiptune music.
 *
 * Lookahead scheduling (industry-standard pattern) ensures glitch-free playback.
 * All sound is generated procedurally – no audio files required.
 *
 * Usage:
 *   const audio = new AudioManager();
 *   audio.play('title');   // after first user gesture
 *   audio.crossfade('battle');
 *   audio.stop();
 *   audio.sfx('attack');
 */

type TrackName = 'title' | 'field' | 'town' | 'battle' | 'victory';
type OscType   = 'square' | 'sawtooth' | 'triangle' | 'sine';

// ── Note pitch table (Hz) ─────────────────────────────────────────────────────
const F: Record<string, number> = {
  '-':0,
  C2:65.41,  D2:73.42,  E2:82.41,  F2:87.31,  G2:98.00,  A2:110.00, B2:123.47,
  C3:130.81, Db3:138.59, D3:146.83, Eb3:155.56, E3:164.81, F3:174.61,
  Gb3:185.00, G3:196.00, Ab3:207.65, A3:220.00, Bb3:233.08, B3:246.94,
  C4:261.63, Db4:277.18, D4:293.66, Eb4:311.13, E4:329.63, F4:349.23,
  Gb4:369.99, G4:392.00, Ab4:415.30, A4:440.00, Bb4:466.16, B4:493.88,
  C5:523.25, Db5:554.37, D5:587.33, Eb5:622.25, E5:659.25, F5:698.46,
  Gb5:739.99, G5:783.99, Ab5:830.61, A5:880.00, Bb5:932.33, B5:987.77,
  C6:1046.50,D6:1174.66,E6:1318.51,
};

// Note duration: 1 = 16th note  2 = 8th  4 = quarter  8 = half  16 = whole
type NoteCell = [string, number];  // [noteName, len16]

// ── Music data ────────────────────────────────────────────────────────────────

// Title theme: key Am, 80 BPM, peaceful & nostalgic
const TITLE_BPM = 80;

const TITLE_MELODY: NoteCell[] = [
  // Bar 1-4
  ['A4',4],['C5',2],['E5',2],  ['G5',4],['E5',2],['D5',2],
  ['C5',4],['E5',4],           ['-',4],['A4',2],['C5',2],
  // Bar 5-8
  ['E5',4],['G5',2],['A5',2],  ['G5',4],['E5',2],['C5',2],
  ['D5',4],['E5',4],           ['-',4],['C5',2],['D5',2],
  // Bar 9-12
  ['E5',4],['D5',2],['C5',2],  ['B4',4],['A4',4],
  ['A4',2],['B4',2],['C5',2],['D5',2],  ['E5',8],
  // Bar 13-16
  ['D5',4],['C5',2],['A4',2],  ['B4',4],['G4',4],
  ['A4',4],['E5',4],           ['D5',4],['C5',2],['A4',2],
  // Bar 17-20
  ['A4',4],['G4',4],           ['F4',4],['A4',4],
  ['C5',4],['B4',4],           ['A4',8],
];

const TITLE_BASS: NoteCell[] = [
  // Bar 1-4
  ['A2',4],['-',4],            ['A2',4],['-',4],
  ['C3',4],['-',4],            ['A2',4],['-',4],
  // Bar 5-8
  ['A2',4],['-',4],            ['C3',4],['-',4],
  ['F2',4],['-',4],            ['G2',4],['-',4],
  // Bar 9-12
  ['A2',4],['-',4],            ['A2',4],['-',4],
  ['A2',4],['-',4],            ['A2',8],
  // Bar 13-16
  ['F2',4],['-',4],            ['G2',4],['-',4],
  ['C3',4],['-',4],            ['A2',4],['-',4],
  // Bar 17-20
  ['A2',4],['-',4],            ['F2',4],['-',4],
  ['E2',4],['-',4],            ['A2',8],
];

const TITLE_PAD: NoteCell[] = [
  // Bar 1-4 (Am chord tones, sustained)
  ['C4',8],['E4',8],
  ['C4',8],['E4',8],
  // Bar 5-8
  ['C4',8],['E4',8],
  ['F3',8],['G3',8],
  // Bar 9-12
  ['C4',8],['E4',8],
  ['C4',16],
  // Bar 13-16
  ['F3',8],['G3',8],
  ['A3',8],['C4',8],
  // Bar 17-20
  ['A3',8],['F3',8],
  ['E3',8],['A3',8],
];

// Field theme: key G major, 104 BPM, adventurous
const FIELD_BPM = 104;

const FIELD_MELODY: NoteCell[] = [
  ['G4',2],['A4',2],['B4',2],['D5',2],  ['E5',4],['D5',2],['B4',2],
  ['A4',2],['B4',2],['G4',4],           ['-',4],['-',4],
  ['D5',2],['E5',2],['G5',2],['A5',2],  ['G5',4],['E5',2],['D5',2],
  ['B4',2],['D5',2],['G4',4],           ['-',4],['-',4],
  ['G5',2],['A5',2],['G5',2],['E5',2],  ['D5',4],['B4',4],
  ['A4',2],['G4',2],['A4',2],['B4',2],  ['G4',8],
  ['D5',2],['E5',2],['D5',2],['B4',2],  ['A4',4],['G4',4],
  ['A4',4],['B4',4],                     ['G4',8],
];

const FIELD_BASS: NoteCell[] = [
  ['G2',4],['D3',4],                    ['G2',4],['D3',4],
  ['G2',4],['D3',4],                    ['G2',8],
  ['C3',4],['G3',4],                    ['C3',4],['G3',4],
  ['G2',4],['D3',4],                    ['G2',8],
  ['G2',4],['D3',4],                    ['G2',4],['D3',4],
  ['D3',4],['G2',4],                    ['G2',8],
  ['G2',4],['C3',4],                    ['D3',4],['G2',4],
  ['D3',4],['G2',4],                    ['G2',8],
];

// Town theme: key C major, 90 BPM, warm & peaceful
const TOWN_BPM = 90;

const TOWN_MELODY: NoteCell[] = [
  // Bar 1-4: gentle opening
  ['E5',4],['D5',2],['C5',2],  ['E5',4],['G5',4],
  ['A5',4],['G5',2],['E5',2],  ['D5',8],
  // Bar 5-8
  ['C5',4],['E5',4],           ['G5',4],['A5',4],
  ['G5',4],['E5',2],['D5',2],  ['C5',8],
  // Bar 9-12
  ['G4',2],['A4',2],['B4',2],['C5',2],  ['D5',4],['E5',4],
  ['F5',4],['E5',2],['D5',2],           ['C5',8],
  // Bar 13-16
  ['E5',4],['F5',2],['E5',2],  ['D5',4],['C5',4],
  ['A4',4],['B4',4],            ['C5',8],
];

const TOWN_BASS: NoteCell[] = [
  // Bar 1-4
  ['C3',4],['-',4],  ['C3',4],['-',4],
  ['A2',4],['-',4],  ['G2',4],['-',4],
  // Bar 5-8
  ['C3',4],['-',4],  ['F2',4],['-',4],
  ['G2',4],['-',4],  ['C3',4],['-',4],
  // Bar 9-12
  ['C3',4],['-',4],  ['G2',4],['-',4],
  ['F2',4],['-',4],  ['C3',4],['-',4],
  // Bar 13-16
  ['A2',4],['-',4],  ['F2',4],['-',4],
  ['G2',4],['-',4],  ['C3',4],['-',4],
];

const TOWN_CHIME: NoteCell[] = [
  // Light triangle chime for warmth
  ['G5',8], ['E5',8],
  ['A5',8], ['F5',8],
  ['G5',8], ['C6',8],
  ['E5',8], ['D5',8],
];

// Battle theme: key Dm, 152 BPM, intense
const BATTLE_BPM = 152;

const BATTLE_MELODY: NoteCell[] = [
  ['D5',1],['-',1],['D5',1],['-',1],['F5',1],['G5',2],['A5',1],
  ['Bb5',2],['A5',2],['G5',2],['F5',2],
  ['D5',1],['-',1],['C5',1],['-',1],['D5',1],['F5',2],['A5',1],
  ['G5',2],['F5',2],['Eb5',2],['D5',2],
  ['A5',2],['G5',2],['F5',2],['E5',2],
  ['F5',4],['D5',4],
  ['G5',2],['-',2],['A5',2],['-',2],
  ['Bb5',4],['A5',2],['G5',2],
  ['F5',2],['E5',2],['D5',4],
  ['-',2],['A4',2],['-',2],['A4',2],
  ['D5',2],['F5',2],['A5',4],
  ['G5',2],['F5',2],['E5',2],['D5',2],
];

const BATTLE_BASS: NoteCell[] = [
  ['D2',2],['-',2],['A2',2],['-',2],
  ['D2',2],['-',2],['F2',2],['-',2],
  ['D2',2],['-',2],['C2',2],['-',2],
  ['D2',2],['-',2],['G2',2],['-',2],
  ['A2',2],['-',2],['A2',2],['-',2],
  ['F2',2],['-',2],['C2',2],['-',2],
  ['G2',2],['-',2],['A2',2],['-',2],
  ['D2',4],['D2',4],
  ['D2',2],['-',2],['A2',2],['-',2],
  ['D2',2],['-',2],['F2',2],['-',2],
  ['D2',2],['-',2],['C2',2],['-',2],
  ['D2',4],['-',4],
];

const BATTLE_RHYTHM: NoteCell[] = [
  ['D4',1],['F4',1],['D4',1],['F4',1],['D4',1],['F4',1],['D4',1],['F4',1],
  ['D4',1],['F4',1],['D4',1],['F4',1],['D4',1],['F4',1],['D4',1],['F4',1],
  ['D4',1],['F4',1],['D4',1],['F4',1],['D4',1],['F4',1],['D4',1],['F4',1],
  ['D4',1],['F4',1],['D4',1],['F4',1],['D4',1],['F4',1],['D4',1],['F4',1],
  ['D4',1],['F4',1],['D4',1],['F4',1],['D4',1],['F4',1],['D4',1],['F4',1],
  ['D4',1],['F4',1],['D4',1],['F4',1],['D4',1],['F4',1],['D4',1],['F4',1],
];

// Victory fanfare: 4 bar jingle
const VICTORY_BPM = 120;

const VICTORY_MELODY: NoteCell[] = [
  ['C4',1],['E4',1],['G4',1],['C5',4],['-',1],
  ['G4',1],['-',1],['A4',1],['-',1],['B4',2],
  ['C5',2],['E5',2],['G5',2],['E5',2],
  ['C5',4],['-',4],['-',8],
];

const VICTORY_BASS: NoteCell[] = [
  ['C3',2],['-',2],['G3',2],['-',2],
  ['C3',2],['-',2],['G3',2],['-',2],
  ['C3',2],['-',2],['G3',2],['-',2],
  ['C3',4],['-',12],
];

// ── AudioManager class ────────────────────────────────────────────────────────

interface Channel {
  notes   : NoteCell[];
  bpm     : number;
  type    : OscType;
  volume  : number;
  detune  : number;   // cents
  cutoff  : number;   // Hz (low-pass)
  idx     : number;   // current note index
  nextTime: number;   // scheduled time of next note
}

export class AudioManager {

  private ctx     : AudioContext | null = null;
  private master  : GainNode     | null = null;
  private delay   : DelayNode    | null = null;
  private delayFb : GainNode     | null = null;
  private delayMix: GainNode     | null = null;

  private channels  : Channel[]          = [];
  private loopIds   : ReturnType<typeof setTimeout>[] = [];
  private activeOscs: OscillatorNode[]   = [];

  private currentTrack : TrackName | null = null;
  private muted = false;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /** Must be called after a user gesture (click / keydown). */
  init(): void {
    if (this.ctx) return;
    this.ctx = new AudioContext();

    // Master gain
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.22;

    // Compressor (prevents clipping)
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.ratio.value = 4;
    comp.attack.value = 0.005;
    comp.release.value = 0.1;

    // Echo / delay
    this.delay   = this.ctx.createDelay(0.5);
    this.delayFb = this.ctx.createGain();
    this.delayMix= this.ctx.createGain();
    this.delay.delayTime.value = 0.28;
    this.delayFb.gain.value    = 0.22;
    this.delayMix.gain.value   = 0.14;

    this.master.connect(this.delay);
    this.delay.connect(this.delayFb);
    this.delayFb.connect(this.delay);
    this.delay.connect(this.delayMix);
    this.delayMix.connect(comp);
    this.master.connect(comp);
    comp.connect(this.ctx.destination);
  }

  setMute(m: boolean): void {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.22;
  }

  isMuted(): boolean { return this.muted; }

  // ── Track control ─────────────────────────────────────────────────────────

  play(track: TrackName): void {
    if (!this.ctx || !this.master) return;
    if (this.currentTrack === track) return;
    this.stopAll();
    this.currentTrack = track;
    switch (track) {
      case 'title':   this.startTitle();   break;
      case 'field':   this.startField();   break;
      case 'town':    this.startTown();    break;
      case 'battle':  this.startBattle();  break;
      case 'victory': this.startVictory(); break;
    }
  }

  crossfade(track: TrackName, durationMs = 600): void {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const dur  = durationMs / 1000;
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + dur * 0.5);
    setTimeout(() => {
      this.play(track);
      if (!this.ctx || !this.master) return;
      const t = this.ctx.currentTime;
      this.master.gain.setValueAtTime(0, t);
      this.master.gain.linearRampToValueAtTime(0.22, t + dur * 0.5);
    }, durationMs * 0.5);
  }

  stop(): void {
    this.stopAll();
    this.currentTrack = null;
  }

  private stopAll(): void {
    this.loopIds.forEach(id => clearTimeout(id));
    this.loopIds = [];
    this.activeOscs.forEach(o => { try { o.stop(); } catch { /* already stopped */ } });
    this.activeOscs = [];
    this.channels = [];
  }

  // ── Track builders ────────────────────────────────────────────────────────

  private startTitle(): void {
    this.addChannel(TITLE_MELODY, TITLE_BPM, 'square',   0.28,  0,   3000);
    this.addChannel(TITLE_PAD,    TITLE_BPM, 'sawtooth', 0.10,  8,    800);
    this.addChannel(TITLE_BASS,   TITLE_BPM, 'triangle', 0.30, -5,  6000);
    this.startScheduler();
  }

  private startField(): void {
    this.addChannel(FIELD_MELODY, FIELD_BPM, 'square',   0.28,  0,   4000);
    this.addChannel(FIELD_BASS,   FIELD_BPM, 'triangle', 0.32, -3,   5000);
    this.startScheduler();
  }

  private startTown(): void {
    this.addChannel(TOWN_MELODY, TOWN_BPM, 'triangle', 0.26,  0,   5000);
    this.addChannel(TOWN_BASS,   TOWN_BPM, 'triangle', 0.28, -4,   4000);
    this.addChannel(TOWN_CHIME,  TOWN_BPM, 'sine',     0.12,  5,   8000);
    this.startScheduler();
  }

  private startBattle(): void {
    this.addChannel(BATTLE_MELODY, BATTLE_BPM, 'square',   0.30,  0,   5000);
    this.addChannel(BATTLE_BASS,   BATTLE_BPM, 'triangle', 0.35, -2,   4000);
    this.addChannel(BATTLE_RHYTHM, BATTLE_BPM, 'sawtooth', 0.08, -7,   1200);
    this.startScheduler();
  }

  private startVictory(): void {
    this.addChannel(VICTORY_MELODY, VICTORY_BPM, 'square',   0.35, 0,   5000);
    this.addChannel(VICTORY_BASS,   VICTORY_BPM, 'triangle', 0.30, 0,   4000);
    this.startScheduler();
  }

  private addChannel(
    notes : NoteCell[],
    bpm   : number,
    type  : OscType,
    vol   : number,
    detune: number,
    cutoff: number,
  ): void {
    if (!this.ctx) return;
    this.channels.push({
      notes, bpm, type, volume: vol, detune, cutoff,
      idx: 0, nextTime: this.ctx.currentTime + 0.05,
    });
  }

  // ── Lookahead scheduler ───────────────────────────────────────────────────

  private readonly LOOKAHEAD   = 0.25;  // seconds ahead to schedule
  private readonly INTERVAL_MS = 50;    // scheduling interval

  private startScheduler(): void {
    const tick = () => {
      if (!this.ctx || this.channels.length === 0) return;
      const now = this.ctx.currentTime;
      for (const ch of this.channels) {
        while (ch.nextTime < now + this.LOOKAHEAD) {
          const [noteName, len16] = ch.notes[ch.idx];
          const beatSec = 60 / (ch.bpm * 4); // 16th note duration
          const dur     = len16 * beatSec;
          if (noteName !== '-') {
            this.scheduleNote(noteName, ch.nextTime, dur, ch);
          }
          ch.nextTime += dur;
          ch.idx = (ch.idx + 1) % ch.notes.length;
        }
      }
      const id = setTimeout(tick, this.INTERVAL_MS);
      this.loopIds.push(id);
    };
    tick();
  }

  private scheduleNote(
    noteName : string,
    startTime: number,
    duration : number,
    ch       : Channel,
  ): void {
    if (!this.ctx || !this.master) return;
    const freq = F[noteName];
    if (!freq || freq === 0) return;

    const osc    = this.ctx.createOscillator();
    const gain   = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type      = ch.type;
    osc.frequency.value = freq;
    osc.detune.value    = ch.detune;

    filter.type            = 'lowpass';
    filter.frequency.value = ch.cutoff;
    filter.Q.value         = 0.5;

    // Envelope: attack + release
    const attack  = Math.min(0.015, duration * 0.1);
    const release = Math.min(0.08,  duration * 0.3);
    const sustain = Math.max(0, duration - attack - release);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(ch.volume, startTime + attack);
    gain.gain.setValueAtTime(ch.volume, startTime + attack + sustain);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master!);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);

    this.activeOscs.push(osc);
    osc.onended = () => {
      const i = this.activeOscs.indexOf(osc);
      if (i !== -1) this.activeOscs.splice(i, 1);
    };
  }

  // ── Sound Effects ─────────────────────────────────────────────────────────

  sfx(name: 'attack' | 'magic' | 'heal' | 'select' | 'cancel' | 'victory' | 'hit' | 'level_up'): void {
    if (!this.ctx || !this.master) return;
    switch (name) {
      case 'select':   this.tone('square',   440, 0.06, 0.05, 0.08); break;
      case 'cancel':   this.tone('square',   280, 0.06, 0.02, 0.12); break;
      case 'attack':   this.noise(0.15, 0.08); this.tone('sawtooth', 220, 0.15, 0.01, 0.15); break;
      case 'hit':      this.noise(0.25, 0.06); break;
      case 'magic':    this.sweep('sine', 440, 880, 0.3, 0.5); break;
      case 'heal':     this.sweep('triangle', 523, 1046, 0.2, 0.4); break;
      case 'victory':  this.fanfare(); break;
      case 'level_up': this.sweep('square', 330, 660, 0.3, 0.5); this.tone('sine', 880, 0.3, 0.05, 0.4); break;
    }
  }

  private tone(type: OscType, freq: number, vol: number, attack: number, release: number): void {
    if (!this.ctx || !this.master) return;
    const ctx  = this.ctx;
    const now  = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + attack);
    gain.gain.linearRampToValueAtTime(0,   now + attack + release);
    osc.connect(gain);
    gain.connect(this.master!);
    osc.start(now);
    osc.stop(now + attack + release + 0.01);
  }

  private sweep(type: OscType, f0: number, f1: number, vol: number, dur: number): void {
    if (!this.ctx || !this.master) return;
    const ctx  = this.ctx;
    const now  = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, now);
    osc.frequency.linearRampToValueAtTime(f1, now + dur);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.linearRampToValueAtTime(0, now + dur);
    osc.connect(gain);
    gain.connect(this.master!);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  }

  private noise(vol: number, dur: number): void {
    if (!this.ctx || !this.master) return;
    const ctx    = this.ctx;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data   = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src  = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 1000;
    filt.Q.value = 0.5;
    src.buffer = buffer;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
    src.connect(filt);
    filt.connect(gain);
    gain.connect(this.master!);
    src.start();
  }

  private fanfare(): void {
    const notes: Array<[number, number, number]> = [
      [523.25, 0.0,  0.15],
      [659.25, 0.15, 0.15],
      [783.99, 0.30, 0.15],
      [1046.5, 0.45, 0.4 ],
    ];
    notes.forEach(([freq, when, dur]) => {
      setTimeout(() => this.tone('square', freq, 0.25, 0.01, dur), when * 1000);
    });
  }
}
