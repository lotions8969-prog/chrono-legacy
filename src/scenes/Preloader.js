import Phaser from 'phaser';
import { SCENE, TILE } from '../data/constants';
const S = TILE.SIZE; // 16
export class Preloader extends Phaser.Scene {
    constructor() { super({ key: SCENE.PRELOADER }); }
    create() {
        this.buildTileset();
        this.buildBattleBackgrounds();
        this.buildPlayerSprite();
        this.buildAllySprite();
        this.buildNPCSprites();
        this.buildEnemySprite();
        this.buildPortraitTextures();
        this.buildEnvironmentSprites();
        this.buildUIAssets();
        this.scene.start(SCENE.TITLE);
    }
    painter(ctx, pal, ox, oy, rows) {
        rows.forEach((row, gy) => {
            for (let gx = 0; gx < row.length; gx++) {
                const col = pal[row[gx]];
                if (!col)
                    continue;
                ctx.fillStyle = col;
                ctx.fillRect(ox + gx, oy + gy, 1, 1);
            }
        });
    }
    // ── Tileset (10 tiles × 16×16) ─────────────────────────────────────────────
    buildTileset() {
        const ct = this.textures.createCanvas('tileset', S * 10, S);
        const ctx = ct.context;
        const pal = {
            '.': null,
            G: '#3A7D44', g: '#2D6636', L: '#50A060', l: '#68B878', X: '#80C880',
            W: '#1A5AB0', w: '#2068C4', Q: '#3A80D8', q: '#6AB2F0', f: '#ACD8F8',
            R: '#5C5047', r: '#3A2E28', O: '#746050', o: '#8A7868', x: '#9A8878',
            P: '#C8A840', p: '#9A7830', A: '#DCC060', a: '#E8D078',
            V: '#CC2244', v: '#CCAA00', E: '#F0E0C8', s: '#228822', d: '#1A6A1A',
            N: '#E8D090', n: '#C8B060', M: '#F0DC98', m: '#D8BC70',
            K: '#1E4824', k: '#163618', J: '#284E30', j: '#324A2A',
            B: '#8A6020', b: '#6A4010', I: '#A07830', i: '#C09050',
            Y: '#B08040', Z: '#987030', T: '#C89050', t: '#A07838',
            // cobblestone
            C: '#888880', c: '#666660', F: '#9A9A90', D: '#707070',
        };
        const px = (ox, rows) => this.painter(ctx, pal, ox, 0, rows);
        // Tile 0: Rich Grass
        px(0, [
            'GGgGGGGgGGlGGGgG', 'GlGGgGGGGGGgGGGG', 'GGGGGGlGGgGGGGlG',
            'gGGGlGGGGGGGgGGG', 'GGlGGGGgGGGlGGGG', 'GGGgGGGGGGGGGGgG',
            'GlGGGGgGGlGGGGGG', 'GGGGGGGGGGGGlGGG', 'gGGlGGGgGGGGGGGg',
            'GGGGGGGGGlGGGlGG', 'GGGgGGlGGGGGGGGG', 'lGGGGGGGGGgGGlGG',
            'GGGGlGGGlGGGGGGg', 'GGgGGGGGGGGGGGGG', 'GGGGGGlGGgGGGlGG',
            'gGGlGGGGGGGGGGGG',
        ]);
        // Tile 1: Water with shimmer
        px(S, [
            'WWwWWWWwWWWWWwWW', 'wWQQQQWWWWQQQwWW', 'WWQqQQQwWQQqQQWW',
            'WWWwWQQQQQQwWWWW', 'WqWWWWQQQQWWWwWW', 'WWWQQQwWWWWQQQWW',
            'WWQqQQQwWQQqQQWW', 'WwWWWQQQQQWWwWWW', 'WWfFfWwWWWWfFfWW',
            'WWQqQQQwWQQqQQWW', 'WwWWWWQQQQWWWwWW', 'WWWQQQwWWWWQQQWW',
            'WWqWWQQQQQQwWWWW', 'WWWWwWQQQQWWWWWW', 'WwWQQQwWWWWQQQwW',
            'WWWWWWWwWWWWWWWW',
        ]);
        // Tile 2: Rock / Mountain wall
        px(S * 2, [
            'rrrrrrrrrrrrrrrr', 'rROOoOOOOOOoROOr', 'rROOOOOOOOOOROOr',
            'rROxOOOOOOOoROOr', 'rROOOoOrRROoROOr', 'rROOOOOrRROOROOr',
            'rROxOOOOrROOROOr', 'rROOOOOOrROOROOr', 'rROOoOOOrROOROOr',
            'rRrrrrrrrrrrrOOr', 'rROOOOOOOOOOROOr', 'rROxOOOOOoOOROOr',
            'rROOOOOOOOOOROOr', 'rROOoOOOOOOoROOr', 'rROOOOOOOOOOROOr',
            'rrrrrrrrrrrrrrrr',
        ]);
        // Tile 3: Dirt path
        px(S * 3, [
            'PPpPPPPPPpPPPPPP', 'PAPPpPPPPPPpPAPP', 'PPPpPPAPPPPPPPPP',
            'PPPPPPPPpPPAaPPP', 'pPAPPPPPPPPPPpPP', 'PPPPpPPAPPPpPPPP',
            'PPPPPPPPPPPaPPPP', 'PpPPPPpPPPPPPPpP', 'PPPAPpPPPPPPPPPP',
            'PPPPPPPPpPAPPPPP', 'PPpPPPPAaPPPpPPP', 'PPPPPpPPPPPPPPPP',
            'PAPPPPPPpPPAPPpp', 'PPPpPPPPPPPPPPPP', 'PPPPPAPpPPPPPAPA',
            'pPPPPPPPpPPpPPPP',
        ]);
        // Tile 4: Flowers
        px(S * 4, [
            'GGgGGGGgGGGGGgGG', 'GGGGGGGGGGGGGGGG', 'GGsGGGGGGGGGsGGG',
            'GGdGGGVVGGGGdGGG', 'GddsGVVVVGGGddsG', 'GGdGVVVVVGGGdGGG',
            'GGsVVVVVVGGGdsGG', 'GGGdVVVVGGGGGGGG', 'GGGGdVGGGGvvvGGG',
            'GGsGGdGGGvvvvvGG', 'GGdGGGGGGEvvvEGG', 'GddGGGGGGGsvvGGG',
            'GGGGsGGGGGdGGGGG', 'GGgGdGGGGGdGGgGG', 'GGGGGGGGgGGGGGGG',
            'GGGGGGGGGGGgGGGG',
        ]);
        // Tile 5: Sand
        px(S * 5, [
            'NNnNNNNnNNMNNNnN', 'NMNNnNNNNNNnNMNN', 'NNNnNNMNNNNNNNNN',
            'NNNNNNNNnNNMmNNN', 'nNMNNNNNNNNNNnNN', 'NNNNnNNMNNNnNNNN',
            'NNNNNNNNNNNmNNNN', 'NnNNNNnNNNNNNNnN', 'NNNMNnNNNNNNNNNN',
            'NNNNNNNNnNMNNNNN', 'NNnNNNNMmNNNnNNN', 'NNNNNnNNNNNNNNNN',
            'MNNNNNNNnNNMNNmm', 'NNNnNNNNNNNNNNNN', 'NNNNNMNnNNNNNMNM',
            'nNNNNNNNnNNnNNNN',
        ]);
        // Tile 6: Dark Grass
        px(S * 6, [
            'KKkKKKKkKKJKKKkK', 'KJKKkKKKKKKkKKKK', 'KKKKKKJKKkKKKKJK',
            'kKKKJKKKKKKKkKKK', 'KKJKKKKkKKKJKKKK', 'KKKkKKKKKKKKKKkK',
            'KJKKKKkKKJKKKKKK', 'KKKKKKKKKKKKJKKK', 'kKKJKKKkKKKKKKKk',
            'KKKKKKKKKJKKKJKK', 'KKKkKKJKKKKKKKKK', 'JKKKKKKKKKkKKJKK',
            'KKKKJKKKJKKKKKKk', 'KKkKKKKKKKKKKKKK', 'KKKKKKJKKkKKKJKK',
            'kKKJKKKKKKKKKKKK',
        ]);
        // Tile 7: Wooden bridge
        px(S * 7, [
            'bbbbbbbbbbbbbbbb', 'bIIiIIIiIIiIIIIb', 'bIIiIIIiIIiIIIIb',
            'BBBBbBBBBbBBBBBB', 'bIIiIIIiIIiIIIIb', 'bIIiIIIiIIiIIIIb',
            'BBBBbBBBBbBBBBBB', 'bIIiIIIiIIiIIIIb', 'bIIiIIIiIIiIIIIb',
            'BBBBbBBBBbBBBBBB', 'bIIiIIIiIIiIIIIb', 'bIIiIIIiIIiIIIIb',
            'BBBBbBBBBbBBBBBB', 'bIIiIIIiIIiIIIIb', 'bIIiIIIiIIiIIIIb',
            'bbbbbbbbbbbbbbbb',
        ]);
        // Tile 8: Wood floor
        px(S * 8, [
            'YYZYYYYZYYTYYYZY', 'YTYYZYYYYYYZYTYY', 'YYYZYYTYYYYYYYYY',
            'YYYYYYYYZYYTtYYY', 'ZYTYYYYYYYYYZYY', 'YYYYZYYTYYYZYYYY',
            'YYYYYYYYYYYtYYYY', 'YZYYYYYY ZYYYYYZy', 'YYYTYZYYYYYYYYY',
            'YYYYYYYYZYTYYYY', 'YYZYYYY TtYYYZYYY', 'YYYYYZYYYYYYYYYY',
            'TYYYYYYYZYYTYYtt', 'YYYZYYYYYYYYYYY', 'YYYYYTYZYYYYYTYT',
            'ZYYYYYYYYYYYYYYy',
        ]);
        // Tile 9: Cobblestone (town floors)
        px(S * 9, [
            'CCCCCCCCCCCCCCCC', 'CDFDDFDDFDDFDDCc', 'CDFDDFDDFDDFDDC',
            'CDDDDDDDDDDDDDC', 'CCCCCCCCCCCCCCCC', 'CDFDFDFDFDFDFDCc',
            'CDFDFDFDFDFDFDC', 'CDDDDDDDDDDDDDC', 'CCCCCCCCCCCCCCCC',
            'CDFDDFDDFDDFDDCc', 'CDFDDFDDFDDFDDC', 'CDDDDDDDDDDDDDC',
            'CCCCCCCCCCCCCCCC', 'CDFDFDFDFDFDFDCc', 'CDFDFDFDFDFDFDC',
            'CDDDDDDDDDDDDDC',
        ]);
        ct.refresh();
    }
    // ── Battle Backgrounds (4 zones, 256×160) ─────────────────────────────────
    buildBattleBackgrounds() {
        this.buildBgField();
        this.buildBgForest();
        this.buildBgDungeon();
        this.buildBgVillage();
    }
    buildBgField() {
        const ct = this.textures.createCanvas('battle_bg_field', 256, 160);
        const ctx = ct.context;
        // Sky gradient
        const sky = ctx.createLinearGradient(0, 0, 0, 90);
        sky.addColorStop(0, '#4899CC');
        sky.addColorStop(0.5, '#70B8E0');
        sky.addColorStop(1, '#A8D8EE');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 256, 90);
        // Sun
        ctx.fillStyle = '#FFFFD0';
        ctx.beginPath();
        ctx.arc(210, 30, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFF80';
        ctx.beginPath();
        ctx.arc(210, 30, 14, 0, Math.PI * 2);
        ctx.fill();
        // Sun rays
        ctx.strokeStyle = '#FFFF80';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
            ctx.beginPath();
            ctx.moveTo(210 + Math.cos(a) * 20, 30 + Math.sin(a) * 20);
            ctx.lineTo(210 + Math.cos(a) * 28, 30 + Math.sin(a) * 28);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // Clouds
        const drawCloud = (cx2, cy2, w2) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.ellipse(cx2, cy2, w2, w2 * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx2 - w2 * 0.4, cy2 + 4, w2 * 0.55, w2 * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx2 + w2 * 0.35, cy2 + 3, w2 * 0.5, w2 * 0.32, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        };
        drawCloud(55, 22, 28);
        drawCloud(150, 15, 22);
        // Far mountains
        ctx.fillStyle = '#6888A0';
        ctx.globalAlpha = 0.7;
        for (let x = 0; x <= 256; x += 40) {
            const h2 = 28 + Math.sin(x * 0.04) * 20 + Math.cos(x * 0.09) * 12;
            ctx.beginPath();
            ctx.moveTo(x, 90);
            ctx.lineTo(x + 20, 90 - h2);
            ctx.lineTo(x + 40, 90);
            ctx.closePath();
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        // Closer hills
        ctx.fillStyle = '#4A7840';
        ctx.beginPath();
        ctx.moveTo(0, 160);
        ctx.lineTo(0, 100);
        ctx.bezierCurveTo(40, 75, 90, 70, 128, 80);
        ctx.bezierCurveTo(170, 90, 210, 72, 256, 82);
        ctx.lineTo(256, 160);
        ctx.closePath();
        ctx.fill();
        // Ground
        const gnd = ctx.createLinearGradient(0, 88, 0, 160);
        gnd.addColorStop(0, '#5A9050');
        gnd.addColorStop(0.4, '#4A8040');
        gnd.addColorStop(1, '#3A6830');
        ctx.fillStyle = gnd;
        ctx.fillRect(0, 88, 256, 72);
        // Ground details: grass tufts
        ctx.fillStyle = '#6AAA60';
        for (let x = 4; x < 256; x += 8) {
            const gy2 = 90 + (x * 3 % 14);
            ctx.fillRect(x, gy2, 1, 4);
            ctx.fillRect(x + 3, gy2 - 2, 1, 5);
            ctx.fillRect(x + 6, gy2 + 1, 1, 3);
        }
        // Flowers on ground
        ctx.fillStyle = '#FF8888';
        for (let x = 20; x < 240; x += 35) {
            ctx.fillRect(x, 95 + (x % 10), 2, 2);
        }
        ctx.fillStyle = '#FFDD44';
        for (let x = 40; x < 220; x += 45) {
            ctx.fillRect(x, 98 + (x % 8), 2, 2);
        }
        // Ground shadow (bottom of hills into flat)
        ctx.fillStyle = '#2A5820';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(0, 88, 256, 6);
        ctx.globalAlpha = 1;
        ct.refresh();
    }
    buildBgForest() {
        const ct = this.textures.createCanvas('battle_bg_forest', 256, 160);
        const ctx = ct.context;
        // Dark sky
        const sky = ctx.createLinearGradient(0, 0, 0, 80);
        sky.addColorStop(0, '#0A1828');
        sky.addColorStop(1, '#142840');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 256, 80);
        // Stars
        ctx.fillStyle = '#FFFFFF';
        const stars = [[20, 10], [55, 8], [90, 15], [130, 6], [170, 12], [200, 5], [240, 18], [15, 25], [70, 22], [110, 30], [165, 8], [220, 22]];
        stars.forEach(([sx, sy]) => {
            ctx.globalAlpha = 0.7 + Math.random() * 0.3;
            ctx.fillRect(sx, sy, 1, 1);
        });
        ctx.globalAlpha = 1;
        // Moon
        ctx.fillStyle = '#EEEEDD';
        ctx.beginPath();
        ctx.arc(35, 28, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1A2838';
        ctx.beginPath();
        ctx.arc(39, 25, 10, 0, Math.PI * 2);
        ctx.fill();
        // Far trees silhouette
        ctx.fillStyle = '#0A1808';
        for (let x = 0; x < 256; x += 18) {
            const th = 45 + Math.sin(x * 0.2) * 20;
            ctx.fillRect(x, 80 - th, 14, th);
            ctx.beginPath();
            ctx.arc(x + 7, 80 - th, 9, Math.PI, 0);
            ctx.fill();
        }
        // Ground dark
        const gnd = ctx.createLinearGradient(0, 80, 0, 160);
        gnd.addColorStop(0, '#1A2410');
        gnd.addColorStop(1, '#0E1808');
        ctx.fillStyle = gnd;
        ctx.fillRect(0, 80, 256, 80);
        // Roots/fallen logs
        ctx.fillStyle = '#2A1808';
        ctx.fillRect(10, 125, 60, 6);
        ctx.fillRect(180, 130, 50, 5);
        // Mushrooms
        ctx.fillStyle = '#CC4444';
        ctx.beginPath();
        ctx.arc(85, 138, 6, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#882222';
        ctx.fillRect(84, 138, 2, 8);
        ctx.fillStyle = '#FF8888';
        ctx.fillRect(83, 138, 1, 2);
        ctx.fillRect(88, 135, 1, 2);
        // Near trees (very dark, foreground)
        ctx.fillStyle = '#050C04';
        ctx.fillRect(0, 60, 25, 100);
        ctx.fillRect(230, 55, 26, 105);
        // Tree branches
        ctx.strokeStyle = '#050C04';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(20, 80);
        ctx.lineTo(50, 65);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(236, 75);
        ctx.lineTo(210, 60);
        ctx.stroke();
        // Fireflies
        ctx.fillStyle = '#AAFFAA';
        ctx.globalAlpha = 0.8;
        ctx.fillRect(120, 100, 2, 2);
        ctx.fillRect(145, 115, 2, 2);
        ctx.fillRect(95, 120, 2, 2);
        ctx.globalAlpha = 1;
        ct.refresh();
    }
    buildBgDungeon() {
        const ct = this.textures.createCanvas('battle_bg_dungeon', 256, 160);
        const ctx = ct.context;
        // Stone ceiling
        ctx.fillStyle = '#252020';
        ctx.fillRect(0, 0, 256, 30);
        // Ceiling cracks
        ctx.strokeStyle = '#151010';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, 5);
        ctx.lineTo(60, 20);
        ctx.lineTo(70, 15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(180, 8);
        ctx.lineTo(170, 22);
        ctx.stroke();
        // Walls
        const wallLeft = ctx.createLinearGradient(0, 0, 60, 0);
        wallLeft.addColorStop(0, '#1A1515');
        wallLeft.addColorStop(1, '#302828');
        ctx.fillStyle = wallLeft;
        ctx.fillRect(0, 0, 60, 160);
        const wallRight = ctx.createLinearGradient(196, 0, 256, 0);
        wallRight.addColorStop(0, '#302828');
        wallRight.addColorStop(1, '#1A1515');
        ctx.fillStyle = wallRight;
        ctx.fillRect(196, 0, 60, 160);
        // Stone bricks on walls
        const drawBricks = (wx, wy, ww, wh) => {
            ctx.strokeStyle = '#151010';
            ctx.lineWidth = 1;
            for (let row = 0; row < wh; row += 12) {
                const offset = (row / 12 % 2 === 0) ? 0 : 8;
                for (let col = offset; col < ww; col += 16) {
                    ctx.strokeRect(wx + col, wy + row, 16, 12);
                }
            }
        };
        drawBricks(0, 0, 60, 160);
        drawBricks(196, 0, 60, 160);
        // Torches
        const drawTorch = (tx, ty) => {
            // Torch handle
            ctx.fillStyle = '#703020';
            ctx.fillRect(tx - 2, ty, 4, 10);
            // Flame glow
            ctx.fillStyle = '#FF8800';
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(tx, ty, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFDD00';
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(tx, ty, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(tx, ty - 1, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            // Torch light glow (radial)
            const glow = ctx.createRadialGradient(tx, ty, 0, tx, ty, 40);
            glow.addColorStop(0, 'rgba(255,140,0,0.3)');
            glow.addColorStop(1, 'rgba(255,140,0,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(tx, ty, 40, 0, Math.PI * 2);
            ctx.fill();
        };
        drawTorch(48, 60);
        drawTorch(208, 60);
        // Floor
        const floor = ctx.createLinearGradient(0, 100, 0, 160);
        floor.addColorStop(0, '#383030');
        floor.addColorStop(1, '#281E1E');
        ctx.fillStyle = floor;
        ctx.fillRect(0, 100, 256, 60);
        // Floor stones
        ctx.strokeStyle = '#201818';
        ctx.lineWidth = 1;
        for (let row = 100; row < 160; row += 15) {
            for (let col = 60; col < 196; col += 20) {
                ctx.strokeRect(col, row, 20, 15);
            }
        }
        // Floor moisture/cracks
        ctx.fillStyle = '#181010';
        ctx.fillRect(100, 128, 30, 2);
        ctx.fillRect(160, 115, 20, 1);
        // Center arch opening (darker middle background)
        const arch = ctx.createLinearGradient(60, 0, 196, 0);
        arch.addColorStop(0, '#201A1A');
        arch.addColorStop(0.5, '#302828');
        arch.addColorStop(1, '#201A1A');
        ctx.fillStyle = arch;
        ctx.fillRect(60, 30, 136, 70);
        ct.refresh();
    }
    buildBgVillage() {
        const ct = this.textures.createCanvas('battle_bg_village', 256, 160);
        const ctx = ct.context;
        // Day sky
        const sky = ctx.createLinearGradient(0, 0, 0, 70);
        sky.addColorStop(0, '#5090C8');
        sky.addColorStop(1, '#90C0E0');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 256, 70);
        // Buildings in background
        const drawBuilding = (bx, by, bw, bh, roofH, wallCol, roofCol) => {
            // Roof
            ctx.fillStyle = roofCol;
            ctx.beginPath();
            ctx.moveTo(bx - 4, by);
            ctx.lineTo(bx + bw / 2, by - roofH);
            ctx.lineTo(bx + bw + 4, by);
            ctx.closePath();
            ctx.fill();
            // Wall
            ctx.fillStyle = wallCol;
            ctx.fillRect(bx, by, bw, bh);
            // Window
            ctx.fillStyle = '#88AACC';
            ctx.fillRect(bx + bw * 0.3, by + 8, bw * 0.15, bh * 0.3);
            ctx.fillRect(bx + bw * 0.6, by + 8, bw * 0.15, bh * 0.3);
        };
        drawBuilding(10, 60, 40, 50, 18, '#C8A888', '#884422');
        drawBuilding(60, 55, 50, 55, 22, '#C8B898', '#7A3C22');
        drawBuilding(180, 58, 45, 52, 20, '#B8A888', '#884422');
        drawBuilding(230, 62, 30, 48, 15, '#D0B890', '#663820');
        // Cobblestone ground
        const gnd = ctx.createLinearGradient(0, 88, 0, 160);
        gnd.addColorStop(0, '#888878');
        gnd.addColorStop(1, '#706860');
        ctx.fillStyle = gnd;
        ctx.fillRect(0, 88, 256, 72);
        // Cobble grid
        ctx.strokeStyle = '#555045';
        ctx.lineWidth = 1;
        for (let row = 92; row < 160; row += 10) {
            for (let col = 0; col < 256; col += 14) {
                const offset = (row / 10 % 2 === 0) ? 0 : 7;
                ctx.strokeRect(col + offset, row, 14, 10);
            }
        }
        // Market stall canopy
        ctx.fillStyle = '#CC4444';
        ctx.fillRect(90, 70, 80, 6);
        ctx.fillStyle = '#FFEECC';
        ctx.fillRect(88, 73, 84, 4);
        // Lamp post
        ctx.fillStyle = '#444434';
        ctx.fillRect(126, 62, 4, 28);
        ctx.fillStyle = '#FFEEAA';
        ctx.beginPath();
        ctx.arc(128, 62, 5, 0, Math.PI * 2);
        ctx.fill();
        // Flags/banners
        ctx.fillStyle = '#CC2244';
        ctx.fillRect(12, 42, 14, 10);
        ctx.fillStyle = '#EEBB00';
        ctx.fillRect(234, 44, 12, 8);
        ct.refresh();
    }
    // ── Player sprite – 16×24 × 16 frames  ──────────────────────────────────────
    // Layout: [0]=down-idle, [1-3]=down-walk, [4]=up-idle, [5-7]=up-walk,
    //         [8]=side-idle, [9-11]=side-walk, [12]=talk, [13-14]=victory, [15]=battle
    buildPlayerSprite() {
        const FW = 16, FH = 24, N = 16;
        const ct = this.textures.createCanvas('player', FW * N, FH);
        const ctx = ct.context;
        const pal = {
            '.': null,
            H: '#CC2C08', h: '#E84020', i: '#FF6040', // hair
            S: '#F4C090', c: '#D49070', C: '#B87050', // skin
            K: '#1A0C00', // dark/outline
            e: '#4878F0', l: '#8AACFF', // eyes
            m: '#CC5040', // mouth
            R: '#CC1820', // headband
            w: '#F0F2FF', W: '#D0D4EE', // white shirt
            B: '#1848C0', b: '#0C2C90', d: '#081870', // blue jacket
            P: '#C8A040', p: '#A07828', q: '#786018', // khaki pants
            T: '#704028', t: '#401810', u: '#905030', // boots
            Z: '#100800', // very dark
            L: '#3A2008', // belt
        };
        const paint = (ox, rows) => this.painter(ctx, pal, ox, 0, rows);
        // ── Shared head pieces ────────────────────────────────────────────────
        // Down-facing head (front view)
        const HDf = [
            '....HHHHHH......',
            '...HhHHHhHH.....',
            '..HHhiHiHHHH....',
            '..KHHSSSSSHHK...',
            '..KHSSSSSSShK...',
            '..KHSeKlKeShK...',
            '..KHSSSmSSShK...',
            '..KHcSSSScHK....',
        ];
        const HDfR = [
            '...KRRRRRRK.....',
        ];
        // Back-facing head
        const HDb = [
            '....HHHHHH......',
            '...HhHHHhHH.....',
            '..HHHHhHHHHH....',
            '..KHHHHHHHHK....',
            '..KHHHhHHHHK....',
            '..KHHHHHHHhK....',
            '..KHHhHHHHHK....',
            '..KHHHHHHHhK....',
        ];
        const HDbR = [
            '...KRRRRRRK.....',
        ];
        // Side-facing head (profile left)
        const HDs = [
            '.....HHHHh......',
            '....HhHHHhH.....',
            '...HHhiHHHHH....',
            '...KHHSSSSHh....',
            '...KHSSSSSHh....',
            '...KHSeKKSH.....',
            '...KHSSSmSH.....',
            '...KHcSSScH.....',
        ];
        const HDsR = [
            '....KRRRRRK.....',
        ];
        // Shared torso (jacket + shirt)
        const torso = [
            '...KBBBBBBK.....',
            '..KBwwwwwwBBK...',
            '..KBwWWWWwBBK...',
            '..KBBBBBbBBBK...',
            '..KbBBBbBBBbK...',
            '..KBBBBBbBBBK...',
            '...KLLLLLLLK....',
        ];
        // Legs idle
        const legsIdle = [
            '...KPPpPPPK.....',
            '...KPPpPPPK.....',
            '...KPpPpPPK.....',
            '...KPpPpPPK.....',
            '...KPpPpPPK.....',
            '..KTTKKKTTk.....',
            '..KTuTKKTuTK....',
            '..KttKKKttK.....',
        ];
        // Legs walk A (left foot forward)
        const legsWalkA = [
            '..KPPpPKPPpK....',
            '..KPPpKKPPpK....',
            '..KPpPKKpPPK....',
            '..KPpPK.pPPK....',
            '.KPpP...KpPpK...',
            '.KTTKKKTuTK.....',
            '.KTuT.KTuTK.....',
            '.KttKKKttKK.....',
        ];
        // Legs walk B (right foot forward)
        const legsWalkB = [
            '..KPPpPKPPpK....',
            '..KPPpKKPPpK....',
            '.KPpPKKKpPPK....',
            'KPpPK..KKpPPK...',
            '.KpPK...KPpPK...',
            '..KTuTKKTTKK....',
            '..KTuTKKTuTK....',
            '..KttKKKttKK....',
        ];
        // Legs walk C (mid stride)
        const legsWalkC = [
            '...KPPPpPPK.....',
            '...KPPPpPPK.....',
            '...KPPpPPPK.....',
            '..KPPpPPPPK.....',
            '..KPPpPPPpK.....',
            '.KTTuKKTTuK.....',
            '.KTuTKKTuTK.....',
            '.KttKKKttKK.....',
        ];
        // Victory arms up
        const legsVictory = [
            '...KPPpPPPK.....',
            '...KPPpPPPK.....',
            '...KPpPpPPK.....',
            '.KPpPpPpPPpK....',
            'KTT..KKK..TTK...',
            'KTuT.KKK.TuTK...',
            'KTuTKKKKKTuTK...',
            'KttKKKKKKttKK...',
        ];
        // Frame 0: down-idle
        paint(0, [...HDf, ...HDfR, ...torso, ...legsIdle]);
        // Frame 1: down-walk A
        paint(FW, [...HDf, ...HDfR, ...torso, ...legsWalkA]);
        // Frame 2: down-walk B
        paint(FW * 2, [...HDf, ...HDfR, ...torso, ...legsWalkB]);
        // Frame 3: down-walk C
        paint(FW * 3, [...HDf, ...HDfR, ...torso, ...legsWalkC]);
        // Frame 4: up-idle
        paint(FW * 4, [...HDb, ...HDbR, ...torso, ...legsIdle]);
        // Frame 5: up-walk A
        paint(FW * 5, [...HDb, ...HDbR, ...torso, ...legsWalkA]);
        // Frame 6: up-walk B
        paint(FW * 6, [...HDb, ...HDbR, ...torso, ...legsWalkB]);
        // Frame 7: up-walk C
        paint(FW * 7, [...HDb, ...HDbR, ...torso, ...legsWalkC]);
        // Frame 8: side-idle
        paint(FW * 8, [...HDs, ...HDsR, ...torso, ...legsIdle]);
        // Frame 9: side-walk A
        paint(FW * 9, [...HDs, ...HDsR, ...torso, ...legsWalkA]);
        // Frame 10: side-walk B
        paint(FW * 10, [...HDs, ...HDsR, ...torso, ...legsWalkB]);
        // Frame 11: side-walk C
        paint(FW * 11, [...HDs, ...HDsR, ...torso, ...legsWalkC]);
        // Frame 12: talk
        const HDfTalk = [...HDf.slice(0, 6), '..KHSSmSSShK....', '..KHcSSSScHK....'];
        paint(FW * 12, [...HDfTalk, ...HDfR, ...torso, ...legsIdle]);
        // Frame 13-14: victory
        paint(FW * 13, [...HDf, ...HDfR, ...torso, ...legsVictory]);
        const legsV2 = legsVictory.map((r, i) => i < 3 ? r : r.replace('...', '..'));
        paint(FW * 14, [...HDf, ...HDfR, ...torso, ...legsV2]);
        // Frame 15: battle pose (turned slightly)
        paint(FW * 15, [...HDs, ...HDsR, ...torso, ...legsIdle]);
        const tex = this.textures.get('player');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * FW, 0, FW, FH);
        ct.refresh();
    }
    // ── Ally sprite – 16×24 × 16 frames ────────────────────────────────────────
    buildAllySprite() {
        const FW = 16, FH = 24, N = 16;
        const ct = this.textures.createCanvas('ally', FW * N, FH);
        const ctx = ct.context;
        const pal = {
            '.': null,
            Y: '#E8C020', y: '#FFD840', j: '#FFF080', // blonde hair
            S: '#F4C090', c: '#D49070', C: '#B87050', // skin
            K: '#1A0C00', // dark
            e: '#44AA66', l: '#88DDAA', // green eyes
            m: '#CC5040', // mouth
            A: '#CC88CC', a: '#AA66AA', // purple bow/ribbon
            D: '#F0F4FF', d: '#D0D4EE', X: '#C0C4DE', // white/silver dress
            L: '#6090C8', G: '#4070A8', // blue dress trim
            T: '#F0EEE8', t: '#D0CECA', u: '#B8B0A8', // white boots
            Z: '#100800', // dark
        };
        const paint = (ox, rows) => this.painter(ctx, pal, ox, 0, rows);
        // Down-facing head (Marle)
        const HDf = [
            '...YyYYYYy......',
            '..YjYYYYYjYY....',
            '.YYjYYYYYYjYY...',
            '..KYYSSSSYYaK...',
            '..KYSSSSSSSaK...',
            '..KYSeKlKeaaK...',
            '..KYSSSmSSSK....',
            '..KYcSSSScYK....',
        ];
        const HDfR = [
            '...KAAAAAaK.....',
        ];
        // Back-facing head (shows ponytail)
        const HDb = [
            '...YyYYYYy......',
            '..YjYYYYYjYY....',
            '.YYYYjYYYYjYY...',
            '..KYYYYYYYyK....',
            '..KYYYYYYYyK....',
            '..KYYjYYYYyK....',
            '..KYYYYYjYyK....',
            '..KYYYYYYYYK....',
        ];
        const HDbR = [
            '...KAAAAAaK.....',
            '....KYYYyK......',
        ];
        // Side-facing head
        const HDs = [
            '.....YYYYy......',
            '....YjYYYjYY....',
            '...YYjYYYYYYY...',
            '...KYYSSSSSYy...',
            '...KYSSSSSSYy...',
            '...KYSeKKSSK....',
            '...KYSSSmSSK....',
            '...KYcSSScYK....',
        ];
        const HDsR = [
            '....KAAAAAaK....',
        ];
        // Dress/body
        const torso = [
            '...KDDDDDDdK....',
            '..KDdDDDDDdDK...',
            '..KLLDDDDdLLK...',
            '..KGDDDDDDDdK...',
            '..KGDDDXDDDdK...',
            '...KLLDDDLLk....',
            '...KdDDDDddK....',
        ];
        // Skirt / lower dress legs
        const legsIdle = [
            '..KDDDDDDDDdK...',
            '..KdDDXDDdDDK...',
            '.KdDDDDDDDDDdK..',
            '.KdDDDdDDDDDdK..',
            '.KDDDdDDDDdDDK..',
            '..KTTKKKTTTkK...',
            '..KTtTKKTtTkK...',
            '..KttKKKtttKK...',
        ];
        const legsWalkA = [
            '..KDDDDDDdDK....',
            '.KdDDXDDDdDDK...',
            '.KDDDDDDDDdDK...',
            'KDDDDdDDDDdDDK..',
            '.KDdDdDDdDdDK...',
            '.KTTkKKKTtTK....',
            '.KTtTKKKTtTK....',
            '.KttKKKKtttKK...',
        ];
        const legsWalkB = [
            '..KDDDDdDDDK....',
            '.KdDDDDdDXDDK...',
            '.KDDDDDDdDDDK...',
            '.KDDDDdDDDDDK...',
            '.KDdDdDDDdDK....',
            '..KTtTKKKTTkK...',
            '..KTtTKKKTtKK...',
            '..KtttKKKttKK...',
        ];
        const legsWalkC = [
            '...KDDDDDDdK....',
            '..KdDDXDdDDDK...',
            '..KDDDDDDdDDK...',
            '..KDDDdDDDDK....',
            '..KDDdDDDDDK....',
            '..KTTuKKTTuK....',
            '..KTtTKKTtTK....',
            '..KttKKKtttKK...',
        ];
        const legsVictory = [
            '...KDDDDDdK.....',
            '...KdDDDdDdK....',
            '..KDDDDDDDDdK...',
            '.KDDdDKKKdDDDK..',
            'KTTKKKKKKKKTTkK.',
            'KTtTKKKKKKTtTkK.',
            'KTtTKKKKKKTtTkK.',
            'KttKKKKKKKtttKK.',
        ];
        paint(0, [...HDf, ...HDfR, ...torso, ...legsIdle]);
        paint(FW, [...HDf, ...HDfR, ...torso, ...legsWalkA]);
        paint(FW * 2, [...HDf, ...HDfR, ...torso, ...legsWalkB]);
        paint(FW * 3, [...HDf, ...HDfR, ...torso, ...legsWalkC]);
        paint(FW * 4, [...HDb, ...HDbR, ...torso, ...legsIdle]);
        paint(FW * 5, [...HDb, ...HDbR, ...torso, ...legsWalkA]);
        paint(FW * 6, [...HDb, ...HDbR, ...torso, ...legsWalkB]);
        paint(FW * 7, [...HDb, ...HDbR, ...torso, ...legsWalkC]);
        paint(FW * 8, [...HDs, ...HDsR, ...torso, ...legsIdle]);
        paint(FW * 9, [...HDs, ...HDsR, ...torso, ...legsWalkA]);
        paint(FW * 10, [...HDs, ...HDsR, ...torso, ...legsWalkB]);
        paint(FW * 11, [...HDs, ...HDsR, ...torso, ...legsWalkC]);
        const HDfTalk = [...HDf.slice(0, 6), '..KYSSSmSSSmK...', '..KYcSSSScYK....'];
        paint(FW * 12, [...HDfTalk, ...HDfR, ...torso, ...legsIdle]);
        paint(FW * 13, [...HDf, ...HDfR, ...torso, ...legsVictory]);
        paint(FW * 14, [...HDf, ...HDfR, ...torso, ...legsVictory]);
        paint(FW * 15, [...HDs, ...HDsR, ...torso, ...legsIdle]);
        const tex = this.textures.get('ally');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * FW, 0, FW, FH);
        ct.refresh();
    }
    // ── NPC sprites – 16×24 × 10 frames (5 types × 2) ─────────────────────────
    buildNPCSprites() {
        const FW = 16, FH = 24, N = 10;
        const ct = this.textures.createCanvas('npc', FW * N, FH);
        const ctx = ct.context;
        const pal = {
            '.': null,
            H: '#5A3010', h: '#C87820', // brown hair
            A: '#AA2800', a: '#882000', // dark red hair
            N: '#CCCCCC', n: '#AAAAAA', // grey hair
            O: '#CC8800', o: '#AA6600', // orange hair
            V: '#884488', v: '#552266', // violet
            S: '#F4C090', c: '#D49070', // skin
            K: '#1A0C00', // dark
            e: '#44AACC', // eye
            B: '#1848A8', b: '#0C2878', // blue
            G: '#208020', g: '#105010', // green
            W: '#DDDDEE', w: '#BBBBCC', // white/grey
            P: '#183060', p: '#101840', // dark pants
            T: '#502010', t: '#301008', u: '#703020', // boots
            Y: '#DAA520', y: '#FFD700', // gold
            R: '#AA2020', r: '#882020', // red
            X: '#E0D080', x: '#C0B060', // straw/tan
        };
        const paint = (ox, rows) => this.painter(ctx, pal, ox, 0, rows);
        // Generic head builder helper
        const mkHead = (hairC, eyeC, label) => {
            void label;
            return [
                `....${hairC}${hairC}${hairC}${hairC}${hairC}${hairC}......`,
                `...${hairC}${hairC}${hairC}${hairC}${hairC}${hairC}${hairC}${hairC}.....`,
                `..${hairC}${hairC}SSSSSS${hairC}${hairC}....`,
                `..${hairC}SSSSSSSS${hairC}....`,
                `..KS${eyeC}KSK${eyeC}SSK....`,
                `..KSSSSSmSSK....`,
                `..KcSSSSScK....`,
            ];
        };
        // Elder (grey hair, robes)
        const elderHead = [
            '....NNNNNN......',
            '...NNNNNNNN.....',
            '..NNSSSSSSNn....',
            '..NSSSSSSSSN....',
            '..KSeKlKeSSK....',
            '..KSSSSSmSSK....',
            '..KcSSSSScNK....',
        ];
        const elderBody = [
            '....KNNNNK......',
            '...KNWWWWNK.....',
            '..KNWwWWwWNK....',
            '..KWWWWWWWwK....',
            '..KWwWwWWwWK....',
            '..KWWWWWWWwK....',
            '..KwWWWWWwWK....',
        ];
        const elderLegs = [
            '..KWWWWWWWwK....',
            '..KWwWWWWwWK....',
            '..KWWWWWWWwK....',
            '..KWwWWWwWWK....',
            '..KWWWWWWWwK....',
            '..KTTKKKTTtK....',
            '..KTtTKKTtTK....',
            '..KttKKKttKK....',
        ];
        const elderLegsW = [
            '..KWWWWWWWwK....',
            '..KWwWWWWwWK....',
            '.KWWWWWWWwWK....',
            'KWwWWWWWwWKK....',
            '.KWWWWWWWwK.....',
            '..KTtTKKTTkK....',
            '..KTtTKKTtKK....',
            '..KtttKKttKK....',
        ];
        paint(0, [...elderHead, ...elderBody, ...elderLegs]);
        paint(FW, [...elderHead, ...elderBody, ...elderLegsW]);
        // Merchant (brown hair, orange vest)
        const merchantHead = [
            '....HHHHHH......',
            '...HHHHHHHH.....',
            '..HHSSSSSSHh....',
            '..HSSSSSSSH.....',
            '..KSKeKlSSK.....',
            '..KSSSmSSSSK....',
            '..KcSSSSScHK....',
        ];
        const merchantBody = [
            '...KOOOOoK......',
            '..KOBBBBBOK.....',
            '..KOBbBBBOK.....',
            '..KOBBBBBBOK....',
            '..KOBbBBBOK.....',
            '..KBBBBBBBOK....',
            '..KoOOOOOOK.....',
        ];
        const merchantLegs = [
            '..KPPPpPPPK.....',
            '..KPpPpPPPK.....',
            '..KPPpPPpPK.....',
            '..KPpPpPpPK.....',
            '..KPPpPpPPK.....',
            '..KTTKKKTTtK....',
            '..KTtTKKTtTK....',
            '..KttKKKttKK....',
        ];
        const merchantLegsW = [...merchantLegs];
        merchantLegsW[4] = '.KPPpPpPPpPK....';
        paint(FW * 2, [...merchantHead, ...merchantBody, ...merchantLegs]);
        paint(FW * 3, [...merchantHead, ...merchantBody, ...merchantLegsW]);
        // Adventurer (red hair, brown vest)
        const adventHead = mkHead('A', 'e', 'adv');
        const adventBody = [
            '...KXXXXXK......',
            '..KXRRRRRxK.....',
            '..KXRrRRRxK.....',
            '..KXRRRRRXK.....',
            '..KXRrRRRxK.....',
            '..KXRRRRRXK.....',
            '..KxXXXXxXK.....',
        ];
        const adventLegs = [
            '..KPPPpPPPK.....',
            '..KPpPpPPPK.....',
            '..KPPpPPpPK.....',
            '..KPpPpPpPK.....',
            '..KPPpPpPPK.....',
            '..KTTKKKTTtK....',
            '..KTuTKKTuTK....',
            '..KttKKKttKK....',
        ];
        const adventLegsW = [...adventLegs];
        adventLegsW[4] = '.KPpPpPpPpK.....';
        const ah = adventHead.map(r => r.padEnd(16, '.'));
        paint(FW * 4, [...ah, ...adventBody, ...adventLegs]);
        paint(FW * 5, [...ah, ...adventBody, ...adventLegsW]);
        // Child (pigtails, pink dress)
        const childHead = [
            '..VHHHHHHVv.....',
            '.VVHHHHHHHVv....',
            '..VHSSSSSSHV....',
            '...HSSSSSSSH....',
            '...KSKeKlSSK....',
            '...KSSSmSSSSK...',
            '...KcSSSSScK....',
        ];
        const childBody = [
            '....KVVVVvK.....',
            '...KVDDDDvVK....',
            '...KVDdDDvVK....',
            '...KVDDDDvVK....',
            '...KVDdDDvVK....',
            '...KDDDDDDvK....',
            '...KvDDDDvK.....',
        ];
        const childLegs = [
            '...KDDDDDDvK....',
            '...KDdDDDvDK....',
            '..KDDDDDDDDK....',
            '..KDdDDDDdDK....',
            '..KDDDDDDdDK....',
            '...KTtKKTtkK....',
            '...KTtKKTtTK....',
            '...KttKKtttKK...',
        ];
        const childLegsW = [...childLegs];
        childLegsW[3] = '.KDDdDDDdDDK....';
        paint(FW * 6, [...childHead, ...childBody, ...childLegs]);
        paint(FW * 7, [...childHead, ...childBody, ...childLegsW]);
        // Scientist (white hair, lab coat)
        const sciHead = [
            '....NNNNNN......',
            '...NNNNNNNN.....',
            '..NNSSSSSSNn....',
            '..NSSSSSSSSN....',
            '..KSnKnSKSSK....', // glasses (n = lens frame)
            '..KSSSSSmSSK....',
            '..KcSSSSScNK....',
        ];
        const sciBody = [
            '...KWWWWWWK.....',
            '..KWwWWWWwWK....',
            '..KWWWWWWWwK....',
            '..KWwWWWWwWK....',
            '..KWWWWWWWwK....',
            '..KWwWWWWwWK....',
            '..KWWWWWWWwK....',
        ];
        const sciLegs = [
            '..KPPPpPPPK.....',
            '..KPpPpPPPK.....',
            '..KPPpPPpPK.....',
            '..KPpPpPpPK.....',
            '..KPPpPpPPK.....',
            '..KTTKKKTTtK....',
            '..KTtTKKTtTK....',
            '..KttKKKttKK....',
        ];
        const sciLegsW = [...sciLegs];
        sciLegsW[4] = '.KPPpPpPpPK.....';
        paint(FW * 8, [...sciHead, ...sciBody, ...sciLegs]);
        paint(FW * 9, [...sciHead, ...sciBody, ...sciLegsW]);
        const tex = this.textures.get('npc');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * FW, 0, FW, FH);
        ct.refresh();
    }
    // ── Enemy sprites – 20×24 × 12 frames ─────────────────────────────────────
    // [0-2]=slime, [3-5]=bat, [6-8]=golem, [9-11]=crystal wraith
    buildEnemySprite() {
        const EW = 20, EH = 24, N = 12;
        const ct = this.textures.createCanvas('enemy', EW * N, EH);
        const ctx = ct.context;
        const pal = {
            '.': null,
            G: '#22CC44', g: '#18A030', L: '#55EE66', l: '#80FF90', k: '#002200', w: '#EEFFEE',
            V: '#3A1840', v: '#5A2860', X: '#6A3870', x: '#8A5090', r: '#FF2222', e: '#FF8888',
            O: '#887766', o: '#5C5045', A: '#AAA088', a: '#CCBBA0', F: '#FF5500', f: '#FF9944', C: '#2A1810',
            U: '#4488CC', u: '#88AAEE', Z: '#AACCFF', z: '#2244AA', Q: '#FFCCFF', q: '#DD99FF',
            W: '#FFFFFF', Y: '#FF44AA',
            // New lizard warrior
            M: '#558833', m: '#3A6620', P: '#AABB44', p: '#888822', D: '#FF4400', d: '#CC2200',
            // New dark knight
            N: '#303040', n: '#1A1A28', T: '#606080', t: '#404050', R: '#CC2020', J: '#FFAA00',
        };
        const paint = (ox, oy, rows) => this.painter(ctx, pal, ox, oy, rows);
        // ── Slime (frames 0-2) ──────────────────────────────────────────────
        const slimeFrame = (fi, bounce) => {
            const ox = fi * EW;
            const bodyH = 12 + bounce;
            const bodyY = 10 - bounce;
            ctx.fillStyle = '#001100';
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.ellipse(ox + 10, 23, 7, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            for (let row = 0; row < bodyH; row++) {
                const t = row / bodyH;
                const edge = Math.round(Math.sin(Math.PI * t) * 2.5);
                const lw = 14 - edge * 2;
                const lx = 3 + edge;
                const col = row < 2 ? pal['L'] : row < bodyH - 2 ? pal['G'] : pal['g'];
                ctx.fillStyle = col;
                ctx.fillRect(ox + lx, bodyY + row, lw, 1);
            }
            // Highlight sheen
            ctx.fillStyle = pal['l'];
            ctx.fillRect(ox + 4, bodyY + 1, 4, 1);
            ctx.fillRect(ox + 4, bodyY + 2, 3, 1);
            ctx.fillStyle = pal['w'];
            ctx.fillRect(ox + 5, bodyY + 1, 2, 1);
            // Eyes
            ctx.fillStyle = pal['k'];
            ctx.fillRect(ox + 4, bodyY + 4, 3, 2);
            ctx.fillRect(ox + 11, bodyY + 4, 3, 2);
            ctx.fillStyle = pal['w'];
            ctx.fillRect(ox + 4, bodyY + 4, 1, 1);
            ctx.fillRect(ox + 11, bodyY + 4, 1, 1);
            // Smile
            ctx.fillStyle = pal['k'];
            ctx.fillRect(ox + 6, bodyY + 8, 1, 1);
            ctx.fillRect(ox + 7, bodyY + 9, 4, 1);
            ctx.fillRect(ox + 11, bodyY + 8, 1, 1);
            // Drip
            if (bounce > 0) {
                ctx.fillStyle = pal['G'];
                ctx.fillRect(ox + 9, bodyY + bodyH, 2, 2);
                ctx.fillStyle = pal['g'];
                ctx.fillRect(ox + 9, bodyY + bodyH + 2, 2, 1);
            }
        };
        slimeFrame(0, 0);
        slimeFrame(1, 2);
        slimeFrame(2, 3);
        // ── Bat (frames 3-5) ────────────────────────────────────────────────
        const batFrame = (fi, phase) => {
            const ox = fi * EW;
            const wingY = [4, 7, 10][phase];
            const wingSp = [12, 9, 7][phase];
            // Wing left
            paint(ox, wingY, [
                `vv..........`, `Vvv.........`, `VVvv........`,
                `VVVVv.......`, `XXVVVv......`,
            ].map(r => r.padEnd(20, '.')));
            // Wing right
            const wingR = [`..........vv`, `........vvV`, `........vVVV`,
                `......vVVVV`, `.....vVVVXX`];
            wingR.forEach((row, gy) => {
                for (let gx = 0; gx < row.length; gx++) {
                    const col = pal[row[gx]];
                    if (!col)
                        continue;
                    ctx.fillStyle = col;
                    ctx.fillRect(ox + EW - row.length + gx, wingY + gy, 1, 1);
                }
            });
            // Body
            paint(ox, 8, [
                '.......vVVVVVv.......',
                '......VXXXXXXVv......',
                '.....VXXXXXXXXVv.....',
                '......VXXXXXXVv......',
                '.......vVVVVVv.......',
                '.......VVVVVVVV......',
                '........VVVVVV.......',
                '.......VVVVVVVV......',
            ].map(r => r.slice(0, EW)));
            // Head
            paint(ox, 4, [
                '....vVVv..vVVv......',
                '....VVVv..VVVv......',
                '....vVvvvVVv........',
                '.....VVVVVV.........',
                '......VVVVVv........',
            ].map(r => r.slice(0, EW)));
            // Eyes glow
            ctx.fillStyle = pal['r'];
            ctx.fillRect(ox + 7, 9, 2, 1);
            ctx.fillRect(ox + 11, 9, 2, 1);
            ctx.fillStyle = pal['e'];
            ctx.fillRect(ox + 7, 9, 1, 1);
            ctx.fillRect(ox + 11, 9, 1, 1);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(ox + 7, 14, 1, 2);
            ctx.fillRect(ox + 10, 14, 1, 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(ox + 8, 14, 1, 1);
        };
        batFrame(3, 0);
        batFrame(4, 1);
        batFrame(5, 2);
        // ── Golem (frames 6-8) ──────────────────────────────────────────────
        const golemFrame = (fi, pose) => {
            const ox = fi * EW;
            paint(ox, 3, [
                '....oOOOOOOOoo......',
                '...oOAAOOOAAOOo.....',
                '...oOAAOOOAAOOo.....',
                '...oOOOOOOOOOOo.....',
                '...oOOOOOOOOOOo.....',
                '..oOOAOOCCCCOAOOo...',
                '.oOOOOCCCCCCOOOOo...',
                '.oOOOOCCCCCCOOOOo...',
                '..oOOOOCCCCOOOOo....',
                '..oOOOOOOOOOOOo.....',
                '...oOOOOOOOOOo......',
                '...oOOOCCOCOOo......',
                '....oOOCOOCOOo......',
                '....oOOOOOOOo.......',
                '.....oOOOOOo........',
                '......oooooo........',
            ].map(r => r.slice(0, EW)));
            // Arms based on pose
            const armY = pose === 0 ? 6 : pose === 1 ? 3 : 1;
            paint(ox, armY, [
                '...OOo.....OOo......',
                '..OOOo.....OOO......',
                '.oOOOo.....OOo......',
                '.oOOO.......oo......',
                '.oOO................',
            ].map(r => r.slice(0, EW)));
            // Glowing eyes
            ctx.fillStyle = pal['F'];
            ctx.fillRect(ox + 4, 7, 3, 2);
            ctx.fillRect(ox + 12, 7, 3, 2);
            ctx.fillStyle = pal['f'];
            ctx.fillRect(ox + 4, 7, 1, 1);
            ctx.fillRect(ox + 12, 7, 1, 1);
            // Cracks
            ctx.fillStyle = pal['C'];
            ctx.fillRect(ox + 7, 11, 5, 1);
            ctx.fillRect(ox + 8, 12, 1, 2);
            ctx.fillRect(ox + 10, 12, 2, 1);
            // Rocks on shoulders
            ctx.fillStyle = pal['o'];
            ctx.fillRect(ox + 1, 6, 2, 2);
            ctx.fillRect(ox + 17, 6, 2, 2);
        };
        golemFrame(6, 0);
        golemFrame(7, 1);
        golemFrame(8, 2);
        // ── Crystal Wraith (frames 9-11) ────────────────────────────────────
        const wraithFrame = (fi, phase) => {
            const ox = fi * EW;
            const oy = phase;
            paint(ox, oy + 2, [
                '.....zuuuzz.........',
                '....zuUUUUUz........',
                '...zuUUUUUUUz.......',
                '...zUUUZZUUUz.......',
                '...zUUZZQZZUz.......',
                '..zuUZZQQQZUuz......',
                '..zuUZQQQQQZUuz.....',
                '...zUUZZQZZUz.......',
                '...zuUUUUUUuz.......',
                '....zzuUUuzz........',
                '.....zzzzzz.........',
                '....zzzzzzz.........',
            ].map(r => r.slice(0, EW)));
            ctx.fillStyle = pal['Q'];
            ctx.fillRect(ox + 9, oy + 8, 3, 3);
            ctx.fillStyle = pal['W'];
            ctx.fillRect(ox + 10, oy + 8, 1, 1);
            ctx.fillStyle = pal['Y'];
            ctx.fillRect(ox + 6, oy + 5, 2, 1);
            ctx.fillRect(ox + 12, oy + 5, 2, 1);
            // Crystal shards
            if (phase > 0) {
                ctx.fillStyle = pal['Z'];
                const pts = [[3, 16], [16, 17], [7, 19], [12, 18]];
                pts.forEach(([px, py]) => ctx.fillRect(ox + px, oy + py, 1 + (phase % 2), 1));
            }
            // Glow
            const glow = ctx.createRadialGradient(ox + 10, oy + 10, 0, ox + 10, oy + 10, 8);
            glow.addColorStop(0, 'rgba(160,200,255,0.25)');
            glow.addColorStop(1, 'rgba(160,200,255,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(ox + 10, oy + 10, 8, 0, Math.PI * 2);
            ctx.fill();
        };
        wraithFrame(9, 0);
        wraithFrame(10, 1);
        wraithFrame(11, 2);
        const tex = this.textures.get('enemy');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * EW, 0, EW, EH);
        ct.refresh();
    }
    // ── Portrait textures (32×32) ──────────────────────────────────────────────
    buildPortraitTextures() {
        const defs = [
            ['portrait_hero', '#1A3055', '#CC2808', '#FF5030', '#4878F0', '#1848C0'],
            ['portrait_ally', '#2A1855', '#E8C020', '#FFD840', '#44AA66', '#F0F4FF'],
            ['portrait_elder', '#2A1A10', '#CCCCCC', '#EEEEEE', '#3388AA', '#884444'],
            ['portrait_merchant', '#1A2010', '#5A3010', '#C87820', '#44AACC', '#CC8800'],
            ['portrait_adventurer', '#101828', '#AA2800', '#DD6600', '#33AACC', '#773322'],
            ['portrait_child', '#1A1040', '#5A3010', '#C87820', '#FF88AA', '#CC44AA'],
            ['portrait_scientist', '#0E1820', '#BBBBBB', '#DDDDDD', '#4488AA', '#E0E8F0'],
        ];
        defs.forEach(([key, bg, hairD, hairL, eyeC, clothC]) => {
            const ct = this.textures.createCanvas(key, 32, 32);
            const c = ct.context;
            // Background gradient
            const grad = c.createLinearGradient(0, 0, 0, 32);
            grad.addColorStop(0, bg);
            grad.addColorStop(1, this.lightenHex(bg, 20));
            c.fillStyle = grad;
            c.fillRect(0, 0, 32, 32);
            // Hair
            c.fillStyle = hairD;
            c.fillRect(7, 3, 18, 5);
            c.fillRect(6, 5, 20, 6);
            c.fillStyle = hairL;
            c.fillRect(10, 3, 6, 3);
            c.fillRect(18, 4, 4, 2);
            // Face
            c.fillStyle = '#F4C090';
            c.fillRect(7, 9, 18, 12);
            c.fillStyle = '#D49070';
            c.fillRect(7, 18, 18, 3);
            // Eyes
            c.fillStyle = '#1A0C00';
            c.fillRect(9, 12, 4, 2);
            c.fillRect(19, 12, 4, 2);
            c.fillStyle = eyeC;
            c.fillRect(10, 12, 2, 2);
            c.fillRect(20, 12, 2, 2);
            c.fillStyle = '#FFFFFF';
            c.fillRect(10, 12, 1, 1);
            c.fillRect(20, 12, 1, 1);
            // Eyebrows
            c.fillStyle = hairD;
            c.fillRect(9, 10, 5, 1);
            c.fillRect(18, 10, 5, 1);
            // Nose
            c.fillStyle = '#D49070';
            c.fillRect(15, 15, 2, 1);
            // Mouth
            c.fillStyle = '#AA4444';
            c.fillRect(12, 18, 8, 1);
            c.fillStyle = '#FF8888';
            c.fillRect(13, 18, 6, 1);
            // Ears
            c.fillStyle = '#F4C090';
            c.fillRect(6, 13, 2, 4);
            c.fillRect(24, 13, 2, 4);
            // Neck
            c.fillStyle = '#F4C090';
            c.fillRect(13, 21, 6, 3);
            // Clothing
            c.fillStyle = clothC;
            c.fillRect(5, 24, 22, 8);
            c.fillStyle = this.lightenHex(clothC, -20);
            c.fillRect(5, 24, 3, 8);
            c.fillRect(24, 24, 3, 8);
            ct.refresh();
        });
    }
    lightenHex(hex, amount) {
        const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    // ── Environment sprites ────────────────────────────────────────────────────
    buildEnvironmentSprites() {
        // Tree: 16×32 (larger, more detailed)
        const TW = 16, TH = 32;
        const ctT = this.textures.createCanvas('tree', TW, TH);
        const ctxT = ctT.context;
        const palT = {
            '.': null,
            G: '#1E6020', g: '#145015', L: '#2A8030', l: '#3A9840', X: '#50B050',
            k: '#0A2010', K: '#061808', B: '#5A3A18', b: '#3E2208', s: '#7A5028',
        };
        this.painter(ctxT, palT, 0, 0, [
            '......GGGG......', '....GGGGGGGG....', '...GLLLLLXLLG...', '..GLXLlLlLXLG...',
            '.GLLLXLlLLXLLG..', 'GGLLLLLLLLLLLLG.', 'GLLLLXLLLXLLLLG.', 'GLLLLLLLLLLLLLG.',
            '.GLLXLLlLLXLLG..', '..GLLLlLLLLLG...', '...GLLXLLlLG....', '....GGkLLGG.....',
            '.....GGGGGg.....', '......KBBs......', '......KBBs......', '......KBBs......',
            '......KBbs......', '......KBBs......', '......KBbs......', '......KBBs......',
            '......KBbs......', '......KBBs......', '......KBbs......', '......KBBs......',
            '......KBBBB.....', '......KBBBB.....', '......KBBBB.....', '......KBBBB.....',
            '......bBBBB.....', '......bBBBB.....', '......bBBBB.....', '......bBBBB.....',
        ]);
        ctT.refresh();
        // Building: 32×32
        const ctB = this.textures.createCanvas('building', 32, 32);
        const ctxB = ctB.context;
        const palB = {
            '.': null,
            R: '#8B3A2A', r: '#6A2A1A', W: '#DDD8C8', w: '#B8B0A0',
            D: '#6A4020', d: '#4A2810', G: '#4A8840', g: '#306030',
            B: '#1040A0', b: '#0A2860', Y: '#E8D080', y: '#C8B050',
            S: '#888880', s: '#666660', T: '#704030', t: '#502010',
            Z: '#2A1808', z: '#402010',
        };
        this.painter(ctxB, palB, 0, 0, [
            'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
            'RrrRRRRRRRRRRRRRRRRRRRRRRRRRrrR',
            'RRRyYYYYYYYYYYYYYYYYYYYYYYyRRRR',
            'RRRYRRRRRRRRRRRRRRRRRRRRRRRYRRRR',
            'RRRyRRRRRRRRRRRRRRRRRRRRRRRyRRR',
            'RRRRyRRRRRRRRRRRRRRRRRRRRRyRRRR',
            'RRRRRyyyyyyyyyyyyyyyyyyyyyyrRRRR',
            'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
            'WWWWBBBBWWWWWWWWWWWWWWBBBBWWWWWW',
            'WWWWBbBBWWWWDDDDDDWWWWBbBBWWWWWW',
            'WWWWBBbBWWWWDDdDDDWWWWBBbBWWWWWW',
            'WWWWBbBBWWWWDtttDDWWWWBbBBWWWWWW',
            'WWWWBBBBWWWWDtDtDDWWWWBBBBWWWWWW',
            'WWwwwwwwwwwwDtDtDDwwwwwwwwwwWWWW',
            'WWwGGGGGwwwwDDDDDDwwwGGGGGwwWWWW',
            'WWwGggGGwwwwwwwwwwwwwGggGGwwWWWW',
            'WWwGGGGGwwwwwwwwwwwwwGGGGGwwWWWW',
            'WWwwwwwwwwwwwwwwwwwwwwwwwwwwWWWW',
            'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
            'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
            'SsSSSSSSSSSSSSSSSSSSSSSSSSSSsSSS',
            'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
            'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
            'SsSSSSSSSSSSSSSSSSSSSSSSSSSSsSSS',
            'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
            'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
            'SsSSSSSSSSSSSSSSSSSSSSSSSSSSsSSS',
            'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
            'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
            'SsSSSSSSSSSSSSSSSSSSSSSSSSSSsSSS',
            'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
            'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
        ]);
        ctB.refresh();
        // Gate: 16×32
        const ctG = this.textures.createCanvas('gate', 16, 32);
        const ctxG = ctG.context;
        const palG = {
            '.': null,
            A: '#1020A0', a: '#081060', B: '#2040C0', b: '#3060E0',
            C: '#5080FF', c: '#80A0FF', D: '#A0C0FF', d: '#C0D8FF',
            G: '#202020', g: '#101010',
        };
        this.painter(ctxG, palG, 0, 0, [
            '......dddd......', '....dDDDDDDd....', '...dDCCCCCCDd...', '..dDCBBBBBBCDd..',
            '..dDCBbbbbBCDd..', '..DCBbAAAAbBCDd.', '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.',
            '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.',
            '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.',
            '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.', '..DCBbAAAAbBCDd.', '..dDCBbbbbBCDd..',
            '..dDCBBBBBBCDd..', '...dDCCCCCCDd...', '....dDDDDDDd....', '......dddd......',
            '......ggGG......', '......ggGG......', '......ggGG......', '......ggGG......',
            '......ggGG......', '......ggGG......', '......ggGG......', '......ggGG......',
        ]);
        ctG.refresh();
        // Save crystal: 12×16
        const ctS = this.textures.createCanvas('save_crystal', 12, 16);
        const ctxS = ctS.context;
        const palS = { '.': null, Y: '#AACCFF', W: '#FFFFFF', y: '#88AADD', Z: '#6688CC' };
        this.painter(ctxS, palS, 0, 0, [
            '....YYYY....', '...YYYYY....', '..YYYYYYY...', '..YYYYYYY...',
            '.YYYYWWYYY..', '..YYWWYYYY..', '..YYWWYYYY..', '..YYYYWYYY..',
            '.YYYYWYYYY..', '..YYYYWYY...', '..YYYYYYYYY.', '..YYYYYYYY..',
            '...YYYYYY...', '....YYYY....', '....YYYY....', '....YYYY....',
        ]);
        ctS.refresh();
    }
    // ── UI assets ─────────────────────────────────────────────────────────────
    buildUIAssets() {
        // Window frame chrome: 8×8 corner piece
        const ctCorner = this.textures.createCanvas('ui_corner', 8, 8);
        const ctxC = ctCorner.context;
        ctxC.fillStyle = '#CCA820';
        ctxC.fillRect(0, 6, 8, 2);
        ctxC.fillRect(6, 0, 2, 8);
        ctxC.fillRect(6, 6, 2, 2);
        ctxC.fillStyle = '#FFDE60';
        ctxC.fillRect(6, 6, 1, 1);
        ctCorner.refresh();
        // Menu cursor
        const ct = this.textures.createCanvas('cursor', 8, 8);
        const ctx = ct.context;
        ctx.fillStyle = '#FFE060';
        [[0, 3, 1, 2], [1, 2, 1, 4], [2, 1, 1, 6], [3, 0, 1, 8]].forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
        ct.refresh();
        // ATB bar fill gradient (wider: 60×5)
        const atb = this.textures.createCanvas('atb_fill', 60, 5);
        const actx = atb.context;
        const agrad = actx.createLinearGradient(0, 0, 60, 0);
        agrad.addColorStop(0, '#1050C0');
        agrad.addColorStop(0.4, '#3088FF');
        agrad.addColorStop(0.8, '#60B8FF');
        agrad.addColorStop(1, '#A0D8FF');
        actx.fillStyle = agrad;
        actx.fillRect(0, 0, 60, 5);
        atb.refresh();
        // HP bar fill
        const hpBar = this.textures.createCanvas('hp_fill', 60, 5);
        const hctx = hpBar.context;
        const hg = hctx.createLinearGradient(0, 0, 60, 0);
        hg.addColorStop(0, '#880820');
        hg.addColorStop(0.5, '#D83050');
        hg.addColorStop(1, '#FF7090');
        hctx.fillStyle = hg;
        hctx.fillRect(0, 0, 60, 5);
        hpBar.refresh();
        // MP bar fill
        const mpBar = this.textures.createCanvas('mp_fill', 60, 5);
        const mctx = mpBar.context;
        const mg = mctx.createLinearGradient(0, 0, 60, 0);
        mg.addColorStop(0, '#182080');
        mg.addColorStop(0.5, '#3050C8');
        mg.addColorStop(1, '#6080FF');
        mctx.fillStyle = mg;
        mctx.fillRect(0, 0, 60, 5);
        mpBar.refresh();
        // Level up flash
        const lvl = this.textures.createCanvas('levelup_fx', 64, 16);
        const lctx = lvl.context;
        const lg = lctx.createLinearGradient(0, 0, 64, 0);
        lg.addColorStop(0, 'rgba(255,220,0,0)');
        lg.addColorStop(0.3, 'rgba(255,220,0,1)');
        lg.addColorStop(0.7, 'rgba(255,220,0,1)');
        lg.addColorStop(1, 'rgba(255,220,0,0)');
        lctx.fillStyle = lg;
        lctx.fillRect(0, 0, 64, 16);
        lvl.refresh();
    }
}
