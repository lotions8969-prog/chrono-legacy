import Phaser from 'phaser';
import { EnemyDef } from '../data/enemies';

// ── Enemy ────────────────────────────────────────────────────────────────────
export class Enemy extends Phaser.Physics.Arcade.Sprite {

  readonly def   : EnemyDef;
  hp             : number;
  mp             : number;

  private wanderTimer = 0;
  private wanderVx    = 0;
  private wanderVy    = 0;
  private readonly SPEED = 22;

  constructor(scene: Phaser.Scene, x: number, y: number, def: EnemyDef) {
    super(scene, x, y, 'enemy', def.frameBase);
    this.def = def;
    this.hp  = def.hp;
    this.mp  = def.mp;

    scene.add.existing(this as unknown as Phaser.GameObjects.GameObject);
    scene.physics.add.existing(this as unknown as Phaser.GameObjects.GameObject);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 10);
    body.setOffset(2, 6);
    body.setCollideWorldBounds(true);

    this.setOrigin(0.5, 1).setDepth(8);
    this.buildAnim(scene);
    this.play(`enemy_idle_${def.frameBase}`);
  }

  private buildAnim(scene: Phaser.Scene): void {
    const k = `enemy_idle_${this.def.frameBase}`;
    if (!scene.anims.exists(k)) {
      scene.anims.create({
        key     : k,
        frames  : [
          { key: 'enemy', frame: this.def.frameBase     },
          { key: 'enemy', frame: this.def.frameBase + 1 },
        ],
        frameRate: 4,
        repeat  : -1,
      });
    }
  }

  /** Called every frame. Pass `inBattle = true` to freeze wandering. */
  tick(dt: number, inBattle: boolean): void {
    if (inBattle) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      return;
    }
    this.wander(dt);
  }

  private wander(dt: number): void {
    this.wanderTimer -= dt;
    if (this.wanderTimer <= 0) {
      this.wanderTimer = Phaser.Math.Between(1200, 3200);
      const idle = Math.random() < 0.4;
      if (idle) {
        this.wanderVx = 0; this.wanderVy = 0;
      } else {
        const a = Math.random() * Math.PI * 2;
        this.wanderVx = Math.cos(a) * this.SPEED;
        this.wanderVy = Math.sin(a) * this.SPEED;
      }
    }
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(this.wanderVx, this.wanderVy);
    if (this.wanderVx < -1) this.setFlipX(true);
    else if (this.wanderVx > 1) this.setFlipX(false);
  }

  takeDamage(amount: number): number {
    const dmg = Math.max(1, Math.floor(amount));
    this.hp   = Math.max(0, this.hp - dmg);
    return dmg;
  }

  get isDead()  : boolean { return this.hp <= 0; }
  get isAlive() : boolean { return this.hp > 0;  }
}
