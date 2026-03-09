import Phaser from 'phaser';
import { SCENE, TILE } from '../data/constants';
const S = TILE.SIZE; // 16
// ── Preloader ─────────────────────────────────────────────────────────────────
// Generates ALL placeholder textures programmatically using CanvasTexture.
// When real assets are available, replace each `buildXxx()` with a normal load.
export class Preloader extends Phaser.Scene {
    constructor() { super({ key: SCENE.PRELOADER }); }
    create() {
        this.buildTileset();
        this.buildPlayerSprite();
        this.buildNPCSprite();
        this.buildUIAssets();
        this.scene.start(SCENE.TITLE);
    }
    // ── Tileset  (5 tiles × 16×16, horizontal strip) ───────────────────────────
    // Index: 0=grass  1=water  2=rock  3=path  4=flower
    buildTileset() {
        const ct = this.textures.createCanvas('tileset', S * 5, S);
        const ctx = ct.context;
        // helper: fill with detail dots
        const dots = (offX, pairs, col) => {
            ctx.fillStyle = col;
            pairs.forEach(([x, y]) => ctx.fillRect(offX + x, y, 1, 1));
        };
        // ── Tile 0: Grass ─────────────────────────────────────────────────────────
        ctx.fillStyle = '#3a7d44';
        ctx.fillRect(0, 0, S, S);
        dots(0, [[3, 4], [9, 11], [13, 2], [6, 14]], '#2d6636');
        dots(0, [[2, 8], [11, 5], [7, 1]], '#4a9950');
        // ── Tile 1: Water ─────────────────────────────────────────────────────────
        ctx.fillStyle = '#1a4fa0';
        ctx.fillRect(S, 0, S, S);
        ctx.fillStyle = '#2060bb';
        ctx.fillRect(S + 2, 5, 5, 2);
        ctx.fillRect(S + 9, 11, 5, 2);
        ctx.fillStyle = '#5090e0';
        ctx.fillRect(S + 2, 5, 2, 1);
        ctx.fillRect(S + 9, 11, 2, 1);
        ctx.fillStyle = '#70b8f8'; // shimmer pixel
        ctx.fillRect(S + 7, 2, 1, 1);
        ctx.fillRect(S + 4, 13, 1, 1);
        // ── Tile 2: Rock / Wall ───────────────────────────────────────────────────
        ctx.fillStyle = '#5c5047';
        ctx.fillRect(S * 2, 0, S, S);
        ctx.fillStyle = '#4a3e38';
        ctx.fillRect(S * 2 + 2, 2, 5, 5);
        ctx.fillRect(S * 2 + 9, 9, 5, 5);
        ctx.fillStyle = '#6e6058';
        ctx.fillRect(S * 2 + 2, 2, 2, 1);
        ctx.fillRect(S * 2 + 9, 9, 2, 1);
        ctx.fillStyle = '#38302a'; // border shadow
        ctx.fillRect(S * 2 + 1, 1, 1, 14);
        ctx.fillRect(S * 2 + 1, 1, 14, 1);
        // ── Tile 3: Path / Dirt ───────────────────────────────────────────────────
        ctx.fillStyle = '#c9a94a';
        ctx.fillRect(S * 3, 0, S, S);
        ctx.fillStyle = '#b89840';
        ctx.fillRect(S * 3 + 2, 5, 3, 2);
        ctx.fillRect(S * 3 + 10, 11, 3, 2);
        ctx.fillStyle = '#d4b860';
        ctx.fillRect(S * 3 + 5, 2, 1, 1);
        ctx.fillRect(S * 3 + 12, 13, 1, 1);
        // ── Tile 4: Flowers ───────────────────────────────────────────────────────
        ctx.fillStyle = '#3a7d44';
        ctx.fillRect(S * 4, 0, S, S);
        dots(S * 4, [[5, 8], [12, 11]], '#2d6636');
        // Red flower
        ctx.fillStyle = '#cc2244';
        ctx.fillRect(S * 4 + 2, 7, 2, 2);
        ctx.fillStyle = '#ff4466';
        ctx.fillRect(S * 4 + 2, 7, 1, 1);
        // Yellow flower
        ctx.fillStyle = '#ccaa00';
        ctx.fillRect(S * 4 + 10, 3, 2, 2);
        ctx.fillStyle = '#ffdd00';
        ctx.fillRect(S * 4 + 10, 3, 1, 1);
        // Stems
        ctx.fillStyle = '#228822';
        ctx.fillRect(S * 4 + 3, 9, 1, 2);
        ctx.fillRect(S * 4 + 11, 5, 1, 2);
        ct.refresh();
    }
    // ── Player sprite  (8 frames × 12×16) ──────────────────────────────────────
    // 0=idle  1=walk_a  2=walk_b  3=run_a  4=run_b  5=talk  6=win_a  7=win_b
    buildPlayerSprite() {
        const FW = 12, FH = 16, N = 8;
        const ct = this.textures.createCanvas('player', FW * N, FH);
        const ctx = ct.context;
        const HAIR = '#d4a017';
        const drawChar = (fi, o) => {
            const ox = fi * FW;
            // Foot shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(ox + 2, 14, 8, 2);
            // Legs
            ctx.fillStyle = '#2244aa';
            ctx.fillRect(ox + 3, 14 + o.legOff, 2, 2 - o.legOff);
            ctx.fillRect(ox + 7, 14 - o.legOff, 2, 2 + o.legOff);
            // Body
            ctx.fillStyle = o.bodyCol;
            ctx.fillRect(ox + 2, 5, 8, 9);
            // Belt
            ctx.fillStyle = '#443300';
            ctx.fillRect(ox + 2, 10, 8, 1);
            // Collar/scarf
            ctx.fillStyle = '#cc4422';
            ctx.fillRect(ox + 2, 5, 8, 1);
            // Head
            ctx.fillStyle = '#fdbcb4';
            ctx.fillRect(ox + 3, 1, 6, 5);
            // Hair
            ctx.fillStyle = HAIR;
            ctx.fillRect(ox + 3, 0, 6, 2);
            ctx.fillRect(ox + 3, 0, 1, 4); // left sideburn
            ctx.fillRect(ox + 8, 0, 1, 3); // right sideburn
            // Eyes
            ctx.fillStyle = '#331111';
            ctx.fillRect(ox + 4 + o.eyeShift, 3, 1, 1);
            ctx.fillRect(ox + 7 + o.eyeShift, 3, 1, 1);
            // Mouth (open when talking)
            if (o.mouthOpen) {
                ctx.fillStyle = '#331111';
                ctx.fillRect(ox + 5, 5, 2, 1);
            }
        };
        drawChar(0, { bodyCol: '#4466bb', legOff: 0, eyeShift: 0, mouthOpen: false }); // idle
        drawChar(1, { bodyCol: '#4466bb', legOff: 0, eyeShift: 0, mouthOpen: false }); // walk_a
        drawChar(2, { bodyCol: '#4466bb', legOff: 1, eyeShift: 0, mouthOpen: false }); // walk_b
        drawChar(3, { bodyCol: '#3388cc', legOff: 0, eyeShift: 1, mouthOpen: false }); // run_a (leaning)
        drawChar(4, { bodyCol: '#3388cc', legOff: 1, eyeShift: 1, mouthOpen: false }); // run_b
        drawChar(5, { bodyCol: '#4466bb', legOff: 0, eyeShift: 0, mouthOpen: true }); // talk
        drawChar(6, { bodyCol: '#44aa55', legOff: 0, eyeShift: 0, mouthOpen: false }); // win_a
        drawChar(7, { bodyCol: '#44aa55', legOff: 1, eyeShift: 0, mouthOpen: false }); // win_b
        // Register named frames so spritesheet API works
        const tex = this.textures.get('player');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * FW, 0, FW, FH);
        ct.refresh();
    }
    // ── NPC sprite  (4 frames × 12×16) ─────────────────────────────────────────
    // 0=npc_a_idle  1=npc_a_walk  2=npc_b_idle  3=npc_b_walk
    buildNPCSprite() {
        const FW = 12, FH = 16, N = 4;
        const ct = this.textures.createCanvas('npc', FW * N, FH);
        const ctx = ct.context;
        const drawNPC = (fi, bodyCol, hairCol, legOff) => {
            const ox = fi * FW;
            ctx.fillStyle = '#2244aa';
            ctx.fillRect(ox + 3, 14 + legOff, 2, 2 - legOff);
            ctx.fillRect(ox + 7, 14 - legOff, 2, 2 + legOff);
            ctx.fillStyle = bodyCol;
            ctx.fillRect(ox + 2, 5, 8, 9);
            ctx.fillStyle = '#fdbcb4';
            ctx.fillRect(ox + 3, 1, 6, 5);
            ctx.fillStyle = hairCol;
            ctx.fillRect(ox + 3, 0, 6, 3);
            ctx.fillStyle = '#331111';
            ctx.fillRect(ox + 4, 3, 1, 1);
            ctx.fillRect(ox + 7, 3, 1, 1);
        };
        drawNPC(0, '#aa4422', '#552211', 0);
        drawNPC(1, '#aa4422', '#552211', 1);
        drawNPC(2, '#2266aa', '#113355', 0);
        drawNPC(3, '#2266aa', '#113355', 1);
        const tex = this.textures.get('npc');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * FW, 0, FW, FH);
        ct.refresh();
    }
    // ── UI / dialogue window assets ─────────────────────────────────────────────
    buildUIAssets() {
        // 8×8 cursor arrow (for future menus)
        const ct = this.textures.createCanvas('cursor', 8, 8);
        const ctx = ct.context;
        ctx.fillStyle = '#ffffff';
        // Simple arrow pointing right
        [0, 1, 2, 3].forEach(i => ctx.fillRect(i, 3 - i, 1, 1 + i * 2));
        ct.refresh();
    }
}
