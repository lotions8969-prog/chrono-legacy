import Phaser from 'phaser';
export class ParticleManager {
    constructor(scene) {
        this.scene = scene;
    }
    // ── Play a named effect ───────────────────────────────────────────────────
    play(key, x, y, onDone) {
        switch (key) {
            case 'slash':
                this.fxSlash(x, y, onDone);
                break;
            case 'fire':
                this.fxFire(x, y, onDone);
                break;
            case 'ice':
                this.fxIce(x, y, onDone);
                break;
            case 'lightning':
                this.fxLightning(x, y, onDone);
                break;
            case 'heal':
                this.fxHeal(x, y, onDone);
                break;
            case 'firesword':
                this.fxFireSword(x, y, onDone);
                break;
            case 'icetackle':
                this.fxIceTackle(x, y, onDone);
                break;
            case 'crystal':
                this.fxCrystal(x, y, onDone);
                break;
            default:
                this.fxDefault(x, y, onDone);
                break;
        }
    }
    // ── Slash ─────────────────────────────────────────────────────────────────
    fxSlash(x, y, cb) {
        const DURATION = 220;
        const arcs = [
            { ax: x - 6, ay: y - 8, ex: x + 8, ey: y + 4, col: 0xFFFFEE },
            { ax: x - 4, ay: y - 6, ex: x + 6, ey: y + 6, col: 0xCCDDFF },
            { ax: x - 8, ay: y - 4, ex: x + 10, ey: y + 2, col: 0xEEEEFF },
        ];
        let done = 0;
        arcs.forEach(({ ax, ay, ex, ey, col }, i) => {
            const g = this.scene.add.graphics().setDepth(300);
            g.lineStyle(i === 0 ? 2 : 1, col, 1);
            g.beginPath();
            g.moveTo(ax, ay);
            g.lineTo(ex, ey);
            g.strokePath();
            this.scene.tweens.add({
                targets: g, alpha: 0,
                duration: DURATION, delay: i * 30,
                onComplete: () => {
                    g.destroy();
                    done++;
                    if (done === arcs.length)
                        cb?.();
                },
            });
        });
        // Screen shake
        this.screenShake(2, 80);
    }
    // ── Fire ──────────────────────────────────────────────────────────────────
    fxFire(x, y, cb) {
        const count = 20;
        const colors = [0xFF6600, 0xFF9900, 0xFFCC00, 0xFF3300, 0xFFFF44];
        let done = 0;
        this.screenFlash(0xFF6600, 0.18);
        this.screenShake(3, 150);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 24 + Math.random() * 28;
            const tx = x + Math.cos(angle) * speed;
            const ty = y + Math.sin(angle) * speed - 18;
            const col = colors[Math.floor(Math.random() * colors.length)];
            const sz = 2 + Math.random() * 3;
            const g = this.scene.add.graphics().setDepth(300);
            g.fillStyle(col, 1);
            g.fillCircle(x, y, sz);
            this.scene.tweens.add({
                targets: g, x: tx - x, y: ty - y,
                alpha: 0, scaleX: 0.2, scaleY: 0.2,
                duration: 380 + Math.random() * 150,
                ease: 'Quad.easeOut',
                onComplete: () => { g.destroy(); done++; if (done === count)
                    cb?.(); },
            });
        }
        // Central burst
        const center = this.scene.add.graphics().setDepth(301);
        center.fillStyle(0xFFFF88, 0.9);
        center.fillCircle(x, y, 10);
        this.scene.tweens.add({ targets: center, alpha: 0, scaleX: 2.8, scaleY: 2.8,
            duration: 320, ease: 'Quad.easeOut', onComplete: () => center.destroy() });
    }
    // ── Ice ───────────────────────────────────────────────────────────────────
    fxIce(x, y, cb) {
        const count = 16;
        const colors = [0x88CCFF, 0xAADDFF, 0xCCEEFF, 0x4499DD, 0xFFFFFF];
        let done = 0;
        this.screenFlash(0x88CCFF, 0.15);
        this.screenShake(2, 120);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = 20 + Math.random() * 12;
            const tx = x + Math.cos(angle) * r;
            const ty = y + Math.sin(angle) * r;
            const col = colors[Math.floor(Math.random() * colors.length)];
            const s = 2 + Math.random() * 2.5;
            const g = this.scene.add.graphics().setDepth(300);
            g.fillStyle(col, 1);
            // Ice shard (diamond shape)
            g.fillTriangle(x, y - s, x - s, y, x + s, y);
            g.fillTriangle(x, y + s, x - s, y, x + s, y);
            this.scene.tweens.add({
                targets: g, x: tx - x, y: ty - y, alpha: 0,
                scaleX: 0, scaleY: 0,
                duration: 420,
                ease: 'Cubic.easeOut',
                onComplete: () => { g.destroy(); done++; if (done === count)
                    cb?.(); },
            });
        }
        // Freeze burst ring
        const ring = this.scene.add.graphics().setDepth(301);
        ring.lineStyle(2, 0xAADDFF, 0.8);
        ring.strokeCircle(x, y, 4);
        this.scene.tweens.add({ targets: ring, scaleX: 3, scaleY: 3, alpha: 0,
            duration: 350, onComplete: () => ring.destroy() });
    }
    // ── Lightning ─────────────────────────────────────────────────────────────
    fxLightning(x, y, cb) {
        this.screenFlash(0xFFFF44, 0.4);
        this.screenShake(5, 200);
        const BOLTS = 3;
        let done = 0;
        for (let b = 0; b < BOLTS; b++) {
            const g = this.scene.add.graphics().setDepth(300);
            const ox = x + Phaser.Math.Between(-6, 6);
            const oy = y - 35 + b * 2;
            g.lineStyle(b === 0 ? 2 : 1, b === 0 ? 0xFFFFAA : 0xCCFFFF, 1);
            g.beginPath();
            let cy = oy;
            let cx = ox;
            g.moveTo(cx, cy);
            while (cy < y + 4) {
                const ny = cy + Phaser.Math.Between(4, 8);
                const nx = cx + Phaser.Math.Between(-5, 5);
                g.lineTo(nx, ny);
                cx = nx;
                cy = ny;
            }
            g.strokePath();
            this.scene.tweens.add({
                targets: g, alpha: 0,
                duration: 200, delay: b * 60,
                onComplete: () => { g.destroy(); done++; if (done === BOLTS)
                    cb?.(); },
            });
        }
        // Impact at target
        const flash = this.scene.add.graphics().setDepth(302);
        flash.fillStyle(0xFFFFBB, 0.9);
        flash.fillCircle(x, y, 7);
        this.scene.tweens.add({ targets: flash, alpha: 0, scaleX: 3.5, scaleY: 3.5,
            duration: 280, onComplete: () => flash.destroy() });
        // Star burst
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const len = 12;
            const eg = this.scene.add.graphics().setDepth(301);
            eg.lineStyle(1, 0xFFFF88, 1);
            eg.lineBetween(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len);
            this.scene.tweens.add({ targets: eg, alpha: 0, duration: 300,
                onComplete: () => eg.destroy() });
        }
    }
    // ── Heal ──────────────────────────────────────────────────────────────────
    fxHeal(x, y, cb) {
        const count = 14;
        const colors = [0x44FF88, 0x88FFCC, 0xCCFFAA, 0xFFFFBB, 0xBBFFBB];
        let done = 0;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
            const r = 16 + Math.random() * 10;
            const tx = x + Math.cos(angle) * r;
            const ty = y + Math.sin(angle) * r;
            const col = colors[Math.floor(Math.random() * colors.length)];
            const sz = 1 + Math.random() * 2;
            const g = this.scene.add.graphics().setDepth(300);
            g.fillStyle(col, 1);
            g.fillCircle(x, y, sz);
            this.scene.tweens.add({
                targets: g, x: tx - x, y: ty - y - 12,
                alpha: 0, scaleX: 0.5, scaleY: 0.5,
                duration: 550,
                ease: 'Quad.easeOut',
                onComplete: () => { g.destroy(); done++; if (done === count)
                    cb?.(); },
            });
        }
        // Healing cross
        const plus = this.scene.add.text(x, y - 8, '+', {
            fontSize: '16px', fontFamily: 'monospace', color: '#88FF88',
            stroke: '#002200', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(301);
        this.scene.tweens.add({ targets: plus, y: y - 26, alpha: 0, duration: 700,
            ease: 'Quad.easeOut', onComplete: () => plus.destroy() });
    }
    // ── Fire Sword (dual tech) ────────────────────────────────────────────────
    fxFireSword(x, y, cb) {
        this.screenFlash(0xFF4400, 0.45);
        this.screenShake(4, 180);
        this.fxSlash(x, y);
        this.scene.time.delayedCall(100, () => this.fxFire(x, y, cb));
    }
    // ── Ice Tackle (dual tech) ────────────────────────────────────────────────
    fxIceTackle(x, y, cb) {
        this.screenFlash(0x44AAFF, 0.45);
        this.screenShake(4, 180);
        this.fxSlash(x, y);
        this.scene.time.delayedCall(100, () => this.fxIce(x, y, cb));
    }
    // ── Crystal (wraith attack) ────────────────────────────────────────────────
    fxCrystal(x, y, cb) {
        this.screenFlash(0x8844FF, 0.35);
        this.screenShake(3, 160);
        const count = 12;
        let done = 0;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = 20 + Math.random() * 10;
            const g = this.scene.add.graphics().setDepth(300);
            g.fillStyle(0xAABBFF, 1);
            g.fillCircle(x, y, 2 + Math.random());
            this.scene.tweens.add({
                targets: g,
                x: Math.cos(angle) * r,
                y: Math.sin(angle) * r,
                alpha: 0,
                duration: 480,
                ease: 'Cubic.easeOut',
                onComplete: () => { g.destroy(); done++; if (done === count)
                    cb?.(); },
            });
        }
    }
    // ── Default ───────────────────────────────────────────────────────────────
    fxDefault(x, y, cb) {
        const g = this.scene.add.graphics().setDepth(300);
        g.fillStyle(0xFFFFFF, 0.9);
        g.fillCircle(x, y, 5);
        this.scene.tweens.add({ targets: g, alpha: 0, scaleX: 2.5, scaleY: 2.5,
            duration: 260, onComplete: () => { g.destroy(); cb?.(); } });
    }
    // ── Damage numbers ────────────────────────────────────────────────────────
    showDamageNumber(x, y, value, element, isHeal = false) {
        const colors = {
            physical: '#FFFFFF',
            fire: '#FF8800',
            ice: '#88DDFF',
            lightning: '#FFFF44',
            heal: '#88FF88',
            default: '#DDDDDD',
        };
        const col = isHeal ? '#88FF88' : (colors[element] ?? colors.default);
        const sign = isHeal ? '+' : '';
        const size = value >= 100 ? '10px' : '8px';
        const txt = this.scene.add.text(x, y, `${sign}${value}`, {
            fontSize: size,
            fontFamily: 'monospace',
            color: col,
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(350);
        this.scene.tweens.add({
            targets: txt,
            y: y - 22,
            alpha: 0,
            duration: 950,
            ease: 'Quad.easeOut',
            onComplete: () => txt.destroy(),
        });
    }
    // ── Screen flash ──────────────────────────────────────────────────────────
    screenFlash(color, _alpha) {
        const cam = this.scene.cameras.main;
        cam.flash(130, (color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF, false);
    }
    // ── Camera shake ──────────────────────────────────────────────────────────
    screenShake(intensity = 3, duration = 150) {
        this.scene.cameras.main.shake(duration, intensity / 100);
    }
}
