import Phaser from 'phaser';
import { SCENE, TILE } from '../data/constants';

const S = TILE.SIZE; // 16

// ── Preloader ─────────────────────────────────────────────────────────────────
// All textures are generated programmatically via canvas pixel-painting.
// Replace any buildXxx() with a real asset load when artwork is ready.
export class Preloader extends Phaser.Scene {
  constructor() { super({ key: SCENE.PRELOADER }); }

  create(): void {
    this.buildTileset();
    this.buildPlayerSprite();
    this.buildAllySprite();
    this.buildNPCSprite();
    this.buildEnemySprite();
    this.buildUIAssets();
    this.scene.start(SCENE.TITLE);
  }

  // ── Pixel painter helper ──────────────────────────────────────────────────
  private painter(
    ctx    : CanvasRenderingContext2D,
    pal    : Record<string, string | null>,
    ox     : number,
    oy     : number,
    rows   : string[],
  ): void {
    rows.forEach((row, gy) => {
      for (let gx = 0; gx < row.length; gx++) {
        const col = pal[row[gx]];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(ox + gx, oy + gy, 1, 1);
      }
    });
  }

  // ── Tileset  (5 tiles × 16 × 16) ─────────────────────────────────────────
  // Tile 0=grass  1=water  2=rock  3=path  4=flower
  private buildTileset(): void {
    const ct  = this.textures.createCanvas('tileset', S * 5, S)!;
    const ctx = ct.context;

    const pal: Record<string, string | null> = {
      '.': null,
      // grass
      G: '#3A7D44', g: '#2D6636', L: '#50A060', l: '#68B878',
      // water
      W: '#1A4FA0', w: '#2460BC', Q: '#3A78D4', q: '#8EC8F0', f: '#C0D8F8',
      // rock
      R: '#5C5047', r: '#3A2E28', O: '#746050', o: '#8A7868',
      // path
      P: '#C8A840', p: '#9A7830', A: '#DCC060', a: '#E8D078',
      // flower & stem
      F: '#CC2244', V: '#CCAA00', E: '#F0E0C8', s: '#228822', d: '#1A6A1A',
    };

    const px = (ox: number, rows: string[]) => this.painter(ctx, pal, ox, 0, rows);

    // ── Tile 0: Grass ─────────────────────────────────────────────────────
    px(0, [
      'GGgGGGGgGGlGGGgG',
      'GlGGgGGGGGGgGGGG',
      'GGGGGGlGGgGGGGlG',
      'gGGGlGGGGGGGgGGG',
      'GGlGGGGgGGGlGGGG',
      'GGGgGGGGGGGGGGgG',
      'GlGGGGgGGlGGGGGG',
      'GGGGGGGGGGGGlGGG',
      'gGGlGGGgGGGGGGGg',
      'GGGGGGGGGlGGGlGG',
      'GGGgGGlGGGGGGGGG',
      'lGGGGGGGGGgGGlGG',
      'GGGGlGGGlGGGGGGg',
      'GGgGGGGGGGGGGGGG',
      'GGGGGGlGGgGGGlGG',
      'gGGlGGGGGGGGGGGG',
    ]);

    // ── Tile 1: Water ─────────────────────────────────────────────────────
    px(S, [
      'WWwWWWWwWWWWWwWW',
      'wWQQQQWWWWQQQwWW',
      'WWQQQQQwWQQQQQWW',
      'WWWwWQQQQQQwWWWW',
      'WqWWWWQQQQWWWwWW',
      'WWWQQQwWWWWQQQWW',
      'WWQQQQQwWQQQQQWW',
      'WwWWWQQQQQWWwWWW',
      'WWWQQQwWWWWQQQWW',
      'WWQQQQQwWQQQQQWW',
      'WwWWWWQQQQWWWwWW',
      'WWWQQQwWWWWQQQWW',
      'WWqWWQQQQQQwWWWW',
      'WWWWwWQQQQWWWWWW',
      'WwWQQQwWWWWQQQwW',
      'WWWWWWWwWWWWWWWW',
    ]);

    // ── Tile 2: Rock / Wall ───────────────────────────────────────────────
    px(S * 2, [
      'rrrrrrrrrrrrrrrr',
      'rROOOOOOOOOOROOr',
      'rROOOOOOOOOOROOr',
      'rROoOOOOOOOOROOr',
      'rROOOoOrRROoROOr',
      'rROOOOOrRROOROOr',
      'rROoOOOOrROOROOr',
      'rROOOOOOrROOROOr',
      'rROOoOOOrROOROOr',
      'rRrrrrrrrrrrrOOr',
      'rROOOOOOOOOOROOr',
      'rROoOOOOOoOOROOr',
      'rROOOOOOOOOOROOr',
      'rROOoOOOOOOoROOr',
      'rROOOOOOOOOOROOr',
      'rrrrrrrrrrrrrrrr',
    ]);

    // ── Tile 3: Path / Dirt ───────────────────────────────────────────────
    px(S * 3, [
      'PPpPPPPPPpPPPPPP',
      'PAPPpPPPPPPpPAPP',
      'PPPpPPAPPPPPPPPP',
      'PPPPPPPPpPPAaPPP',
      'pPAPPPPPPPPPPpPP',
      'PPPPpPPAPPPpPPPP',
      'PPPPPPPPPPPaPPPP',
      'PpPPPPpPPPPPPPpP',
      'PPPAPpPPPPPPPPPP',
      'PPPPPPPPpPAPPPPP',
      'PPpPPPPAaPPPpPPP',
      'PPPPPpPPPPPPPPPP',
      'PAPPPPPPpPPAPPpp',
      'PPPpPPPPPPPPPPPP',
      'PPPPPAPpPPPPPAPA',
      'pPPPPPPPpPPpPPPP',
    ]);

    // ── Tile 4: Flowers ───────────────────────────────────────────────────
    px(S * 4, [
      'GGgGGGGgGGGGGgGG',
      'GGGGGGGGGGGGGGGG',
      'GGsGGGGGGGGGsGGG',
      'GGdGGGFFGGGGdGGG',
      'GddsGFFFGGGddsGG',
      'GGdFFFFFGGGGdGGG',
      'GGsFFFFFGGGdsGGG',
      'GGGdFFFFGGGGGGGG',
      'GGGGdFGGGGVVVGGG',
      'GGsGGdGGGVVVVVGG',
      'GGdGGGGGGEVVVEGG',
      'GddGGGGGGGsVVGGG',
      'GGGGsGGGGGdGGGGG',
      'GGgGdGGGGGdGGgGG',
      'GGGGGGGGgGGGGGGG',
      'GGGGGGGGGGGgGGGG',
    ]);

    ct.refresh();
  }

