import Phaser from 'phaser';
import { CANVAS } from '../data/constants';
const W = CANVAS.WIDTH;
const H = CANVAS.HEIGHT;
// ── DialogueSystem ─────────────────────────────────────────────────────────────
// Full-screen dialogue overlay with character portrait, name plate, and
// typewriter-effect text. Driven by keyboard (Z to advance / close).
//
// Design matches classic Chrono Trigger dialogue boxes:
//   ┌──────────────────────────────────────────────────────────┐
//   │ [Portrait] NAME                                         │
//   │            Text text text text text text …             │
//   │                                              ▼ press Z  │
//   └──────────────────────────────────────────────────────────┘
export class DialogueSystem {
    constructor(scene) {
        this.container = null;
        this.msgText = null;
        this.indicator = null;
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
        // Use Phaser's JustDown to avoid repeated triggers
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
        const boxX = 4;
        const boxY = H - 72;
        const boxW = W - 8;
        const boxH = 68;
        const cont = this.scene.add.container(boxX, boxY).setDepth(200).setScrollFactor(0);
        // Dark background + golden border
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x08061A, 0.92);
        bg.fillRect(0, 0, boxW, boxH);
        bg.lineStyle(1, 0xCCA820, 1);
        bg.strokeRect(0, 0, boxW, boxH);
        bg.lineStyle(1, 0x664400, 0.5);
        bg.strokeRect(1, 1, boxW - 2, boxH - 2);
        cont.add(bg);
        // Portrait placeholder + portrait sprite
        const portBg = this.scene.add.graphics();
        portBg.fillStyle(0x1A1040, 1);
        portBg.fillRect(4, 4, 38, 38);
        portBg.lineStyle(1, 0xCCA820, 0.8);
        portBg.strokeRect(4, 4, 38, 38);
        cont.add(portBg);
        // The actual portrait image (created in showPage)
        cont.setName('dialogue-box');
        // Name plate
        const nameBg = this.scene.add.graphics();
        nameBg.fillStyle(0x1A0835, 0.95);
        nameBg.fillRect(46, 4, 80, 12);
        nameBg.lineStyle(1, 0xCCA820, 0.7);
        nameBg.strokeRect(46, 4, 80, 12);
        cont.add(nameBg);
        // Message text (typewriter)
        this.msgText = this.scene.add.text(48, 18, '', {
            fontSize: '7px',
            fontFamily: 'monospace',
            color: '#E8E4FF',
            wordWrap: { width: boxW - 54, useAdvancedWrap: true },
            lineSpacing: 2,
        });
        cont.add(this.msgText);
        // Advance indicator
        this.indicator = this.scene.add.text(boxW - 10, boxH - 10, '▼', {
            fontSize: '7px',
            fontFamily: 'monospace',
            color: '#CCA820',
        }).setOrigin(1, 1);
        cont.add(this.indicator);
        this.scene.tweens.add({
            targets: this.indicator,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Stepped',
            easeParams: [1],
        });
        this.indicator.setVisible(false);
        this.container = cont;
    }
    // ── Page display ─────────────────────────────────────────────────────────────
    showPage(idx) {
        if (!this.container || idx >= this.pages.length) {
            this.close();
            return;
        }
        const page = this.pages[idx];
        // Clear old portrait/name objects added in previous page
        this.container.getAll().forEach(obj => {
            if (obj.name === 'portrait-img' || obj.name === 'name-text')
                obj.destroy();
        });
        // Portrait image
        const texKey = page.portrait;
        if (this.scene.textures.exists(texKey)) {
            const img = this.scene.add.image(23, 23, texKey).setOrigin(0.5, 0.5);
            img.setName('portrait-img');
            this.container.add(img);
        }
        else {
            // Fallback: colored square
            const g = this.scene.add.graphics();
            g.fillStyle(0x443366, 1);
            g.fillRect(6, 6, 34, 34);
            g.name = 'portrait-img';
            this.container.add(g);
        }
        // Name text
        const boxW = W - 8;
        const nameText = this.scene.add.text(50, 6, page.name, {
            fontSize: '6px',
            fontFamily: 'monospace',
            color: '#FFD070',
        });
        nameText.setName('name-text');
        this.container.add(nameText);
        nameText;
        boxW; // suppress unused
        // Start typewriter
        this.fullText = page.text;
        this.charIdx = 0;
        this.typingDone = false;
        this.indicator?.setVisible(false);
        if (this.msgText)
            this.msgText.setText('');
        this.stopTyping();
        this.typingTimer = this.scene.time.addEvent({
            delay: 28,
            callback: this.typeNextChar,
            callbackScope: this,
            repeat: this.fullText.length - 1,
        });
    }
    typeNextChar() {
        if (!this.msgText)
            return;
        this.charIdx++;
        this.msgText.setText(this.fullText.slice(0, this.charIdx));
        if (this.charIdx >= this.fullText.length) {
            this.typingDone = true;
            this.indicator?.setVisible(true);
        }
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
            this.close();
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
