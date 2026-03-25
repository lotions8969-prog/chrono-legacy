import Phaser from 'phaser';
import { SCENE, CANVAS, TILE, BLOCKING_TILES } from '../data/constants';
import { Player, Ally }  from '../entities/Player';
import { Enemy }          from '../entities/Enemy';
import { BattleManager }  from '../systems/BattleManager';
import { DialogueSystem } from '../systems/DialogueSystem';
import { AudioManager }   from '../systems/AudioManager';
import { ENEMY_DEFS }     from '../data/enemies';
import { NPC_SCRIPTS }    from '../data/story';

const W = CANVAS.WIDTH;
const H = CANVAS.HEIGHT;

// ── Zone definitions ─────────────────────────────────────────────────────────
type ZoneKey = 'village' | 'forest' | 'dungeon';

interface ZoneData {
  map         : number[][];
  bgKey       : string;
  musicTrack  : 'field' | 'town' | 'battle' | 'title';
  label       : string;
  playerStart : [number, number];
  enemySpawns : Array<[number, number, string]>;
  npcSpawns   : NpcDef[];
  exits       : Array<{ tx: number; ty: number; toZone: ZoneKey; toTx: number; toTy: number }>;
}

interface NpcDef {
  tx: number; ty: number;
  scriptKey: string;
  npcFrame: number;
  facing: 'down' | 'left' | 'right' | 'up';
}

// ── Village map (50×36) ──────────────────────────────────────────────────────
const MAP_VILLAGE: number[][] = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,4,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,2,2,2,0,0,0,6,6,2,2,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,2,2,2,0,0,0,6,6,2,2,6,6,6,6,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,2],
  [2,0,4,0,0,0,0,0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,1,1,7,7,1,1,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,1,1,7,7,1,1,0,0,0,4,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,9,0,0,8,8,8,8,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,4,0,0,0,0,0,0,9,0,0,8,8,8,8,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,9,0,0,8,8,8,8,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,4,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,2],
  [2,0,0,0,2,2,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,2],
  [2,0,0,0,2,2,0,0,0,9,0,0,0,0,0,0,0,0,8,8,8,8,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,8,8,8,8,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,2],
  [2,0,4,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,8,8,8,8,0,9,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,3,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,2],
  [2,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,2],
  [2,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,3,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,2],
  [2,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,4,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,2],
  [2,0,4,0,0,4,0,0,0,0,0,4,0,0,0,4,0,0,0,0,4,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];

// ── Forest map (40×30) ───────────────────────────────────────────────────────
const MAP_FOREST: number[][] = Array.from({ length: 30 }, (_, y) =>
  Array.from({ length: 40 }, (_, x) => {
    if (y === 0 || y === 29 || x === 0 || x === 39) return 2;
    if (x < 5 || x > 34) return 6;
    if (y < 4 || y > 25) return 6;
    if ((x % 7 === 0 && y % 5 === 0)) return 2;
    if (x % 4 === 0 && y % 3 === 0 && Math.sin(x * y) > 0.5) return 6;
    if (x > 14 && x < 26 && y > 10 && y < 20) return 3;
    return 0;
  }),
);
// Clear path in forest
for (let x = 16; x < 24; x++) for (let y = 6; y < 24; y++) MAP_FOREST[y][x] = 3;
MAP_FOREST[1][18] = 3; MAP_FOREST[2][18] = 3; MAP_FOREST[3][18] = 3; // north exit
for (let y = 24; y < 29; y++) MAP_FOREST[y][18] = 3; // south exit