  // ── Player sprite  (12×16 × 8 frames) ────────────────────────────────────
  // Frames: 0=idle 1=walkA 2=walkB 3=runA 4=runB 5=talk 6=winA 7=winB
  private buildPlayerSprite(): void {
    const FW = 12, FH = 16, N = 8;
    const ct  = this.textures.createCanvas('player', FW * N, FH)!;
    const ctx = ct.context;

    const pal: Record<string, string | null> = {
      '.': null,
      H: '#6A3810', h: '#C87820',          // hair dark / highlight
      S: '#FCCFA0', c: '#D4A070',          // skin / shadow
      K: '#140A00',                         // eye dark
      M: '#882200',                         // mouth open
      R: '#CC3300',                         // red scarf
      W: '#E8F0FF', w: '#C8D0E8',          // white shirt / shadow
      B: '#3878B8', b: '#1858A0',          // blue tunic / shadow
      P: '#182850', p: '#101830',          // dark pants / shadow
      Z: '#703818',                         // belt
      T: '#381808', t: '#784028', X: '#A05030', // boot dark / mid / toe
      G: '#44AA55', g: '#228833',          // victory green
    };

    const paint = (ox: number, rows: string[]) => this.painter(ctx, pal, ox, 0, rows);

    // Shared head rows (rows 0-5)
    const HEAD = [
      '...HHhHH....', // 0 hair top
      '..HHHHHHHh..', // 1 hair crown
      '..HSSSSSH...', // 2 face top      (H at 2,8  skin 3-7)
      '..HSKSSKcH..', // 3 eyes           (K at 4,7  c=cheek at 8)
      '..HSSSSSH...', // 4 face mid
      '..HcSSScH...', // 5 chin           (c cheek shadows)
    ];

    // Shared body rows (rows 6-13)
    const BODY = [
      '..RRRRRRRR..', // 6  red scarf
      '..wwWWWWww..', // 7  white shirt (w=shadow at edges)
      '..BBBBBBBB..', // 8  blue tunic
      '..BbBBBBbB..', // 9  tunic fold lines
      '..bBBBBBBb..', // 10 lower tunic shadow
      '..ZZZZZZZZ..', // 11 belt
      '..PPPPPPPP..', // 12 pants
      '..PpPPPPpP..', // 13 pants shadow
    ];

    // Build a full 16-row frame with optional overrides
    const frame = (
      fi       : number,
      boot14   : string,
      boot15   : string,
      overrides: Record<number, string> = {},
    ) => {
      const rows = [...HEAD, ...BODY, boot14, boot15];
      Object.entries(overrides).forEach(([ri, row]) => { rows[Number(ri)] = row; });
      paint(fi * FW, rows);
    };

    frame(0, '..TT..TT....', '..Xt..Xt....');                           // idle
    frame(1, '..TT...TT...', '..Xt...Xt...');                           // walk A (right fwd)
    frame(2, '.TT....TT...', '.Xt....Xt...');                           // walk B (left fwd)
    frame(3, '..TT....TT..', '..Xt....Xt..');                           // run A (wider)
    frame(4, '.TT.....TT..', '.Xt.....Xt..');                           // run B
    frame(5, '..TT..TT....', '..Xt..Xt....', { 5: '..HcSMScH...' });   // talk (mouth open)
    frame(6, '..TT.....TT.', '............',                            // win A (jump)
      { 8: '..GBBBBBGG..', 9: '..GgBBBBgG..', 10: '..gGBBBBGg..' });
    frame(7, '.TT......TT.', '............',                            // win B (jump other)
      { 8: '..GBBBBBGG..', 9: '..GgBBBBgG..', 10: '..gGBBBBGg..' });

    const tex = this.textures.get('player');
    for (let i = 0; i < N; i++) tex.add(i, 0, i * FW, 0, FW, FH);
    ct.refresh();
  }

