import Phaser from 'phaser';
// ── Enemy ────────────────────────────────────────────────────────────────────
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, def) {
        super(scene, x, y, 'enemy', def.frameBase);
        this.wanderTimer = 0;
        this.wanderVx = 0;
        this.wanderVy = 0;
        this.SPEED = 22;
        this.def = def;
        this.hp = def.hp;
        this.mp = def.mp;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const body = this.body;
        body.setSize(12, 10);
        body.setOffset(2, 6);
        body.setCollideWorldBounds(true);
        this.setOrigin(0.5, 1).setDepth(8);
        this.buildAnim(scene);
        this.play(`enemy_idle_${def.frameBase}`);
    }
    buildAnim(scene) {
        const k = `enemy_idle_${this.def.frameBase}`;
        if (!scene.anims.exists(k)) {
            scene.anims.create({
                key: k,
                frames: [
                    { key: 'enemy', frame: this.def.frameBase },
                    { key: 'enemy', frame: this.def.frameBase + 1 },
                ],
                frameRate: 4,
                repeat: -1,
            });
        }
    }
    /** Called every frame. Pass `inBattle = true` to freeze wandering. */
    tick(dt, inBattle) {
        if (inBattle) {
            this.body.setVelocity(0, 0);
            return;
        }
        this.wander(dt);
    }
    wander(dt) {
        this.wanderTimer -= dt;
        if (this.wanderTimer <= 0) {
            this.wanderTimer = Phaser.Math.Between(1200, 3200);
            const idle = Math.random() < 0.4;
            if (idle) {
                this.wanderVx = 0;
                this.wanderVy = 0;
            }
            else {
                const a = Math.random() * Math.PI * 2;
                this.wanderVx = Math.cos(a) * this.SPEED;
                this.wanderVy = Math.sin(a) * this.SPEED;
            }
        }
        this.body.setVelocity(this.wanderVx, this.wanderVy);
        if (this.wanderVx < -1)
            this.setFlipX(true);
        else if (this.wanderVx > 1)
            this.setFlipX(false);
    }
    takeDamage(amount) {
        const dmg = Math.max(1, Math.floor(amount));
        this.hp = Math.max(0, this.hp - dmg);
        return dmg;
    }
    get isDead() { return this.hp <= 0; }
    get isAlive() { return this.hp > 0; }
}