// ── Dungeon map (40×30) ──────────────────────────────────────────────────────
const MAP_DUNGEON: number[][] = (() => {
  const DW = 40, DH = 30;
  const m: number[][] = Array.from({ length: DH }, () => Array(DW).fill(2));
  const fill = (x: number, y: number, w: number, h: number, t: number) => {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        if (y + dy >= 0 && y + dy < DH && x + dx >= 0 && x + dx < DW)
          m[y + dy][x + dx] = t;
  };

  // Entrance hall (lower section)
  fill(3, 16, 34, 7, 8);

  // Three rooms at top
  fill(1,  2, 11, 7, 8);   // left room
  fill(13, 1, 14, 8, 8);   // center boss room
  fill(27, 2, 12, 7, 8);   // right room

  // Vertical corridors connecting hall to rooms
  fill(3,  9, 4, 7, 3);    // left corridor
  fill(17, 9, 6, 7, 3);    // center corridor
  fill(31, 9, 4, 7, 3);    // right corridor

  // Horizontal connectors
  fill(7,  9, 10, 3, 3);   // left ↔ center
  fill(23, 9,  8, 3, 3);   // center ↔ right

  // South entrance corridor
  fill(17, 23, 6, 7, 3);   // reaches south wall

  // Pillars in rooms for visual interest
  m[4][3] = 2;  m[4][8] = 2;               // left room
  m[3][15] = 2; m[3][19] = 2; m[3][23] = 2; m[7][16] = 2; m[7][22] = 2; // center
  m[4][29] = 2; m[4][36] = 2;              // right room
  m[17][8] = 2; m[17][15] = 2; m[17][23] = 2; m[17][30] = 2;  // hall pillars
  m[21][8] = 2; m[21][15] = 2; m[21][23] = 2; m[21][30] = 2;

  // Water hazards
  fill(6, 11, 2, 2, 1);   // left corridor
  fill(25, 10, 2, 2, 1);  // right corridor
  fill(15, 4, 2, 2, 1);   // boss room
  fill(19, 18, 2, 2, 1);  // entrance hall

  return m;
})();

// ── Zone definitions map ──────────────────────────────────────────────────────
function makeZones(): Record<ZoneKey, ZoneData> {
  return {
    village: {
      map: MAP_VILLAGE,
      bgKey: 'battle_bg_village',
      musicTrack: 'town',
      label: 'Truce Village',
      playerStart: [11, 13],
      enemySpawns: [
        [20, 4,  'SLIME'],
        [30, 8,  'BAT'],
        [13, 13, 'SLIME'],
        [38, 12, 'BAT'],
        [42, 22, 'GOLEM'],
        [25, 28, 'SLIME'],
        [45, 30, 'BAT'],
        [40, 18, 'CRYSTAL_WRAITH'],
      ],
      npcSpawns: [
        { tx: 12, ty: 13, scriptKey: 'elder',      npcFrame: 0, facing: 'down'  },
        { tx: 16, ty: 16, scriptKey: 'merchant',   npcFrame: 2, facing: 'right' },
        { tx: 21, ty: 10, scriptKey: 'adventurer', npcFrame: 4, facing: 'left'  },
        { tx: 14, ty: 17, scriptKey: 'child',      npcFrame: 6, facing: 'down'  },
        { tx: 20, ty: 16, scriptKey: 'scientist',  npcFrame: 8, facing: 'right' },
      ],
      exits: [
        { tx: 10, ty: 1, toZone: 'forest', toTx: 18, toTy: 26 },
      ],
    },
    forest: {
      map: MAP_FOREST,
      bgKey: 'battle_bg_forest',
      musicTrack: 'field',
      label: 'Guardia Forest',
      playerStart: [18, 26],
      enemySpawns: [
        [10, 8,  'BAT'],
        [28, 10, 'BAT'],
        [15, 15, 'GOLEM'],
        [22, 18, 'CRYSTAL_WRAITH'],
        [8,  20, 'BAT'],
        [30, 22, 'GOLEM'],
      ],
      npcSpawns: [
        { tx: 20, ty: 12, scriptKey: 'adventurer', npcFrame: 4, facing: 'down' },
      ],
      exits: [
        { tx: 18, ty: 28, toZone: 'village', toTx: 10, toTy: 2 },
        { tx: 18, ty:  1, toZone: 'dungeon', toTx: 19, toTy: 26 },
      ],
    },
    dungeon: {
      map: MAP_DUNGEON,
      bgKey: 'battle_bg_dungeon',
      musicTrack: 'field',
      label: 'Ancient Ruins',
      playerStart: [19, 26],
      enemySpawns: [
        [18, 20, 'GOLEM'],
        [10, 20, 'CRYSTAL_WRAITH'],
        [28, 19, 'CRYSTAL_WRAITH'],
        [ 4,  5, 'BAT'],
        [ 8,  5, 'BAT'],
        [16,  4, 'CRYSTAL_WRAITH'],
        [22,  4, 'CRYSTAL_WRAITH'],
        [32,  5, 'GOLEM'],
        [36,  4, 'BAT'],
      ],
      npcSpawns: [
        { tx: 20, ty: 20, scriptKey: 'scientist', npcFrame: 8, facing: 'down' },
      ],
      exits: [
        { tx: 19, ty: 28, toZone: 'forest', toTx: 18, toTy: 2 },
      ],
    },
  };
}

