import Phaser from 'phaser';
import { SCENE, CANVAS, TILE, BLOCKING_TILES } from '../data/constants';
import { Player, Ally } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { BattleManager } from '../systems/BattleManager';
import { ENEMY_DEFS } from '../data/enemies';

// ── Map  30 × 20 ─────────────────────────────────────────────────────────────
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

const COLS = MAP[0].length;
const ROWS = MAP.length;

// ── Spawn points [tileX, tileY, enemyKey] ────────────────────────────────────
const ENEMY_SPAWNS: Array<[number, number, string]> = [
  [15, 3,  'SLIME'],
  [22, 7,  'BAT'],
  [8,  13, 'SLIME'],
  [20, 14, 'BAT'],
  [25, 10, 'GOLEM'],
];

// ── World ─────────────────────────────────────────────────────────────────────
export class World extends Phaser.Scene {

  private player!        : Player;
  private ally!          : Ally;
  private enemies        : Enemy[] = [];
  private wallLayer!     : Phaser.Tilemaps.TilemapLayer;
  private battleMgr!     : BattleManager;
  private debugText!     : Phaser.GameObjects.Text;
  private locked         = false;   // true while battle is running
  private battleCooldown = false;   // brief cooldown after battle ends to prevent immediate re-trigger

  constructor() { super({ key: SCENE.WORLD }); }