  // ── Ally / Mage sprite  (12×16 × 8 frames) ───────────────────────────────
  // Golden-haired mage in white dress with blue trim and staff
  private buildAllySprite(): void {
    const FW = 12, FH = 16, N = 8;
    const ct  = this.textures.createCanvas('ally', FW * N, FH)!;
    const ctx = ct.context;

    const pal: Record<string, string | null> = {
      '.': null,
      Y: '#DAA520', y: '#FFD700',          // gold hair dark / highlight
      S: '#FCCFA0', c: '#D4A070',          // skin / shadow
      K: '#140A00',                         // eye
      M: '#882200',                         // mouth
      D: '#F0F4FF', d: '#C8D0E8',          // dress white / shadow
      L: '#6090C0', l: '#3A6090',          // blue trim / shadow
      T: '#705030', t: '#C0A060', X: '#E0C080', // boot tan / light / toe
      U: '#886600',                         // staff handle
      u: '#AAEEFF',                         // staff gem
      G: '#44AA55', g: '#228833',          // win green
    };

    const paint = (ox: number, rows: string[]) => this.painter(ctx, pal, ox, 0, rows);

    // Hair extends down sides of face for long-hair look
    const HEAD = [
      '..yYYyYy....', // 0 hair top
      '.YYYYYYYy...', // 1 hair crown
      '.YSSSSSSSY..', // 2 face (Y=hair at 1,8-9)
      '.YSKSSKcSY..', // 3 eyes (K at 3,6)
      '.YSSSSSSSY..', // 4 face mid
      '.YcSSSSScY..', // 5 chin
    ];

    // Dress body with staff on right side
    const BODY = [
      '..LLLLLLLL.U', // 6  blue collar + staff
      '..DDDDDDDDdU', // 7  dress top + staff
      '..DDDDDDDDdU', // 8  dress
      '.dDDDDDDDddU', // 9  dress folds
      '.dDDDDDDdDdU', // 10 dress folds
      '..LLLLLLLLlU', // 11 blue hem trim
      '..dddddddddU', // 12 dress skirt
      '...ddddddd.U', // 13 skirt bottom
    ];

    const frame = (fi: number, boot14: string, boot15: string, overrides: Record<number, string> = {}) => {
      const rows = [...HEAD, ...BODY, boot14, boot15];
      Object.entries(overrides).forEach(([ri, row]) => { rows[Number(ri)] = row; });
      // Staff gem at top
      rows[6] = rows[6].slice(0, 11) + 'u';
      paint(fi * FW, rows);
    };

    frame(0, '...TT.TT....', '...Xt.Xt....');                           // idle
    frame(1, '...TT..TT...', '...Xt..Xt...');                           // walk A
    frame(2, '..TT...TT...', '..Xt...Xt...');                           // walk B
    frame(3, '...TT...TT..', '...Xt...Xt..');                           // run A
    frame(4, '..TT....TT..', '..Xt....Xt..');                           // run B
    frame(5, '...TT.TT....', '...Xt.Xt....', { 5: '.YcSMSScY...' });   // talk
    frame(6, '...TT....TT.', '............',                            // win A
      { 8: '..GDDDDDGdU', 9: '.gGDDDDGgdU', 10: '.gGDDDDGgdU' });
    frame(7, '..TT.....TT.', '............',                            // win B
      { 8: '..GDDDDDGdU', 9: '.gGDDDDGgdU', 10: '.gGDDDDGgdU' });

    const tex = this.textures.get('ally');
    for (let i = 0; i < N; i++) tex.add(i, 0, i * FW, 0, FW, FH);
    ct.refresh();
  }

