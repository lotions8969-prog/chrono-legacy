import Phaser from 'phaser';
import { SCENE, CANVAS } from '../data/constants';
import { AudioManager } from '../systems/AudioManager';
const W = CANVAS.WIDTH;
const H = CANVAS.HEIGHT;
// ── Title ─────────────────────────────────────────────────────────────────────
// Cinematic JRPG title screen with:
//   • Layered parallax star-field and nebula
//   • Animated silhouette characters walking in foreground
//   • Glowing CHRONO LEGACY logo with animated underline rune
//   • SNES-chiptune title music (starts on first keypress)
//   • Smooth fade-in / fade-out transitions
export class Title extends Phaser.Scene {
    constructor() {
        super({ key: SCENE.TITLE });
        this.audioReady = false;
        this.stars = [];
        this.clouds = [];
        this.silhouettes = [];
        this.runes = [];
        this.elapsed = 0;
        this.audio = new AudioManager();
    }
    create() {
        this.buildBackground();
        this.buildNebula();
        this.buildStars();
        this.buildMountainSilhouette();
        this.buildCharacterSilhouettes();
        this.buildLogo();
        this.buildRuneBorder();
        this.buildPrompt();
        this.buildVersionInfo();
        this.setupInput();
        this.cameras.main.fadeIn(800, 0, 0, 0);
    }
    // ── Background gradient (deep midnight sky) ───────────────────────────────
    buildBackground() {
        const bg = this.add.graphics();
        // Top: deep indigo-black
        bg.fillGradientStyle(0x000014, 0x000014, 0x00001E, 0x00003C, 1);
        bg.fillRect(0, 0, W, H * 0.65);
        // Horizon: purple-blue glow
        bg.fillGradientStyle(0x000830, 0x000830, 0x220840, 0x440828, 1);
        bg.fillRect(0, H * 0.55, W, H * 0.30);
        // Ground silhouette base
        bg.fillStyle(0x040208, 1);
        bg.fillRect(0, H * 0.78, W, H * 0.22);
    }
    // ── Nebula clouds ─────────────────────────────────────────────────────────
    buildNebula() {
        const nebData = [
            [40, 40, 60, 20, 0x1A0840],
            [160, 30, 90, 24, 0x0A2050],
            [220, 50, 50, 16, 0x200840],
            [70, 70, 40, 14, 0x0A1840],
        ];
        nebData.forEach(([x, y, rx, ry, color]) => {
            const g = this.add.graphics();
            g.fillStyle(color, 0.4);
            g.fillEllipse(x, y, rx * 2, ry * 2);
            this.clouds.push(g);
        });
    }
    // ── Stars (3 layers, different speeds for parallax feel) ──────────────────
    buildStars() {
        const layers = [
            { count: 30, size: 1, alpha: [0.2, 0.5], speed: 0.04 },
            { count: 50, size: 1, alpha: [0.4, 0.9], speed: 0.08 },
            { count: 20, size: 2, alpha: [0.6, 1.0], speed: 0.14 },
        ];
        layers.forEach(({ count, size, alpha, speed }) => {
            for (let i = 0; i < count; i++) {
                const x = Phaser.Math.Between(0, W);
                const y = Phaser.Math.Between(0, Math.floor(H * 0.78));
                const a = Phaser.Math.FloatBetween(alpha[0], alpha[1]);
                const s = this.add.rectangle(x, y, size, size, 0xffffff, a);
                this.stars.push({ gfx: s, speed });
                // Twinkle animation with random phase
                this.tweens.add({
                    targets: s,
                    alpha: 0,
                    duration: Phaser.Math.Between(800, 2400),
                    delay: Phaser.Math.Between(0, 2000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                });
            }
        });
    }
    // ── Mountain silhouette in foreground ─────────────────────────────────────
    buildMountainSilhouette() {
        const g = this.add.graphics();
        // Back mountains (lighter)
        g.fillStyle(0x0A0818, 1);
        g.fillTriangle(0, H * 0.78, 40, H * 0.54, 80, H * 0.78);
        g.fillTriangle(40, H * 0.78, 90, H * 0.48, 140, H * 0.78);
        g.fillTriangle(100, H * 0.78, 160, H * 0.44, 220, H * 0.78);
        g.fillTriangle(170, H * 0.78, 220, H * 0.50, 256, H * 0.78);
        g.fillRect(0, Math.floor(H * 0.78), W, H);
        // Front hill layer (slightly darker)
        g.fillStyle(0x070512, 1);
        const hillY = H * 0.84;
        g.fillEllipse(W * 0.15, hillY, 90, 30);
        g.fillEllipse(W * 0.55, hillY + 2, 120, 28);
        g.fillEllipse(W * 0.85, hillY, 80, 26);
        g.fillRect(0, Math.floor(hillY), W, H);
        // Horizon glow line
        g.lineStyle(1, 0x4400AA, 0.4);
        g.lineBetween(0, H * 0.78, W, H * 0.78);
        g.lineStyle(1, 0x220066, 0.25);
        g.lineBetween(0, H * 0.79, W, H * 0.79);
    }
    // ── Silhouette characters walking across the horizon ─────────────────────
    buildCharacterSilhouettes() {
        const configs = [
            { x: -20, y: H * 0.76, size: 8, speed: 12 },
            { x: W + 15, y: H * 0.75, size: 10, speed: -14 },
        ];
        configs.forEach(({ x, y, size, speed }) => {
            const g = this.add.graphics();
            this.drawPersonSilhouette(g, 0, 0, size);
            g.setPosition(x, y);
            this.silhouettes.push({ obj: g, vx: speed, y, phase: Math.random() * Math.PI * 2 });
        });
    }
    drawPersonSilhouette(g, ox, oy, s) {
        const col = 0x000008;
        g.fillStyle(col, 1);
        g.fillCircle(ox, oy - s * 1.5, s * 0.5); // head
        g.fillRect(ox - s * 0.4, oy - s, s * 0.8, s * 1.1); // torso
        g.fillRect(ox - s * 0.5, oy + s * 0.1, s * 0.25, s * 0.9); // left leg
        g.fillRect(ox + s * 0.25, oy + s * 0.1, s * 0.25, s * 0.9); // right leg
        g.fillRect(ox - s * 0.8, oy - s * 0.8, s * 0.25, s * 0.7); // left arm
        g.fillRect(ox + s * 0.55, oy - s * 0.8, s * 0.25, s * 0.7); // right arm
    }
    // ── Logo ─────────────────────────────────────────────────────────────────
    buildLogo() {
        const cy = H * 0.30;
        // Shadow glow effect (layered text)
        for (let i = 4; i >= 1; i--) {
            this.add.text(W / 2 + i * 0.5, cy + i * 0.5, 'CHRONO', {
                fontSize: '28px',
                fontFamily: 'monospace',
                color: '#440022',
            }).setOrigin(0.5).setAlpha(0.3 / i);
        }
        const titleTop = this.add.text(W / 2, cy, 'CHRONO', {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#FFE080',
            stroke: '#884400',
            strokeThickness: 3,
            shadow: { offsetX: 1, offsetY: 2, color: '#000', blur: 0, fill: true },
        }).setOrigin(0.5);
        // Bottom subtitle
        const titleBot = this.add.text(W / 2, cy + 30, 'LEGACY', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#88DDFF',
            stroke: '#003366',
            strokeThickness: 2,
        }).setOrigin(0.5);
        // Decorative divider line
        const rule = this.add.graphics();
        rule.lineStyle(1, 0x6699CC, 0.8);
        rule.lineBetween(W * 0.15, cy + 52, W * 0.85, cy + 52);
        rule.lineStyle(1, 0x334466, 0.5);
        rule.lineBetween(W * 0.15, cy + 54, W * 0.85, cy + 54);
        // Subtitle tagline
        this.add.text(W / 2, cy + 60, '— A Chronicle of Lost Ages —', {
            fontSize: '6px',
            fontFamily: 'monospace',
            color: '#8899CC',
        }).setOrigin(0.5);
        // Breathe animation
        this.tweens.add({
            targets: [titleTop, titleBot],
            scaleX: 1.012,
            scaleY: 1.012,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        // Glow pulse on CHRONO text
        this.tweens.add({
            targets: titleTop,
            alpha: 0.85,
            duration: 2600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        rule; // suppress unused
    }
    // ── Rune border decoration ────────────────────────────────────────────────
    buildRuneBorder() {
        const runes = ['⊕', '◈', '⊗', '◉', '⊙'];
        const y = H * 0.30 + 68;
        for (let i = 0; i < 5; i++) {
            const x = W * 0.2 + i * (W * 0.6 / 4);
            const r = this.add.text(x, y, runes[i % runes.length], {
                fontSize: '8px', fontFamily: 'monospace', color: '#334466',
            }).setOrigin(0.5);
            this.runes.push(r);
            this.tweens.add({
                targets: r,
                color: '#6688AA',
                alpha: 0.3,
                duration: 1000 + i * 200,
                delay: i * 160,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        }
    }
    // ── Press Start prompt ────────────────────────────────────────────────────
    buildPrompt() {
        const prompt = this.add.text(W / 2, H * 0.82, '◆  Press  Z  to  Begin  ◆', {
            fontSize: '7px',
            fontFamily: 'monospace',
            color: '#CCBBEE',
            stroke: '#110022',
            strokeThickness: 1,
        }).setOrigin(0.5);
        this.tweens.add({
            targets: prompt,
            alpha: 0,
            duration: 620,
            yoyo: true,
            repeat: -1,
            ease: 'Stepped',
            easeParams: [1],
        });
    }
    // ── Version label ─────────────────────────────────────────────────────────
    buildVersionInfo() {
        this.add.text(W / 2, H - 7, '◇ Chrono Legacy  v2.0 ◇', {
            fontSize: '5px',
            fontFamily: 'monospace',
            color: '#223344',
        }).setOrigin(0.5);
    }
    // ── Input ────────────────────────────────────────────────────────────────
    setupInput() {
        this.input.keyboard.once('keydown-Z', () => {
            if (!this.audioReady) {
                this.audio.init();
                this.audio.play('title');
                this.audioReady = true;
            }
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(SCENE.WORLD, { audio: this.audio });
            });
        });
        // Also support Enter and Space
        ['ENTER', 'SPACE'].forEach(key => {
            this.input.keyboard.once(`keydown-${key}`, () => {
                this.input.keyboard.emit('keydown-Z');
            });
        });
        // Any key starts music without advancing
        this.input.keyboard.on('keydown', () => {
            if (!this.audioReady) {
                this.audio.init();
                this.audio.play('title');
                this.audioReady = true;
            }
        });
    }
    // ── Update ────────────────────────────────────────────────────────────────
    update(_time, delta) {
        this.elapsed += delta;
        const t = this.elapsed / 1000;
        // Drift silhouettes across the screen
        this.silhouettes.forEach(s => {
            s.obj.x += s.vx * (delta / 1000);
            // Bob up/down like walking
            s.obj.y = s.y + Math.sin(t * 2.5 + s.phase) * 0.6;
            // Wrap around screen
            if (s.vx > 0 && s.obj.x > W + 30)
                s.obj.x = -30;
            if (s.vx < 0 && s.obj.x < -30)
                s.obj.x = W + 30;
        });
        // Slowly scroll nebula
        this.clouds.forEach((c, i) => {
            c.x += Math.sin(t * 0.08 + i) * 0.012;
        });
    }
}
