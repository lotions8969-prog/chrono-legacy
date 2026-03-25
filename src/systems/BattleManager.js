import Phaser from 'phaser';
import { ATBSystem } from './ATBSystem';
import { BattleUI } from '../ui/BattleUI';
import { ParticleManager } from './ParticleManager';
import { TECHS } from '../data/techs';
import { CANVAS } from '../data/constants';
const W = CANVAS.WIDTH;
const H = CANVAS.HEIGHT;
// ── BattleManager ─────────────────────────────────────────────────────────────
export class BattleManager {
    constructor(scene) {
        this.atb = new ATBSystem();
        this._phase = 'idle';
        this.menuOpen = false;
        this.playerUnits = [];
        this.enemyUnits = [];
        this.commandQueue = [];
        this.onBattleStart = null;
        this.onBattleEnd = null;
        this.engagedEnemyObjs = [];
        // Battle background overlay
        this.battleBg = null;
        this.battleOverlay = null;
        this.bgKey = 'battle_bg_field';
        // Stored original positions (to restore after battle)
        this.origPositions = new Map();
        // Enemy HP bars (world-space, no scroll factor adjustment needed since cam is frozen)
        this.enemyHpBars = [];
        this.enemyLabels = [];
        this.scene = scene;
        this.vfx = new ParticleManager(scene);
        this.ui = new BattleUI(scene);
    }
    setCallbacks(onStart, onEnd) {
        this.onBattleStart = onStart;
        this.onBattleEnd = onEnd;
    }
    setBattleBackground(key) { this.bgKey = key; }
    showLevelUp(unitName, level) { this.ui.showLevelUp(unitName, level); }
    get isActive() { return this._phase !== 'idle'; }
    get phase() { return this._phase; }
    // ── Start ────────────────────────────────────────────────────────────────────
    startBattle(playerSprites, enemyEntries) {
        if (this._phase !== 'idle')
            return;
        this._phase = 'engaging';
        this.onBattleStart?.();
        this.playerUnits = playerSprites.map(e => e.unit);
        this.enemyUnits = enemyEntries.map(e => e.unit);
        this.engagedEnemyObjs = enemyEntries.map(e => e.sprite);
        this.origPositions.clear();
        [...playerSprites, ...enemyEntries].forEach(({ sprite }) => {
            this.origPositions.set(sprite, { x: sprite.x, y: sprite.y });
        });
        [...this.playerUnits, ...this.enemyUnits].forEach(u => { u.atb = 0; u.waitingForInput = false; });
        const cam = this.scene.cameras.main;
        cam.stopFollow();
        // Screen flash
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
            this.battleBg = this.scene.add.image(cam.scrollX + W / 2, cam.scrollY + H / 2, this.bgKey).setScrollFactor(0).setDepth(2).setAlpha(0);
            this.scene.tweens.add({
                targets: this.battleBg,
                alpha: 1,
                duration: 300,
                ease: 'Quad.easeOut',
            });
            this.battleOverlay = this.scene.add.rectangle(0, 0, W, H, 0x000000, 0.15)
                .setScrollFactor(0).setDepth(3).setOrigin(0, 0);
        });
        // Zoom camera
        this.scene.tweens.add({
            targets: cam,
            zoom: 1.05,
            duration: 400,
            ease: 'Sine.easeOut',
        });
        const cx = cam.scrollX;
        const cy = cam.scrollY;
        const partySlots = [
            [cx + 48, cy + H * 0.62],
            [cx + 32, cy + H * 0.74],
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
                targets: entry.sprite,
                x: tx, y: ty,
                duration: 480,
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
                duration: 480,
                ease: 'Quad.easeInOut',
                onComplete: () => { ready++; if (ready === allSprites.length)
                    this.onEngageComplete(); },
            });
        });
    }
    onEngageComplete() {
        this._phase = 'active';
        this.ui.showBanner('Battle Start!', '#FFE060');
        this.buildEnemyBars();
        this.scene.time.delayedCall(200, () => this.updateStatusUI());
    }
    // ── Update ────────────────────────────────────────────────────────────────────
    update(dt) {
        if (this._phase !== 'active')
            return;
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
                this.enemyAI(unit);
            }
        });
        this.updateStatusUI();
        this.updateEnemyBars();
    }
    // ── Enemy HP bars ─────────────────────────────────────────────────────────────
    buildEnemyBars() {
        this.clearEnemyBars();
        this.enemyUnits.forEach(unit => {
            const bar = this.scene.add.graphics().setDepth(6);
            this.enemyHpBars.push(bar);
            this.drawEnemyBar(bar, unit);
            const lbl = this.scene.add.text(unit.sprite.x, unit.sprite.y - 26, unit.name, { fontSize: '5px', fontFamily: 'monospace', color: '#FFEECC' }).setOrigin(0.5, 1).setDepth(7);
            this.enemyLabels.push(lbl);
        });
    }
    drawEnemyBar(bar, unit) {
        bar.clear();
        const BAR_W = 26;
        const BAR_H = 3;
        const sx = unit.sprite.x - BAR_W / 2;
        const sy = unit.sprite.y - 22;
        const pct = Math.max(0, unit.hp / unit.maxHp);
        const col = pct > 0.5 ? 0x44CC44 : pct > 0.25 ? 0xCCAA22 : 0xCC3322;
        bar.fillStyle(0x220000, 0.85);
        bar.fillRect(sx, sy, BAR_W, BAR_H);
        bar.fillStyle(col, 1);
        bar.fillRect(sx, sy, Math.ceil(BAR_W * pct), BAR_H);
        bar.lineStyle(1, 0x888888, 0.6);
        bar.strokeRect(sx, sy, BAR_W, BAR_H);
    }
    updateEnemyBars() {
        this.enemyUnits.forEach((unit, i) => {
            const bar = this.enemyHpBars[i];
            const lbl = this.enemyLabels[i];
            if (bar)
                this.drawEnemyBar(bar, unit);
            if (lbl) {
                lbl.setPosition(unit.sprite.x, unit.sprite.y - 26);
                lbl.setVisible(unit.hp > 0);
            }
        });
    }
    clearEnemyBars() {
        this.enemyHpBars.forEach(b => b.destroy());
        this.enemyLabels.forEach(l => l.destroy());
        this.enemyHpBars = [];
        this.enemyLabels = [];
    }
    // ── Attack animation ──────────────────────────────────────────────────────────
    /**
     * Tween `attacker` 50% toward `target`, call `onHit`, then return.
     * Calls `onDone` after the return tween completes.
     */
    doAttackAnim(attacker, target, onHit, onDone) {
        const ox = attacker.x;
        const oy = attacker.y;
        const tx = ox + (target.x - ox) * 0.5;
        const ty = oy + (target.y - oy) * 0.5;
        this.scene.tweens.add({
            targets: attacker,
            x: tx, y: ty,
            duration: 130,
            ease: 'Quad.easeIn',
            onComplete: () => {
                onHit();
                this.scene.tweens.add({
                    targets: attacker,
                    x: ox, y: oy,
                    duration: 190,
                    ease: 'Quad.easeOut',
                    onComplete: onDone,
                });
            },
        });
    }
    // ── Enemy AI (type-aware) ─────────────────────────────────────────────────────
    enemyAI(unit) {
        if (this._phase !== 'active')
            return;
        this._phase = 'animating';
        const target = this.playerUnits.find(u => u.hp > 0);
        if (!target) {
            this.checkDefeat();
            return;
        }
        const name = unit.name.toLowerCase();
        const atkSpr = unit.sprite;
        const defSpr = target.sprite;
        const finish = () => {
            this.scene.time.delayedCall(80, () => {
                this.atb.reset(unit);
                this._phase = 'active';
                this.checkDefeat();
            });
        };
        if (name.includes('bat')) {
            // Fast double-hit
            this.doAttackAnim(atkSpr, defSpr, () => {
                const d1 = this.calcDamage(unit, target, 'physical', 0.7);
                target.hp = Math.max(0, target.hp - d1);
                this.vfx.showDamageNumber(defSpr.x, defSpr.y - 12, d1, 'physical');
                this.flashSprite(target.sprite, 0xFF6644);
                this.vfx.play('slash', defSpr.x, defSpr.y, undefined);
            }, () => {
                this.scene.time.delayedCall(60, () => {
                    if (this._phase !== 'animating')
                        return;
                    this.doAttackAnim(atkSpr, defSpr, () => {
                        const d2 = this.calcDamage(unit, target, 'physical', 0.7);
                        target.hp = Math.max(0, target.hp - d2);
                        this.vfx.showDamageNumber(defSpr.x, defSpr.y - 16, d2, 'physical');
                        this.flashSprite(target.sprite, 0xFF4422);
                    }, finish);
                });
            });
        }
        else if (name.includes('golem')) {
            // Heavy slow hit + screen shake
            this.doAttackAnim(atkSpr, defSpr, () => {
                const d = this.calcDamage(unit, target, 'physical', 1.4);
                target.hp = Math.max(0, target.hp - d);
                this.vfx.showDamageNumber(defSpr.x, defSpr.y - 12, d, 'physical');
                this.flashSprite(target.sprite, 0xFF2200);
                this.scene.cameras.main.shake(110, 0.005);
                this.vfx.play('slash', defSpr.x, defSpr.y, undefined);
            }, finish);
        }
        else if (name.includes('wraith') || name.includes('crystal')) {
            // Magic ranged attack (no physical lunge)
            const d = this.calcDamage(unit, target, 'ice', 1.2);
            target.hp = Math.max(0, target.hp - d);
            this.vfx.showDamageNumber(defSpr.x, defSpr.y - 12, d, 'ice');
            this.flashSprite(target.sprite, 0xAADDFF);
            this.vfx.play('crystal', defSpr.x, defSpr.y, undefined);
            this.scene.time.delayedCall(400, () => {
                this.atb.reset(unit);
                this._phase = 'active';
                this.checkDefeat();
            });
        }
        else {
            // Default physical
            this.doAttackAnim(atkSpr, defSpr, () => {
                const d = this.calcDamage(unit, target, 'physical', 1.0);
                target.hp = Math.max(0, target.hp - d);
                this.vfx.showDamageNumber(defSpr.x, defSpr.y - 12, d, 'physical');
                this.flashSprite(target.sprite, 0xFF4444);
            }, finish);
        }
    }
    // ── Player command ────────────────────────────────────────────────────────────
    tryShowCommand() {
        if (this.commandQueue.length === 0)
            return;
        if (this._phase !== 'active')
            return;
        if (this.menuOpen)
            return;
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
    allPartyReady(indices) {
        return indices.every(i => this.playerUnits[i]?.atb >= 100);
    }
    handlePlayerChoice(unit, choice, techKey) {
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
    // ── Execute player action ─────────────────────────────────────────────────────
    executePlayerAction(actor, targets, techKey) {
        this.commandQueue.shift();
        const def = TECHS[techKey];
        if (!def) {
            this.atb.reset(actor);
            this._phase = 'active';
            return;
        }
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
            const co = this.playerUnits[coIdx];
            if (co) {
                this.atb.consumeMp(co, def.mpCost);
                this.atb.reset(co);
            }
        }
        const cam = this.scene.cameras.main;
        const vfxX = targets[0]?.sprite.x ?? cam.scrollX + W / 2;
        const vfxY = targets[0]?.sprite.y ?? cam.scrollY + H / 2;
        const isHeal = def.element === 'heal';
        const safeKey = def.effectKey ?? 'default';
        const finishAction = () => {
            this.atb.reset(actor);
            actor.waitingForInput = false;
            this._phase = 'active';
            this.checkVictory();
            if (this._phase === 'active')
                this.tryShowCommand();
        };
        const applyEffects = () => {
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
                    this.flashSprite(t.sprite, 0xFFFFFF);
                    if (dmg > 10)
                        this.scene.cameras.main.shake(70, 0.003);
                }
            });
        };
        const firstTarget = targets[0];
        if (!isHeal && firstTarget && def.target !== 'all_enemies') {
            // Physical single-target: lunge animation
            this.doAttackAnim(actor.sprite, firstTarget.sprite, () => {
                applyEffects();
                this.vfx.play(safeKey, vfxX, vfxY, undefined);
            }, finishAction);
        }
        else {
            // Heal or AoE: immediate VFX then apply
            this.vfx.play(safeKey, vfxX, vfxY, () => {
                applyEffects();
                finishAction();
            });
        }
    }
    // ── Target selection ──────────────────────────────────────────────────────────
    pickEnemyTargets(targetType) {
        const alive = this.enemyUnits.filter(u => u.hp > 0);
        if (targetType === 'all_enemies')
            return alive;
        return alive.length > 0 ? [alive.reduce((a, b) => a.hp < b.hp ? a : b)] : [];
    }
    // ── Damage calculation ────────────────────────────────────────────────────────
    calcDamage(atk, def, _elem, power) {
        const base = atk.atk * power - def.def * 0.5;
        const noise = Phaser.Math.Between(-3, 5);
        return Math.max(1, Math.floor(base + noise));
    }
    // ── Victory / Defeat ─────────────────────────────────────────────────────────
    checkVictory() {
        if (this.enemyUnits.every(u => u.hp <= 0)) {
            this._phase = 'victory';
            this.ui.hideCommandMenu();
            this.clearEnemyBars();
            const expGain = this.enemyUnits.reduce((s, u) => s + (u.exp ?? 5), 0);
            const goldGain = this.enemyUnits.reduce((s, u) => s + (u.gold ?? 2), 0);
            this.scene.time.delayedCall(200, () => {
                this.ui.showVictoryExp(expGain, goldGain);
                this.engagedEnemyObjs.forEach(s => {
                    this.scene.tweens.add({ targets: s, alpha: 0, scaleY: 0.5, duration: 500 });
                });
                this.scene.time.delayedCall(2400, () => this.endBattle(expGain, goldGain));
            });
        }
    }
    checkDefeat() {
        if (this.playerUnits.every(u => u.hp <= 0)) {
            this._phase = 'defeat';
            this.ui.hideCommandMenu();
            this.clearEnemyBars();
            this.ui.showBanner('Defeated...', '#FF4444', 2000);
            this.scene.time.delayedCall(2200, () => this.endBattle(0, 0));
        }
    }
    flee() {
        if (Phaser.Math.Between(1, 100) <= 70) {
            this._phase = 'ending';
            this.ui.showBanner('Escaped!', '#AAFFAA', 1000);
            this.scene.time.delayedCall(1200, () => this.endBattle(0, 0));
        }
        else {
            this.ui.showBanner("Can't escape!", '#FF8888', 800);
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
    endBattle(expGain, goldGain) {
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            zoom: 1,
            duration: 300,
            ease: 'Sine.easeInOut',
        });
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
        this.clearEnemyBars();
        this._phase = 'idle';
        this.menuOpen = false;
        this.ui.destroy();
        this.commandQueue = [];
        this.playerUnits = [];
        this.enemyUnits = [];
        this.origPositions.clear();
        this.onBattleEnd?.(expGain, goldGain);
    }
    // ── Helpers ───────────────────────────────────────────────────────────────────
    updateStatusUI() {
        if (this.playerUnits.length > 0)
            this.ui.updateStatusPanel(this.playerUnits);
    }
    flashSprite(sprite, color) {
        const origTint = sprite.tintTopLeft;
        const hadTint = sprite.isTinted;
        sprite.setTint(color);
        this.scene.time.delayedCall(120, () => {
            if (hadTint) {
                sprite.setTint(origTint);
            }
            else {
                sprite.clearTint();
            }
        });
    }
}
