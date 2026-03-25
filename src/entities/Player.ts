import Phaser from 'phaser';
import { StateMachine }              from '../systems/StateMachine';
import { InputManager, FrameInput }  from '../systems/InputManager';
import { PHYSICS }                   from '../data/constants';
import { BattleUnit }                from '../systems/ATBSystem';
import { HERO_TECHS, MAGE_TECHS }    from '../data/techs';

export type Facing      = 'down' | 'up' | 'left' | 'right';
export type PlayerState = 'idle' | 'walk' | 'run' | 'talk';

// Sprite frame layout (16×24 × 16 frames)
// [0]=down-idle, [1-3]=down-walk, [4]=up-idle, [5-7]=up-walk,
// [8]=side-idle, [9-11]=side-walk, [12]=talk, [13-14]=victory, [15]=battle
const FRAMES = {
  down : { idle: 0, walkA: 1, walkB: 2, walkC: 3 },
  up   : { idle: 4, walkA: 5, walkB: 6, walkC: 7 },
  side : { idle: 8, walkA: 9, walkB: 10, walkC: 11 },
  talk : 12,
  winA : 13, winB: 14,
  battle: 15,
} as const;

// ── EXP table ─────────────────────────────────────────────────────────────────
const EXP_TO_LEVEL: number[] = [0, 10, 30, 60, 100, 150, 210, 280, 360, 450, 550];

export function expForLevel(lv: number): number {
  return EXP_TO_LEVEL[Math.min(lv, EXP_TO_LEVEL.length - 1)] ?? 9999;
}

// ── Combatant base ─────────────────────────────────────────────────────────────
export abstract class Combatant extends Phaser.Physics.Arcade.Sprite {
  readonly battleUnit: BattleUnit;
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, unit: BattleUnit) {
    super(scene, x, y, texture, 0);
    this.battleUnit = unit;
    scene.add.existing(this as unknown as Phaser.GameObjects.GameObject);
    scene.physics.add.existing(this as unknown as Phaser.GameObjects.GameObject);
  }
}

// ── Player ─────────────────────────────────────────────────────────────────────
export class Player extends Combatant {
  private readonly sm           : StateMachine = new StateMachine();
  private readonly inputManager : InputManager;
  private _facing               : Facing = 'down';
  private vx = 0;
  private vy = 0;

