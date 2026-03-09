import Phaser from 'phaser';
// ── ParticleManager ───────────────────────────────────────────────────────────
// Spawns 16-bit style magic / hit effects using programmatic Graphics tweens.
// All effects are self-cleaning (destroy on completion).
export class ParticleManager {
    constructor(scene) {
        this.scene = scene;
    }
    play(effectKey, wx, wy, onDone) {
        switch (effectKey) {
            case 'slash':
                this.fxSlash(wx, wy, onDone);
                break;
            case 'fire':
                this.fxFire(wx, wy, onDone);
                break;
            case 'ice':
                this.fxIce(wx, wy, onDone);
                break;
            case 'lightning':
                this.fxLightning(wx, wy, onDone);
                break;
            case 'heal':
                this.fxHeal(wx, wy, onDone);
                break;
            case 'firesword':
                this.fxFireSword(wx, wy, onDone);
                break;
            case 'icetackle':
                this.fxIceTackle(wx, wy, onDone);
                break;
            default:
                onDone?.();
                break;
        }
    }
    // ── Slash ──────────────────────────────────────────────────────────────────
    fxSlash(x, y, cb) {
        const lines = [];
        const angles = [-45, 0, 45];
        angles.forEach((deg, i) => {
            const g = this.scene.add.graphics().setDepth(50);
            g.lineStyle(2, 0xffffff, 1);
            const rad = Phaser.Math.DegToRad(deg);
            const len = 12;
            g.lineBetween(x - Math.cos(rad) * len, y - Math.sin(rad) * len, x + Math.cos(rad) * len, y + Math.sin(rad) * len);
            lines.push(g);
            this.scene.tweens.add({
                targets: g,
                alpha: 0,
                x: g.x + Math.cos(rad + Math.PI / 2) * 6,
                y: g.y + Math.sin(rad + Math.PI / 2) * 6,
                duration: 200,
                delay: i * 40,
                onComplete: () => { g.destroy(); if (i === angles.length - 1)
                    cb?.(); },
            });
        });
        lines; // suppress unused
    }
    // ── Fire ───────────────────────────────────────────────────────────────────
    fxFire(x, y, cb) {
        const colors = [0xff8800, 0xff4400, 0xffcc00, 0xff2200];
        let done = 0;
        const total = 8;
        for (let i = 0; i < total; i++) {
            const g = this.scene.add.graphics().setDepth(50);
            const col = Phaser.Utils.Array.GetRandom(colors);
            const angle = (i / total) * Math.PI * 2;
            const dist = Phaser.Math.Between(4, 14);
            const size = Phaser.Math.Between(2, 5);
            g.fillStyle(col, 1);
            g.fillRect(-size / 2, -size / 2, size, size);
            g.setPosition(x, y);
            this.scene.tweens.add({
                targets: g,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist - 8,
                alpha: 0,
                scaleX: 0.2,
                scaleY: 0.2,
                duration: 350 + i * 30,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    g.destroy();
                    done++;
                    if (done === total)
                        cb?.();
                },
            });
        }
        // additive-style flash
        const flash = this.scene.add.graphics().setDepth(49);
        flash.fillStyle(0xff6600, 0.4);
        flash.fillCircle(x, y, 16);
        this.scene.tweens.add({ targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
    }
    // ── Ice ────────────────────────────────────────────────────────────────────
    fxIce(x, y, cb) {
        const shards = 6;
        let done = 0;
        for (let i = 0; i < shards; i++) {
            const g = this.scene.add.graphics().setDepth(50);
            const angle = (i / shards) * Math.PI * 2;
            g.fillStyle(0x88ddff, 1);
            // Draw a thin diamond shard
            g.fillTriangle(0, -6, -3, 0, 3, 0);
            g.fillStyle(0xccf4ff, 0.6);
            g.fillTriangle(0, -6, -1, -3, 1, -3);
            g.setPosition(x, y);
            g.setRotation(angle);
            this.scene.tweens.add({
                targets: g,
                x: x + Math.cos(angle) * 18,
                y: y + Math.sin(angle) * 18,
                rotation: g.rotation + Math.PI,
                alpha: 0,
                duration: 400,
                delay: i * 30,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    g.destroy();
                    done++;
                    if (done === shards)
                        cb?.();
                },
            });
        }
        // Blue flash
        const flash = this.scene.add.graphics().setDepth(49);
        flash.fillStyle(0x4499ff, 0.35);
        flash.fillCircle(x, y, 18);
        this.scene.tweens.add({ targets: flash, alpha: 0, duration: 250, onComplete: () => flash.destroy() });
    }
    // ── Lightning ──────────────────────────────────────────────────────────────
    fxLightning(x, y, cb) {
        const g = this.scene.add.graphics().setDepth(50);
        const drawBolt = (alpha) => {
            g.clear();
            g.lineStyle(2, 0xffff44, alpha);
            let cy = y - 30;
            g.moveTo(x + Phaser.Math.Between(-4, 4), cy);
            while (cy < y + 10) {
                cy += Phaser.Math.Between(4, 8);
                const nx = x + Phaser.Math.Between(-8, 8);
                g.lineTo(nx, cy);
            }
            g.strokePath();
            // Branches
            g.lineStyle(1, 0xffffaa, alpha * 0.7);
            for (let b = 0; b < 3; b++) {
                const bx = x + Phaser.Math.Between(-6, 6);
                const by = y - Phaser.Math.Between(5, 25);
                g.moveTo(bx, by);
                g.lineTo(bx + Phaser.Math.Between(-10, 10), by + Phaser.Math.Between(5, 12));
                g.strokePath();
            }
        };
        let flashes = 0;
        const doFlash = () => {
            drawBolt(1 - flashes * 0.25);
            flashes++;
            if (flashes < 4) {
                this.scene.time.delayedCall(80, doFlash);
            }
            else {
                this.scene.tweens.add({ targets: g, alpha: 0, duration: 100, onComplete: () => { g.destroy(); cb?.(); } });
            }
        };
        doFlash();
        // Yellow glow
        const flash = this.scene.add.graphics().setDepth(49);
        flash.fillStyle(0xffff00, 0.3);
        flash.fillCircle(x, y, 14);
        this.scene.tweens.add({ targets: flash, alpha: 0, duration: 320, onComplete: () => flash.destroy() });
    }
    // ── Heal ───────────────────────────────────────────────────────────────────
    fxHeal(x, y, cb) {
        let done = 0;
        const total = 5;
        for (let i = 0; i < total; i++) {
            const g = this.scene.add.graphics().setDepth(50);
            g.fillStyle(0x44ff88, 1);
            // Small cross / plus
            g.fillRect(-1, -3, 2, 6);
            g.fillRect(-3, -1, 6, 2);
            g.setPosition(x + Phaser.Math.Between(-8, 8), y + Phaser.Math.Between(-4, 4));
            this.scene.tweens.add({
                targets: g,
                y: g.y - 18,
                alpha: 0,
                duration: 500,
                delay: i * 60,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    g.destroy();
                    done++;
                    if (done === total)
                        cb?.();
                },
            });
        }
        const flash = this.scene.add.graphics().setDepth(49);
        flash.fillStyle(0x00ff66, 0.3);
        flash.fillCircle(x, y, 14);
        this.scene.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
    }
    // ── Dual: Fire Sword ───────────────────────────────────────────────────────
    fxFireSword(x, y, cb) {
        // Large slash + fire burst combo
        this.fxSlash(x, y);
        this.scene.time.delayedCall(100, () => this.fxFire(x, y));
        this.scene.time.delayedCall(200, () => this.fxFire(x - 10, y + 5));
        this.scene.time.delayedCall(300, () => { this.fxFire(x + 10, y - 5); cb?.(); });
    }
    // ── Dual: Ice Tackle ──────────────────────────────────────────────────────
    fxIceTackle(x, y, cb) {
        this.fxIce(x, y);
        this.scene.time.delayedCall(120, () => this.fxIce(x + 12, y));
        this.scene.time.delayedCall(240, () => { this.fxIce(x - 12, y); cb?.(); });
    }
    // ── Floating damage number ─────────────────────────────────────────────────
    showDamageNumber(x, y, value, element = 'physical', heal = false) {
        const colorMap = {
            physical: '#ffffff', fire: '#ff8800', ice: '#88ddff',
            lightning: '#ffff44', heal: '#44ff88',
        };
        const col = heal ? '#44ff88' : (colorMap[element] ?? '#ffffff');
        const txt = this.scene.add.text(x, y - 8, heal ? `+${value}` : String(value), {
            fontSize: '8px',
            fontFamily: 'monospace',
            color: col,
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5, 1).setDepth(60);
        // Bounce physics: pop up then fall with gravity simulation
        let vy = -60;
        const gravity = 120;
        let elapsed = 0;
        const dur = 900;
        const listener = (_time, delta) => {
            elapsed += delta;
            vy += gravity * (delta / 1000);
            txt.y += vy * (delta / 1000);
            if (elapsed > dur / 2)
                txt.setAlpha(1 - (elapsed - dur / 2) / (dur / 2));
            if (elapsed >= dur) {
                txt.destroy();
                this.scene.events.off('update', listener);
            }
        };
        this.scene.events.on('update', listener);
    }
}
