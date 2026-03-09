import Phaser from 'phaser';
import { StateMachine } from '../systems/StateMachine';
import { InputManager } from '../systems/InputManager';
import { PHYSICS } from '../data/constants';
// ── Player ────────────────────────────────────────────────────────────────────
// Extends Phaser.Physics.Arcade.Sprite.
// Renamed accessors avoid clashes with Phaser's own `.state` / `.setState` / `.input`.
export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player', 0);
        this.sm = new StateMachine();
        this._facing = 'down';
        this.vx = 0;
        this.vy = 0;
        // Cast needed because Phaser's TS overloads are overly strict on subclasses
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const body = this.body;
        body.setSize(10, 8);
        body.setOffset(1, 8);
        body.setCollideWorldBounds(true);
        body.setMaxVelocity(PHYSICS.MAX_RUN_SPEED * 1.1, PHYSICS.MAX_RUN_SPEED * 1.1);
        this.setOrigin(0.5, 1);
        this.setDepth(10);
        this.inputManager = new InputManager(scene);
        this.buildAnims(scene);
        this.initStates();
        this.sm.set('idle');
    }
    // ── Animation setup ──────────────────────────────────────────────────────────
    // Frame layout in 'player' texture  (each frame 12×16):
    //  0=idle  1=walk_a  2=walk_b  3=run_a  4=run_b  5=talk  6=win_a  7=win_b
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
    // ── State machine ─────────────────────────────────────────────────────────────
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
    // ── Physics helpers ───────────────────────────────────────────────────────────
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
    // ── Public API ────────────────────────────────────────────────────────────────
    // Prefixed to avoid clashing with Phaser's own .setState() / .state
    setPlayerState(s) { this.sm.set(s); }
    get playerState() { return this.sm.current; }
    get facing() { return this._facing; }
    update(delta) {
        this.sm.update(delta);
    }
}
function moveToward(current, target, step) {
    const diff = target - current;
    return Math.abs(diff) <= step ? target : current + Math.sign(diff) * step;
}
