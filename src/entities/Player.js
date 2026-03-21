import Phaser from 'phaser';
import { StateMachine } from '../systems/StateMachine';
import { InputManager } from '../systems/InputManager';
import { PHYSICS } from '../data/constants';
import { HERO_TECHS, MAGE_TECHS } from '../data/techs';
// Sprite frame layout (12×16 × 12 frames)
// [0-2]=down(front), [3-5]=up(back), [6-8]=side(left, right=flipX), [9]=talk, [10-11]=victory
const FRAMES = {
    down: { idle: 0, walkA: 1, walkB: 2 },
    up: { idle: 3, walkA: 4, walkB: 5 },
    side: { idle: 6, walkA: 7, walkB: 8 },
    talk: 9,
    winA: 10, winB: 11,
};
// ── Combatant base ─────────────────────────────────────────────────────────────
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
            hp: 140, maxHp: 140,
            mp: 70, maxMp: 70,
            atk: 24, def: 12, spd: 15,
            atb: 0, isPlayerUnit: true, partyIndex: 0,
            techs: HERO_TECHS, waitingForInput: false,
        };
        super(scene, x, y, 'player', unit);
        this.sm = new StateMachine();
        this._facing = 'down';
        this.vx = 0;
        this.vy = 0;
        this.walkPhase = false; // alternates A/B frames each step
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
    // ── Animations (4-directional) ─────────────────────────────────────────────
    buildAnims(scene) {
        const A = scene.anims;
        if (A.exists('p_idle_down'))
            return;
        const mk = (key, frames, fr) => A.create({ key, frames: frames.map(f => ({ key: 'player', frame: f })), frameRate: fr, repeat: -1 });
        mk('p_idle_down', [FRAMES.down.idle], 1);
        mk('p_idle_up', [FRAMES.up.idle], 1);
        mk('p_idle_side', [FRAMES.side.idle], 1);
        mk('p_walk_down', [FRAMES.down.walkA, FRAMES.down.walkB], 8);
        mk('p_walk_up', [FRAMES.up.walkA, FRAMES.up.walkB], 8);
        mk('p_walk_side', [FRAMES.side.walkA, FRAMES.side.walkB], 8);
        mk('p_run_down', [FRAMES.down.walkA, FRAMES.down.walkB], 14);
        mk('p_run_up', [FRAMES.up.walkA, FRAMES.up.walkB], 14);
        mk('p_run_side', [FRAMES.side.walkA, FRAMES.side.walkB], 14);
        mk('p_talk', [FRAMES.talk], 1);
        mk('p_win', [FRAMES.winA, FRAMES.winB], 6);
    }
    idleAnim() { return `p_idle_${this.dirKey()}`; }
    walkAnim(run) { return `p_${run ? 'run' : 'walk'}_${this.dirKey()}`; }
    dirKey() {
        return this._facing === 'left' || this._facing === 'right' ? 'side' : this._facing;
    }
    // ── State machine ──────────────────────────────────────────────────────────
    initStates() {
        this.sm
            .add('idle', {
            onEnter: () => { this.play(this.idleAnim(), true); },
            onUpdate: (dt) => {
                this.applyFriction(dt);
                const inp = this.inputManager.poll();
                if (inp.moving)
                    this.sm.set(inp.run ? 'run' : 'walk');
            },
        })
            .add('walk', {
            onEnter: () => { this.play(this.walkAnim(false), true); },
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
            onEnter: () => { this.play(this.walkAnim(true), true); },
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
    // ── Movement helpers ──────────────────────────────────────────────────────
    applyMove(inp, maxSpd, dt) {
        const sec = dt / 1000;
        // Update facing direction based on dominant axis
        if (Math.abs(inp.dx) >= Math.abs(inp.dy) && inp.dx !== 0) {
            const newFacing = inp.dx > 0 ? 'right' : 'left';
            if (newFacing !== this._facing) {
                this._facing = newFacing;
                this.play(this.walkAnim(inp.run), true);
            }
            this.setFlipX(inp.dx < 0);
        }
        else if (inp.dy !== 0) {
            const newFacing = inp.dy > 0 ? 'down' : 'up';
            if (newFacing !== this._facing) {
                this._facing = newFacing;
                this.setFlipX(false);
                this.play(this.walkAnim(inp.run), true);
            }
        }
        this.vx = moveToward(this.vx, inp.dx * maxSpd, PHYSICS.ACCELERATION * sec);
        this.vy = moveToward(this.vy, inp.dy * maxSpd, PHYSICS.ACCELERATION * sec);
        this.body.setVelocity(this.vx, this.vy);
        this.walkPhase; // suppress
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
// ── Ally ──────────────────────────────────────────────────────────────────────
export class Ally extends Combatant {
    constructor(scene, x, y) {
        const unit = {
            id: 'mage', name: 'Marle',
            sprite: null,
            hp: 105, maxHp: 105,
            mp: 100, maxMp: 100,
            atk: 18, def: 9, spd: 13,
            atb: 0, isPlayerUnit: true, partyIndex: 1,
            techs: MAGE_TECHS, waitingForInput: false,
        };
        super(scene, x, y, 'ally', unit);
        this.followTarget = null;
        this.vx = 0;
        this.vy = 0;
        this._facing = 'down';
        unit.sprite = this;
        const body = this.body;
        body.setSize(10, 8);
        body.setOffset(1, 8);
        body.setCollideWorldBounds(true);
        this.setOrigin(0.5, 1).setDepth(9);
        this.buildAnims(scene);
        this.play('a_idle_down', true);
    }
    buildAnims(scene) {
        const A = scene.anims;
        if (A.exists('a_idle_down'))
            return;
        const mk = (key, frames, fr) => A.create({ key, frames: frames.map(f => ({ key: 'ally', frame: f })), frameRate: fr, repeat: -1 });
        mk('a_idle_down', [0], 1);
        mk('a_idle_up', [3], 1);
        mk('a_idle_side', [6], 1);
        mk('a_walk_down', [1, 2], 8);
        mk('a_walk_up', [4, 5], 8);
        mk('a_walk_side', [7, 8], 8);
        mk('a_win', [10, 11], 6);
        mk('a_talk', [9], 1);
    }
    follow(target) { this.followTarget = target; }
    update(delta, inBattle) {
        if (inBattle || !this.followTarget)
            return;
        const OFFSET_X = -18;
        const dx = (this.followTarget.x + OFFSET_X) - this.x;
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
            // Update facing and animation
            let newFacing = this._facing;
            if (Math.abs(dx) >= Math.abs(dy)) {
                newFacing = dx > 0 ? 'right' : 'left';
            }
            else {
                newFacing = dy > 0 ? 'down' : 'up';
            }
            if (newFacing !== this._facing) {
                this._facing = newFacing;
            }
            const dirKey = (this._facing === 'left' || this._facing === 'right') ? 'side' : this._facing;
            this.setFlipX(this._facing === 'left');
            this.play(`a_walk_${dirKey}`, true);
        }
        else {
            this.vx = moveToward(this.vx, 0, 600 * delta / 1000);
            this.vy = moveToward(this.vy, 0, 600 * delta / 1000);
            this.body.setVelocity(this.vx, this.vy);
            const dirKey = (this._facing === 'left' || this._facing === 'right') ? 'side' : this._facing;
            this.play(`a_idle_${dirKey}`, true);
        }
    }
}
function moveToward(current, target, step) {
    const diff = target - current;
    return Math.abs(diff) <= step ? target : current + Math.sign(diff) * step;
}
