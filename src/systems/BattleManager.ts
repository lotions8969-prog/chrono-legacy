import Phaser from 'phaser';
import { BattleUnit, ATBSystem } from './ATBSystem';
import { BattleUI, MenuChoice } from '../ui/BattleUI';
import { ParticleManager } from './ParticleManager';
import { TECHS } from '../data/techs';
import { CANVAS } from '../data/constants';

type EffectKey = 'slash' | 'fire' | 'ice' | 'lightning' | 'heal' | 'firesword' | 'icetackle' | 'crystal' | 'default';

const W = CANVAS.WIDTH;
const H = CANVAS.HEIGHT;

export type BattlePhase = 'idle' | 'engaging' | 'active' | 'animating' | 'victory' | 'defeat' | 'ending';

// ── BattleManager ─────────────────────────────────────────────────────────────
export class BattleManager {
  private readonly scene    : Phaser.Scene;
  private readonly atb      : ATBSystem    = new ATBSystem();
  private readonly vfx      : ParticleManager;
  private readonly ui       : BattleUI;

  private _phase    : BattlePhase = 'idle';
  private menuOpen  : boolean = false;
  private playerUnits : BattleUnit[] = [];
  private enemyUnits  : BattleUnit[] = [];
  private commandQueue: BattleUnit[] = [];

  private onBattleStart : (() => void) | null = null;
  private onBattleEnd   : ((expGain: number, goldGain: number) => void) | null = null;

  private engagedEnemyObjs: Phaser.Physics.Arcade.Sprite[] = [];

  // Battle background overlay
  private battleBg   : Phaser.GameObjects.Image | null = null;
  private battleOverlay : Phaser.GameObjects.Rectangle | null = null;
  private bgKey      = 'battle_bg_field';

