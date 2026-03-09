import Phaser from 'phaser';
import { SCENE, CANVAS } from '../data/constants';
// ── Title ─────────────────────────────────────────────────────────────────────
// Retro JRPG title screen.
// Press Z (or tap) to fade into the World scene.
export class Title extends Phaser.Scene {
    constructor() { super({ key: SCENE.TITLE }); }
    create() {
        const { WIDTH: W, HEIGHT: H } = CANVAS;
        // ── Background gradient ──────────────────────────────────────────────────
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x000014, 0x000014, 0x00001e, 0x00003c, 1);
        bg.fillRect(0, 0, W, H);
        // ── Stars ────────────────────────────────────────────────────────────────
        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(0, W);
            const y = Phaser.Math.Between(0, H * 0.82);
            const sz = Math.random() < 0.15 ? 2 : 1;
            const alpha = Phaser.Math.FloatBetween(0.25, 1.0);
            this.add.rectangle(x, y, sz, sz, 0xffffff, alpha);
        }
        // ── Horizon glow ────────────────────────────────────────────────────────
        const glow = this.add.graphics();
        glow.fillGradientStyle(0x000050, 0x000050, 0x1a0050, 0x1a0050, 0);
        glow.fillRect(0, H * 0.55, W, H * 0.45);
        // ── Title logo ───────────────────────────────────────────────────────────
        const titleTop = this.add.text(W / 2, H * 0.30, 'CHRONO', {
            fontSize: '26px',
            fontFamily: 'monospace',
            color: '#ffe080',
            stroke: '#996600',
            strokeThickness: 4,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true },
        }).setOrigin(0.5);
        const titleBot = this.add.text(W / 2, H * 0.30 + 28, 'LEGACY', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#80ccff',
            stroke: '#004488',
            strokeThickness: 3,
        }).setOrigin(0.5);
        // ── Sub-title rule ───────────────────────────────────────────────────────
        const rule = this.add.graphics();
        rule.lineStyle(1, 0x4488cc, 0.6);
        rule.lineBetween(W * 0.2, H * 0.30 + 48, W * 0.8, H * 0.30 + 48);
        this.add.text(W / 2, H * 0.30 + 56, '~ A Short Chronicle ~', {
            fontSize: '6px',
            fontFamily: 'monospace',
            color: '#8899cc',
        }).setOrigin(0.5);
        // ── Press Z prompt (blinking) ────────────────────────────────────────────
        const prompt = this.add.text(W / 2, H * 0.78, 'Press  Z  to  Start', {
            fontSize: '8px',
            fontFamily: 'monospace',
            color: '#ccccdd',
        }).setOrigin(0.5);
        this.tweens.add({
            targets: prompt,
            alpha: 0,
            duration: 550,
            yoyo: true,
            repeat: -1,
            ease: 'Stepped',
            easeParams: [1],
        });
        // ── Logo breathe animation ───────────────────────────────────────────────
        this.tweens.add({
            targets: [titleTop, titleBot],
            scaleX: 1.015,
            scaleY: 1.015,
            duration: 1400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        // ── Version / build info ─────────────────────────────────────────────────
        this.add.text(W / 2, H - 9, 'Phase 1  ·  Foundation Build', {
            fontSize: '6px',
            fontFamily: 'monospace',
            color: '#334466',
        }).setOrigin(0.5);
        // ── Start on Z ───────────────────────────────────────────────────────────
        this.input.keyboard.once('keydown-Z', () => {
            rule;
            titleBot; // suppress unused warning
            this.cameras.main.fadeOut(350, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(SCENE.WORLD);
            });
        });
        this.cameras.main.fadeIn(400, 0, 0, 0);
    }
}
