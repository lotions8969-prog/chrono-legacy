import Phaser from 'phaser';
import { CANVAS } from '../data/constants';
const W = CANVAS.WIDTH;
const H = CANVAS.HEIGHT;
// ── Window drawing helper ──────────────────────────────────────────────────────
function drawWindow(g, x, y, w, h, opts = {}) {
    const { alpha = 0.92, borderColor = 0xCCA820, innerColor = 0x040214 } = opts;
    // Outer fill
    g.fillStyle(innerColor, alpha);
    g.fillRoundedRect(x, y, w, h, 3);
    // Double border (CT style)
    g.lineStyle(1, borderColor, 0.9);
    g.strokeRoundedRect(x, y, w, h, 3);
    g.lineStyle(1, borderColor, 0.35);
    g.strokeRoundedRect(x + 1, y + 1, w - 2, h - 2, 2);
    // Corner accents
    g.fillStyle(borderColor, 0.8);
    g.fillRect(x, y, 3, 1);
    g.fillRect(x, y, 1, 3);
    g.fillRect(x + w - 3, y, 3, 1);
    g.fillRect(x + w - 1, y, 1, 3);
    g.fillRect(x, y + h - 1, 3, 1);
    g.fillRect(x, y + h - 3, 1, 3);
    g.fillRect(x + w - 3, y + h - 1, 3, 1);
    g.fillRect(x + w - 1, y + h - 3, 1, 3);
}
// ── BattleUI ──────────────────────────────────────────────────────────────────
export class BattleUI {
    constructor(scene) {
        // Status panel
        this.panel = null;
        this.hpBars = [];
        this.mpBars = [];
        this.atbBars = [];
        this.nameTexts = [];
        this.hpTexts = [];
        this.mpTexts = [];
        this.levelTexts = [];
        this.atbReadyDots = [];
        // Command menu
        this.commandContainer = null;
        this.onChoice = null;
        this.cursor = 0;
        this.menuItems = [];
        this.menuTexts = [];
        this.cursSprite = null;
        this.scene = scene;
        const kb = scene.input.keyboard;
        const K = Phaser.Input.Keyboard.KeyCodes;
        this.keys = {
            up: kb.addKey(K.UP),
            down: kb.addKey(K.DOWN),
            z: kb.addKey(K.Z),
            x: kb.addKey(K.X),
        };
    }
    // ── Status Panel ────────────────────────────────────────────────────────────
    buildStatusPanel(playerUnits) {
        const PH = 52;
        const c = this.scene.add.container(0, H - PH).setScrollFactor(0).setDepth(80);
        const bg = this.scene.add.graphics();
        // Dark gradient background
        bg.fillGradientStyle(0x040214, 0x040214, 0x080428, 0x080428, 0.95);
        bg.fillRect(0, 0, W, PH);
        // Gold top border
        bg.lineStyle(1, 0xCCA820, 0.9);
        bg.lineBetween(0, 0, W, 0);
        bg.lineStyle(1, 0xCCA820, 0.3);
        bg.lineBetween(0, 1, W, 1);
        c.add(bg);
        // Divider line between units
        if (playerUnits.length > 1) {
            const div = this.scene.add.graphics();
            div.lineStyle(1, 0x3A3060, 0.7);
            div.lineBetween(W / 2, 4, W / 2, PH - 4);
            c.add(div);
        }
        this.hpBars = [];
        this.mpBars = [];
        this.atbBars = [];
        this.nameTexts = [];
        this.hpTexts = [];
        this.mpTexts = [];
        this.levelTexts = [];
        this.atbReadyDots = [];
        playerUnits.forEach((u, i) => {
            const ox = 4 + i * (W / 2);
            const panelW = W / 2 - 8;
            // Portrait box (small, 18×18)
            const portBg = this.scene.add.graphics();
            portBg.fillStyle(0x1A1040, 1);
            portBg.fillRect(ox, 4, 18, 18);
            portBg.lineStyle(1, 0x6644AA, 0.8);
            portBg.strokeRect(ox, 4, 18, 18);
            c.add(portBg);
            // Portrait image
            const portraitKey = u.id === 'hero' ? 'portrait_hero' : 'portrait_ally';
            if (this.scene.textures.exists(portraitKey)) {
                const img = this.scene.add.image(ox + 9, 13, portraitKey)
                    .setOrigin(0.5, 0.5)
                    .setDisplaySize(16, 16);
                c.add(img);
            }
            // Name
            const nameT = this.scene.add.text(ox + 22, 4, u.name, {
                fontSize: '6px', fontFamily: 'monospace', color: '#C8D8FF',
            });
            c.add(nameT);
            this.nameTexts.push(nameT);
            // Level text
            const lvT = this.scene.add.text(ox + panelW - 2, 4, 'Lv1', {
                fontSize: '5px', fontFamily: 'monospace', color: '#AABB88',
            }).setOrigin(1, 0);
            c.add(lvT);
            this.levelTexts.push(lvT);
            // HP label + bar + text
            c.add(this.scene.add.text(ox + 22, 13, 'HP', {
                fontSize: '5px', fontFamily: 'monospace', color: '#FF8888',
            }));
            const hpBg = this.scene.add.graphics();
            hpBg.fillStyle(0x1A0808);
            hpBg.fillRoundedRect(ox + 32, 14, 60, 5, 1);
            hpBg.lineStyle(1, 0x442222, 0.7);
            hpBg.strokeRoundedRect(ox + 32, 14, 60, 5, 1);
            c.add(hpBg);
            const hpFill = this.scene.add.graphics();
            c.add(hpFill);
            this.hpBars.push(hpFill);
            const hpT = this.scene.add.text(ox + 94, 12, `${u.hp}`, {
                fontSize: '5px', fontFamily: 'monospace', color: '#FFAAAA',
            });
            c.add(hpT);
            this.hpTexts.push(hpT);
            // MP label + bar + text
            c.add(this.scene.add.text(ox + 22, 22, 'MP', {
                fontSize: '5px', fontFamily: 'monospace', color: '#8888FF',
            }));
            const mpBg = this.scene.add.graphics();
            mpBg.fillStyle(0x080818);
            mpBg.fillRoundedRect(ox + 32, 23, 60, 5, 1);
            mpBg.lineStyle(1, 0x222244, 0.7);
            mpBg.strokeRoundedRect(ox + 32, 23, 60, 5, 1);
            c.add(mpBg);
            const mpFill = this.scene.add.graphics();
            c.add(mpFill);
            this.mpBars.push(mpFill);
            const mpT = this.scene.add.text(ox + 94, 21, `${u.mp}`, {
                fontSize: '5px', fontFamily: 'monospace', color: '#AAAAFF',
            });
            c.add(mpT);
            this.mpTexts.push(mpT);
            // ATB label + bar
            c.add(this.scene.add.text(ox + 22, 31, 'AT', {
                fontSize: '5px', fontFamily: 'monospace', color: '#AADDFF',
            }));
            const atbBg = this.scene.add.graphics();
            atbBg.fillStyle(0x080810);
            atbBg.fillRoundedRect(ox + 32, 32, 60, 5, 1);
            atbBg.lineStyle(1, 0x223344, 0.7);
            atbBg.strokeRoundedRect(ox + 32, 32, 60, 5, 1);
            c.add(atbBg);
            const atbFill = this.scene.add.graphics();
            c.add(atbFill);
            this.atbBars.push(atbFill);
            // ATB ready indicator dot
            const rdot = this.scene.add.graphics();
            c.add(rdot);
            this.atbReadyDots.push(rdot);
            // Status row (READY / status effects area)
            c.add(this.scene.add.text(ox + 22, 40, '', {
                fontSize: '5px', fontFamily: 'monospace', color: '#FFFF80',
            }));
        });
        this.panel = c;
    }
    updateStatusPanel(playerUnits, levels) {
        if (!this.panel) {
            this.buildStatusPanel(playerUnits);
            return;
        }
        playerUnits.forEach((u, i) => {
            const ox = 4 + i * (W / 2);
            const ready = u.atb >= 100;
            const hpPct = Math.min(1, u.hp / u.maxHp);
            const mpPct = Math.min(1, u.mp / u.maxMp);
            const atbPct = Math.min(1, u.atb / 100);
            // Name color: gold when ready
            this.nameTexts[i]?.setColor(ready ? '#FFE060' : '#C8D8FF');
            // Level
            if (levels)
                this.levelTexts[i]?.setText(`Lv${levels[i] ?? 1}`);
            // HP bar
            const hp = this.hpBars[i];
            if (hp) {
                hp.clear();
                const hpColor = hpPct > 0.5 ? 0x44CC44 : hpPct > 0.25 ? 0xCCAA22 : 0xCC3322;
                hp.fillStyle(hpColor);
                hp.fillRoundedRect(ox + 32, 14, Math.floor(60 * hpPct), 5, 1);
            }
            this.hpTexts[i]?.setText(`${u.hp}`);
            // MP bar
            const mp = this.mpBars[i];
            if (mp) {
                mp.clear();
                mp.fillStyle(0x4466FF);
                mp.fillRoundedRect(ox + 32, 23, Math.floor(60 * mpPct), 5, 1);
            }
            this.mpTexts[i]?.setText(`${u.mp}`);
            // ATB bar
            const atb = this.atbBars[i];
            if (atb) {
                atb.clear();
                atb.fillStyle(ready ? 0xFFEE44 : 0x44AAFF);
                atb.fillRoundedRect(ox + 32, 32, Math.floor(60 * atbPct), 5, 1);
            }
            // Ready dot
            const dot = this.atbReadyDots[i];
            if (dot) {
                dot.clear();
                if (ready) {
                    dot.fillStyle(0xFFEE44);
                    dot.fillCircle(ox + 95, 35, 3);
                }
            }
        });
    }
    // ── Command Menu ─────────────────────────────────────────────────────────────
    showCommandMenu(unit, dualTechs, cb) {
        this.hideCommandMenu();
        this.onChoice = cb;
        this.cursor = 0;
        this.menuItems = ['Attack', 'Tech', 'Flee'];
        const CW = 80;
        const CH = 48 + (dualTechs.length > 0 ? 12 : 0);
        const cx = 8;
        const cy = H - 52 - CH - 4;
        const cc = this.scene.add.container(cx, cy + 6).setScrollFactor(0).setDepth(85);
        cc.setAlpha(0);
        const bg = this.scene.add.graphics();
        drawWindow(bg, 0, 0, CW, CH);
        cc.add(bg);
        // Unit name header
        cc.add(this.scene.add.text(6, 4, `❖ ${unit.name}`, {
            fontSize: '6px', fontFamily: 'monospace', color: '#AADDFF',
        }));
        // Separator line
        const sep = this.scene.add.graphics();
        sep.lineStyle(1, 0xCCA820, 0.4);
        sep.lineBetween(4, 13, CW - 4, 13);
        cc.add(sep);
        this.menuTexts = [];
        const icons = ['⚔', '✦', '↩'];
        this.menuItems.forEach((item, i) => {
            const t = this.scene.add.text(16, 17 + i * 11, `${icons[i]} ${item}`, {
                fontSize: '7px', fontFamily: 'monospace', color: '#FFFFFF',
            });
            cc.add(t);
            this.menuTexts.push(t);
        });
        this.cursSprite = this.scene.add.text(5, 17, '▶', {
            fontSize: '6px', fontFamily: 'monospace', color: '#FFE060',
        });
        cc.add(this.cursSprite);
        if (dualTechs.length > 0) {
            const dualSep = this.scene.add.graphics();
            dualSep.lineStyle(1, 0xFFEE44, 0.4);
            dualSep.lineBetween(4, CH - 14, CW - 4, CH - 14);
            cc.add(dualSep);
            cc.add(this.scene.add.text(6, CH - 12, `⚡ Dual Ready!`, {
                fontSize: '5px', fontFamily: 'monospace', color: '#FFEE44',
            }));
        }
        this.commandContainer = cc;
        this.refreshCursor();
        this.scene.tweens.add({
            targets: cc,
            alpha: 1,
            y: cy,
            duration: 160,
            ease: 'Back.easeOut',
        });
        this.scene.events.on('update', this.handleMenuInput, this);
    }
    handleMenuInput() {
        if (!this.commandContainer)
            return;
        const { JustDown } = Phaser.Input.Keyboard;
        if (JustDown(this.keys.down)) {
            this.cursor = (this.cursor + 1) % this.menuItems.length;
            this.refreshCursor();
        }
        if (JustDown(this.keys.up)) {
            this.cursor = (this.cursor - 1 + this.menuItems.length) % this.menuItems.length;
            this.refreshCursor();
        }
        if (JustDown(this.keys.z))
            this.selectCurrent();
    }
    refreshCursor() {
        if (!this.cursSprite || !this.commandContainer)
            return;
        this.cursSprite.setY(17 + this.cursor * 11);
        this.menuTexts.forEach((t, i) => {
            t.setColor(i === this.cursor ? '#FFE060' : '#FFFFFF');
            t.setScale(i === this.cursor ? 1.05 : 1.0);
        });
    }
    selectCurrent() {
        const item = this.menuItems[this.cursor].toLowerCase();
        const cb = this.onChoice;
        this.hideCommandMenu();
        cb?.(item);
    }
    hideCommandMenu() {
        this.scene.events.off('update', this.handleMenuInput, this);
        this.commandContainer?.destroy();
        this.commandContainer = null;
        this.menuTexts = [];
        this.cursSprite = null;
        this.onChoice = null;
    }
    // ── Tech Menu ────────────────────────────────────────────────────────────────
    showTechMenu(availableTechs, cb) {
        const allEntries = [...availableTechs, { key: '__back__', name: '← Back', mpCost: 0, desc: '' }];
        const CW = 120;
        const CH = 16 + allEntries.length * 11 + 4;
        const cx = 8;
        const cy = H - 52 - CH - 60;
        const cc = this.scene.add.container(cx, cy).setScrollFactor(0).setDepth(86);
        const bg = this.scene.add.graphics();
        drawWindow(bg, 0, 0, CW, CH, { borderColor: 0x88AAFF });
        cc.add(bg);
        cc.add(this.scene.add.text(6, 4, '── Techniques ──', {
            fontSize: '5px', fontFamily: 'monospace', color: '#8899CC',
        }));
        const sep = this.scene.add.graphics();
        sep.lineStyle(1, 0x88AAFF, 0.4);
        sep.lineBetween(4, 13, CW - 4, 13);
        cc.add(sep);
        let cur = 0;
        const texts = [];
        const mpCostTexts = [];
        allEntries.forEach((t, i) => {
            const isBack = t.key === '__back__';
            const mpStr = (!isBack && t.mpCost > 0) ? `${t.mpCost}` : '';
            const baseCol = isBack ? '#888899' : (t.mpCost > 0 ? '#AADDFF' : '#FFFFFF');
            const tx = this.scene.add.text(18, 17 + i * 11, t.name, {
                fontSize: '6px', fontFamily: 'monospace', color: baseCol,
            });
            cc.add(tx);
            texts.push(tx);
            if (mpStr) {
                const mt = this.scene.add.text(CW - 6, 17 + i * 11, `${mpStr}MP`, {
                    fontSize: '5px', fontFamily: 'monospace', color: '#6688FF',
                }).setOrigin(1, 0);
                cc.add(mt);
                mpCostTexts.push(mt);
            }
        });
        const curs = this.scene.add.text(6, 17, '▶', {
            fontSize: '6px', fontFamily: 'monospace', color: '#FFE060',
        });
        cc.add(curs);
        const total = allEntries.length;
        const refresh = () => {
            curs.setY(17 + cur * 11);
            texts.forEach((t, i) => {
                const isBack = allEntries[i].key === '__back__';
                const sel = i === cur;
                const baseCol = isBack ? '#888899' : (allEntries[i].mpCost > 0 ? '#AADDFF' : '#FFFFFF');
                t.setColor(sel ? '#FFE060' : baseCol);
            });
        };
        refresh();
        cc.setAlpha(0);
        this.scene.tweens.add({ targets: cc, alpha: 1, duration: 120 });
        const { JustDown } = Phaser.Input.Keyboard;
        const handler = () => {
            if (JustDown(this.keys.down)) {
                cur = (cur + 1) % total;
                refresh();
            }
            if (JustDown(this.keys.up)) {
                cur = (cur - 1 + total) % total;
                refresh();
            }
            if (JustDown(this.keys.z)) {
                this.scene.events.off('update', handler);
                cc.destroy();
                const chosen = allEntries[cur];
                cb(chosen.key === '__back__' ? null : chosen.key);
            }
            if (JustDown(this.keys.x)) {
                this.scene.events.off('update', handler);
                cc.destroy();
                cb(null);
            }
        };
        this.scene.events.on('update', handler);
    }
    // ── Banner ───────────────────────────────────────────────────────────────────
    showBanner(text, color = '#ffffff', duration = 1600) {
        const bw = text.length * 6 + 24;
        const bh = 18;
        const bx = W / 2;
        const by = H * 0.38;
        const cont = this.scene.add.container(bx, by)
            .setScrollFactor(0).setDepth(92).setAlpha(0);
        const bg = this.scene.add.graphics();
        drawWindow(bg, -bw / 2, -bh / 2, bw, bh, { innerColor: 0x020108 });
        cont.add(bg);
        const t = this.scene.add.text(0, 0, text, {
            fontSize: '10px',
            fontFamily: 'monospace',
            color,
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5);
        cont.add(t);
        this.scene.tweens.add({
            targets: cont,
            alpha: 1,
            y: by - 4,
            duration: 200,
            yoyo: true,
            hold: duration - 400,
            onComplete: () => cont.destroy(),
        });
    }
    // ── Level-up effect ──────────────────────────────────────────────────────────
    showLevelUp(unitName, level) {
        const cont = this.scene.add.container(W / 2, H / 2 - 20)
            .setScrollFactor(0).setDepth(95).setAlpha(0);
        const bg = this.scene.add.graphics();
        drawWindow(bg, -56, -12, 112, 28, { borderColor: 0xFFDD44, innerColor: 0x080400 });
        cont.add(bg);
        cont.add(this.scene.add.text(0, -6, `⭐ LEVEL UP!`, {
            fontSize: '8px', fontFamily: 'monospace', color: '#FFEE44',
            stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5));
        cont.add(this.scene.add.text(0, 5, `${unitName} → Lv.${level}`, {
            fontSize: '6px', fontFamily: 'monospace', color: '#FFCC88',
        }).setOrigin(0.5));
        this.scene.tweens.add({
            targets: cont,
            alpha: 1,
            duration: 300,
            yoyo: true,
            hold: 1800,
            onComplete: () => cont.destroy(),
        });
    }
    // ── Victory panel (EXP gain display) ─────────────────────────────────────────
    showVictoryExp(expGain, gold) {
        const cont = this.scene.add.container(W / 2, H / 2 - 10)
            .setScrollFactor(0).setDepth(94).setAlpha(0);
        const bg = this.scene.add.graphics();
        drawWindow(bg, -60, -16, 120, 36, { borderColor: 0xCCA820, innerColor: 0x040214 });
        cont.add(bg);
        cont.add(this.scene.add.text(0, -10, 'Victory!', {
            fontSize: '9px', fontFamily: 'monospace', color: '#FFE060',
            stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5));
        cont.add(this.scene.add.text(0, 2, `EXP +${expGain}   G +${gold}`, {
            fontSize: '6px', fontFamily: 'monospace', color: '#AADDFF',
        }).setOrigin(0.5));
        this.scene.tweens.add({
            targets: cont,
            alpha: 1,
            duration: 250,
            yoyo: true,
            hold: 2000,
            onComplete: () => cont.destroy(),
        });
    }
    destroy() {
        this.hideCommandMenu();
        this.panel?.destroy();
        this.panel = null;
        this.hpBars = [];
        this.mpBars = [];
        this.atbBars = [];
        this.nameTexts = [];
        this.hpTexts = [];
        this.mpTexts = [];
        this.levelTexts = [];
        this.atbReadyDots = [];
    }
}
