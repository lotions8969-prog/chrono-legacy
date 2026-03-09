import Phaser from 'phaser';
import { SCENE, CANVAS, TILE, BLOCKING_TILES } from '../data/constants';
import { Player } from '../entities/Player';

// ── Map data  30 cols × 20 rows ───────────────────────────────────────────────
// 0=grass  1=water  2=rock  3=path  4=flower
const MAP: number[][] = [
  [2,2,2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2,2,2],
  [2,0,0,0,0,0,0,0,0,3, 3,3,3,3,3,3,0,0,0,0, 0,0,0,0,0,0,0,0,0,2],
  [2,0,4,0,0,0,0,0,0,3, 0,0,0,0,0,3,0,0,4,0, 0,0,0,0,0,0,0,4,0,2],
  [2,0,0,0,2,2,0,0,0,3, 0,0,0,0,0,3,0,0,0,0, 0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,2,2,0,0,0,3, 0,0,0,0,0,3,0,0,0,0, 0,0,0,0,0,4,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,3, 0,0,0,0,0,0,0,0,0,1, 1,1,1,0,0,0,0,0,0,2],
  [2,0,0,4,0,0,0,0,0,3, 0,0,0,0,0,0,0,0,0,1, 1,1,1,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,3, 3,3,3,3,0,0,0,0,0,1, 1,1,1,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0, 0,0,3,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0,2],
  [2,0,4,0,0,0,0,0,0,0, 0,0,3,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0, 0,0,3,3,3,3,3,3,0,0, 0,0,0,0,0,4,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,3,0,0, 0,0,0,0,0,0,0,0,0,2],
  [2,0,0,2,2,2,0,0,0,0, 0,0,0,0,0,0,0,3,0,0, 0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,3,0,0, 0,4,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,4,0, 0,0,0,0,0,0,0,3,3,3, 3,3,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,2],
  [2,0,4,0,0,0,0,0,0,0, 0,0,4,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,4,0,2],
  [2,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,4,0,0,0,0,4, 0,0,0,0,0,4,0,0,0,0, 4,0,0,0,0,0,0,0,0,2],
  [2,2,2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2,2,2],
];

const MAP_COLS = MAP[0].length;  // 30
const MAP_ROWS = MAP.length;     // 20

// ── World ─────────────────────────────────────────────────────────────────────
export class World extends Phaser.Scene {

  private player!    : Player;
  private wallLayer! : Phaser.Tilemaps.TilemapLayer;
  private debugText! : Phaser.GameObjects.Text;

  constructor() { super({ key: SCENE.WORLD }); }

  create(): void {
    this.createTilemap();
    this.createPlayer();
    this.setupCamera();
    this.setupCollision();
    this.addNPCs();
    this.setupDebugHUD();
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  // ── Tilemap ───────────────────────────────────────────────────────────────
  private createTilemap(): void {
    const map = this.make.tilemap({
      data      : MAP,
      tileWidth : TILE.SIZE,
      tileHeight: TILE.SIZE,
    });

    // 'world' is just a local name; 'tileset' is the Phaser texture key
    const tileset = map.addTilesetImage('world', 'tileset', TILE.SIZE, TILE.SIZE, 0, 0)!;
    this.wallLayer = map.createLayer(0, tileset, 0, 0)!;
    this.wallLayer.setDepth(0);
  }

  // ── Player ─────────────────────────────────────────────────────────────────
  private createPlayer(): void {
    // Start at tile (5, 9) – a safe grass cell near map centre
    const tx = 5, ty = 9;
    this.player = new Player(
      this,
      tx * TILE.SIZE + TILE.SIZE / 2,
      ty * TILE.SIZE + TILE.SIZE,      // origin is bottom-centre
    );
  }

  // ── Camera ─────────────────────────────────────────────────────────────────
  private setupCamera(): void {
    const worldW = MAP_COLS * TILE.SIZE;
    const worldH = MAP_ROWS * TILE.SIZE;

    this.physics.world.setBounds(0, 0, worldW, worldH);

    this.cameras.main
      .setBounds(0, 0, worldW, worldH)
      .startFollow(this.player, true, 0.10, 0.10)  // lerp smoothing
      .setRoundPixels(true);
  }

  // ── Collision ──────────────────────────────────────────────────────────────
  private setupCollision(): void {
    this.wallLayer.setCollision(BLOCKING_TILES);
    this.physics.add.collider(this.player, this.wallLayer);
  }

  // ── Decorative NPCs ────────────────────────────────────────────────────────
  private addNPCs(): void {
    const positions = [
      { tx: 12, ty: 3 },
      { tx: 20, ty: 6 },
      { tx: 7,  ty: 14 },
    ];

    positions.forEach(({ tx, ty }, i) => {
      const npc = this.physics.add.sprite(
        tx * TILE.SIZE + TILE.SIZE / 2,
        ty * TILE.SIZE + TILE.SIZE,
        'npc',
        i % 2 === 0 ? 0 : 2,
      );
      npc.setOrigin(0.5, 1).setDepth(8);

      // Idle bob tween
      this.tweens.add({
        targets : npc,
        y       : npc.y - 1,
        duration: 700 + i * 200,
        yoyo    : true,
        repeat  : -1,
        ease    : 'Sine.easeInOut',
      });
    });
  }

  // ── Debug HUD ──────────────────────────────────────────────────────────────
  private setupDebugHUD(): void {
    this.debugText = this.add
      .text(4, 4, '', {
        fontSize  : '6px',
        fontFamily: 'monospace',
        color     : '#00ff88',
        backgroundColor: 'rgba(0,0,0,0.45)',
        padding   : { x: 3, y: 2 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Controls hint (bottom of screen)
    this.add.text(CANVAS.WIDTH / 2, CANVAS.HEIGHT - 8,
      '[←→↑↓ / WASD] Move   [Shift] Run   [Z] Action',
      {
        fontSize  : '5px',
        fontFamily: 'monospace',
        color     : '#8899aa',
      },
    ).setOrigin(0.5, 1).setScrollFactor(0).setDepth(100);
  }

  // ── Update loop ────────────────────────────────────────────────────────────
  override update(_time: number, delta: number): void {
    this.player.update(delta);
    this.refreshDebug();
  }

  private refreshDebug(): void {
    const { x, y } = this.player;
    const tx = Math.floor(x / TILE.SIZE);
    const ty = Math.floor(y / TILE.SIZE);
    this.debugText.setText(
      `Pos  ${x.toFixed(0).padStart(3)} , ${y.toFixed(0).padStart(3)}\n` +
      `Tile ${tx} , ${ty}\n` +
      `State  ${this.player.playerState ?? '—'}   Face  ${this.player.facing}`,
    );
  }
}
