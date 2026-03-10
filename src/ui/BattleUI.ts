import Phaser from 'phaser';
import { BattleUnit } from '../systems/ATBSystem';
import { CANVAS } from '../data/constants';

const W = CANVAS.WIDTH;
const H = CANVAS.HEIGHT;

export type MenuChoice = 'attack' | 'tech' | 'flee';

// ── BattleUI ──────────────────────────────────────────────────────────────────
// Camera-fixed overlay: ATB / HP / MP bars (bottom), command window (centre-bottom).
export class BattleUI {
  private readonly scene   : Phaser.Scene;

  // ── Persistent status panel (built once, updated each frame) ──────────────
  private panel            : Phaser.GameObjects.Container | null = null;
  // Per-unit graphics that are updated each frame instead of recreated
  private hpBars           : Phaser.GameObjects.Graphics[] = [];
  private mpBars           : Phaser.GameObjects.Graphics[] = [];
  private atbBars          : Phaser.GameObjects.Graphics[] = [];
  private nameTexts        : Phaser.GameObjects.Text[] = [];
  private hpTexts          : Phaser.GameObjects.Text[] = [];
  private mpTexts          : Phaser.GameObjects.Text[] = [];
  private readyTexts       : Phaser.GameObjects.Text[] = [];

  private commandContainer : Phaser.GameObjects.Container | null = null;
  private onChoice         : ((choice: MenuChoice, techKey?: string) => void) | null = null;
  private cursor           = 0;
  private menuItems        : string[]  = [];
  private menuTexts        : Phaser.GameObjects.Text[] = [];
  private cursSprite       : Phaser.GameObjects.Text | null = null;
  private keys             : { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; z: Phaser.Input.Keyboard.Key };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const kb = scene.input.keyboard!;
    const K  = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      up   : kb.addKey(K.UP),
      down : kb.addKey(K.DOWN),
      z    : kb.addKey(K.Z),
    };
  }

  // ── Status panel (ATB / HP / MP) ────────────────────────────────────────────
  /** Build the status panel once. Called on first update. */
  private buildStatusPanel(playerUnits: BattleUnit[]): void {
    const PH = 38;
    const c  = this.scene.add.container(0, H - PH).setScrollFactor(0).setDepth(80);

    // Background (static, drawn once)
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000018, 0.88);
    bg.fillRect(0, 0, W, PH);
    bg.lineStyle(1, 0x3366aa, 0.8);
    bg.lineBetween(0, 0, W, 0);
    c.add(bg);

    this.hpBars     = [];
    this.mpBars     = [];
    this.atbBars    = [];
    this.nameTexts  = [];
    this.hpTexts    = [];
    this.mpTexts    = [];
    this.readyTexts = [];

    playerUnits.forEach((u, i) => {
      const ox = 4 + i * 130;

      // Name (text updated each frame for ATB-ready colour)
      const nameT = this.scene.add.text(ox, 2, u.name, {
        fontSize: '6px', fontFamily: 'monospace', color: '#aabbcc',
      });
      c.add(nameT);
      this.nameTexts.push(nameT);

      // HP bar background
      const hpBg = this.scene.add.graphics();
      hpBg.fillStyle(0x226622); hpBg.fillRect(ox, 10, 72, 4);
      c.add(hpBg);
      // HP bar fill (cleared+redrawn each frame)
      const hpFill = this.scene.add.graphics();
      c.add(hpFill);
      this.hpBars.push(hpFill);

      const hpT = this.scene.add.text(ox + 74, 8, `${u.hp}/${u.maxHp}`, {
        fontSize: '5px', fontFamily: 'monospace', color: '#88ee88',
      });
      c.add(hpT);
      this.hpTexts.push(hpT);

      // MP bar background
      const mpBg = this.scene.add.graphics();
      mpBg.fillStyle(0x223366); mpBg.fillRect(ox, 17, 72, 4);
      c.add(mpBg);
      const mpFill = this.scene.add.graphics();
      c.add(mpFill);
      this.mpBars.push(mpFill);

      const mpT = this.scene.add.text(ox + 74, 15, `${u.mp}/${u.maxMp}`, {
        fontSize: '5px', fontFamily: 'monospace', color: '#88aaff',
      });
      c.add(mpT);
      this.mpTexts.push(mpT);

      // ATB bar background
      const atbBg = this.scene.add.graphics();
      atbBg.fillStyle(0x443300); atbBg.fillRect(ox, 25, 72, 4);
      c.add(atbBg);
      const atbFill = this.scene.add.graphics();
      c.add(atbFill);
      this.atbBars.push(atbFill);

      const readyT = this.scene.add.text(ox + 74, 23, '', {
        fontSize: '5px', fontFamily: 'monospace', color: '#ffff44',
      });
      c.add(readyT);
      this.readyTexts.push(readyT);
    });

    this.panel = c;
  }

  /** Update bar fills and text values each frame (no destroy/recreate). */
  updateStatusPanel(playerUnits: BattleUnit[]): void {
    if (!this.panel) {
      this.buildStatusPanel(playerUnits);
      return;
    }

    playerUnits.forEach((u, i) => {
      const ox   = 4 + i * 130;
      const ready = u.atb >= 100;

      // Name colour
      this.nameTexts[i]?.setColor(ready ? '#ffffa0' : '#aabbcc');

      // HP bar fill
      const hp = this.hpBars[i];
      if (hp) {
        hp.clear();
        hp.fillStyle(0x44cc44);
        hp.fillRect(ox, 10, Math.floor(72 * Math.min(1, u.hp / u.maxHp)), 4);
      }
      this.hpTexts[i]?.setText(`${u.hp}/${u.maxHp}`);

      // MP bar fill
      const mp = this.mpBars[i];
      if (mp) {
        mp.clear();
        mp.fillStyle(0x4488ff);
        mp.fillRect(ox, 17, Math.floor(72 * Math.min(1, u.mp / u.maxMp)), 4);
      }
      this.mpTexts[i]?.setText(`${u.mp}/${u.maxMp}`);

      // ATB bar fill
      const atb = this.atbBars[i];
      if (atb) {
        atb.clear();
        atb.fillStyle(ready ? 0xffff44 : 0xffcc00);
        atb.fillRect(ox, 25, Math.floor(72 * Math.min(1, u.atb / 100)), 4);
      }
      this.readyTexts[i]?.setText(ready ? 'READY' : '');
    });
  }

  // ── Command menu ────────────────────────────────────────────────────────────
  showCommandMenu(
    unit     : BattleUnit,
    dualTechs: string[],
    cb       : (choice: MenuChoice, techKey?: string) => void,
  ): void {
    this.hideCommandMenu();
    this.onChoice = cb;
    this.cursor   = 0;

    this.menuItems = ['Attack', 'Tech', 'Flee'];

    const CW = 90, CH = 8 + this.menuItems.length * 10 + (dualTechs.length > 0 ? 12 : 4);
    const cx = W / 2 - CW / 2;
    const cy = H - 38 - CH - 4;

    const cc = this.scene.add.container(cx, cy).setScrollFactor(0).setDepth(85);

    const wbg = this.scene.add.graphics();
    wbg.fillGradientStyle(0x000044, 0x000022, 0x000055, 0x000033, 0.92);
    wbg.fillRoundedRect(0, 0, CW, CH, 3);
    wbg.lineStyle(1, 0x4466cc, 0.9);
    wbg.strokeRoundedRect(0, 0, CW, CH, 3);
    cc.add(wbg);

    cc.add(this.scene.add.text(4, 2, `◆ ${unit.name}`, {
      fontSize: '6px', fontFamily: 'monospace', color: '#aaddff',
    }));

    this.menuTexts = [];
    this.menuItems.forEach((item, i) => {
      const t = this.scene.add.text(14, 10 + i * 10, item, {
        fontSize: '7px', fontFamily: 'monospace', color: '#ffffff',
      });
      cc.add(t);
      this.menuTexts.push(t);
    });

    this.cursSprite = this.scene.add.text(4, 10, '►', {
      fontSize: '7px', fontFamily: 'monospace', color: '#ffff88',
    });
    cc.add(this.cursSprite);

    if (dualTechs.length > 0) {
      cc.add(this.scene.add.text(4, CH - 10, `⚡ Dual ready!`, {
        fontSize: '5px', fontFamily: 'monospace', color: '#ffff44',
      }));
    }

    this.commandContainer = cc;
    this.refreshCursor();

    cc.setAlpha(0);
    this.scene.tweens.add({ targets: cc, alpha: 1, y: cy - 4, duration: 150, ease: 'Quad.easeOut' });

    this.scene.events.on('update', this.handleMenuInput, this);
  }

  private handleMenuInput(): void {
    if (!this.commandContainer) return;
    const { JustDown } = Phaser.Input.Keyboard;

    if (JustDown(this.keys.down)) {
      this.cursor = (this.cursor + 1) % this.menuItems.length;
      this.refreshCursor();
    }
    if (JustDown(this.keys.up)) {
      this.cursor = (this.cursor - 1 + this.menuItems.length) % this.menuItems.length;
      this.refreshCursor();
    }
    if (JustDown(this.keys.z)) {
      this.selectCurrent();
    }
  }

  private refreshCursor(): void {
    if (!this.cursSprite || !this.commandContainer) return;
    this.cursSprite.setY(10 + this.cursor * 10);
    this.menuTexts.forEach((t, i) => {
      t.setColor(i === this.cursor ? '#ffff88' : '#ffffff');
    });
  }

  private selectCurrent(): void {
    const item = this.menuItems[this.cursor].toLowerCase();
    const cb   = this.onChoice;
    this.hideCommandMenu();
    cb?.(item as MenuChoice);
  }

  hideCommandMenu(): void {
    this.scene.events.off('update', this.handleMenuInput, this);
    this.commandContainer?.destroy();
    this.commandContainer = null;
    this.menuTexts        = [];
    this.cursSprite       = null;
    this.onChoice         = null;
  }

  // ── Tech sub-menu ────────────────────────────────────────────────────────────
  showTechMenu(
    availableTechs: Array<{ key: string; name: string; mpCost: number; desc: string }>,
    cb: (techKey: string | null) => void,
  ): void {
    const allEntries = [...availableTechs, { key: '__back__', name: 'Back', mpCost: 0, desc: '' }];
    const CW = 110;
    const CH = 8 + allEntries.length * 10 + 4;
    const cx = W / 2 - CW / 2;
    const cy = H - 38 - CH - 60;

    const cc = this.scene.add.container(cx, cy).setScrollFactor(0).setDepth(86);

    const wbg = this.scene.add.graphics();
    wbg.fillGradientStyle(0x000033, 0x000011, 0x000044, 0x000022, 0.93);
    wbg.fillRoundedRect(0, 0, CW, CH, 3);
    wbg.lineStyle(1, 0x6688dd, 0.9);
    wbg.strokeRoundedRect(0, 0, CW, CH, 3);
    cc.add(wbg);
    cc.add(this.scene.add.text(4, 2, '── Tech ──', {
      fontSize: '5px', fontFamily: 'monospace', color: '#8899cc',
    }));

    let cur = 0;
    const texts: Phaser.GameObjects.Text[] = [];

    allEntries.forEach((t, i) => {
      const isBack = t.key === '__back__';
      const mpStr  = (!isBack && t.mpCost > 0) ? ` (${t.mpCost}MP)` : '';
      const label  = `${t.name}${mpStr}`;
      const color  = isBack ? '#aaaaaa' : (t.mpCost > 0 ? '#aaddff' : '#ffffff');
      const tx = this.scene.add.text(14, 10 + i * 10, label, {
        fontSize: '6px', fontFamily: 'monospace', color,
      });
      cc.add(tx);
      texts.push(tx);
    });

    const curs = this.scene.add.text(4, 10, '►', {
      fontSize: '6px', fontFamily: 'monospace', color: '#ffff88',
    });
    cc.add(curs);

    const total = allEntries.length;
    const refresh = () => {
      curs.setY(10 + cur * 10);
      texts.forEach((t, i) => {
        const isBack  = allEntries[i].key === '__back__';
        const sel     = i === cur;
        const baseCol = isBack ? '#aaaaaa' : (allEntries[i].mpCost > 0 ? '#aaddff' : '#ffffff');
        t.setColor(sel ? '#ffff88' : baseCol);
      });
    };
    refresh();
    cc.setAlpha(0);
    this.scene.tweens.add({ targets: cc, alpha: 1, duration: 120 });

    const { JustDown } = Phaser.Input.Keyboard;
    const handler = () => {
      if (JustDown(this.keys.down)) { cur = (cur + 1) % total; refresh(); }
      if (JustDown(this.keys.up))   { cur = (cur - 1 + total) % total; refresh(); }
      if (JustDown(this.keys.z)) {
        this.scene.events.off('update', handler);
        cc.destroy();
        const chosen = allEntries[cur];
        cb(chosen.key === '__back__' ? null : chosen.key);
      }
    };
    this.scene.events.on('update', handler);
  }

  // ── Banner ───────────────────────────────────────────────────────────────────
  showBanner(text: string, color = '#ffffff', duration = 1600): void {
    const t = this.scene.add.text(W / 2, H * 0.4, text, {
      fontSize  : '10px',
      fontFamily: 'monospace',
      color,
      stroke    : '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(90).setAlpha(0);

    this.scene.tweens.add({
      targets  : t,
      alpha    : 1,
      y        : H * 0.38,
      duration : 250,
      yoyo     : true,
      hold     : duration - 500,
      onComplete: () => t.destroy(),
    });
  }

  destroy(): void {
    this.hideCommandMenu();
    this.panel?.destroy();
    this.panel       = null;
    this.hpBars      = [];
    this.mpBars      = [];
    this.atbBars     = [];
    this.nameTexts   = [];
    this.hpTexts     = [];
    this.mpTexts     = [];
    this.readyTexts  = [];
  }
}