  create(): void {
    this.createTilemap();
    this.createCharacters();
    this.setupCamera();
    this.setupCollision();
    this.spawnEnemies();
    this.setupBattle();
    this.addDecoNPCs();
    this.setupDebugHUD();
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  // ── Tilemap ───────────────────────────────────────────────────────────────
  private createTilemap(): void {
    const map      = this.make.tilemap({ data: MAP, tileWidth: TILE.SIZE, tileHeight: TILE.SIZE });
    const tileset  = map.addTilesetImage('world', 'tileset', TILE.SIZE, TILE.SIZE, 0, 0)!;
    this.wallLayer = map.createLayer(0, tileset, 0, 0)!;
    this.wallLayer.setDepth(0);
  }

  // ── Characters ────────────────────────────────────────────────────────────
  private createCharacters(): void {
    const sx = 5 * TILE.SIZE + TILE.SIZE / 2;
    const sy = 9 * TILE.SIZE + TILE.SIZE;
    this.player = new Player(this, sx, sy);
    this.ally   = new Ally(this, sx - 18, sy);
    this.ally.follow(this.player);
  }

  // ── Camera ────────────────────────────────────────────────────────────────
  private setupCamera(): void {
    const ww = COLS * TILE.SIZE, wh = ROWS * TILE.SIZE;
    this.physics.world.setBounds(0, 0, ww, wh);
    this.cameras.main
      .setBounds(0, 0, ww, wh)
      .startFollow(this.player, true, 0.10, 0.10)
      .setRoundPixels(true);
  }

  // ── Collision ─────────────────────────────────────────────────────────────
  private setupCollision(): void {
    this.wallLayer.setCollision(BLOCKING_TILES);
    this.physics.add.collider(this.player as unknown as Phaser.Physics.Arcade.Sprite, this.wallLayer);
    this.physics.add.collider(this.ally   as unknown as Phaser.Physics.Arcade.Sprite, this.wallLayer);
  }

  // ── Enemies ───────────────────────────────────────────────────────────────
  private spawnEnemies(): void {
    ENEMY_SPAWNS.forEach(([tx, ty, key]) => {
      const def   = ENEMY_DEFS[key];
      if (!def) return;
      const enemy = new Enemy(
        this,
        tx * TILE.SIZE + TILE.SIZE / 2,
        ty * TILE.SIZE + TILE.SIZE,
        def,
      );
      this.wallLayer.setCollision(BLOCKING_TILES);
      this.physics.add.collider(enemy as unknown as Phaser.Physics.Arcade.Sprite, this.wallLayer);
      this.enemies.push(enemy);
    });
  }

  // ── Battle system ─────────────────────────────────────────────────────────
  private setupBattle(): void {
    this.battleMgr = new BattleManager(this);

    this.battleMgr.setCallbacks(
      // onBattleStart: lock exploration
      () => { this.locked = true; },
      // onBattleEnd: resume exploration, restore camera follow
      () => {
        this.locked = false;
        this.cameras.main.startFollow(this.player, true, 0.10, 0.10);
        // Remove enemies whose sprites were faded out (alpha=0) by BattleManager
        this.enemies = this.enemies.filter(e => {
          if (!e.active || e.alpha < 0.1) { e.destroy(); return false; }
          return true;
        });
        // Brief cooldown to prevent instantly re-triggering a battle
        this.battleCooldown = true;
        this.time.delayedCall(800, () => { this.battleCooldown = false; });
      },
    );

    // Register overlap triggers for each enemy
    this.enemies.forEach(enemy => {
      this.physics.add.overlap(
        this.player as unknown as Phaser.Physics.Arcade.Sprite,
        enemy as unknown as Phaser.Physics.Arcade.Sprite,
        () => {
          if (this.locked || this.battleCooldown) return;

          // Build BattleUnit entries for alive enemies encountered
          // (for now: the single enemy that was touched)
          const enemyUnit = {
            id             : `${enemy.def.key}_${Date.now()}`,
            name           : enemy.def.name,
            sprite         : enemy as unknown as Phaser.GameObjects.Sprite,
            hp             : enemy.hp,   maxHp: enemy.def.hp,
            mp             : enemy.mp,   maxMp: enemy.def.mp,
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
        },
      );
    });
  }

  // ── Decorative NPCs ────────────────────────────────────────────────────────
  private addDecoNPCs(): void {
    [[12, 3], [20, 6], [7, 14]].forEach(([tx, ty], i) => {
      const npc = this.physics.add.sprite(
        tx * TILE.SIZE + TILE.SIZE / 2,
        ty * TILE.SIZE + TILE.SIZE,
        'npc', i % 2 === 0 ? 0 : 2,
      );
      npc.setOrigin(0.5, 1).setDepth(8);
      this.tweens.add({ targets: npc, y: npc.y - 1, duration: 700 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
  }

  // ── Debug HUD ─────────────────────────────────────────────────────────────
  private setupDebugHUD(): void {
    this.debugText = this.add.text(4, 4, '', {
      fontSize: '6px', fontFamily: 'monospace', color: '#00ff88',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 3, y: 2 },
    }).setScrollFactor(0).setDepth(100);

    this.add.text(CANVAS.WIDTH / 2, CANVAS.HEIGHT - 5,
      '[Arrows/WASD] Move  [Shift] Run  [Z] Confirm',
      { fontSize: '5px', fontFamily: 'monospace', color: '#667788' },
    ).setOrigin(0.5, 1).setScrollFactor(0).setDepth(100);
  }

  // ── Update ────────────────────────────────────────────────────────────────
  override update(_time: number, delta: number): void {
    if (this.locked) {
      this.battleMgr.update(delta);
    } else {
      this.player.update(delta);
      this.ally.update(delta, false);
    }

    this.enemies.forEach(e => e.tick(delta, this.locked));
    this.refreshDebug();
  }

  private refreshDebug(): void {
    const { x, y } = this.player;
    const tx = Math.floor(x / TILE.SIZE);
    const ty = Math.floor(y / TILE.SIZE);
    const bu = this.player.battleUnit;
    this.debugText.setText(
      `Pos ${x.toFixed(0).padStart(3)},${y.toFixed(0).padStart(3)}  Tile ${tx},${ty}\n` +
      `State ${this.player.playerState ?? '—'}  Face ${this.player.facing}\n` +
      `HP ${bu.hp}/${bu.maxHp}  MP ${bu.mp}/${bu.maxMp}  ${this.locked ? '⚔ BATTLE' : '🗺 EXPLORE'}`,
    );
  }
}