  // Stored original positions (to restore after battle)
  private origPositions: Map<Phaser.GameObjects.Sprite, { x: number; y: number }> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.vfx   = new ParticleManager(scene);
    this.ui    = new BattleUI(scene);
  }

  setCallbacks(
    onStart : () => void,
    onEnd   : (expGain: number, goldGain: number) => void,
  ): void {
    this.onBattleStart = onStart;
    this.onBattleEnd   = onEnd;
  }

  setBattleBackground(key: string): void { this.bgKey = key; }

  showLevelUp(unitName: string, level: number): void { this.ui.showLevelUp(unitName, level); }

  get isActive(): boolean { return this._phase !== 'idle'; }
  get phase()   : BattlePhase { return this._phase; }

  // ── Start ────────────────────────────────────────────────────────────────────
  startBattle(
    playerSprites : Array<{ sprite: Phaser.Physics.Arcade.Sprite; unit: BattleUnit }>,
    enemyEntries  : Array<{ sprite: Phaser.Physics.Arcade.Sprite; unit: BattleUnit }>,
  ): void {
    if (this._phase !== 'idle') return;
    this._phase = 'engaging';
    this.onBattleStart?.();

    this.playerUnits        = playerSprites.map(e => e.unit);
    this.enemyUnits         = enemyEntries.map(e => e.unit);
    this.engagedEnemyObjs   = enemyEntries.map(e => e.sprite);

    // Store original positions
    this.origPositions.clear();
    [...playerSprites, ...enemyEntries].forEach(({ sprite }) => {
      this.origPositions.set(sprite, { x: sprite.x, y: sprite.y });
    });

    [...this.playerUnits, ...this.enemyUnits].forEach(u => { u.atb = 0; u.waitingForInput = false; });

    const cam = this.scene.cameras.main;
    cam.stopFollow();

    // Screen flash on battle start
    const flash = this.scene.add.rectangle(0, 0, W, H, 0xFFFFFF, 1)
      .setScrollFactor(0).setDepth(200).setOrigin(0, 0);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });

    // Show battle background
    this.scene.time.delayedCall(80, () => {
      this.battleBg = this.scene.add.image(
        cam.scrollX + W / 2,
        cam.scrollY + H / 2,
        this.bgKey,
      ).setScrollFactor(0).setDepth(2).setAlpha(0);

      this.scene.tweens.add({
        targets: this.battleBg,
        alpha: 1,
        duration: 300,
        ease: 'Quad.easeOut',
      });

      // Semi-transparent dark border vignette
      this.battleOverlay = this.scene.add.rectangle(0, 0, W, H, 0x000000, 0.15)
        .setScrollFactor(0).setDepth(3).setOrigin(0, 0);
    });

    // Zoom camera slightly for drama
    this.scene.tweens.add({
      targets: cam,
      zoom: 1.05,
      duration: 400,
      ease: 'Sine.easeOut',
    });

    const cx = cam.scrollX;
    const cy = cam.scrollY;

    // Battle positions: party on left-center, enemies on right
    const partySlots = [
      [cx + 48,      cy + H * 0.62],
      [cx + 32,      cy + H * 0.74],
    ];
    const enemySlots = [
      [cx + W * 0.68, cy + H * 0.38],
      [cx + W * 0.78, cy + H * 0.52],
      [cx + W * 0.62, cy + H * 0.60],
    ];

    const allSprites = [...playerSprites.map(e => e.sprite), ...enemyEntries.map(e => e.sprite)];
    let ready = 0;

    playerSprites.forEach((entry, i) => {
      const [tx, ty] = partySlots[i] ?? partySlots[0];
      this.scene.tweens.add({
        targets : entry.sprite,
        x: tx, y: ty,
        duration: 480,
        ease    : 'Quad.easeInOut',
        onComplete: () => { ready++; if (ready === allSprites.length) this.onEngageComplete(); },
      });
    });

    enemyEntries.forEach((entry, i) => {
      const [tx, ty] = enemySlots[i] ?? enemySlots[0];
      this.scene.tweens.add({
        targets : entry.sprite,
        x: tx, y: ty,
        duration: 480,
        ease    : 'Quad.easeInOut',
        onComplete: () => { ready++; if (ready === allSprites.length) this.onEngageComplete(); },
      });
    });
  }

  private onEngageComplete(): void {
    this._phase = 'active';
    this.ui.showBanner('Battle Start!', '#FFE060');
    this.scene.time.delayedCall(200, () => this.updateStatusUI());
  }

  // ── Update ────────────────────────────────────────────────────────────────────
  update(dt: number): void {
    if (this._phase !== 'active') return;
    if (this.menuOpen) { this.updateStatusUI(); return; }

    const justReady = this.atb.tick([...this.playerUnits, ...this.enemyUnits], dt);

    justReady.forEach(unit => {
      if (unit.isPlayerUnit) {
        unit.waitingForInput = true;
        this.commandQueue.push(unit);
        this.tryShowCommand();
      } else {
        this.enemyAI(unit);
      }
    });

    this.updateStatusUI();
  }

  // ── Enemy AI (type-aware) ─────────────────────────────────────────────────────
  private enemyAI(unit: BattleUnit): void {
    if (this._phase !== 'active') return;
    this._phase = 'animating';

    const target = this.playerUnits.find(u => u.hp > 0);
    if (!target) { this.checkDefeat(); return; }

    // Type-specific behaviors
    const name = unit.name.toLowerCase();
    let dmg = 0;
    let effectKey: EffectKey = 'slash';

    if (name.includes('bat')) {
      // Bat: fast double-hit
      dmg = this.calcDamage(unit, target, 'physical', 0.7);
      target.hp = Math.max(0, target.hp - dmg);
      this.vfx.showDamageNumber(target.sprite.x, target.sprite.y - 12, dmg, 'physical');
      this.flashSprite(target.sprite, 0xFF6644);
      effectKey = 'slash';
      // Second hit
      this.scene.time.delayedCall(200, () => {
        if (this._phase !== 'animating') return;
        const dmg2 = this.calcDamage(unit, target, 'physical', 0.7);
        target.hp = Math.max(0, target.hp - dmg2);
        this.vfx.showDamageNumber(target.sprite.x, target.sprite.y - 16, dmg2, 'physical');
        this.flashSprite(target.sprite, 0xFF4422);
      });
    } else if (name.includes('golem')) {
      // Golem: heavy slow hit
      dmg = this.calcDamage(unit, target, 'physical', 1.4);
      target.hp = Math.max(0, target.hp - dmg);
      this.vfx.showDamageNumber(target.sprite.x, target.sprite.y - 12, dmg, 'physical');
      this.flashSprite(target.sprite, 0xFF2200);
      effectKey = 'slash';
      this.vfx.play('slash', target.sprite.x, target.sprite.y, undefined);
    } else if (name.includes('wraith') || name.includes('crystal')) {
      // Wraith: magic attack
      dmg = this.calcDamage(unit, target, 'ice', 1.2);
      target.hp = Math.max(0, target.hp - dmg);
      this.vfx.showDamageNumber(target.sprite.x, target.sprite.y - 12, dmg, 'ice');
      this.flashSprite(target.sprite, 0xAADDFF);
      effectKey = 'crystal';
      this.vfx.play('crystal', target.sprite.x, target.sprite.y, undefined);
    } else {
      // Default: basic attack
      dmg = this.calcDamage(unit, target, 'physical', 1.0);
      target.hp = Math.max(0, target.hp - dmg);
      this.vfx.showDamageNumber(target.sprite.x, target.sprite.y - 12, dmg, 'physical');
      this.flashSprite(target.sprite, 0xFF4444);
    }
    void effectKey;

    this.scene.time.delayedCall(380, () => {
      this.atb.reset(unit);
      this._phase = 'active';
      this.checkDefeat();
    });
  }

  // ── Player command ────────────────────────────────────────────────────────────
  private tryShowCommand(): void {
    if (this.commandQueue.length === 0) return;
    if (this._phase !== 'active') return;
    if (this.menuOpen) return;

    const unit = this.commandQueue[0];
    this.menuOpen = true;

    const dualAvail = unit.techs
      .map(k => TECHS[k])
      .filter(t => t && t.participants === 2 && t.requires && this.allPartyReady(t.requires))
      .map(t => t.key);

    this.ui.showCommandMenu(unit, dualAvail, (choice, techKey) => {
      this.menuOpen = false;
      this.handlePlayerChoice(unit, choice, techKey);
    });
  }

  private allPartyReady(indices: [number, number]): boolean {
    return indices.every(i => this.playerUnits[i]?.atb >= 100);
  }

  private handlePlayerChoice(unit: BattleUnit, choice: MenuChoice, techKey?: string): void {
    void techKey;
    switch (choice) {
      case 'attack': {
        const targets = this.pickEnemyTargets('single_enemy');
        this.executePlayerAction(unit, targets, 'SLASH');
        break;
      }
      case 'tech': {
        const availList = unit.techs
          .map(k => TECHS[k])
          .filter(t => {
            if (!t) return false;
            if (t.participants === 2 && t.requires && !this.allPartyReady(t.requires)) return false;
            return unit.mp >= t.mpCost;
          })
          .map(t => ({ key: t.key, name: t.name, mpCost: t.mpCost, desc: t.desc }));

        this.ui.showTechMenu(availList, (selectedKey) => {
          this.menuOpen = false;
          if (!selectedKey) {
            this.menuOpen = true;
            const dualAvail2 = unit.techs
              .map(k => TECHS[k])
              .filter(t => t && t.participants === 2 && t.requires && this.allPartyReady(t.requires))
              .map(t => t.key);
            this.ui.showCommandMenu(unit, dualAvail2, (choice2, techKey2) => {
              this.menuOpen = false;
              this.handlePlayerChoice(unit, choice2, techKey2);
            });
            return;
          }
          const def  = TECHS[selectedKey];
          const tgts = this.pickEnemyTargets(def.target);
          this.executePlayerAction(unit, tgts, selectedKey);
        });
        break;
      }
      case 'flee':
        this.menuOpen = false;
        this.flee();
        break;
    }
  }

  // ── Execute action ────────────────────────────────────────────────────────────
  private executePlayerAction(
    actor   : BattleUnit,
    targets : BattleUnit[],
    techKey : string,
  ): void {
    this.commandQueue.shift();
    const def = TECHS[techKey];
    if (!def) { this.atb.reset(actor); this._phase = 'active'; return; }

    if (!this.atb.consumeMp(actor, def.mpCost)) {
      this.ui.showBanner('Not enough MP!', '#FF8888', 900);
      actor.waitingForInput = false;
      this._phase = 'active';
      this.tryShowCommand();
      return;
    }

    if (def.participants === 2 && def.requires) {
      const [ia, ib] = def.requires;
      const coIdx = ia === actor.partyIndex ? ib : ia;
      const co    = this.playerUnits[coIdx];
      if (co) { this.atb.consumeMp(co, def.mpCost); this.atb.reset(co); }
    }

    const vfxX = targets[0]?.sprite.x ?? this.scene.cameras.main.scrollX + W / 2;
    const vfxY = targets[0]?.sprite.y ?? this.scene.cameras.main.scrollY + H / 2;

    const isHeal = def.element === 'heal';
    const safeKey = (def.effectKey as EffectKey) ?? 'default';

    this.vfx.play(safeKey, vfxX, vfxY, () => {
      targets.forEach(t => {
        if (isHeal) {
          const amt = Math.floor(actor.atk * def.power * 0.5 + 15);
          t.hp = Math.min(t.maxHp, t.hp + amt);
          this.vfx.showDamageNumber(t.sprite.x, t.sprite.y - 12, amt, 'heal', true);
        } else {
          const dmg = this.calcDamage(actor, t, def.element, def.power);
          t.hp = Math.max(0, t.hp - dmg);
          this.vfx.showDamageNumber(t.sprite.x, t.sprite.y - 12, dmg, def.element);
          this.flashSprite(t.sprite, 0xFFFFFF);
        }
      });

      this.atb.reset(actor);
      actor.waitingForInput = false;
      this._phase = 'active';
      this.checkVictory();
      if (this._phase === 'active') this.tryShowCommand();
    });
  }

  // ── Target selection ──────────────────────────────────────────────────────────
  private pickEnemyTargets(targetType: string): BattleUnit[] {
    const alive = this.enemyUnits.filter(u => u.hp > 0);
    if (targetType === 'all_enemies') return alive;
    return alive.length > 0 ? [alive.reduce((a, b) => a.hp < b.hp ? a : b)] : [];
  }

  // ── Damage calculation ────────────────────────────────────────────────────────
  private calcDamage(
    atk   : BattleUnit,
    def   : BattleUnit,
    _elem : string,
    power : number,
  ): number {
    const base  = atk.atk * power - def.def * 0.5;
    const noise = Phaser.Math.Between(-3, 5);
    return Math.max(1, Math.floor(base + noise));
  }

  // ── Victory / Defeat ─────────────────────────────────────────────────────────
  private checkVictory(): void {
    if (this.enemyUnits.every(u => u.hp <= 0)) {
      this._phase = 'victory';
      this.ui.hideCommandMenu();

      const expGain  = this.enemyUnits.reduce((s, u) => s + ((u as unknown as { exp?: number }).exp ?? 5), 0);
      const goldGain = this.enemyUnits.reduce((s, u) => s + ((u as unknown as { gold?: number }).gold ?? 2), 0);

      this.scene.time.delayedCall(200, () => {
        this.ui.showVictoryExp(expGain, goldGain);
        this.engagedEnemyObjs.forEach(s => {
          this.scene.tweens.add({ targets: s, alpha: 0, scaleY: 0.5, duration: 500 });
        });
        this.scene.time.delayedCall(2400, () => this.endBattle(expGain, goldGain));
      });
    }
  }

  private checkDefeat(): void {
    if (this.playerUnits.every(u => u.hp <= 0)) {
      this._phase = 'defeat';
      this.ui.hideCommandMenu();
      this.ui.showBanner('Defeated...', '#FF4444', 2000);
      this.scene.time.delayedCall(2200, () => this.endBattle(0, 0));
    }
  }

  private flee(): void {
    if (Phaser.Math.Between(1, 100) <= 70) {
      this._phase = 'ending';
      this.ui.showBanner('Escaped!', '#AAFFAA', 1000);
      this.scene.time.delayedCall(1200, () => this.endBattle(0, 0));
    } else {
      this.ui.showBanner("Can't escape!", '#FF8888', 800);
      const unit = this.commandQueue.shift();
      if (unit) { this.atb.reset(unit); unit.waitingForInput = false; }
      this._phase = 'active';
      this.tryShowCommand();
    }
  }

  // ── End battle ────────────────────────────────────────────────────────────────
  private endBattle(expGain: number, goldGain: number): void {
    // Restore camera zoom
    this.scene.tweens.add({
      targets: this.scene.cameras.main,
      zoom: 1,
      duration: 300,
      ease: 'Sine.easeInOut',
    });

    // Fade out battle background
    if (this.battleBg) {
      this.scene.tweens.add({
        targets: this.battleBg,
        alpha: 0,
        duration: 350,
        onComplete: () => { this.battleBg?.destroy(); this.battleBg = null; },
      });
    }
    if (this.battleOverlay) {
      this.battleOverlay.destroy();
      this.battleOverlay = null;
    }

    this._phase   = 'idle';
    this.menuOpen = false;
    this.ui.destroy();
    this.commandQueue = [];
    this.playerUnits  = [];
    this.enemyUnits   = [];
    this.origPositions.clear();
    this.onBattleEnd?.(expGain, goldGain);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  private updateStatusUI(): void {
    if (this.playerUnits.length > 0) this.ui.updateStatusPanel(this.playerUnits);
  }

  private flashSprite(sprite: Phaser.GameObjects.Sprite, color: number): void {
    const origTint = sprite.tintTopLeft;
    const hadTint  = sprite.isTinted;
    sprite.setTint(color);
    this.scene.time.delayedCall(120, () => {
      if (hadTint) { sprite.setTint(origTint); }
      else         { sprite.clearTint(); }
    });
  }
}