  // ── NPC sprite  (12×16 × 4 frames) ───────────────────────────────────────
  private buildNPCSprite(): void {
    const FW = 12, FH = 16, N = 4;
    const ct  = this.textures.createCanvas('npc', FW * N, FH)!;
    const ctx = ct.context;

    const pal: Record<string, string | null> = {
      '.': null,
      H: '#6A3810', h: '#C87820',
      A: '#AA3300', a: '#882200',  // red-hair NPC
      B: '#224488', b: '#112244',  // blue-shirt NPC
      S: '#FCCFA0', c: '#D4A070',
      K: '#140A00',
      P: '#182850', p: '#101830',
      T: '#381808', t: '#784028',
    };

    const paint = (ox: number, rows: string[]) => this.painter(ctx, pal, ox, 0, rows);

    // NPC type A (red-hair villager)
    const npcA = (fi: number, legOff: number) => paint(fi * FW, [
      '...AAAaAA...', '..AAAAAAAA..', '..ASSSSSSA..',
      '..ASKSSKcA..', '..ASSSSSSA..', '..AcSSScA...',
      '..SSAAAAAS..', '..aBBBBBBa..', '..aBBBBBBa..',
      '..aBbBBbBa..', '..abBBBBba..', '..PPPPPPPP..',
      '..PPPPPPPP..', '..PpPPPPpP..',
      legOff ? '..TT...TT...' : '..TT..TT....', legOff ? '..t....t....' : '..t...t.....',
    ]);

    // NPC type B (blue-shirt merchant)
    const npcB = (fi: number, legOff: number) => paint(fi * FW, [
      '...HHhHH....', '..HHHHHHHH..', '..HSSSSSH...',
      '..HSKSSKcH..', '..HSSSSSH...', '..HcSSScH...',
      '..BBBBBBBB..', '..BBbbBBBB..', '..BBBBBBBb..',
      '..bBBBBBBb..', '..bBBBBBBb..', '..PPPPPPPP..',
      '..PPPPPPPP..', '..PpPPPPpP..',
      legOff ? '.TT....TT...' : '..TT..TT....', legOff ? '.t.....t....' : '..t...t.....',
    ]);

    npcA(0, 0); npcA(1, 1);
    npcB(2, 0); npcB(3, 1);

    const tex = this.textures.get('npc');
    for (let i = 0; i < N; i++) tex.add(i, 0, i * FW, 0, FW, FH);
    ct.refresh();
  }