// ── World scene ────────────────────────────────────────────────────────────────
export class World extends Phaser.Scene {

  private player!        : Player;
  private ally!          : Ally;
  private enemies        : Enemy[] = [];
  private npcs           : Array<{ sprite: Phaser.Physics.Arcade.Sprite; scriptKey: string }> = [];
  private wallLayer!     : Phaser.Tilemaps.TilemapLayer;

  private battleMgr!     : BattleManager;
  private dialogue!      : DialogueSystem;
  private audio          : AudioManager | null = null;

  private locked         = false;
  private battleCooldown = false;
  private inDialogue     = false;

  private hud!           : Phaser.GameObjects.Container;
  private hudZoneLabel!  : Phaser.GameObjects.Text;
  private hudLevelLabel! : Phaser.GameObjects.Text;

  private currentZone    : ZoneKey = 'village';
  private zones          : Record<ZoneKey, ZoneData> = makeZones();

  private introPlayed    = false;

  constructor() { super({ key: SCENE.WORLD }); }

  init(data: { audio?: AudioManager; zone?: ZoneKey; startTx?: number; startTy?: number }): void {
    this.audio       = data?.audio ?? null;
    this.currentZone = data?.zone  ?? 'village';
    if (data?.startTx !== undefined) {
      const zd = makeZones()[this.currentZone];
      zd.playerStart = [data.startTx, data.startTy ?? zd.playerStart[1]];
    }
    this.zones = makeZones();
  }

  create(): void {
    this.createParallaxBackground();
    this.createTilemap();
    this.placeDecorations();
    this.createCharacters();
    this.setupCamera();
    this.setupCollision();
    this.spawnEnemies();
    this.spawnNPCs();
    this.setupBattle();
    this.setupDialogue();
    this.createHUD();
    this.createControls();

    if (!this.audio) this.audio = new AudioManager();
    const zoneTrack = this.zones[this.currentZone].musicTrack;
    this.input.keyboard?.once('keydown', () => {
      this.audio?.init();
      this.audio?.crossfade(zoneTrack, 400);
    });

    this.cameras.main.fadeIn(600, 0, 0, 0);

    if (!this.introPlayed) {
      this.introPlayed = true;
      this.time.delayedCall(800, () => this.playOpeningIntro());
    }
  }

  // ── Opening intro ────────────────────────────────────────────────────────────
  private playOpeningIntro(): void {
    if (this.inDialogue || this.dialogue.isActive) return;
    const intro = NPC_SCRIPTS['__intro__'];
    if (!intro) return;
    this.locked    = true;
    this.inDialogue = true;
    this.player.setPlayerState('talk');
    this.dialogue.show(intro, () => {
      this.inDialogue = false;
      this.locked     = false;
      this.player.setPlayerState('idle');
    });
  }

