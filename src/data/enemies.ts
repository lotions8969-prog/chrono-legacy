// ── Enemy definitions ────────────────────────────────────────────────────────
export interface EnemyDef {
  key      : string;
  name     : string;
  hp       : number;
  mp       : number;
  atk      : number;
  def      : number;
  spd      : number;
  exp      : number;
  gold     : number;
  frameBase: number;   // first frame index in 'enemy' spritesheet
}

export const ENEMY_DEFS: Record<string, EnemyDef> = {
  SLIME: {
    key: 'SLIME', name: 'Slime',
    hp: 45, mp: 0, atk: 10, def: 4, spd: 11,
    exp: 6, gold: 4, frameBase: 0,
  },
  BAT: {
    key: 'BAT', name: 'Cave Bat',
    hp: 32, mp: 0, atk: 15, def: 2, spd: 24,
    exp: 9, gold: 6, frameBase: 2,
  },
  GOLEM: {
    key: 'GOLEM', name: 'Stone Golem',
    hp: 110, mp: 20, atk: 24, def: 15, spd: 8,
    exp: 32, gold: 20, frameBase: 4,
  },
  CRYSTAL_WRAITH: {
    key: 'CRYSTAL_WRAITH', name: 'Crystal Wraith',
    hp: 180, mp: 60, atk: 30, def: 10, spd: 18,
    exp: 80, gold: 50, frameBase: 6,
  },
};