  // ── Enemy sprite  (16×20 × 6 frames: slime×2, bat×2, golem×2) ────────────
  private buildEnemySprite(): void {
    const EW = 16, EH = 20, N = 6;
    const ct  = this.textures.createCanvas('enemy', EW * N, EH)!;
    const ctx = ct.context;

    const pal: Record<string, string | null> = {
      '.': null,
      // Slime
      G: '#22CC44', g: '#18A030', L: '#55EE66', l: '#80FF90', // green body / shadow / highlight
      k: '#002200', w: '#EEFFEE',  // eye dark / white
      // Bat
      V: '#3A1840', v: '#5A2860', X: '#6A3870', x: '#8A5090', // purple body
      r: '#FF2222', e: '#FF8888', // red eyes
      // Golem
      O: '#887766', o: '#5C5045', A: '#AAA088', a: '#CCBBA0', // stone body
      F: '#FF5500', f: '#FF9944', // glowing eyes
      C: '#2A1810', // stone cracks
    };

    const paint = (ox: number, oy: number, rows: string[]) => this.painter(ctx, pal, ox, oy, rows);

    // ── Slime (frames 0-1, 16×20) ────────────────────────────────────────
    const slime = (fi: number, bounce: number) => {
      const ox = fi * EW;
      const W  = 12, h = 10 + bounce, bx = 2, by = 8 - bounce;

      // shadow (ellipse-like)
      paint(ox, 18, ['......gggg......']);

      // body (main green blob, wider when squished)
      const bodyW = W + bounce;
      const bodyX = bx - Math.floor(bounce / 2);
      for (let row = 0; row < h; row++) {
        const t     = row / h;
        const edge  = Math.round(Math.sin(Math.PI * t) * 2);
        const lineW = bodyW - edge * 2;
        const lineX = bodyX + edge;
        const col   = row < 2 ? 'L' : row < h - 2 ? 'G' : 'g';
        for (let px2 = 0; px2 < lineW; px2++) {
          ctx.fillStyle = pal[col]!;
          ctx.fillRect(ox + lineX + px2, by + row, 1, 1);
        }
      }

      // specular highlight on top-left
      paint(ox, by + 1, [
        '.lll............', '.ll.............', '.l..............',
      ]);

      // eyes
      paint(ox, by + 3, [
        '....kwkwkk......',  // row: 4='k', 5='w', 6='k', 7='w'  -- wait
      ]);
      // Draw eyes explicitly
      const ey = by + 3;
      // Left eye
      ctx.fillStyle = pal['k']!; ctx.fillRect(ox + 3, ey, 2, 2);
      ctx.fillStyle = pal['w']!; ctx.fillRect(ox + 3, ey, 1, 1);
      // Right eye
      ctx.fillStyle = pal['k']!; ctx.fillRect(ox + 9, ey, 2, 2);
      ctx.fillStyle = pal['w']!; ctx.fillRect(ox + 9, ey, 1, 1);

      // mouth (happy arc)
      ctx.fillStyle = pal['k']!;
      ctx.fillRect(ox + 4, ey + 3, 1, 1);
      ctx.fillRect(ox + 5, ey + 4, 3, 1);
      ctx.fillRect(ox + 8, ey + 3, 1, 1);
    };
    slime(0, 0);
    slime(1, 2);

    // ── Bat (frames 2-3, 16×20) ──────────────────────────────────────────
    const bat = (fi: number, wingsUp: boolean) => {
      const ox = fi * EW;

      // Wings
      if (wingsUp) {
        paint(ox, 4, [
          'vv..........vvvv',
          'Vvv..........vVV',
          'VVv...........Vv',
          'VVVv..........Vx',
          'XVVVv.......vVVX',
        ]);
      } else {
        paint(ox, 8, [
          'vv..........vvvv',
          'Vvv..........vVV',
          'VVv...........Vv',
          'VVVv..........Vx',
          'XVVVv.......vVVX',
        ]);
      }

      // Body (always at center)
      paint(ox, 7, [
        '....vVVVVVv.....',
        '....VXXXXVV.....',
        '...VXXXXXXVv....',
        '....VXXXXVV.....',
        '....vVVVVVv.....',
        '.....VVVVV......',
        '....VVVVVVV.....',
        '....VVVVVVV.....',
      ]);

      // Head + ears
      paint(ox, 3, [
        '....vVVv..vVVv..',
        '....VVVv..VVVv..',
        '.....vVvvvVVv...',
        '......VVVVV.....',
        '......VVVVVv....',
      ]);

      // Glowing red eyes
      ctx.fillStyle = pal['r']!; ctx.fillRect(ox + 6, 9, 1, 1); ctx.fillRect(ox + 9, 9, 1, 1);
      ctx.fillStyle = pal['e']!; ctx.fillRect(ox + 6, 9, 1, 1);

      // Fangs
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ox + 7, 13, 1, 1); ctx.fillRect(ox + 9, 13, 1, 1);
    };
    bat(2, true);
    bat(3, false);

