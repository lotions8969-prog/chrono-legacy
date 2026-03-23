import Phaser from 'phaser';
import { SCENE, CANVAS, TILE, BLOCKING_TILES } from '../data/constants';
import { Player, Ally } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { BattleManager } from '../systems/BattleManager';
import { DialogueSystem } from '../systems/DialogueSystem';
import { AudioManager } from '../systems/AudioManager';
import { ENEMY_DEFS } from '../data/enemies';
import { NPC_SCRIPTS } from '../data/story';
const W = CANVAS.WIDTH;
const H = CANVAS.HEIGHT;
// ── Map definition  50 × 36 ───────────────────────────────────────────────────
// 0=grass 1=water 2=rock 3=path 4=flower 5=sand 6=dark-grass 7=bridge 8=wood-floor
const MAP = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 4, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 2, 2, 0, 0, 0, 6, 6, 2, 2, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 2, 2, 0, 0, 0, 6, 6, 2, 2, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 4, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 7, 7, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 7, 7, 1, 1, 0, 0, 0, 4, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 4, 0, 0, 0, 0, 0, 0, 3, 0, 0, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 2, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 2, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2],
    [2, 0, 4, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 3, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2],
    [2, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2],
    [2, 0, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 3, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2],
    [2, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];
const COLS = MAP[0].length; // 50
const ROWS = MAP.length; // 36
// ── Enemy spawn table ─────────────────────────────────────────────────────────
const ENEMY_SPAWNS = [
    [20, 4, 'SLIME'],
    [30, 8, 'BAT'],
    [13, 13, 'SLIME'],
    [38, 12, 'BAT'],
    [42, 22, 'GOLEM'],
    [25, 28, 'SLIME'],
    [45, 30, 'BAT'],
    [40, 18, 'CRYSTAL_WRAITH'],
];
const NPC_SPAWNS = [
    { tx: 12, ty: 13, scriptKey: 'elder', npcFrame: 0, facing: 'down' },
    { tx: 16, ty: 16, scriptKey: 'merchant', npcFrame: 2, facing: 'right' },
    { tx: 21, ty: 10, scriptKey: 'adventurer', npcFrame: 4, facing: 'left' },
    { tx: 14, ty: 17, scriptKey: 'child', npcFrame: 6, facing: 'down' },
    { tx: 20, ty: 16, scriptKey: 'scientist', npcFrame: 8, facing: 'right' },
];
// ── World scene ───────────────────────────────────────────────────────────────
export class World extends Phaser.Scene {
    constructor() {
        super({ key: SCENE.WORLD });
        this.enemies = [];
        this.npcs = [];
        this.audio = null;
        this.locked = false;
        this.battleCooldown = false;
        this.inDialogue = false;
        this.cloudTimer = 0;
    }
    // Data passed from Title scene
    init(data) {
        this.audio = data?.audio ?? null;
    }
    create() {
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
        // Start or continue field music
        if (!this.audio) {
            this.audio = new AudioManager();
        }
        this.input.keyboard?.once('keydown', () => {
            this.audio?.init();
            this.audio?.crossfade('field', 400);
        });
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }
    // ── Parallax background ───────────────────────────────────────────────────
    createParallaxBackground() {
        const mapPxW = COLS * TILE.SIZE;
        const mapPxH = ROWS * TILE.SIZE;
        // Sky gradient (always behind everything, full map size)
        const sky = this.add.graphics().setScrollFactor(0).setDepth(-30);
        sky.fillGradientStyle(0x102040, 0x102040, 0x203060, 0x304080, 1);
        sky.fillRect(0, 0, W, H);
        // Distant mountains (parallax layer, scrolls at 0.3x speed)
        this.mountainBg = this.add.graphics().setScrollFactor(0.3, 0.5).setDepth(-20);
        this.drawMountainLayer(this.mountainBg, mapPxW);
        // Cloud layer
        this.cloudBg = this.add.graphics().setScrollFactor(0.15, 0).setDepth(-25);
        this.drawClouds(this.cloudBg, mapPxW);
        // Keep tilemap over parallax
        mapPxH; // suppress
    }
    drawMountainLayer(g, mapW) {
        // Draw mountain silhouettes across the full map width
        g.fillStyle(0x1A2840, 1);
        const peaks = [];
        for (let x = 0; x <= mapW; x += 32)
            peaks.push(32 + Math.sin(x * 0.03) * 28 + Math.cos(x * 0.07) * 14);
        for (let i = 0; i < peaks.length - 1; i++) {
            const x0 = i * 32, x1 = (i + 1) * 32;
            const y0 = H * 0.5 - peaks[i], y1 = H * 0.5 - peaks[i + 1];
            const yBase = H;
            g.fillTriangle(x0, yBase, x0, y0, x1, y1);
            g.fillTriangle(x0, yBase, x1, y1, x1, yBase);
        }
        // Closer mountains, darker
        g.fillStyle(0x0E1828, 1);
        for (let i = 0; i < peaks.length - 1; i++) {
            const x0 = i * 32, x1 = (i + 1) * 32;
            const y0 = H * 0.6 - peaks[i] * 0.6, y1 = H * 0.6 - peaks[i + 1] * 0.6;
            g.fillTriangle(x0, H, x0, y0, x1, y1);
            g.fillTriangle(x0, H, x1, y1, x1, H);
        }
    }
    drawClouds(g, mapW) {
        const cloudPositions = [
            [20, 20, 40, 12], [90, 14, 60, 14], [180, 22, 50, 10],
            [260, 18, 70, 16], [360, 10, 45, 11], [440, 24, 55, 13],
        ];
        cloudPositions.forEach(([x, y, rx, ry]) => {
            while (x < mapW) {
                g.fillStyle(0x8899BB, 0.12);
                g.fillEllipse(x, y, rx * 2, ry * 2);
                g.fillStyle(0xAABBCC, 0.06);
                g.fillEllipse(x - rx * 0.3, y - ry * 0.3, rx * 1.4, ry * 1.4);
                x += mapW * 0.7;
            }
        });
    }
    // ── Tilemap ───────────────────────────────────────────────────────────────
    createTilemap() {
        const map = this.make.tilemap({ data: MAP, tileWidth: TILE.SIZE, tileHeight: TILE.SIZE });
        const tileset = map.addTilesetImage('world', 'tileset', TILE.SIZE, TILE.SIZE, 0, 0);
        this.wallLayer = map.createLayer(0, tileset, 0, 0);
        this.wallLayer.setDepth(0);
    }
    // ── Decorative objects (trees, buildings, gate, save crystal) ─────────────
    placeDecorations() {
        // Trees scattered in dark-grass / border areas
        const treePositions = [
            [10, 1], [11, 2], [12, 1], [13, 3], [11, 4], // north forest
            [10, 5], [14, 1], [15, 2], [16, 3],
            [1, 22], [2, 24], [1, 28], [2, 30], // west forest
            [47, 5], [47, 8], [47, 12], [47, 16], // east border
        ];
        treePositions.forEach(([tx, ty]) => {
            this.add.image(tx * TILE.SIZE + TILE.SIZE / 2, ty * TILE.SIZE + TILE.SIZE * 2, // tree bottom = tile bottom
            'tree').setOrigin(0.5, 1).setDepth(ty * TILE.SIZE + TILE.SIZE * 2 - 1);
        });
        // Buildings (placed over wood-floor tiles)
        const buildingPositions = [
            [12, 9], // elder's house
            [18, 15], // scientist's lab
        ];
        buildingPositions.forEach(([tx, ty]) => {
            const bx = tx * TILE.SIZE + TILE.SIZE * 2;
            const by = ty * TILE.SIZE + TILE.SIZE * 2;
            this.add.image(bx, by, 'building').setOrigin(0.5, 1).setDepth(by - 1);
        });
        // Time gate / portal (glowing, animated)
        const gate = this.add.image(44 * TILE.SIZE + TILE.SIZE / 2, 13 * TILE.SIZE, 'gate')
            .setOrigin(0.5, 1).setDepth(700);
        this.tweens.add({
            targets: gate,
            alpha: 0.7,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1200,
            yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut',
        });
        // Gate shimmer
        this.time.addEvent({
            delay: 300,
            callback: () => {
                this.tweens.add({ targets: gate, tint: 0x88AAFF, duration: 150, yoyo: true });
            },
            repeat: -1,
        });
        // Save crystal
        const crystal = this.add.image(16 * TILE.SIZE + 8, 12 * TILE.SIZE - 2, 'save_crystal')
            .setOrigin(0.5, 1).setDepth(500);
        this.tweens.add({
            targets: crystal,
            alpha: 0.6,
            y: crystal.y - 2,
            duration: 900,
            yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut',
        });
        // Crystal glow particles
        this.time.addEvent({
            delay: 200,
            callback: () => {
                const px = crystal.x + Phaser.Math.Between(-6, 6);
                const py = crystal.y + Phaser.Math.Between(-8, 0);
                const spark = this.add.rectangle(px, py, 1, 1, 0xAADDFF, 0.8).setDepth(501);
                this.tweens.add({ targets: spark, y: py - 6, alpha: 0, duration: 600,
                    onComplete: () => spark.destroy() });
            },
            repeat: -1,
        });
        // Water shimmer effect on lake tiles
        this.time.addEvent({
            delay: 400,
            callback: () => {
                const lakeX = Phaser.Math.Between(35, 39) * TILE.SIZE + 4;
                const lakeY = Phaser.Math.Between(5, 9) * TILE.SIZE + 4;
                const shimmer = this.add.rectangle(lakeX, lakeY, 3, 1, 0xAADDFF, 0.5).setDepth(1);
                this.tweens.add({ targets: shimmer, alpha: 0, x: lakeX + 3, duration: 700,
                    onComplete: () => shimmer.destroy() });
            },
            repeat: -1,
        });
    }
    // ── Characters ────────────────────────────────────────────────────────────
    createCharacters() {
        const sx = 11 * TILE.SIZE + TILE.SIZE / 2;
        const sy = 13 * TILE.SIZE + TILE.SIZE;
        this.player = new Player(this, sx, sy);
        this.ally = new Ally(this, sx - 18, sy);
        this.ally.follow(this.player);
    }
    // ── Camera ────────────────────────────────────────────────────────────────
    setupCamera() {
        const ww = COLS * TILE.SIZE;
        const wh = ROWS * TILE.SIZE;
        this.physics.world.setBounds(0, 0, ww, wh);
        this.cameras.main
            .setBounds(0, 0, ww, wh)
            .startFollow(this.player, true, 0.10, 0.10)
            .setRoundPixels(true);
    }
    // ── Collision ─────────────────────────────────────────────────────────────
    setupCollision() {
        this.wallLayer.setCollision(BLOCKING_TILES);
        this.physics.add.collider(this.player, this.wallLayer);
        this.physics.add.collider(this.ally, this.wallLayer);
    }
    // ── Enemies ───────────────────────────────────────────────────────────────
    spawnEnemies() {
        ENEMY_SPAWNS.forEach(([tx, ty, key]) => {
            const def = ENEMY_DEFS[key];
            if (!def)
                return;
            const enemy = new Enemy(this, tx * TILE.SIZE + TILE.SIZE / 2, ty * TILE.SIZE + TILE.SIZE, def);
            this.physics.add.collider(enemy, this.wallLayer);
            this.enemies.push(enemy);
        });
    }
    // ── NPCs ──────────────────────────────────────────────────────────────────
    spawnNPCs() {
        NPC_SPAWNS.forEach(({ tx, ty, scriptKey, npcFrame, facing }) => {
            const nx = tx * TILE.SIZE + TILE.SIZE / 2;
            const ny = ty * TILE.SIZE + TILE.SIZE;
            const sprite = this.physics.add.sprite(nx, ny, 'npc', npcFrame);
            sprite.setOrigin(0.5, 1).setDepth(ny - 1);
            sprite.body.setImmovable(true);
            sprite.body.setSize(10, 8);
            // Set flip for facing
            if (facing === 'right')
                sprite.setFlipX(false);
            if (facing === 'left')
                sprite.setFlipX(true);
            // Idle bob
            this.tweens.add({
                targets: sprite,
                y: ny - 1,
                duration: 600 + Math.random() * 400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
            // Interaction radius indicator (visible when player is near)
            this.npcs.push({ sprite, scriptKey });
        });
    }
    // ── Battle system ─────────────────────────────────────────────────────────
    setupBattle() {
        this.battleMgr = new BattleManager(this);
        this.battleMgr.setCallbacks(() => {
            this.locked = true;
            this.audio?.crossfade('battle', 400);
        }, () => {
            this.locked = false;
            this.cameras.main.startFollow(this.player, true, 0.10, 0.10);
            this.enemies = this.enemies.filter(e => {
                if (!e.active || e.alpha < 0.1) {
                    e.destroy();
                    return false;
                }
                return true;
            });
            this.battleCooldown = true;
            this.time.delayedCall(800, () => { this.battleCooldown = false; });
            this.audio?.crossfade('field', 600);
            this.audio?.sfx('victory');
        });
        this.enemies.forEach(enemy => {
            this.physics.add.overlap(this.player, enemy, () => {
                if (this.locked || this.battleCooldown || this.inDialogue)
                    return;
                const enemyUnit = {
                    id: `${enemy.def.key}_${Date.now()}`,
                    name: enemy.def.name,
                    sprite: enemy,
                    hp: enemy.hp, maxHp: enemy.def.hp,
                    mp: enemy.mp, maxMp: enemy.def.mp,
                    atk: enemy.def.atk, def: enemy.def.def, spd: enemy.def.spd,
                    atb: 0, isPlayerUnit: false, partyIndex: -1,
                    exp: enemy.def.exp,
                    techs: [],
                    waitingForInput: false,
                };
                this.battleMgr.startBattle([
                    { sprite: this.player, unit: this.player.battleUnit },
                    { sprite: this.ally, unit: this.ally.battleUnit },
                ], [{ sprite: enemy, unit: enemyUnit }]);
                this.audio?.sfx('attack');
            });
        });
    }
    // ── Dialogue system ───────────────────────────────────────────────────────
    setupDialogue() {
        this.dialogue = new DialogueSystem(this);
    }
    // ── HUD ───────────────────────────────────────────────────────────────────
    createHUD() {
        this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(150);
        // Mini-map indicator (top right)
        const mapBg = this.add.graphics();
        mapBg.fillStyle(0x000000, 0.5);
        mapBg.fillRect(W - 38, 2, 36, 12);
        mapBg.lineStyle(1, 0x446688, 0.6);
        mapBg.strokeRect(W - 38, 2, 36, 12);
        this.hud.add(mapBg);
        const mapLabel = this.add.text(W - 37, 4, 'Truce Village', {
            fontSize: '5px', fontFamily: 'monospace', color: '#88AACC',
        });
        this.hud.add(mapLabel);
        // Controls hint
        const hint = this.add.text(W / 2, H - 5, '[←→↑↓/WASD] Move   [Shift] Run   [Z] Interact', { fontSize: '5px', fontFamily: 'monospace', color: '#445566' }).setOrigin(0.5, 1);
        this.hud.add(hint);
    }
    createControls() {
        // Z key handling for NPC dialogue
        this.input.keyboard.on('keydown-Z', () => {
            if (this.locked || this.dialogue.isActive)
                return;
            this.tryInteract();
        });
    }
    tryInteract() {
        const INTERACT_DIST = TILE.SIZE * 1.4;
        // Check NPCs
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
        // Check gate
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
    // ── Update ────────────────────────────────────────────────────────────────
    update(_time, delta) {
        this.cloudTimer += delta;
        if (this.dialogue.isActive) {
            this.dialogue.update();
            return;
        }
        if (this.locked) {
            this.battleMgr.update(delta);
        }
        else {
            this.player.update(delta);
            this.ally.update(delta, false);
        }
        this.enemies.forEach(e => e.tick(delta, this.locked));
        this.updateNPCInteractHints();
    }
    updateNPCInteractHints() {
        const INTERACT_DIST = TILE.SIZE * 1.5;
        this.npcs.forEach(npc => {
            const dx = npc.sprite.x - this.player.x;
            const dy = npc.sprite.y - this.player.y;
            const near = Math.sqrt(dx * dx + dy * dy) < INTERACT_DIST;
            npc.sprite.setTint(near ? 0xFFFFAA : 0xFFFFFF);
        });
    }
}