  // EXP / Level
  exp   = 0;
  level = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const unit: BattleUnit = {
      id: 'hero', name: 'Crono',
      sprite: null!,
      hp: 140, maxHp: 140,
      mp: 70,  maxMp: 70,
      atk: 24, def: 12, spd: 15,
      atb: 0, isPlayerUnit: true, partyIndex: 0,
      techs: HERO_TECHS, waitingForInput: false,
    };
    super(scene, x, y, 'player', unit);
    unit.sprite = this;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 10);
    body.setOffset(2, 14);
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(PHYSICS.MAX_RUN_SPEED * 1.1, PHYSICS.MAX_RUN_SPEED * 1.1);

    this.setOrigin(0.5, 1).setDepth(10);
    this.inputManager = new InputManager(scene);
    this.buildAnims(scene);
    this.initStates();
    this.sm.set('idle');
  }

  private buildAnims(scene: Phaser.Scene): void {
    const A = scene.anims;
    if (A.exists('p_idle_down')) return;

    const mk = (key: string, frames: number[], fr: number) =>
      A.create({ key, frames: frames.map(f => ({ key: 'player', frame: f })), frameRate: fr, repeat: -1 });

    mk('p_idle_down',  [FRAMES.down.idle], 1);
    mk('p_idle_up',    [FRAMES.up.idle],   1);
    mk('p_idle_side',  [FRAMES.side.idle], 1);
    mk('p_walk_down',  [FRAMES.down.walkA, FRAMES.down.walkB, FRAMES.down.walkC], 9);
    mk('p_walk_up',    [FRAMES.up.walkA,   FRAMES.up.walkB,   FRAMES.up.walkC],   9);
    mk('p_walk_side',  [FRAMES.side.walkA, FRAMES.side.walkB, FRAMES.side.walkC], 9);
    mk('p_run_down',   [FRAMES.down.walkA, FRAMES.down.walkB, FRAMES.down.walkC], 16);
    mk('p_run_up',     [FRAMES.up.walkA,   FRAMES.up.walkB,   FRAMES.up.walkC],   16);
    mk('p_run_side',   [FRAMES.side.walkA, FRAMES.side.walkB, FRAMES.side.walkC], 16);
    mk('p_talk',       [FRAMES.talk], 1);
    mk('p_win',        [FRAMES.winA, FRAMES.winB], 6);
    mk('p_battle',     [FRAMES.battle], 1);
  }

  private idleAnim()    : string { return `p_idle_${this.dirKey()}`; }
  private walkAnim(run: boolean): string { return `p_${run ? 'run' : 'walk'}_${this.dirKey()}`; }
  private dirKey()      : string {
    return this._facing === 'left' || this._facing === 'right' ? 'side' : this._facing;
  }

  private initStates(): void {
    this.sm
      .add('idle', {
        onEnter  : () => { this.play(this.idleAnim(), true); },
        onUpdate : (dt) => {
          this.applyFriction(dt);
          const inp = this.inputManager.poll();
          if (inp.moving) this.sm.set(inp.run ? 'run' : 'walk');
        },
      })
      .add('walk', {
        onEnter  : () => { this.play(this.walkAnim(false), true); },
        onUpdate : (dt) => {
          const inp = this.inputManager.poll();
          if (!inp.moving) { this.sm.set('idle'); return; }
          if (inp.run)     { this.sm.set('run');  return; }
          this.applyMove(inp, PHYSICS.MAX_WALK_SPEED, dt);
        },
      })
      .add('run', {
        onEnter  : () => { this.play(this.walkAnim(true), true); },
        onUpdate : (dt) => {
          const inp = this.inputManager.poll();
          if (!inp.moving) { this.sm.set('idle'); return; }
          if (!inp.run)    { this.sm.set('walk'); return; }
          this.applyMove(inp, PHYSICS.MAX_RUN_SPEED, dt);
        },
      })
      .add('talk', {
        onEnter  : () => {
          this.play('p_talk', true);
          this.vx = 0; this.vy = 0;
          (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        },
        onUpdate : (_dt) => {},
      });
  }

  private applyMove(inp: FrameInput, maxSpd: number, dt: number): void {
    const sec = dt / 1000;
    if (Math.abs(inp.dx) >= Math.abs(inp.dy) && inp.dx !== 0) {
      const newFacing: Facing = inp.dx > 0 ? 'right' : 'left';
      if (newFacing !== this._facing) {
        this._facing = newFacing;
        this.play(this.walkAnim(inp.run), true);
      }
      this.setFlipX(inp.dx < 0);
    } else if (inp.dy !== 0) {
      const newFacing: Facing = inp.dy > 0 ? 'down' : 'up';
      if (newFacing !== this._facing) {
        this._facing = newFacing;
        this.setFlipX(false);
        this.play(this.walkAnim(inp.run), true);
      }
    }
    this.vx = moveToward(this.vx, inp.dx * maxSpd, PHYSICS.ACCELERATION * sec);
    this.vy = moveToward(this.vy, inp.dy * maxSpd, PHYSICS.ACCELERATION * sec);
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(this.vx, this.vy);
  }

  private applyFriction(dt: number): void {
    const sec = dt / 1000;
    this.vx = moveToward(this.vx, 0, PHYSICS.FRICTION * sec);
    this.vy = moveToward(this.vy, 0, PHYSICS.FRICTION * sec);
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(this.vx, this.vy);
  }

  /** Gain EXP. Returns true if leveled up. */
  gainExp(amount: number): boolean {
    this.exp += amount;
    const nextLv = expForLevel(this.level + 1);
    if (this.exp >= nextLv && this.level < 10) {
      this.level++;
      // Stat gains on level up
      this.battleUnit.maxHp  += 12;
      this.battleUnit.hp      = this.battleUnit.maxHp;
      this.battleUnit.maxMp  += 5;
      this.battleUnit.mp      = this.battleUnit.maxMp;
      this.battleUnit.atk    += 3;
      this.battleUnit.def    += 2;
      return true;
    }
    return false;
  }

  setPlayerState(s: PlayerState): void { this.sm.set(s); }
  get playerState() : string | null { return this.sm.current; }
  get facing()      : Facing        { return this._facing;    }

  override update(delta: number): void { this.sm.update(delta); }
}

