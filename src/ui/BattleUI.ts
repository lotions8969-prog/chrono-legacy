import Phaser from 'phaser';
import { BattleUnit } from '../systems/ATBSystem';
import { CANVAS } from '../data/constants';

const W = CANVAS.WIDTH;
const H = CANVAS.HEIGHT;

export type MenuChoice = 'attack' | 'tech' | 'flee';

// ── BattleUI ──────────────────────────────────────────────────────────────────
// Camera-fixed overlay: ATB / HP / MP bars (bottom), command window (centre-bottom).
// All elements are created fresh on showCommandMenu and destroyed on hide.
export class BattleUI {
  private readonly scene   : Phaser.Scene;
  private panel            : Phaser.GameObjects.Container | null = null;
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
  /** Recreate the status panel with current unit values. Call every battle frame. */
  updateStatusPanel(playerUnits: BattleUnit[]): void {
    this.panel?.destroy();

    const PH   = 36;
    const c    = this.scene.add.container(0, H - PH).setScrollFactor(0).setDepth(80);

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000018, 0.85);
    bg.fillRect(0, 0, W, PH);
    bg.lineStyle(1, 0x3366aa, 0.8);
    bg.lineBetween(0, 0, W, 0);
    c.add(bg);

    playerUnits.forEach((u, i) => {
      const ox = 4 + i * 128;
      const ready = u.atb >= 100;

      // Name
      c.add(this.scene.add.text(ox, 2, u.name, {
        fontSize: '6px', fontFamily: 'monospace',
        color: ready ? '#ffffa0' : '#aabbcc',
      }));

      // HP bar
      this.drawBar(c, ox, 10, 70, 4, u.hp / u.maxHp, 0x44cc44, 0x226622);
      c.add(this.scene.add.text(ox + 72, 8, `${u.hp}/${u.maxHp}`, {
        fontSize: '5px', fontFamily: 'monospace', color: '#88ee88',
      }));

      // MP bar
      this.drawBar(c, ox, 17, 70, 4, u.mp / u.maxMp, 0x4488ff, 0x223366);
      c.add(this.scene.add.text(ox + 72, 15, `${u.mp}/${u.maxMp}`, {
        fontSize: '5px', fontFamily: 'monospace', color: '#88aaff',
      }));

      // ATB bar
      this.drawBar(c, ox, 24, 70, 4, u.atb / 100, 0xffcc00, 0x443300);
      if (ready) {
        c.add(this.scene.add.text(ox + 72, 22, 'READY', {
          fontSize: '5px', fontFamily: 'monospace', color: '#ffff44',
        }));
      }
    });

    this.panel = c;
  }

  private drawBar(
    c    : Phaser.GameObjects.Container,
    x    : number, y: number, w: number, h: number,
    pct  : number,
    col  : number,
    bgCol: number,
  ): void {
    const bg = this.scene.add.graphics();
    bg.fillStyle(bgCol); bg.fillRect(x, y, w, h);
    const fill = this.scene.add.graphics();
    fill.fillStyle(col);
    fill.fillRect(x, y, Math.floor(w * Math.min(1, Math.max(0, pct))), h);
    c.add(bg); c.add(fill);
  }

  // ── Command menu ────────────────────────────────────────────────────────────
  showCommandMenu(
    unit     : BattleUnit,
    dualTechs: string[],    // dual tech keys available right now
    cb       : (choice: MenuChoice, techKey?: string) => void,
  ): void {
    this.hideCommandMenu();
    this.onChoice = cb;
    this.cursor   = 0;

    // Build item list
    this.menuItems = ['Attack', 'Tech', 'Flee'];

    const CW = 90, CH = 8 + this.menuItems.length * 10 + 4;
    const cx = W / 2 - CW / 2;
    const cy = H - 36 - CH - 4;

    const cc = this.scene.add.container(cx, cy).setScrollFactor(0).setDepth(85);

    // Window
    const wbg = this.scene.add.graphics();
    wbg.fillGradientStyle(0x000044, 0x000022, 0x000055, 0x000033, 0.92);
    wbg.fillRoundedRect(0, 0, CW, CH, 3);
    wbg.lineStyle(1, 0x4466cc, 0.9);
    wbg.strokeRoundedRect(0, 0, CW, CH, 3);
    cc.add(wbg);

    // Unit name header
    cc.add(this.scene.add.text(4, 2, `◆ ${unit.name}`, {
      fontSize: '6px', fontFamily: 'monospace', color: '#aaddff',
    }));

    // Menu items
    this.menuTexts = [];
    this.menuItems.forEach((item, i) => {
      const t = this.scene.add.text(14, 10 + i * 10, item, {
        fontSize: '7px', fontFamily: 'monospace', color: '#ffffff',
      });
      cc.add(t);
      this.menuTexts.push(t);
    });

    // Animated cursor
    this.cursSprite = this.scene.add.text(4, 10, '►', {
      fontSize: '7px', fontFamily: 'monospace', color: '#ffff88',
    });
    cc.add(this.cursSprite);

    this.commandContainer = cc;
    this.refreshCursor();

    // Slide in
    cc.setAlpha(0);
    this.scene.tweens.add({ targets: cc, alpha: 1, y: cy - 4, duration: 150, ease: 'Quad.easeOut' });

    // Dual tech info (if any)
    if (dualTechs.length > 0) {
      cc.add(this.scene.add.text(4, CH - 8, `⚡ Dual ready!`, {
        fontSize: '5px', fontFamily: 'monospace', color: '#ffff44',
      }));
    }

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
    const CW = 110;
    const CH = 8 + availableTechs.length * 10 + 4;
    const cx = W / 2 - CW / 2;
    const cy = H - 36 - CH - 60;

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
    availableTechs.forEach((t, i) => {
      const mpStr = t.mpCost > 0 ? ` (${t.mpCost}MP)` : '';
      const label = `${t.name}${mpStr}`;
      const tx = this.scene.add.text(14, 10 + i * 10, label, {
        fontSize: '6px', fontFamily: 'monospace',
        color: t.mpCost > 0 ? '#aaddff' : '#ffffff',
      });
      cc.add(tx);
      texts.push(tx);
    });
    // Cancel entry
    const cancelTx = this.scene.add.text(14, 10 + availableTechs.length * 10, 'Back', {
      fontSize: '6px', fontFamily: 'monospace', color: '#aaaaaa',
    });
    cc.add(cancelTx);
    texts.push(cancelTx);

    const curs = this.scene.add.text(4, 10, '►', { fontSize: '6px', fontFamily: 'monospace', color: '#ffff88' });
    cc.add(curs);

    const total = texts.length;
    const refresh = () => {
      curs.setY(10 + cur * 10);
      texts.forEach((t, i) => t.setColor(i === cur ? '#ffff88' : (i < availableTechs.length ? (availableTechs[i].mpCost > 0 ? '#aaddff' : '#ffffff') : '#aaaaaa')));
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
        if (cur >= availableTechs.length) { cb(null); }
        else { cb(availableTechs[cur].key); }
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
    this.panel = null;
  }
}
