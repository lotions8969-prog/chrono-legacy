import Phaser from 'phaser';
import { ATBSystem } from './ATBSystem';
import { BattleUI } from '../ui/BattleUI';
import { ParticleManager } from './ParticleManager';
import { TECHS } from '../data/techs';
import { CANVAS } from '../data/constants';
const W = CANVAS.WIDTH;
const H = CANVAS.HEIGHT;
// ── BattleManager ─────────────────────────────────────────────────────────────
// Orchestrates the seamless on-map battle.
// No scene change. Sprites tween to battle positions, UI slides in.
export class BattleManager {
    constructor(scene) {
        this.atb = new ATBSystem();
        this._phase = 'idle';
        this.menuOpen = false; // true while command/tech menu is showing
        this.playerUnits = [];
        this.enemyUnits = [];
        this.commandQueue = []; // player units waiting for command
        // Callbacks to lock/unlock exploration
        this.onBattleStart = null;
        this.onBattleEnd = null;
        // Currently engaged enemy sprites (to despawn on victory)
        this.engagedEnemyObjs = [];
        this.scene = scene;
        this.vfx = new ParticleManager(scene);
        this.ui = new BattleUI(scene);
    }
    setCallbacks(onStart, onEnd) {
        this.onBattleStart = onStart;
        this.onBattleEnd = onEnd;
    }
    get isActive() { return this._phase !== 'idle'; }
    get phase() { return this._phase; }
    // ── Start ───────────────────────────────────────────────────────────────────
    startBattle(playerSprites, enemyEntries) {
        if (this._phase !== 'idle')
            return;
        this._phase = 'engaging';
        this.onBattleStart?.();
        this.playerUnits = playerSprites.map(e => e.unit);
        this.enemyUnits = enemyEntries.map(e => e.unit);
        this.engagedEnemyObjs = enemyEntries.map(e => e.sprite);
        // Reset ATBs
        [...this.playerUnits, ...this.enemyUnits].forEach(u => { u.atb = 0; u.waitingForInput = false; });
        // Lock camera on current position
        const cam = this.scene.cameras.main;
        cam.stopFollow();
        // Calculate battle positions in world space
        const cx = cam.scrollX;
        const cy = cam.scrollY;
        const partySlots = [[cx + 55, cy + H * 0.58], [cx + 45, cy + H * 0.72]];
        const enemySlots = [
            [cx + W * 0.72, cy + H * 0.40],
            [cx + W * 0.78, cy + H * 0.55],
            [cx + W * 0.68, cy + H * 0.65],
        ];
        // Tween everyone to battle positions
        const tweensDone = [];
        const allSprites = [...playerSprites.map(e => e.sprite), ...enemyEntries.map(e => e.sprite)];
        let ready = 0;
        playerSprites.forEach((entry, i) => {
            const [tx, ty] = partySlots[i] ?? partySlots[0];
            this.scene.tweens.add({
                targets: entry.sprite,
                x: tx, y: ty,
                duration: 500,
                ease: 'Quad.easeInOut',
                onComplete: () => { ready++; if (ready === allSprites.length)
                    this.onEngageComplete(); },
            });
        });
        enemyEntries.forEach((entry, i) => {
            const [tx, ty] = enemySlots[i] ?? enemySlots[0];
            this.scene.tweens.add({
                targets: entry.sprite,
                x: tx, y: ty,
                duration: 500,
                ease: 'Quad.easeInOut',
                onComplete: () => { ready++; if (ready === allSprites.length)
                    this.onEngageComplete(); },
            });
        });
        tweensDone; // suppress lint
    }
    onEngageComplete() {
        this._phase = 'active';
        this.ui.showBanner('Battle Start!', '#ffe080');
        this.scene.time.delayedCall(200, () => this.updateStatusUI());
    }
    // ── Update loop (call every frame during battle) ─────────────────────────────
    update(dt) {
        if (this._phase !== 'active')
            return;
        // Don't tick ATB while menu is open (pure ATB pause during player decision)
        if (this.menuOpen) {
            this.updateStatusUI();
            return;
        }
        const justReady = this.atb.tick([...this.playerUnits, ...this.enemyUnits], dt);
        justReady.forEach(unit => {
            if (unit.isPlayerUnit) {
                unit.waitingForInput = true;
                this.commandQueue.push(unit);
                this.tryShowCommand();
            }
            else {
                // Enemy AI: auto act
                this.enemyAI(unit);
            }
        });
        this.updateStatusUI();
    }
    // ── Enemy AI ────────────────────────────────────────────────────────────────
    enemyAI(unit) {
        if (this._phase !== 'active')
            return;
        this._phase = 'animating';
        // Always attack the first alive player unit
        const target = this.playerUnits.find(u => u.hp > 0);
        if (!target) {
            this.checkDefeat();
            return;
        }
        const dmg = this.calcDamage(unit, target, 'physical', 1.0);
        target.hp = Math.max(0, target.hp - dmg);
        this.vfx.showDamageNumber(target.sprite.x, target.sprite.y - 12, dmg, 'physical');
        // Hit flash on target sprite
        this.flashSprite(target.sprite, 0xff4444);
        this.scene.time.delayedCall(300, () => {
            this.atb.reset(unit);
            this._phase = 'active';
            this.checkDefeat();
        });
    }
    // ── Player command flow ──────────────────────────────────────────────────────
    tryShowCommand() {
        if (this.commandQueue.length === 0)
            return;
        if (this._phase !== 'active')
            return;
        if (this.menuOpen)
            return;
        const unit = this.commandQueue[0];
        this.menuOpen = true;
        // Find dual techs available: techs where all required units have full ATB
        const dualAvail = unit.techs
            .map(k => TECHS[k])
            .filter(t => t && t.participants === 2 && t.requires && this.allPartyReady(t.requires))
            .map(t => t.key);
        this.ui.showCommandMenu(unit, dualAvail, (choice, techKey) => {
            this.menuOpen = false;
            this.handlePlayerChoice(unit, choice, techKey);
        });
    }
    allPartyReady(indices) {
        return indices.every(i => this.playerUnits[i]?.atb >= 100);
    }
    handlePlayerChoice(unit, choice, techKey) {
        switch (choice) {
            case 'attack': {
                const techDef = TECHS['SLASH']; // basic attack = SLASH no-cost version
                const targets = this.pickTargets(techDef?.target ?? 'single_enemy');
                this.executePlayerAction(unit, targets, 'SLASH');
                break;
            }
            case 'tech': {
                // Build available tech list (enough MP, or free)
                const availList = unit.techs
                    .map(k => TECHS[k])
                    .filter(t => {
                    if (!t)
                        return false;
                    if (t.participants === 2 && t.requires && !this.allPartyReady(t.requires))
                        return false;
                    return unit.mp >= t.mpCost;
                })
                    .map(t => ({ key: t.key, name: t.name, mpCost: t.mpCost, desc: t.desc }));
                this.ui.showTechMenu(availList, (selectedKey) => {
                    this.menuOpen = false;
                    if (!selectedKey) {
                        // Back to command menu
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
                    const def = TECHS[selectedKey];
                    const tgts = this.pickTargets(def.target);
                    this.executePlayerAction(unit, tgts, selectedKey);
                });
                break;
            }
            case 'flee': {
                this.menuOpen = false;
                this.flee();
                break;
            }
        }
    }
    // ── Execute action ───────────────────────────────────────────────────────────
    executePlayerAction(actor, targets, techKey) {
        this.commandQueue.shift(); // remove acted unit
        const def = TECHS[techKey];
        if (!def) {
            this.atb.reset(actor);
            this._phase = 'active';
            return;
        }
        // Consume MP (for actor + co-actor if dual)
        if (!this.atb.consumeMp(actor, def.mpCost)) {
            this.ui.showBanner('Not enough MP!', '#ff8888', 900);
            actor.waitingForInput = false;
            this._phase = 'active';
            this.tryShowCommand();
            return;
        }
        // For dual tech, also consume the co-actor's ATB
        if (def.participants === 2 && def.requires) {
            const [ia, ib] = def.requires;
            const coIdx = ia === actor.partyIndex ? ib : ia;
            const co = this.playerUnits[coIdx];
            if (co) {
                this.atb.consumeMp(co, def.mpCost);
                this.atb.reset(co);
            }
        }
        // Play VFX on first target (or centre for AoE)
        const vfxX = targets[0]?.sprite.x ?? this.scene.cameras.main.scrollX + W / 2;
        const vfxY = targets[0]?.sprite.y ?? this.scene.cameras.main.scrollY + H / 2;
        const isHeal = def.element === 'heal';
        const safeKey = def.effectKey ?? 'default';
        this.vfx.play(safeKey, vfxX, vfxY, () => {
            // Apply damage/heal to each target
            targets.forEach(t => {
                if (isHeal) {
                    const amt = Math.floor(actor.atk * def.power * 0.5 + 15);
                    t.hp = Math.min(t.maxHp, t.hp + amt);
                    this.vfx.showDamageNumber(t.sprite.x, t.sprite.y - 12, amt, 'heal', true);
                }
                else {
                    const dmg = this.calcDamage(actor, t, def.element, def.power);
                    t.hp = Math.max(0, t.hp - dmg);
                    this.vfx.showDamageNumber(t.sprite.x, t.sprite.y - 12, dmg, def.element);
                    this.flashSprite(t.sprite, 0xffffff);
                }
            });
            this.atb.reset(actor);
            actor.waitingForInput = false;
            this._phase = 'active';
            this.checkVictory();
            if (this._phase === 'active')
                this.tryShowCommand();
        });
    }
    // ── Target selection ─────────────────────────────────────────────────────────
    pickTargets(targetType) {
        if (targetType === 'single_ally') {
            const alive = this.playerUnits.filter(u => u.hp > 0);
            return alive.length > 0 ? [alive.reduce((a, b) => a.hp < b.hp ? a : b)] : [];
        }
        const alive = this.enemyUnits.filter(u => u.hp > 0);
        if (targetType === 'all_enemies')
            return alive;
        // single: pick lowest HP target (simple AI selection)
        return alive.length > 0 ? [alive.reduce((a, b) => a.hp < b.hp ? a : b)] : [];
    }
    // ── Combat math ──────────────────────────────────────────────────────────────
    calcDamage(atk, def, _elem, power) {
        const base = atk.atk * power - def.def * 0.5;
        const noise = Phaser.Math.Between(-3, 5);
        return Math.max(1, Math.floor(base + noise));
    }
    // ── Checks ───────────────────────────────────────────────────────────────────
    checkVictory() {
        if (this.enemyUnits.every(u => u.hp <= 0)) {
            this._phase = 'victory';
            this.ui.hideCommandMenu();
            const expGain = this.enemyUnits.reduce((s, u) => s + (u.exp ?? 5), 0);
            this.scene.time.delayedCall(300, () => {
                this.ui.showBanner(`Victory!  +${expGain} EXP`, '#ffe080', 2000);
                // Fade out enemy sprites (World.ts will destroy them in onBattleEnd)
                this.engagedEnemyObjs.forEach(s => {
                    this.scene.tweens.add({ targets: s, alpha: 0, duration: 500 });
                });
                this.scene.time.delayedCall(2200, () => this.endBattle());
            });
        }
    }
    checkDefeat() {
        if (this.playerUnits.every(u => u.hp <= 0)) {
            this._phase = 'defeat';
            this.ui.hideCommandMenu();
            this.ui.showBanner('Defeated...', '#ff4444', 2000);
            this.scene.time.delayedCall(2200, () => this.endBattle());
        }
    }
    // ── Flee ─────────────────────────────────────────────────────────────────────
    flee() {
        if (Phaser.Math.Between(1, 100) <= 70) { // 70% flee chance
            this._phase = 'ending';
            this.ui.showBanner('Escaped!', '#aaffaa', 1000);
            this.scene.time.delayedCall(1200, () => this.endBattle());
        }
        else {
            this.ui.showBanner("Can't escape!", '#ff8888', 800);
            const unit = this.commandQueue.shift();
            if (unit) {
                this.atb.reset(unit);
                unit.waitingForInput = false;
            }
            this._phase = 'active';
            this.tryShowCommand();
        }
    }
    // ── End battle ────────────────────────────────────────────────────────────────
    endBattle() {
        this._phase = 'idle';
        this.menuOpen = false;
        this.ui.destroy();
        this.commandQueue = [];
        this.playerUnits = [];
        this.enemyUnits = [];
        this.onBattleEnd?.();
    }
    // ── Helpers ───────────────────────────────────────────────────────────────────
    updateStatusUI() {
        if (this.playerUnits.length > 0)
            this.ui.updateStatusPanel(this.playerUnits);
    }
    flashSprite(sprite, color) {
        const orig = sprite.tintFill;
        sprite.setTint(color);
        this.scene.time.delayedCall(120, () => {
            sprite.clearTint();
            orig; // suppress
        });
    }
}
