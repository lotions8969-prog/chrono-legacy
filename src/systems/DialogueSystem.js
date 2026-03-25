import Phaser from 'phaser';
import { CANVAS } from '../data/constants';
const W = CANVAS.WIDTH;
const H = CANVAS.HEIGHT;
// ── DialogueSystem ─────────────────────────────────────────────────────────────
// Full-screen dialogue overlay with character portrait, name plate, and
// typewriter-effect text. Driven by keyboard (Z to advance / close).
//
// Chrono Trigger-style layout:
//   ╔════════════════════════════════════════════════════════╗
//   ║  ┌──────────┐  ╔══════════════╗                       ║
//   ║  │ Portrait │  ║  NAME PLATE  ║                       ║
//   ║  └──────────┘  ╚══════════════╝                       ║
//   ║                Text text text text...                  ║
//   ║                                                  ▼    ║
//   ╚════════════════════════════════════════════════════════╝
const BOX_MARGIN = 4;
const BOX_W = W - BOX_MARGIN * 2;
const BOX_H = 82;
const BOX_Y = H - BOX_H - BOX_MARGIN;
const PORT_SIZE = 46; // portrait display area
const TEXT_X = PORT_SIZE + 12;
const TEXT_W = BOX_W - TEXT_X - 6;
// Typewriter delay (ms per char); punctuation adds extra pause
const BASE_DELAY = 24;
export class DialogueSystem {
    constructor(scene) {
        this.container = null;
        this.msgText = null;
        this.nameText = null;
        this.indicator = null;
        this.pageCounter = null;
        this.portraitImg = null;
        this.pages = [];
        this.pageIdx = 0;
        this.charIdx = 0;
        this.fullText = '';
        this.typingTimer = null;
        this.typingDone = false;
        this.zKey = null;
        this._active = false;
        this.onClose = null;
        this.scene = scene;
        this.zKey = scene.input.keyboard?.addKey('Z') ?? null;
    }
    // ── Public API ──────────────────────────────────────────────────────────────
    get isActive() { return this._active; }
    show(script, onClose) {
        if (this._active)
            return;
        this._active = true;
        this.onClose = onClose ?? null;
        this.pages = script.pages;
        this.pageIdx = 0;
        this.buildContainer();
        this.showPage(0);
    }
    /** Call every frame from scene update while active. */
    update() {
        if (!this._active)
            return;
        if (!this.zKey)
            return;
        if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
            if (!this.typingDone) {
                this.finishTyping();
            }
            else {
                this.advance();
            }
        }
    }
    destroy() {
        this.stopTyping();
        this.container?.destroy();
        this.container = null;
        this._active = false;
    }
    // ── Container ───────────────────────────────────────────────────────────────
    buildContainer() {
        this.container?.destroy();
        const cont = this.scene.add
            .container(BOX_MARGIN, BOX_Y + BOX_H) // start below screen, slide up
            .setDepth(200)
            .setScrollFactor(0);
        // ── Outer window chrome ─────────────────────────────────────────────────
        const bg = this.scene.add.graphics();
        // Main background: deep midnight blue
        bg.fillStyle(0x060418, 0.95);
        bg.fillRoundedRect(0, 0, BOX_W, BOX_H, 4);
        // Outer gold border
        bg.lineStyle(2, 0xCCA820, 1);
        bg.strokeRoundedRect(0, 0, BOX_W, BOX_H, 4);
        // Inner subtle border
        bg.lineStyle(1, 0x664400, 0.6);
        bg.strokeRoundedRect(2, 2, BOX_W - 4, BOX_H - 4, 3);
        // Corner accent marks (CT-style diamond corners)
        const cSize = 4;
        const cornerColor = 0xFFD060;
        bg.fillStyle(cornerColor, 0.9);
        // TL
        bg.fillTriangle(1, 1, 1 + cSize, 1, 1, 1 + cSize);
        // TR
        bg.fillTriangle(BOX_W - 1, 1, BOX_W - 1 - cSize, 1, BOX_W - 1, 1 + cSize);
        // BL
        bg.fillTriangle(1, BOX_H - 1, 1 + cSize, BOX_H - 1, 1, BOX_H - 1 - cSize);
        // BR
        bg.fillTriangle(BOX_W - 1, BOX_H - 1, BOX_W - 1 - cSize, BOX_H - 1, BOX_W - 1, BOX_H - 1 - cSize);
        cont.add(bg);
        // ── Portrait area ────────────────────────────────────────────────────────
        const portBg = this.scene.add.graphics();
        portBg.fillStyle(0x120830, 1);
        portBg.fillRoundedRect(5, 5, PORT_SIZE, PORT_SIZE, 2);
        portBg.lineStyle(1, 0xCCA820, 0.9);
        portBg.strokeRoundedRect(5, 5, PORT_SIZE, PORT_SIZE, 2);
        // Inner glow
        portBg.lineStyle(1, 0xFFE080, 0.3);
        portBg.strokeRoundedRect(7, 7, PORT_SIZE - 4, PORT_SIZE - 4, 1);
        cont.add(portBg);
        // ── Vertical separator line ──────────────────────────────────────────────
        const sep = this.scene.add.graphics();
        sep.lineStyle(1, 0x443366, 0.8);
        sep.lineBetween(PORT_SIZE + 8, 4, PORT_SIZE + 8, BOX_H - 4);
        cont.add(sep);
        // ── Name plate ───────────────────────────────────────────────────────────
        const nameBg = this.scene.add.graphics();
        nameBg.fillStyle(0x1A0840, 0.95);
        nameBg.fillRoundedRect(TEXT_X, 5, 90, 14, 2);
        nameBg.lineStyle(1, 0xCCA820, 0.8);
        nameBg.strokeRoundedRect(TEXT_X, 5, 90, 14, 2);
        cont.add(nameBg);
        // Name text (created later in showPage)
        this.nameText = this.scene.add.text(TEXT_X + 5, 8, '', {
            fontSize: '8px',
            fontFamily: 'monospace',
            color: '#FFD060',
        });
        cont.add(this.nameText);
        // ── Message text ─────────────────────────────────────────────────────────
        this.msgText = this.scene.add.text(TEXT_X, 24, '', {
            fontSize: '7px',
            fontFamily: 'monospace',
            color: '#E8E4FF',
            wordWrap: { width: TEXT_W, useAdvancedWrap: true },
            lineSpacing: 3,
        });
        cont.add(this.msgText);
        // ── Advance indicator ────────────────────────────────────────────────────
        this.indicator = this.scene.add.text(BOX_W - 7, BOX_H - 8, '▼', {
            fontSize: '6px',
            fontFamily: 'monospace',
            color: '#CCA820',
        }).setOrigin(1, 1);
        cont.add(this.indicator);
        this.scene.tweens.add({
            targets: this.indicator,
            alpha: 0,
            duration: 480,
            yoyo: true,
            repeat: -1,
            ease: 'Stepped',
            easeParams: [1],
        });
        this.indicator.setVisible(false);
        // ── Page counter ─────────────────────────────────────────────────────────
        this.pageCounter = this.scene.add.text(BOX_W - 8, 6, '', {
            fontSize: '5px',
            fontFamily: 'monospace',
            color: '#886644',
        }).setOrigin(1, 0);
        cont.add(this.pageCounter);
        this.container = cont;
        // Slide-in animation
        this.scene.tweens.add({
            targets: cont,
            y: BOX_Y,
            duration: 220,
            ease: 'Back.easeOut',
        });
    }
    // ── Page display ─────────────────────────────────────────────────────────────
    showPage(idx) {
        if (!this.container || idx >= this.pages.length) {
            this.close();
            return;
        }
        const page = this.pages[idx];
        // Remove previous portrait
        if (this.portraitImg) {
            this.container.remove(this.portraitImg, true);
            this.portraitImg = null;
        }
        // Portrait image
        const texKey = page.portrait;
        if (this.scene.textures.exists(texKey)) {
            const img = this.scene.add.image(5 + PORT_SIZE / 2, 5 + PORT_SIZE / 2, texKey).setOrigin(0.5, 0.5);
            // Scale portrait to fit the area
            img.setDisplaySize(PORT_SIZE - 4, PORT_SIZE - 4);
            this.portraitImg = img;
            this.container.add(img);
        }
        else {
            const g = this.scene.add.graphics();
            g.fillStyle(0x2A1050, 1);
            g.fillRoundedRect(7, 7, PORT_SIZE - 4, PORT_SIZE - 4, 2);
            this.portraitImg = g;
            this.container.add(g);
        }
        // Update name
        if (this.nameText)
            this.nameText.setText(page.name);
        // Page counter
        if (this.pageCounter) {
            this.pageCounter.setText(`${idx + 1}/${this.pages.length}`);
        }
        // Start typewriter
        this.fullText = page.text;
        this.charIdx = 0;
        this.typingDone = false;
        this.indicator?.setVisible(false);
        if (this.msgText)
            this.msgText.setText('');
        this.stopTyping();
        this.scheduleNextChar();
    }
    // ── Typewriter with punctuation pauses ───────────────────────────────────────
    scheduleNextChar() {
        if (this.charIdx >= this.fullText.length) {
            this.typingDone = true;
            this.indicator?.setVisible(true);
            return;
        }
        const ch = this.fullText[this.charIdx];
        const delay = this.charDelay(ch);
        this.typingTimer = this.scene.time.delayedCall(delay, () => {
            this.charIdx++;
            if (this.msgText)
                this.msgText.setText(this.fullText.slice(0, this.charIdx));
            this.scheduleNextChar();
        });
    }
    charDelay(ch) {
        if (ch === '.' || ch === '!' || ch === '?')
            return BASE_DELAY * 5;
        if (ch === ',' || ch === ';')
            return BASE_DELAY * 2.5;
        if (ch === ' ')
            return BASE_DELAY * 0.5;
        if (ch === '\n')
            return BASE_DELAY * 3;
        return BASE_DELAY;
    }
    finishTyping() {
        this.stopTyping();
        if (this.msgText)
            this.msgText.setText(this.fullText);
        this.charIdx = this.fullText.length;
        this.typingDone = true;
        this.indicator?.setVisible(true);
    }
    stopTyping() {
        if (this.typingTimer) {
            this.typingTimer.remove(false);
            this.typingTimer = null;
        }
    }
    advance() {
        this.pageIdx++;
        if (this.pageIdx < this.pages.length) {
            this.showPage(this.pageIdx);
        }
        else {
            // Slide out before closing
            if (this.container) {
                this.scene.tweens.add({
                    targets: this.container,
                    y: BOX_Y + BOX_H + 4,
                    duration: 180,
                    ease: 'Back.easeIn',
                    onComplete: () => this.close(),
                });
            }
            else {
                this.close();
            }
        }
    }
    close() {
        this.stopTyping();
        this.container?.destroy();
        this.container = null;
        this._active = false;
        this.onClose?.();
    }
}
