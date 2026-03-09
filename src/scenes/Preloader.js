import Phaser from 'phaser';
import { SCENE, TILE } from '../data/constants';
const S = TILE.SIZE; // 16
// ── Preloader ─────────────────────────────────────────────────────────────────
// Generates ALL placeholder textures programmatically.
// Replace each buildXxx() with a load.image / load.spritesheet when real assets
// are available – the texture keys and frame layout stay identical.
export class Preloader extends Phaser.Scene {
    constructor() { super({ key: SCENE.PRELOADER }); }
    create() {
        this.buildTileset();
        this.buildPlayerSprite();
        this.buildNPCSprite();
        this.buildEnemySprite();
        this.buildAllySprite();
        this.buildUIAssets();
        this.scene.start(SCENE.TITLE);
    }
    // ── Tileset (5 tiles × 16×16) ─────────────────────────────────────────────
    buildTileset() {
        const ct = this.textures.createCanvas('tileset', S * 5, S);
        const ctx = ct.context;
        const dots = (ox, pts, col) => {
            ctx.fillStyle = col;
            pts.forEach(([x, y]) => ctx.fillRect(ox + x, y, 1, 1));
        };
        // 0: Grass
        ctx.fillStyle = '#3a7d44';
        ctx.fillRect(0, 0, S, S);
        dots(0, [[3, 4], [9, 11], [13, 2], [6, 14]], '#2d6636');
        dots(0, [[2, 8], [11, 5], [7, 1]], '#4a9950');
        // 1: Water
        ctx.fillStyle = '#1a4fa0';
        ctx.fillRect(S, 0, S, S);
        ctx.fillStyle = '#2060bb';
        ctx.fillRect(S + 2, 5, 5, 2);
        ctx.fillRect(S + 9, 11, 5, 2);
        ctx.fillStyle = '#70b8f8';
        ctx.fillRect(S + 7, 2, 1, 1);
        ctx.fillRect(S + 4, 13, 1, 1);
        // 2: Rock
        ctx.fillStyle = '#5c5047';
        ctx.fillRect(S * 2, 0, S, S);
        ctx.fillStyle = '#4a3e38';
        ctx.fillRect(S * 2 + 2, 2, 5, 5);
        ctx.fillRect(S * 2 + 9, 9, 5, 5);
        ctx.fillStyle = '#38302a';
        ctx.fillRect(S * 2 + 1, 1, 1, 14);
        ctx.fillRect(S * 2 + 1, 1, 14, 1);
        // 3: Path
        ctx.fillStyle = '#c9a94a';
        ctx.fillRect(S * 3, 0, S, S);
        ctx.fillStyle = '#b89840';
        ctx.fillRect(S * 3 + 2, 5, 3, 2);
        ctx.fillRect(S * 3 + 10, 11, 3, 2);
        // 4: Flowers
        ctx.fillStyle = '#3a7d44';
        ctx.fillRect(S * 4, 0, S, S);
        ctx.fillStyle = '#cc2244';
        ctx.fillRect(S * 4 + 2, 7, 2, 2);
        ctx.fillStyle = '#ccaa00';
        ctx.fillRect(S * 4 + 10, 3, 2, 2);
        ctx.fillStyle = '#228822';
        ctx.fillRect(S * 4 + 3, 9, 1, 2);
        ctx.fillRect(S * 4 + 11, 5, 1, 2);
        ct.refresh();
    }
    // ── Player sprite (8 frames × 12×16) ──────────────────────────────────────
    // Frames: 0=idle 1=walk_a 2=walk_b 3=run_a 4=run_b 5=talk 6=win_a 7=win_b
    buildPlayerSprite() {
        const FW = 12, FH = 16, N = 8;
        const ct = this.textures.createCanvas('player', FW * N, FH);
        const ctx = ct.context;
        const HAIR = '#d4a017';
        const draw = (fi, o) => {
            const ox = fi * FW;
            ctx.fillStyle = '#2244aa';
            ctx.fillRect(ox + 3, 14 + o.legOff, 2, 2 - o.legOff);
            ctx.fillRect(ox + 7, 14 - o.legOff, 2, 2 + o.legOff);
            ctx.fillStyle = o.bodyCol;
            ctx.fillRect(ox + 2, 5, 8, 9);
            ctx.fillStyle = '#443300';
            ctx.fillRect(ox + 2, 10, 8, 1);
            ctx.fillStyle = '#cc4422';
            ctx.fillRect(ox + 2, 5, 8, 1);
            ctx.fillStyle = '#fdbcb4';
            ctx.fillRect(ox + 3, 1, 6, 5);
            ctx.fillStyle = HAIR;
            ctx.fillRect(ox + 3, 0, 6, 2);
            ctx.fillRect(ox + 3, 0, 1, 4);
            ctx.fillRect(ox + 8, 0, 1, 3);
            ctx.fillStyle = '#331111';
            ctx.fillRect(ox + 4 + o.eyeShift, 3, 1, 1);
            ctx.fillRect(ox + 7 + o.eyeShift, 3, 1, 1);
            if (o.mouth) {
                ctx.fillStyle = '#331111';
                ctx.fillRect(ox + 5, 5, 2, 1);
            }
        };
        draw(0, { bodyCol: '#4466bb', legOff: 0, eyeShift: 0, mouth: false }); // idle
        draw(1, { bodyCol: '#4466bb', legOff: 0, eyeShift: 0, mouth: false }); // walk_a
        draw(2, { bodyCol: '#4466bb', legOff: 1, eyeShift: 0, mouth: false }); // walk_b
        draw(3, { bodyCol: '#3388cc', legOff: 0, eyeShift: 1, mouth: false }); // run_a
        draw(4, { bodyCol: '#3388cc', legOff: 1, eyeShift: 1, mouth: false }); // run_b
        draw(5, { bodyCol: '#4466bb', legOff: 0, eyeShift: 0, mouth: true }); // talk
        draw(6, { bodyCol: '#44aa55', legOff: 0, eyeShift: 0, mouth: false }); // win_a
        draw(7, { bodyCol: '#44aa55', legOff: 1, eyeShift: 0, mouth: false }); // win_b
        const tex = this.textures.get('player');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * FW, 0, FW, FH);
        ct.refresh();
    }
    // ── Ally / Mage sprite (8 frames × 12×16) ─────────────────────────────────
    // Same layout as player but different palette (purple robes)
    buildAllySprite() {
        const FW = 12, FH = 16, N = 8;
        const ct = this.textures.createCanvas('ally', FW * N, FH);
        const ctx = ct.context;
        const draw = (fi, o) => {
            const ox = fi * FW;
            ctx.fillStyle = '#441188';
            ctx.fillRect(ox + 3, 14 + o.legOff, 2, 2 - o.legOff);
            ctx.fillRect(ox + 7, 14 - o.legOff, 2, 2 + o.legOff);
            ctx.fillStyle = o.bodyCol;
            ctx.fillRect(ox + 2, 5, 8, 9);
            ctx.fillStyle = '#220044';
            ctx.fillRect(ox + 2, 10, 8, 1); // belt
            ctx.fillStyle = '#aa22cc';
            ctx.fillRect(ox + 2, 5, 8, 1); // collar
            ctx.fillStyle = '#fdbcb4';
            ctx.fillRect(ox + 3, 1, 6, 5); // head
            ctx.fillStyle = '#880099';
            ctx.fillRect(ox + 3, 0, 6, 2);
            ctx.fillRect(ox + 3, 0, 1, 4);
            ctx.fillRect(ox + 8, 0, 1, 3); // hair
            ctx.fillStyle = '#331111';
            ctx.fillRect(ox + 4, 3, 1, 1);
            ctx.fillRect(ox + 7, 3, 1, 1); // eyes
            if (o.mouth) {
                ctx.fillStyle = '#331111';
                ctx.fillRect(ox + 5, 5, 2, 1);
            }
            // Staff (right side)
            ctx.fillStyle = '#886600';
            ctx.fillRect(ox + 9, 2, 1, 13);
            ctx.fillStyle = '#aaddff';
            ctx.fillRect(ox + 8, 1, 3, 2); // staff gem
        };
        draw(0, { bodyCol: '#6633aa', legOff: 0, mouth: false }); // idle
        draw(1, { bodyCol: '#6633aa', legOff: 0, mouth: false }); // walk_a
        draw(2, { bodyCol: '#6633aa', legOff: 1, mouth: false }); // walk_b
        draw(3, { bodyCol: '#5522aa', legOff: 0, mouth: false }); // run_a
        draw(4, { bodyCol: '#5522aa', legOff: 1, mouth: false }); // run_b
        draw(5, { bodyCol: '#6633aa', legOff: 0, mouth: true }); // talk
        draw(6, { bodyCol: '#44aa77', legOff: 0, mouth: false }); // win_a
        draw(7, { bodyCol: '#44aa77', legOff: 1, mouth: false }); // win_b
        const tex = this.textures.get('ally');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * FW, 0, FW, FH);
        ct.refresh();
    }
    // ── NPC sprite (4 frames × 12×16) ─────────────────────────────────────────
    buildNPCSprite() {
        const FW = 12, FH = 16, N = 4;
        const ct = this.textures.createCanvas('npc', FW * N, FH);
        const ctx = ct.context;
        const draw = (fi, col, hair, leg) => {
            const ox = fi * FW;
            ctx.fillStyle = '#2244aa';
            ctx.fillRect(ox + 3, 14 + leg, 2, 2 - leg);
            ctx.fillRect(ox + 7, 14 - leg, 2, 2 + leg);
            ctx.fillStyle = col;
            ctx.fillRect(ox + 2, 5, 8, 9);
            ctx.fillStyle = '#fdbcb4';
            ctx.fillRect(ox + 3, 1, 6, 5);
            ctx.fillStyle = hair;
            ctx.fillRect(ox + 3, 0, 6, 3);
            ctx.fillStyle = '#331111';
            ctx.fillRect(ox + 4, 3, 1, 1);
            ctx.fillRect(ox + 7, 3, 1, 1);
        };
        draw(0, '#aa4422', '#552211', 0);
        draw(1, '#aa4422', '#552211', 1);
        draw(2, '#2266aa', '#113355', 0);
        draw(3, '#2266aa', '#113355', 1);
        const tex = this.textures.get('npc');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * FW, 0, FW, FH);
        ct.refresh();
    }
    // ── Enemy sprite (6 types × 2 frames = 12 frames, each 16×20) ─────────────
    // Layout: [slime_a, slime_b, bat_a, bat_b, golem_a, golem_b]
    buildEnemySprite() {
        const EW = 16, EH = 20, N = 6;
        const ct = this.textures.createCanvas('enemy', EW * N, EH);
        const ctx = ct.context;
        // ── Slime (frames 0-1) ────────────────────────────────────────────────────
        const drawSlime = (fi, squish) => {
            const ox = fi * EW;
            const w = 12, h = 8 + squish, bx = 2, by = 10 - squish;
            ctx.fillStyle = '#44cc44';
            ctx.fillRect(ox + bx, by, w, h);
            ctx.fillStyle = '#33aa33';
            ctx.fillRect(ox + bx + 1, by + 1, w - 2, 2); // highlight
            ctx.fillStyle = '#226622';
            ctx.fillRect(ox + bx, by + h - 1, w, 1); // shadow
            // Eyes
            ctx.fillStyle = '#002200';
            ctx.fillRect(ox + bx + 2, by + 2, 2, 2);
            ctx.fillRect(ox + bx + 7, by + 2, 2, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(ox + bx + 2, by + 2, 1, 1);
            ctx.fillRect(ox + bx + 7, by + 2, 1, 1);
        };
        drawSlime(0, 0);
        drawSlime(1, 2);
        // ── Bat (frames 2-3) ──────────────────────────────────────────────────────
        const drawBat = (fi, wingUp) => {
            const ox = fi * EW;
            // Body
            ctx.fillStyle = '#442244';
            ctx.fillRect(ox + 5, 8, 6, 7);
            // Head
            ctx.fillStyle = '#553355';
            ctx.fillRect(ox + 5, 5, 6, 5);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(ox + 6, 7, 1, 1);
            ctx.fillRect(ox + 9, 7, 1, 1); // eyes
            // Ears
            ctx.fillStyle = '#442244';
            ctx.fillRect(ox + 5, 3, 2, 3);
            ctx.fillRect(ox + 9, 3, 2, 3);
            // Wings
            ctx.fillStyle = '#330022';
            if (wingUp) {
                ctx.fillRect(ox + 0, 5, 5, 4);
                ctx.fillRect(ox + 11, 5, 5, 4);
            }
            else {
                ctx.fillRect(ox + 0, 9, 5, 4);
                ctx.fillRect(ox + 11, 9, 5, 4);
            }
        };
        drawBat(2, true);
        drawBat(3, false);
        // ── Golem (frames 4-5) ────────────────────────────────────────────────────
        const drawGolem = (fi, armRaise) => {
            const ox = fi * EW;
            // Body (large)
            ctx.fillStyle = '#887766';
            ctx.fillRect(ox + 2, 6, 12, 13);
            ctx.fillStyle = '#776655';
            ctx.fillRect(ox + 2, 6, 12, 2); // top highlight
            ctx.fillStyle = '#554433';
            ctx.fillRect(ox + 2, 17, 12, 2); // shadow
            // Head
            ctx.fillStyle = '#998877';
            ctx.fillRect(ox + 3, 2, 10, 6);
            ctx.fillStyle = '#ff4400';
            ctx.fillRect(ox + 5, 4, 2, 2);
            ctx.fillRect(ox + 9, 4, 2, 2); // glowing eyes
            // Arms
            ctx.fillStyle = '#887766';
            ctx.fillRect(ox + 0, 7 - armRaise, 2, 7 + armRaise);
            ctx.fillRect(ox + 14, 7 - armRaise, 2, 7 + armRaise);
            // Cracks
            ctx.fillStyle = '#554433';
            ctx.fillRect(ox + 5, 8, 1, 4);
            ctx.fillRect(ox + 10, 11, 1, 3);
        };
        drawGolem(4, 0);
        drawGolem(5, 2);
        const tex = this.textures.get('enemy');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * EW, 0, EW, EH);
        ct.refresh();
    }
    // ── UI cursor ─────────────────────────────────────────────────────────────
    buildUIAssets() {
        const ct = this.textures.createCanvas('cursor', 8, 8);
        const ctx = ct.context;
        ctx.fillStyle = '#ffffff';
        [0, 1, 2, 3].forEach(i => ctx.fillRect(i, 3 - i, 1, 1 + i * 2));
        ct.refresh();
    }
}
