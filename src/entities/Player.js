import Phaser from 'phaser';
import { StateMachine } from '../systems/StateMachine';
import { InputManager } from '../systems/InputManager';
import { PHYSICS } from '../data/constants';
import { HERO_TECHS, MAGE_TECHS } from '../data/techs';
// ── Base Combatant (shared by Player + Ally) ──────────────────────────────────
export class Combatant extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, unit) {
        super(scene, x, y, texture, 0);
        this.battleUnit = unit;
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
}
// ── Player ────────────────────────────────────────────────────────────────────
export class Player extends Combatant {
    constructor(scene, x, y) {
        const unit = {
            id: 'hero', name: 'Crono',
            sprite: null,
            hp: 120, maxHp: 120,
            mp: 60, maxMp: 60,
            atk: 22, def: 10, spd: 15,
            atb: 0, isPlayerUnit: true, partyIndex: 0,
            techs: HERO_TECHS, waitingForInput: false,
        };
        super(scene, x, y, 'player', unit);
        this.sm = new StateMachine();
        this._facing = 'down';
        this.vx = 0;
        this.vy = 0;
        unit.sprite = this;
        const body = this.body;
        body.setSize(10, 8);
        body.setOffset(1, 8);
        body.setCollideWorldBounds(true);
        body.setMaxVelocity(PHYSICS.MAX_RUN_SPEED * 1.1, PHYSICS.MAX_RUN_SPEED * 1.1);
        this.setOrigin(0.5, 1).setDepth(10);
        this.inputManager = new InputManager(scene);
        this.buildAnims(scene);
        this.initStates();
        this.sm.set('idle');
    }
    buildAnims(scene) {
        const A = scene.anims;
        if (A.exists('p_idle'))
            return;
        A.create({ key: 'p_idle', frames: [{ key: 'player', frame: 0 }], frameRate: 1, repeat: -1 });
        A.create({ key: 'p_walk', frames: [{ key: 'player', frame: 1 }, { key: 'player', frame: 2 }], frameRate: 8, repeat: -1 });
        A.create({ key: 'p_run', frames: [{ key: 'player', frame: 3 }, { key: 'player', frame: 4 }], frameRate: 14, repeat: -1 });
        A.create({ key: 'p_talk', frames: [{ key: 'player', frame: 5 }], frameRate: 1, repeat: -1 });
        A.create({ key: 'p_win', frames: [{ key: 'player', frame: 6 }, { key: 'player', frame: 7 }], frameRate: 6, repeat: -1 });
    }
    initStates() {
        this.sm
            .add('idle', {
            onEnter: () => { this.play('p_idle', true); },
            onUpdate: (dt) => {
                this.applyFriction(dt);
                const inp = this.inputManager.poll();
                if (inp.moving)
                    this.sm.set(inp.run ? 'run' : 'walk');
            },
        })
            .add('walk', {
            onEnter: () => { this.play('p_walk', true); },
            onUpdate: (dt) => {
                const inp = this.inputManager.poll();
                if (!inp.moving) {
                    this.sm.set('idle');
                    return;
                }
                if (inp.run) {
                    this.sm.set('run');
                    return;
                }
                this.applyMove(inp, PHYSICS.MAX_WALK_SPEED, dt);
            },
        })
            .add('run', {
            onEnter: () => { this.play('p_run', true); },
            onUpdate: (dt) => {
                const inp = this.inputManager.poll();
                if (!inp.moving) {
                    this.sm.set('idle');
                    return;
                }
                if (!inp.run) {
                    this.sm.set('walk');
                    return;
                }
                this.applyMove(inp, PHYSICS.MAX_RUN_SPEED, dt);
            },
        })
            .add('talk', {
            onEnter: () => {
                this.play('p_talk', true);
                this.vx = 0;
                this.vy = 0;
                this.body.setVelocity(0, 0);
            },
            onUpdate: (_dt) => { },
        });
    }
    applyMove(inp, maxSpd, dt) {
        const sec = dt / 1000;
        if (Math.abs(inp.dx) >= Math.abs(inp.dy) && inp.dx !== 0) {
            this._facing = inp.dx > 0 ? 'right' : 'left';
            this.setFlipX(inp.dx < 0);
        }
        else if (inp.dy !== 0) {
            this._facing = inp.dy > 0 ? 'down' : 'up';
        }
        this.vx = moveToward(this.vx, inp.dx * maxSpd, PHYSICS.ACCELERATION * sec);
        this.vy = moveToward(this.vy, inp.dy * maxSpd, PHYSICS.ACCELERATION * sec);
        this.body.setVelocity(this.vx, this.vy);
    }
    applyFriction(dt) {
        const sec = dt / 1000;
        this.vx = moveToward(this.vx, 0, PHYSICS.FRICTION * sec);
        this.vy = moveToward(this.vy, 0, PHYSICS.FRICTION * sec);
        this.body.setVelocity(this.vx, this.vy);
    }
    setPlayerState(s) { this.sm.set(s); }
    get playerState() { return this.sm.current; }
    get facing() { return this._facing; }
    update(delta) { this.sm.update(delta); }
}
// ── Ally (Mage companion) ─────────────────────────────────────────────────────
// Follows the player on the overworld. Enters battle as second party member.
export class Ally extends Combatant {
    constructor(scene, x, y) {
        const unit = {
            id: 'mage', name: 'Marle',
            sprite: null,
            hp: 95, maxHp: 95,
            mp: 90, maxMp: 90,
            atk: 16, def: 8, spd: 13,
            atb: 0, isPlayerUnit: true, partyIndex: 1,
            techs: MAGE_TECHS, waitingForInput: false,
        };
        super(scene, x, y, 'ally', unit);
        this.followTarget = null;
        this.vx = 0;
        this.vy = 0;
        this.animTimer = 0;
        this.walkFrame = 0;
        unit.sprite = this;
        const body = this.body;
        body.setSize(10, 8);
        body.setOffset(1, 8);
        body.setCollideWorldBounds(true);
        this.setOrigin(0.5, 1).setDepth(9);
        this.buildAnims(scene);
        this.play('a_idle', true);
    }
    buildAnims(scene) {
        const A = scene.anims;
        if (A.exists('a_idle'))
            return;
        A.create({ key: 'a_idle', frames: [{ key: 'ally', frame: 0 }], frameRate: 1, repeat: -1 });
        A.create({ key: 'a_walk', frames: [{ key: 'ally', frame: 1 }, { key: 'ally', frame: 2 }], frameRate: 8, repeat: -1 });
        A.create({ key: 'a_run', frames: [{ key: 'ally', frame: 3 }, { key: 'ally', frame: 4 }], frameRate: 14, repeat: -1 });
        A.create({ key: 'a_win', frames: [{ key: 'ally', frame: 6 }, { key: 'ally', frame: 7 }], frameRate: 6, repeat: -1 });
    }
    follow(target) { this.followTarget = target; }
    update(delta, inBattle) {
        if (inBattle || !this.followTarget)
            return;
        const dx = this.followTarget.x - 18 - this.x;
        const dy = this.followTarget.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const FOLLOW_SPEED = 95;
        const DEADZONE = 6;
        if (dist > DEADZONE) {
            const nx = dx / dist;
            const ny = dy / dist;
            this.vx = moveToward(this.vx, nx * FOLLOW_SPEED, 480 * delta / 1000);
            this.vy = moveToward(this.vy, ny * FOLLOW_SPEED, 480 * delta / 1000);
            this.body.setVelocity(this.vx, this.vy);
            this.setFlipX(dx < 0);
            this.play('a_walk', true);
        }
        else {
            this.vx = moveToward(this.vx, 0, 600 * delta / 1000);
            this.vy = moveToward(this.vy, 0, 600 * delta / 1000);
            this.body.setVelocity(this.vx, this.vy);
            this.play('a_idle', true);
        }
        this.animTimer;
        this.walkFrame; // suppress
    }
}
function moveToward(current, target, step) {
    const diff = target - current;
    return Math.abs(diff) <= step ? target : current + Math.sign(diff) * step;
}