    // ── Golem (frames 4-5, 16×20) ─────────────────────────────────────────
    const golem = (fi: number, armUp: boolean) => {
      const ox = fi * EW;

      // Base body (large rocky torso)
      paint(ox, 4, [
        '...oOOOOOOOoo...',
        '..oOAAOOOOAAOo..',
        '.oOAAOOOOOOAAOo.',
        '.oOOOOOOOOOOOo..',
        '.oOOOOOOOOOOOo..',
        'ooOAOOCCCCOAOoo.',
        'oOOOOCCCCCCOOOo.',
        'oOOOOCCCCCCOOOo.',
        'oOOOOOCCCCOOOOo.',
        '.oOOOOOOOOOOOo..',
        '.oOOOOOOOOOOOo..',
        '.oOOOOOCOOOOOo..',
        '..oOOCOOOCOOo...',
        '...oOOOOOOOo....',
        '....oOOOOOo.....',
        '.....oooooo.....',
      ]);

      // Arms (position depends on armUp)
      if (armUp) {
        paint(ox, 1, [
          '...OOo......OOo.',
          '..OOOo......OOO.',
          '.oOOOo......OOo.',
          '.oOOO........oo.',
          '.oOO............',
        ]);
      } else {
        paint(ox, 8, [
          '...OOo......OOo.',
          '..OOOo......OOO.',
          '.oOOOo......OOo.',
          '.oOOO........oo.',
          '.oOO............',
        ]);
      }

      // Glowing eyes (large and scary)
      ctx.fillStyle = pal['F']!;
      ctx.fillRect(ox + 4, 7, 2, 2); ctx.fillRect(ox + 10, 7, 2, 2);
      ctx.fillStyle = pal['f']!;
      ctx.fillRect(ox + 4, 7, 1, 1); ctx.fillRect(ox + 10, 7, 1, 1);

      // Mouth (grim)
      ctx.fillStyle = pal['C']!;
      ctx.fillRect(ox + 5, 11, 6, 1);
      ctx.fillRect(ox + 6, 12, 1, 1); ctx.fillRect(ox + 8, 12, 1, 1);
    };
    golem(4, false);
    golem(5, true);

    const tex = this.textures.get('enemy');
    for (let i = 0; i < N; i++) tex.add(i, 0, i * EW, 0, EW, EH);
    ct.refresh();
  }

  // ── UI assets ─────────────────────────────────────────────────────────────
  private buildUIAssets(): void {
    const ct  = this.textures.createCanvas('cursor', 8, 8)!;
    const ctx = ct.context;
    ctx.fillStyle = '#FFE060';
    // Right-pointing arrow
    [[0,3,1,2],[1,2,1,4],[2,1,1,6],[3,0,1,8]].forEach(([x,y,w,h]) => ctx.fillRect(x, y, w, h));
    ct.refresh();
  }
}