// ── Ally ────────────────────────────────────────────────────────────────────────
export class Ally extends Combatant {
  private followTarget : Phaser.GameObjects.Sprite | null = null;
  private vx = 0;
  private vy = 0;
  private _facing: Facing = 'down';

  exp   = 0;
  level = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const unit: BattleUnit = {
      id: 'mage', name: 'Marle',
      sprite: null!,
      hp: 105,  maxHp: 105,
      mp: 100,  maxMp: 100,
      atk: 18, def: 9, spd: 13,
      atb: 0, isPlayerUnit: true, partyIndex: 1,
      techs: MAGE_TECHS, waitingForInput: false,
    };
    super(scene, x, y, 'ally', unit);
    unit.sprite = this;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 10);
    body.setOffset(2, 14);
    body.setCollideWorldBounds(true);
    this.setOrigin(0.5, 1).setDepth(9);
    this.buildAnims(scene);
    this.play('a_idle_down', true);
  }

  private buildAnims(scene: Phaser.Scene): void {
    const A = scene.anims;
    if (A.exists('a_idle_down')) return;
    const mk = (key: string, frames: number[], fr: number) =>
      A.create({ key, frames: frames.map(f => ({ key: 'ally', frame: f })), frameRate: fr, repeat: -1 });
    mk('a_idle_down', [0], 1);
    mk('a_idle_up',   [4], 1);
    mk('a_idle_side', [8], 1);
    mk('a_walk_down', [1, 2, 3], 9);
    mk('a_walk_up',   [5, 6, 7], 9);
    mk('a_walk_side', [9, 10, 11], 9);
    mk('a_win',       [13, 14], 6);
    mk('a_talk',      [12], 1);
    mk('a_battle',    [15], 1);
  }

  gainExp(amount: number): boolean {
    this.exp += amount;
    const nextLv = expForLevel(this.level + 1);
    if (this.exp >= nextLv && this.level < 10) {
      this.level++;
      this.battleUnit.maxHp  += 10;
      this.battleUnit.hp      = this.battleUnit.maxHp;
      this.battleUnit.maxMp  += 8;
      this.battleUnit.mp      = this.battleUnit.maxMp;
      this.battleUnit.atk    += 2;
      this.battleUnit.def    += 1;
      return true;
    }
    return false;
  }

  follow(target: Phaser.GameObjects.Sprite): void { this.followTarget = target; }

  update(delta: number, inBattle: boolean): void {
    if (inBattle || !this.followTarget) return;

    const OFFSET_X = -20;
    const dx   = (this.followTarget.x + OFFSET_X) - this.x;
    const dy   = this.followTarget.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const FOLLOW_SPEED = 98;
    const DEADZONE     = 6;

    if (dist > DEADZONE) {
      const nx = dx / dist;
      const ny = dy / dist;
      this.vx = moveToward(this.vx, nx * FOLLOW_SPEED, 480 * delta / 1000);
      this.vy = moveToward(this.vy, ny * FOLLOW_SPEED, 480 * delta / 1000);
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(this.vx, this.vy);

      let newFacing: Facing = this._facing;
      if (Math.abs(dx) >= Math.abs(dy)) {
        newFacing = dx > 0 ? 'right' : 'left';
      } else {
        newFacing = dy > 0 ? 'down' : 'up';
      }
      if (newFacing !== this._facing) this._facing = newFacing;
      const dirKey = (this._facing === 'left' || this._facing === 'right') ? 'side' : this._facing;
      this.setFlipX(this._facing === 'left');
      this.play(`a_walk_${dirKey}`, true);
    } else {
      this.vx = moveToward(this.vx, 0, 600 * delta / 1000);
      this.vy = moveToward(this.vy, 0, 600 * delta / 1000);
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(this.vx, this.vy);
      const dirKey = (this._facing === 'left' || this._facing === 'right') ? 'side' : this._facing;
      this.play(`a_idle_${dirKey}`, true);
    }
  }
}

function moveToward(current: number, target: number, step: number): number {
  const diff = target - current;
  return Math.abs(diff) <= step ? target : current + Math.sign(diff) * step;
}