  // ── Parallax background ──────────────────────────────────────────────────────
  private createParallaxBackground(): void {
    const zd     = this.zones[this.currentZone];
    const mapPxW = zd.map[0].length * TILE.SIZE;

    if (this.currentZone === 'dungeon') {
      // ── Cave / underground background ──
      const bg = this.add.graphics().setScrollFactor(0).setDepth(-30);
      bg.fillGradientStyle(0x04020C, 0x04020C, 0x0A0618, 0x0A0618, 1);
      bg.fillRect(0, 0, W, H);

      // Ceiling gradient (cave top)
      const ceil = this.add.graphics().setScrollFactor(0).setDepth(-29);
      ceil.fillGradientStyle(0x020108, 0x020108, 0x04020C, 0x04020C, 0.9);
      ceil.fillRect(0, 0, W, H * 0.25);

      // Distant stone columns (parallax)
      const cols = this.add.graphics().setScrollFactor(0.18, 0).setDepth(-25);
      cols.fillStyle(0x0E0820, 0.6);
      for (let i = 0; i < 18; i++) {
        const cx = i * 44 + 8;
        const ch = 20 + (i % 3) * 12;
        cols.fillRect(cx, 0, 6, ch);      // stalactite
        cols.fillRect(cx + 20, H - ch, 5, ch); // stalagmite
      }

      // Atmosphere: subtle blue-purple fog bands
      const fog = this.add.graphics().setScrollFactor(0.08, 0).setDepth(-24);
      fog.fillStyle(0x1A0840, 0.08);
      for (let i = 0; i < 4; i++) {
        fog.fillEllipse(i * mapPxW * 0.3 + mapPxW * 0.1, H * 0.5, mapPxW * 0.35, H * 0.6);
      }
      return;
    }

    // ── Outdoor (village / forest) background ──
    const sky = this.add.graphics().setScrollFactor(0).setDepth(-30);
    if (this.currentZone === 'forest') {
      sky.fillGradientStyle(0x0A1830, 0x0A1830, 0x182840, 0x203050, 1);
    } else {
      sky.fillGradientStyle(0x102040, 0x102040, 0x203060, 0x304080, 1);
    }
    sky.fillRect(0, 0, W, H);

    const mountainBg = this.add.graphics().setScrollFactor(0.3, 0.5).setDepth(-20);
    this.drawMountainLayer(mountainBg, mapPxW);

    const cloudBg = this.add.graphics().setScrollFactor(0.15, 0).setDepth(-25);
    this.drawClouds(cloudBg, mapPxW);
  }

  private drawMountainLayer(g: Phaser.GameObjects.Graphics, mapW: number): void {
    g.fillStyle(0x1A2840, 1);
    const peaks: number[] = [];
    for (let x = 0; x <= mapW; x += 32) peaks.push(32 + Math.sin(x * 0.03) * 28 + Math.cos(x * 0.07) * 14);
    for (let i = 0; i < peaks.length - 1; i++) {
      const x0 = i * 32, x1 = (i + 1) * 32;
      const y0 = H * 0.5 - peaks[i], y1 = H * 0.5 - peaks[i + 1];
      g.fillTriangle(x0, H, x0, y0, x1, y1);
      g.fillTriangle(x0, H, x1, y1, x1, H);
    }
    g.fillStyle(0x0E1828, 1);
    for (let i = 0; i < peaks.length - 1; i++) {
      const x0 = i * 32, x1 = (i + 1) * 32;
      const y0 = H * 0.6 - peaks[i] * 0.6, y1 = H * 0.6 - peaks[i + 1] * 0.6;
      g.fillTriangle(x0, H, x0, y0, x1, y1);
      g.fillTriangle(x0, H, x1, y1, x1, H);
    }
  }

  private drawClouds(g: Phaser.GameObjects.Graphics, mapW: number): void {
    const cloudPositions = [[20,20,40,12],[90,14,60,14],[180,22,50,10],[260,18,70,16],[360,10,45,11],[440,24,55,13]];
    cloudPositions.forEach(([x, y, rx, ry]) => {
      let cx = x;
      while (cx < mapW) {
        g.fillStyle(0x8899BB, 0.12);
        g.fillEllipse(cx, y, rx * 2, ry * 2);
        g.fillStyle(0xAABBCC, 0.06);
        g.fillEllipse(cx - rx * 0.3, y - ry * 0.3, rx * 1.4, ry * 1.4);
        cx += mapW * 0.7;
      }
    });
  }

  // ── Tilemap ──────────────────────────────────────────────────────────────────
  private createTilemap(): void {
    const zd  = this.zones[this.currentZone];
    const map = this.make.tilemap({ data: zd.map, tileWidth: TILE.SIZE, tileHeight: TILE.SIZE });
    const ts  = map.addTilesetImage('world', 'tileset', TILE.SIZE, TILE.SIZE, 0, 0)!;
    this.wallLayer = map.createLayer(0, ts, 0, 0)!;
    this.wallLayer.setDepth(0);
  }

  // ── Decorations ──────────────────────────────────────────────────────────────
  private placeDecorations(): void {
    const zd = this.zones[this.currentZone];

    if (this.currentZone === 'village') {
      // Trees
      const treePos = [
        [10, 1], [11, 2], [12, 1], [13, 3], [11, 4],
        [10, 5], [14, 1], [15, 2], [16, 3],
        [1, 22], [2, 24], [1, 28], [2, 30],
        [47, 5], [47, 8], [47, 12], [47, 16],
      ];
      treePos.forEach(([tx, ty]) => {
        this.add.image(
          tx * TILE.SIZE + TILE.SIZE / 2,
          ty * TILE.SIZE + TILE.SIZE * 2,
          'tree',
        ).setOrigin(0.5, 1).setDepth(ty * TILE.SIZE + TILE.SIZE * 2 - 1);
      });

      // Buildings
      [[12, 9], [18, 15]].forEach(([tx, ty]) => {
        const bx = tx * TILE.SIZE + TILE.SIZE * 2;
        const by = ty * TILE.SIZE + TILE.SIZE * 2;
        this.add.image(bx, by, 'building').setOrigin(0.5, 1).setDepth(by - 1);
      });

      // Time gate
      const gate = this.add.image(44 * TILE.SIZE + TILE.SIZE / 2, 13 * TILE.SIZE, 'gate')
        .setOrigin(0.5, 1).setDepth(700);
      this.tweens.add({ targets: gate, alpha: 0.7, scaleX: 1.05, scaleY: 1.05, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.time.addEvent({ delay: 300, callback: () => {
        this.tweens.add({ targets: gate, tint: 0x88AAFF, duration: 150, yoyo: true });
      }, repeat: -1 });

      // Save crystal
      const crystal = this.add.image(16 * TILE.SIZE + 8, 12 * TILE.SIZE - 2, 'save_crystal')
        .setOrigin(0.5, 1).setDepth(500);
      this.tweens.add({ targets: crystal, alpha: 0.6, y: crystal.y - 2, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.time.addEvent({ delay: 200, callback: () => {
        const px = crystal.x + Phaser.Math.Between(-6, 6);
        const py = crystal.y + Phaser.Math.Between(-8, 0);
        const spark = this.add.rectangle(px, py, 1, 1, 0xAADDFF, 0.8).setDepth(501);
        this.tweens.add({ targets: spark, y: py - 6, alpha: 0, duration: 600, onComplete: () => spark.destroy() });
      }, repeat: -1 });

      // Water shimmer
      this.time.addEvent({ delay: 400, callback: () => {
        const lakeX = Phaser.Math.Between(35, 39) * TILE.SIZE + 4;
        const lakeY = Phaser.Math.Between(5, 9) * TILE.SIZE + 4;
        const shimmer = this.add.rectangle(lakeX, lakeY, 3, 1, 0xAADDFF, 0.5).setDepth(1);
        this.tweens.add({ targets: shimmer, alpha: 0, x: lakeX + 3, duration: 700, onComplete: () => shimmer.destroy() });
      }, repeat: -1 });
    }

    if (this.currentZone === 'dungeon') {
      // Torch flicker effects at pillar positions
      const torchPos = [[8, 17], [14, 17], [22, 17], [29, 17], [8, 21], [29, 21]];
      torchPos.forEach(([tx, ty]) => {
        const wx = tx * TILE.SIZE + 8;
        const wy = ty * TILE.SIZE - 4;
        this.time.addEvent({ delay: 120 + Math.random() * 80, callback: () => {
          const spark = this.add.rectangle(
            wx + Phaser.Math.Between(-3, 3),
            wy + Phaser.Math.Between(-2, 2),
            2, 2, Phaser.Math.RND.pick([0xFFAA22, 0xFF8800, 0xFFCC44]), 0.9,
          ).setDepth(9);
          this.tweens.add({ targets: spark, y: wy - 5, alpha: 0, duration: 400, onComplete: () => spark.destroy() });
        }, repeat: -1 });
      });

      // Drip effects from ceiling
      this.time.addEvent({ delay: 800, callback: () => {
        const dx = Phaser.Math.Between(2, 38) * TILE.SIZE + 4;
        const drip = this.add.rectangle(dx, 2, 1, 3, 0x6688AA, 0.6).setDepth(9);
        this.tweens.add({ targets: drip, y: Phaser.Math.Between(24, 48), alpha: 0, duration: 900, onComplete: () => drip.destroy() });
      }, repeat: -1 });
    }

    // Exit zone indicators (all zones)
    zd.exits.forEach(exit => {
      const ex = exit.tx * TILE.SIZE + TILE.SIZE / 2;
      const ey = exit.ty * TILE.SIZE + TILE.SIZE / 2;
      const col = this.currentZone === 'dungeon' ? 0xFF8844 : 0xAAFF88;
      const indicator = this.add.graphics().setDepth(5);
      indicator.lineStyle(2, col, 0.6);
      indicator.strokeCircle(ex, ey, TILE.SIZE);
      this.tweens.add({ targets: indicator, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
    });
  }

  // ── Characters ────────────────────────────────────────────────────────────────
  private createCharacters(): void {
    const zd = this.zones[this.currentZone];
    const sx = zd.playerStart[0] * TILE.SIZE + TILE.SIZE / 2;
    const sy = zd.playerStart[1] * TILE.SIZE + TILE.SIZE;
    this.player = new Player(this, sx, sy);
    this.ally   = new Ally(this, sx - 20, sy);
    this.ally.follow(this.player);
  }

  // ── Camera ────────────────────────────────────────────────────────────────────
  private setupCamera(): void {
    const zd = this.zones[this.currentZone];
    const ww = zd.map[0].length * TILE.SIZE;
    const wh = zd.map.length    * TILE.SIZE;
    this.physics.world.setBounds(0, 0, ww, wh);
    this.cameras.main
      .setBounds(0, 0, ww, wh)
      .startFollow(this.player, true, 0.10, 0.10)
      .setRoundPixels(true);
  }

  // ── Collision ─────────────────────────────────────────────────────────────────
  private setupCollision(): void {
    this.wallLayer.setCollision(BLOCKING_TILES);
    this.physics.add.collider(this.player as unknown as Phaser.Physics.Arcade.Sprite, this.wallLayer);
    this.physics.add.collider(this.ally   as unknown as Phaser.Physics.Arcade.Sprite, this.wallLayer);
  }

  // ── Enemies ──────────────────────────────────────────────────────────────────
  private spawnEnemies(): void {
    const zd = this.zones[this.currentZone];
    zd.enemySpawns.forEach(([tx, ty, key]) => {
      const def = ENEMY_DEFS[key];
      if (!def) return;
      const enemy = new Enemy(this, tx * TILE.SIZE + TILE.SIZE / 2, ty * TILE.SIZE + TILE.SIZE, def);
      this.wallLayer.setCollision(BLOCKING_TILES);
      this.physics.add.collider(enemy as unknown as Phaser.Physics.Arcade.Sprite, this.wallLayer);
      this.enemies.push(enemy);
    });
  }

  // ── NPCs ──────────────────────────────────────────────────────────────────────
  private spawnNPCs(): void {
    const zd = this.zones[this.currentZone];
    zd.npcSpawns.forEach(({ tx, ty, scriptKey, npcFrame, facing }) => {
      const nx = tx * TILE.SIZE + TILE.SIZE / 2;
      const ny = ty * TILE.SIZE + TILE.SIZE;
      const sprite = this.physics.add.sprite(nx, ny, 'npc', npcFrame);
      sprite.setOrigin(0.5, 1).setDepth(ny - 1);
      (sprite.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      (sprite.body as Phaser.Physics.Arcade.Body).setSize(12, 10);
      if (facing === 'left') sprite.setFlipX(true);
      this.tweens.add({ targets: sprite, y: ny - 1, duration: 600 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.npcs.push({ sprite, scriptKey });
    });
  }

  // ── Battle ────────────────────────────────────────────────────────────────────
  private setupBattle(): void {
    this.battleMgr = new BattleManager(this);
    this.battleMgr.setBattleBackground(this.zones[this.currentZone].bgKey);

    this.battleMgr.setCallbacks(
      () => {
        this.locked = true;
        this.audio?.crossfade('battle', 400);
      },
      (expGain, goldGain) => {
        this.locked = false;
        this.cameras.main.startFollow(this.player, true, 0.10, 0.10);
        this.enemies = this.enemies.filter(e => {
          if (!e.active || e.alpha < 0.1) { e.destroy(); return false; }
          return true;
        });
        this.battleCooldown = true;
        this.time.delayedCall(800, () => { this.battleCooldown = false; });
        const zoneMusic = this.zones[this.currentZone].musicTrack;
        this.audio?.crossfade(zoneMusic, 600);
        this.audio?.sfx('victory');

        // Distribute EXP if gained
        if (expGain > 0) {
          const heroLvUp  = this.player.gainExp(expGain);
          const marleLvUp = this.ally.gainExp(expGain);
          if (heroLvUp) {
            this.time.delayedCall(2600, () => {
              this.battleMgr.showLevelUp('Crono', this.player.level);
            });
          }
          if (marleLvUp) {
            this.time.delayedCall(heroLvUp ? 4400 : 2600, () => {
              this.battleMgr.showLevelUp('Marle', this.ally.level);
            });
          }
          this.hudLevelLabel?.setText(`Lv.${this.player.level}`);
        }
        void goldGain;
      },
    );

    this.enemies.forEach(enemy => {
      this.physics.add.overlap(
        this.player as unknown as Phaser.Physics.Arcade.Sprite,
        enemy as unknown as Phaser.Physics.Arcade.Sprite,
        () => {
          if (this.locked || this.battleCooldown || this.inDialogue) return;
          const enemyUnit = {
            id             : `${enemy.def.key}_${Date.now()}`,
            name           : enemy.def.name,
            sprite         : enemy as unknown as Phaser.GameObjects.Sprite,
            hp             : enemy.hp, maxHp: enemy.def.hp,
            mp             : enemy.mp, maxMp: enemy.def.mp,
            atk            : enemy.def.atk, def: enemy.def.def, spd: enemy.def.spd,
            atb            : 0, isPlayerUnit: false, partyIndex: -1,
            techs          : [],
            waitingForInput: false,
          };
          this.battleMgr.startBattle(
            [
              { sprite: this.player as unknown as Phaser.Physics.Arcade.Sprite, unit: this.player.battleUnit },
              { sprite: this.ally   as unknown as Phaser.Physics.Arcade.Sprite, unit: this.ally.battleUnit   },
            ],
            [{ sprite: enemy as unknown as Phaser.Physics.Arcade.Sprite, unit: enemyUnit }],
          );
          this.audio?.sfx('attack');
        },
      );
    });
  }

  // ── Dialogue ─────────────────────────────────────────────────────────────────
  private setupDialogue(): void {
    this.dialogue = new DialogueSystem(this);
  }

  // ── HUD ──────────────────────────────────────────────────────────────────────
  private createHUD(): void {
    this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(150);

    const zd = this.zones[this.currentZone];

    // Zone name (top left)
    const zoneBg = this.add.graphics();
    zoneBg.fillStyle(0x000000, 0.55);
    zoneBg.fillRoundedRect(2, 2, 90, 14, 2);
    zoneBg.lineStyle(1, 0x446688, 0.5);
    zoneBg.strokeRoundedRect(2, 2, 90, 14, 2);
    this.hud.add(zoneBg);

    this.hudZoneLabel = this.add.text(6, 5, zd.label, {
      fontSize: '6px', fontFamily: 'monospace', color: '#88AACC',
    });
    this.hud.add(this.hudZoneLabel);

    // Level indicator (top right)
    const lvBg = this.add.graphics();
    lvBg.fillStyle(0x000000, 0.55);
    lvBg.fillRoundedRect(W - 38, 2, 36, 14, 2);
    lvBg.lineStyle(1, 0x446688, 0.5);
    lvBg.strokeRoundedRect(W - 38, 2, 36, 14, 2);
    this.hud.add(lvBg);

    this.hudLevelLabel = this.add.text(W - 34, 5, `Lv.${this.player?.level ?? 1}`, {
      fontSize: '6px', fontFamily: 'monospace', color: '#AABB88',
    });
    this.hud.add(this.hudLevelLabel);

    // Controls hint (bottom)
    const hint = this.add.text(W / 2, H - 5,
      '[←→↑↓/WASD] Move  [Shift] Run  [Z] Interact',
      { fontSize: '5px', fontFamily: 'monospace', color: '#334455' },
    ).setOrigin(0.5, 1);
    this.hud.add(hint);
  }

  // ── Controls ─────────────────────────────────────────────────────────────────
  private createControls(): void {
    this.input.keyboard!.on('keydown-Z', () => {
      if (this.locked || this.dialogue.isActive) return;
      this.tryInteract();
    });
  }

  private tryInteract(): void {
    const INTERACT_DIST = TILE.SIZE * 1.5;

    // NPCs
    for (const npc of this.npcs) {
      const dx = npc.sprite.x - this.player.x;
      const dy = npc.sprite.y - this.player.y;
      if (Math.sqrt(dx * dx + dy * dy) < INTERACT_DIST) {
        const script = NPC_SCRIPTS[npc.scriptKey];
        if (script) {
          this.inDialogue = true;
          this.player.setPlayerState('talk');
          this.dialogue.show(script, () => {
            this.inDialogue = false;
            this.player.setPlayerState('idle');
          });
          this.audio?.sfx('select');
          return;
        }
      }
    }

    // Gate
    const gateX = 44 * TILE.SIZE + TILE.SIZE / 2;
    const gateY = 13 * TILE.SIZE;
    const gdx = gateX - this.player.x;
    const gdy = gateY - this.player.y;
    if (Math.sqrt(gdx * gdx + gdy * gdy) < TILE.SIZE * 2) {
      const gateScript = NPC_SCRIPTS['gatekeeper'];
      if (gateScript) {
        this.inDialogue = true;
        this.player.setPlayerState('talk');
        this.dialogue.show(gateScript, () => {
          this.inDialogue = false;
          this.player.setPlayerState('idle');
        });
        this.audio?.sfx('magic');
        return;
      }
    }
  }

  // ── Zone transition ────────────────────────────────────────────────────────────
  private checkZoneTransitions(): void {
    if (this.locked || this.inDialogue) return;
    const zd = this.zones[this.currentZone];
    for (const exit of zd.exits) {
      const ex = exit.tx * TILE.SIZE + TILE.SIZE / 2;
      const ey = exit.ty * TILE.SIZE + TILE.SIZE / 2;
      const dx = ex - this.player.x;
      const dy = ey - this.player.y;
      if (Math.sqrt(dx * dx + dy * dy) < TILE.SIZE * 1.8) {
        this.transitionToZone(exit.toZone, exit.toTx, exit.toTy);
        return;
      }
    }
  }

  private transitionToZone(zone: ZoneKey, toTx: number, toTy: number): void {
    this.locked = true;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({ audio: this.audio, zone, startTx: toTx, startTy: toTy });
    });
  }

  // ── Update ────────────────────────────────────────────────────────────────────
  override update(_time: number, delta: number): void {
    if (this.dialogue.isActive) {
      this.dialogue.update();
      return;
    }

    if (this.locked) {
      this.battleMgr.update(delta);
    } else {
      this.player.update(delta);
      this.ally.update(delta, false);
      this.checkZoneTransitions();
    }

    this.enemies.forEach(e => e.tick(delta, this.locked));
    this.updateNPCHints();
  }

  private updateNPCHints(): void {
    const INTERACT_DIST = TILE.SIZE * 1.5;
    this.npcs.forEach(npc => {
      const dx = npc.sprite.x - this.player.x;
      const dy = npc.sprite.y - this.player.y;
      npc.sprite.setTint(Math.sqrt(dx * dx + dy * dy) < INTERACT_DIST ? 0xFFFFAA : 0xFFFFFF);
    });
  }
}
