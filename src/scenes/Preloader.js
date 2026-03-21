import Phaser from 'phaser';
import { SCENE, TILE } from '../data/constants';
const S = TILE.SIZE; // 16
// ── Preloader ─────────────────────────────────────────────────────────────────
// Generates ALL textures procedurally using pixel-art painting.
// Resolution: All sprites rendered at 1px-per-pixel for crisp 3× scaling.
export class Preloader extends Phaser.Scene {
    constructor() { super({ key: SCENE.PRELOADER }); }
    create() {
        this.buildTileset();
        this.buildPlayerSprite();
        this.buildAllySprite();
        this.buildNPCSprites();
        this.buildEnemySprite();
        this.buildPortraitTextures();
        this.buildEnvironmentSprites();
        this.buildUIAssets();
        this.scene.start(SCENE.TITLE);
    }
    // ── Pixel painter helper ──────────────────────────────────────────────────
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
    // ── Tileset  (9 tiles × 16 × 16) ─────────────────────────────────────────
    // 0=grass 1=water 2=rock 3=path 4=flower 5=sand 6=dark-grass 7=bridge 8=wood-floor
    buildTileset() {
        const ct = this.textures.createCanvas('tileset', S * 9, S);
        const ctx = ct.context;
        const pal = {
            '.': null,
            // Grass
            G: '#3A7D44', g: '#2D6636', L: '#50A060', l: '#68B878',
            // Water (animated-look with highlights)
            W: '#1A5AB0', w: '#2068C4', Q: '#3A80D8', q: '#6AB2F0', f: '#ACD8F8', F: '#DCEEFC',
            // Rock / wall
            R: '#5C5047', r: '#3A2E28', O: '#746050', o: '#8A7868', x: '#9A8878',
            // Path / dirt
            P: '#C8A840', p: '#9A7830', A: '#DCC060', a: '#E8D078',
            // Flower + stem
            V: '#CC2244', v: '#CCAA00', E: '#F0E0C8', s: '#228822', d: '#1A6A1A',
            // Sand
            N: '#E8D090', n: '#C8B060', M: '#F0DC98', m: '#D8BC70',
            // Dark grass
            K: '#1E4824', k: '#163618', J: '#284E30', j: '#324A2A',
            // Bridge wood
            B: '#8A6020', b: '#6A4010', I: '#A07830', i: '#C09050',
            // Wood floor
            X: '#B08040', Z: '#987030', Y: '#C89050', y: '#A07838',
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
        // Tile 6: Dark Grass (forest floor)
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
        // Tile 8: Wood floor (inside buildings)
        px(S * 8, [
            'XXZXXXXZXXYXXXZX', 'XYXXZXXXXXXZXYXX', 'XXXZXXYXXXXXXXXX',
            'XXXXXXXXZXXYyXXX', 'ZXYXXXXXXXXXXZXX', 'XXXXZXXYXXXZXXXX',
            'XXXXXXXXXXXyXXXX', 'XZXXXXZXXXXXXXZX', 'XXXYXZXXXXXXXXXX',
            'XXXXXXXXZXYXXXXX', 'XXZXXXXYyXXXZXXX', 'XXXXXZXXXXXXXXXX',
            'YXXXXXXXZXXYXXyy', 'XXXZXXXXXXXXXXXX', 'XXXXXYXZXXXXXYXY',
            'ZXXXXXXXXXXXXXX',
        ]);
        ct.refresh();
    }
    // ── Player sprite – 12×16 × 12 frames  ───────────────────────────────────
    // Layout: [0-2]=down, [3-5]=up, [6-8]=side-left, [9]=talk, [10-11]=victory
    buildPlayerSprite() {
        const FW = 12, FH = 16, N = 12;
        const ct = this.textures.createCanvas('player', FW * N, FH);
        const ctx = ct.context;
        const pal = {
            '.': null,
            H: '#6A3810', h: '#C87820', // hair dark / highlight
            S: '#FCCFA0', c: '#D4A070', // skin / shadow
            K: '#140A00', // eye dark
            e: '#FFFFFF', // eye white
            M: '#882200', // mouth
            R: '#CC3300', r: '#882200', // red scarf
            W: '#E8F0FF', w: '#C8D0E8', // white shirt
            B: '#3878B8', b: '#1858A0', // blue tunic
            P: '#182850', p: '#101830', // pants
            Z: '#703818', // belt
            T: '#381808', t: '#784028', X: '#A05030', // boot
            G: '#44AA55', g: '#228833', // victory green
        };
        const paint = (ox, rows) => this.painter(ctx, pal, ox, 0, rows);
        // ── FRONT (down) ──────────────────────────────────────────────────────
        // Shared head (front view)
        const HD = ['...HHhHH....', '..HHHHHHHh..', '..HSSSSSH...', '..HSKeSKcH..', '..HSSSSSH...', '..HcSSScH...'];
        // Shared torso
        const BD = ['..RRRRRRRR..', '..wwWWWWww..', '..BBBBBBBB..', '..BbBBBBbB..', '..bBBBBBBb..', '..ZZZZZZZZ..', '..PPPPPPPP..', '..PpPPPPpP..'];
        // Frame 0: down-idle
        paint(0, [...HD, ...BD, '..TT..TT....', '..Xt..Xt....']);
        // Frame 1: down-walk A (left foot fwd)
        paint(FW, [...HD, ...BD, '.TT...TTT...', '..t....t....']);
        // Frame 2: down-walk B (right foot fwd)
        paint(FW * 2, [...HD, ...BD, '.TTT..TT....', '..t....t....']);
        // ── BACK (up) ─────────────────────────────────────────────────────────
        // Show back of head (no face)
        const HU = ['...HHhHH....', '..HHHHHHHh..', '..HHHHHHHH..', '..HHhhhHHH..', '..HHHhHHHH..', '..HHHHHHHHH.'];
        const BU = ['..RRRRRRRR..', '..wwWWWWww..', '..BBBBBBBB..', '..BbBBBBbB..', '..bBBBBBBb..', '..ZZZZZZZZ..', '..PPPPPPPP..', '..PpPPPPpP..'];
        // Frame 3: up-idle
        paint(FW * 3, [...HU, ...BU, '..TT..TT....', '..Xt..Xt....']);
        // Frame 4: up-walk A
        paint(FW * 4, [...HU, ...BU, '.TT...TTT...', '..t....t....']);
        // Frame 5: up-walk B
        paint(FW * 5, [...HU, ...BU, '.TTT..TT....', '..t....t....']);
        // ── SIDE (left) ───────────────────────────────────────────────────────
        // Profile head
        const HS = ['....HHhH....', '...HHHHHh...', '...HSSSSh...', '...HSKeSh...', '...HSSSmH...', '...HcSSSH...'];
        const BS = ['...RRRRRR...', '...wWWWww...', '...BBBBB....', '...BbBBBb...', '...bBBBBb...', '...ZZZZZ....', '...PPPPPP...', '...PpPPPp...'];
        // Frame 6: side-idle
        paint(FW * 6, [...HS, ...BS, '...TTsTT....', '...Xt.Xt....']);
        // Frame 7: side-walk A
        paint(FW * 7, [...HS, ...BS, '..TT..TTT...', '...t...t....']);
        // Frame 8: side-walk B
        paint(FW * 8, [...HS, ...BS, '..TTT.TT....', '...t...t....']);
        // Frame 9: talk (front, mouth open)
        const HD_T = [...HD.slice(0, 5), '..HcSMScH...'];
        paint(FW * 9, [...HD_T, ...BD, '..TT..TT....', '..Xt..Xt....']);
        // Frames 10-11: victory (jump, front)
        const BD_V = ['..RRRRRRRR..', '..wwWWWWww..', '..GBBBBBGG..', '..GgBBBBgG..', '..gGBBBBGg..', '..ZZZZZZZZ..', '..PPPPPPPP..', '..PpPPPPpP..'];
        paint(FW * 10, [...HD, ...BD_V, '..TT.....TT.', '............']);
        paint(FW * 11, [...HD, ...BD_V, '.TT......TT.', '............']);
        const tex = this.textures.get('player');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * FW, 0, FW, FH);
        ct.refresh();
    }
    // ── Ally sprite – 12×16 × 12 frames ──────────────────────────────────────
    buildAllySprite() {
        const FW = 12, FH = 16, N = 12;
        const ct = this.textures.createCanvas('ally', FW * N, FH);
        const ctx = ct.context;
        const pal = {
            '.': null,
            Y: '#DAA520', y: '#FFD700', // gold hair
            S: '#FCCFA0', c: '#D4A070', // skin
            K: '#140A00', e: '#FFFFFF', // eye dark/white
            M: '#882200', // mouth
            D: '#F0F4FF', d: '#C8D0E8', // dress
            L: '#6090C0', l: '#3A6090', // blue trim
            T: '#705030', t: '#C0A060', X: '#E0C080', // boot
            U: '#886600', u: '#AAEEFF', // staff
            G: '#44AA55', g: '#228833', // victory
        };
        const paint = (ox, rows) => this.painter(ctx, pal, ox, 0, rows);
        // Front (down) head – long hair
        const HD = ['.yYYyYy.....', 'YYYYYYYy....', 'YSSSSSSSY...', 'YSKeSKcSY..', 'YSSSSSSSY...', 'YcSSSSScY...'];
        const BD = ['..LLLLLLLL..', '..DDDDDDDd..', '..DDDDDDDd..', '..DDDDDDDd..', '...DDDDDDd..', '..LLLLLLLl..', '...ddddddd..', '....ddddd...'];
        paint(0, [...HD, ...BD, '...TT.TT....', '...Xt.Xt....']);
        paint(FW, [...HD, ...BD, '..TT..TTT...', '...t...t....']);
        paint(FW * 2, [...HD, ...BD, '..TTT.TT....', '...t...t....']);
        // Back (up)
        const HU = ['.yYYyYy.....', 'YYYYYYYy....', 'YYYYYYYYy...', 'YYYyyYYYY...', 'YYYYyYYYY...', 'YYYYYYYYYL..'];
        paint(FW * 3, [...HU, ...BD, '...TT.TT....', '...Xt.Xt....']);
        paint(FW * 4, [...HU, ...BD, '..TT..TTT...', '...t...t....']);
        paint(FW * 5, [...HU, ...BD, '..TTT.TT....', '...t...t....']);
        // Side (left)
        const HS = ['....YYyY....', '...YYYYYy...', '...YSSSSy...', '...YSKeSy...', '...YSSSmY...', '...YcSSSY...'];
        const BS = ['...LLLLLl...', '...DDDDDd...', '...DDDDDd...', '...DDDDDd...', '....DDDDd...', '...LLLLLl...', '....ddddd...', '....dddd....'];
        paint(FW * 6, [...HS, ...BS, '...TTsTT....', '...Xt.Xt....']);
        paint(FW * 7, [...HS, ...BS, '..TT..TTT...', '...t...t....']);
        paint(FW * 8, [...HS, ...BS, '..TTT.TT....', '...t...t....']);
        // Talk
        const HD_T = [...HD.slice(0, 5), 'YcSSMSScY...'];
        paint(FW * 9, [...HD_T, ...BD, '...TT.TT....', '...Xt.Xt....']);
        // Victory
        const BD_V = ['..LLLLLLLL..', '..DDDDDDDd..', '..GDDDDDGd..', '..GgDDDDgd..', '...gDDDDgd..', '..LLLLLLLl..', '...ddddddd..', '....ddddd...'];
        paint(FW * 10, [...HD, ...BD_V, '...TT....TT.', '............']);
        paint(FW * 11, [...HD, ...BD_V, '..TT.....TT.', '............']);
        const tex = this.textures.get('ally');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * FW, 0, FW, FH);
        ct.refresh();
    }
    // ── NPC sprites ───────────────────────────────────────────────────────────
    buildNPCSprites() {
        // 5 NPC types × 4 frames = 20 frames  (12×16 × 20)
        const FW = 12, FH = 16, N = 20;
        const ct = this.textures.createCanvas('npc', FW * N, FH);
        const ctx = ct.context;
        const pal = {
            '.': null,
            H: '#6A3810', h: '#C87820',
            A: '#AA3300', a: '#882200', // red-hair
            B: '#224488', b: '#112244', // blue shirt
            E: '#208020', e: '#105010', // green tunic
            O: '#AA8800', o: '#886600', // orange vest (merchant)
            N: '#CCCCDD', n: '#AAAACC', // white hair (elder)
            Q: '#775533', q: '#553311', // brown vest
            S: '#FCCFA0', c: '#D4A070',
            K: '#140A00',
            P: '#182850', p: '#101830',
            T: '#381808', t: '#784028', X: '#A05030',
            V: '#884488', v: '#552266', // violet (child)
            W: '#F0E0E0', w: '#D0C0C0', // white (elder robe)
            Y: '#DAA520', y: '#FFD700', // gold
            Z: '#703818',
        };
        const paint = (ox, rows) => this.painter(ctx, pal, ox, 0, rows);
        // NPC A – Elder (grey hair, staff)
        const elderF = (fi, legV) => paint(fi * FW, [
            '...NNnNN....', '..NNNNNNn...', '.NWWWWWWN...', '..WKcWKcW...', '..WWWWWWW...', '..WcWWWcW...',
            '...YYYYYY...', '..WWWWWWW...', '..WwWWWWw...', '..wWWWWWW...', '..wWWWWWW...', '..PPPPPP....',
            '..PPPPPP....', '..PpPPPpP...',
            legV ? '..TT..TT....' : '.TT...TTT...', legV ? '..Xt..Xt....' : '..t....t....',
        ]);
        elderF(0, 0);
        elderF(1, 1);
        // NPC B – Merchant woman (brown hair, orange vest)
        const merchantF = (fi, legV) => paint((fi + 2) * FW, [
            '...HHhHH....', '..HHHHHHHH..', '..HSSSSSH...', '.HHSKcSKcHH.', '..HSSSSSH...', '..HcSSScH...',
            '...OOOOOO...', '..OoOOOoO...', '..OOOOOOO...', '..OoOOOoO...', '..oOOOOOo...', '..PPPPPPPP..',
            '..PPPPPPPP..', '..PpPPPPpP..',
            legV ? '..TT..TT....' : '.TT...TTT...', legV ? '..Xt..Xt....' : '..t....t....',
        ]);
        merchantF(0, 0);
        merchantF(1, 1);
        // NPC C – Adventurer (orange hair, traveler gear)
        const adventF = (fi, legV) => paint((fi + 4) * FW, [
            '...AAAaAA...', '..AAAAAAAA..', '..ASSSSSSA..', '..ASKcSKcA..', '..ASSSSSSA..', '..AcSSScA...',
            '...QQQQQQ...', '..QqQQQqQ...', '..QQQQQQQQ..', '..QqQQQqQ...', '..qQQQQQQq..', '..PPPPPPPP..',
            '..PPPPPPPP..', '..PpPPPPpP..',
            legV ? '..TT..TT....' : '.TT...TTT...', legV ? '..Xt..Xt....' : '..t....t....',
        ]);
        adventF(0, 0);
        adventF(1, 1);
        // NPC D – Child (pink ribbons)
        const childF = (fi, legV) => paint((fi + 6) * FW, [
            '..VHHhHHV...', '..VHHHHHHV..', '...HSSSSSH..', '...HSKcSKH..', '...HSSSSSH..', '...HcSSScH..',
            '...vVVVVVv..', '...WWWWWWW..', '...WwWWWwW..', '...wWWWWWw..', '...WWWWWWW..', '...PPPPPP...',
            '...PPPPPP...', '...PpPPPpP..',
            legV ? '...TT.TT....' : '..TT..TTT...', legV ? '...Xt.Xt....' : '...t...t....',
        ]);
        childF(0, 0);
        childF(1, 1);
        // NPC E – Scientist (white coat, glasses)
        const sciF = (fi, legV) => paint((fi + 8) * FW, [
            '...NNnNN....', '..NNNNNNNN..', '..NSSSSSSN..', '..NSKnSKnN..', '..NSSSSSSN..', '..NcSSScN...',
            '...WWWWWW...', '..WwWWWWwW..', '..WWWWWWWW..', '..WwWWWWwW..', '..wWWWWWWw..', '..PPPPPPPP..',
            '..PPPPPPPP..', '..PpPPPPpP..',
            legV ? '..TT..TT....' : '.TT...TTT...', legV ? '..Xt..Xt....' : '..t....t....',
        ]);
        sciF(0, 0);
        sciF(1, 1);
        const tex = this.textures.get('npc');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * FW, 0, FW, FH);
        ct.refresh();
    }
    // ── Enemy sprites – 16×20 × 8 frames ─────────────────────────────────────
    // [0-1]=slime, [2-3]=bat, [4-5]=golem, [6-7]=crystal wraith (boss)
    buildEnemySprite() {
        const EW = 16, EH = 20, N = 8;
        const ct = this.textures.createCanvas('enemy', EW * N, EH);
        const ctx = ct.context;
        const pal = {
            '.': null,
            // Slime
            G: '#22CC44', g: '#18A030', L: '#55EE66', l: '#80FF90',
            k: '#002200', w: '#EEFFEE',
            // Bat
            V: '#3A1840', v: '#5A2860', X: '#6A3870', x: '#8A5090',
            r: '#FF2222', e: '#FF8888',
            // Golem
            O: '#887766', o: '#5C5045', A: '#AAA088', a: '#CCBBA0',
            F: '#FF5500', f: '#FF9944',
            C: '#2A1810',
            // Crystal Wraith
            U: '#4488CC', u: '#88AAEE',
            Z: '#AACCFF', z: '#2244AA',
            Q: '#FFCCFF', q: '#DD99FF',
            W: '#FFFFFF',
            Y: '#FF44AA',
        };
        const paint = (ox, oy, rows) => this.painter(ctx, pal, ox, oy, rows);
        // ── Slime (frames 0-1) ──────────────────────────────────────────────
        const slime = (fi, bounce) => {
            const ox = fi * EW;
            const bodyH = 10 + bounce;
            const bodyY = 8 - bounce;
            const bodyW = 12 + (bounce > 1 ? 1 : 0);
            const bx = Math.floor((EW - bodyW) / 2);
            // Shadow
            ctx.fillStyle = '#001100';
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.ellipse(ox + 8, 19, 5, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            // Body
            for (let row = 0; row < bodyH; row++) {
                const t = row / bodyH;
                const edge = Math.round(Math.sin(Math.PI * t) * 1.5);
                const lw = bodyW - edge * 2;
                const lx = bx + edge;
                const col = row < 2 ? pal['L'] : row < bodyH - 2 ? pal['G'] : pal['g'];
                ctx.fillStyle = col;
                ctx.fillRect(ox + lx, bodyY + row, lw, 1);
            }
            // Highlight
            ctx.fillStyle = pal['l'];
            ctx.fillRect(ox + bx + 1, bodyY + 1, 3, 1);
            ctx.fillRect(ox + bx + 1, bodyY + 2, 2, 1);
            // Eyes
            ctx.fillStyle = pal['k'];
            ctx.fillRect(ox + 4, bodyY + 3, 2, 2);
            ctx.fillRect(ox + 9, bodyY + 3, 2, 2);
            ctx.fillStyle = pal['w'];
            ctx.fillRect(ox + 4, bodyY + 3, 1, 1);
            ctx.fillRect(ox + 9, bodyY + 3, 1, 1);
            // Smile
            ctx.fillStyle = pal['k'];
            ctx.fillRect(ox + 5, bodyY + 6, 1, 1);
            ctx.fillRect(ox + 6, bodyY + 7, 3, 1);
            ctx.fillRect(ox + 9, bodyY + 6, 1, 1);
        };
        slime(0, 0);
        slime(1, 2);
        // ── Bat (frames 2-3) ────────────────────────────────────────────────
        const bat = (fi, wingsUp) => {
            const ox = fi * EW;
            const wyO = wingsUp ? 3 : 7;
            // Wings
            paint(ox, wyO, [
                'vv..........vvvv', 'Vvv.........vVVV', 'VVvv.......vvVVV',
                'VVVVv.....vVVVVV', 'XVVVVv...vVVVVXX',
            ]);
            // Body
            paint(ox, 7, [
                '.....vVVVVVv.....', '....VXXXXXXVv....', '...VXXXXXXXXVv...',
                '....VXXXXXXVv....', '....vVVVVVVv.....', '....VVVVVVVV.....',
                '.....VVVVVV......', '....VVVVVVVV.....',
            ]);
            // Head + ears
            paint(ox, 3, [
                '....vVVv..vVVv..', '....VVVv..VVVv..', '....vVvvvVVv....',
                '.....VVVVVV.....', '......VVVVVv....',
            ]);
            // Eyes
            ctx.fillStyle = pal['r'];
            ctx.fillRect(ox + 6, 9, 2, 1);
            ctx.fillRect(ox + 9, 9, 2, 1);
            ctx.fillStyle = pal['e'];
            ctx.fillRect(ox + 6, 9, 1, 1);
            ctx.fillRect(ox + 9, 9, 1, 1);
            // Fangs
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(ox + 7, 13, 1, 1);
            ctx.fillRect(ox + 9, 13, 1, 1);
        };
        bat(2, true);
        bat(3, false);
        // ── Golem (frames 4-5) ──────────────────────────────────────────────
        const golem = (fi, armUp) => {
            const ox = fi * EW;
            paint(ox, 4, [
                '...oOOOOOOOoo...', '..oOAAOOOOAAOo..', '..oOAAOOOOAAOo..',
                '..oOOOOOOOOOOo..', '..oOOOOOOOOOOo..', '..oOAOOCCCCOAOo.',
                '.oOOOOCCCCCCOOOo', '.oOOOOCCCCCCOOOo', '..oOOOOCCCCOOOo.',
                '..oOOOOOOOOOOo..', '..oOOOOOOOOOOo..', '..oOOOCOOOCOOo..',
                '...oOOCOOCOOo...', '...oOOOOOOOo....', '....oOOOOOo.....',
                '.....oooooo.....',
            ]);
            if (armUp) {
                paint(ox, 1, ['...OOo......OOo.', '..OOOo......OOO.', '.oOOOo......OOo.', '.oOOO........oo.', '.oOO............']);
            }
            else {
                paint(ox, 8, ['...OOo......OOo.', '..OOOo......OOO.', '.oOOOo......OOo.', '.oOOO........oo.', '.oOO............']);
            }
            ctx.fillStyle = pal['F'];
            ctx.fillRect(ox + 4, 7, 2, 2);
            ctx.fillRect(ox + 10, 7, 2, 2);
            ctx.fillStyle = pal['f'];
            ctx.fillRect(ox + 4, 7, 1, 1);
            ctx.fillRect(ox + 10, 7, 1, 1);
            ctx.fillStyle = pal['C'];
            ctx.fillRect(ox + 5, 11, 6, 1);
            ctx.fillRect(ox + 6, 12, 1, 1);
            ctx.fillRect(ox + 8, 12, 1, 1);
        };
        golem(4, false);
        golem(5, true);
        // ── Crystal Wraith (frames 6-7) ─────────────────────────────────────
        const wraith = (fi, phase) => {
            const ox = fi * EW;
            const oy = phase === 0 ? 1 : 0; // hover animation
            // Translucent crystal body
            paint(ox, oy + 3, [
                '.....zuuuzz.....', '....zuUUUUz.....', '...zuUUUUUUz....', '...zUUUZUUUz....',
                '...zUUZZZUUz....', '..zuUZQQZUuz....', '..zuUZQQZUuz....', '...zUUZZZUUz....',
                '...zuUUUUUuz....', '...zzuUUuzz.....', '....zzzzzz......', '...zzzzzzz......',
            ]);
            // Glowing core
            ctx.fillStyle = pal['Q'];
            ctx.fillRect(ox + 7, oy + 9, 2, 2);
            ctx.fillStyle = pal['W'];
            ctx.fillRect(ox + 8, oy + 9, 1, 1);
            // Ethereal eyes
            ctx.fillStyle = pal['Y'];
            ctx.fillRect(ox + 5, oy + 6, 2, 1);
            ctx.fillRect(ox + 9, oy + 6, 2, 1);
            // Trailing particles
            if (phase === 1) {
                ctx.fillStyle = pal['Z'];
                ctx.fillRect(ox + 3, oy + 14, 1, 1);
                ctx.fillRect(ox + 12, oy + 15, 1, 1);
                ctx.fillRect(ox + 6, oy + 16, 1, 1);
            }
        };
        wraith(6, 0);
        wraith(7, 1);
        const tex = this.textures.get('enemy');
        for (let i = 0; i < N; i++)
            tex.add(i, 0, i * EW, 0, EW, EH);
        ct.refresh();
    }
    // ── Portrait textures (24×24) ─────────────────────────────────────────────
    buildPortraitTextures() {
        const PW = 24, PH = 24;
        const portraits = [
            ['portrait_elder', this.drawElderPortrait()],
            ['portrait_merchant', this.drawMerchantPortrait()],
            ['portrait_adventurer', this.drawAdventurerPortrait()],
            ['portrait_child', this.drawChildPortrait()],
            ['portrait_scientist', this.drawScientistPortrait()],
        ];
        portraits.forEach(([key, rows]) => {
            const ct = this.textures.createCanvas(key, PW, PH);
            const ctx = ct.context;
            rows.forEach((row, gy) => {
                row.forEach((col, gx) => {
                    if (col) {
                        ctx.fillStyle = col;
                        ctx.fillRect(gx, gy, 1, 1);
                    }
                });
            });
            ct.refresh();
        });
    }
    drawElderPortrait() {
        const _ = '';
        const W = '#E8E8EE', w = '#CCCCDD', N = '#AAAAAA'; // white hair
        const S = '#FCCFA0', c = '#D4A070'; // skin
        const K = '#140A00', b = '#33AADD'; // eye/blue
        const R = '#884444'; // robe
        const r = '#662222';
        const G = '#557755'; // background
        return [
            [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
            [G, G, G, G, G, G, W, W, W, W, W, W, W, W, W, W, G, G, G, G, G, G, G, G],
            [G, G, G, G, G, W, W, N, N, N, N, N, N, N, N, W, W, G, G, G, G, G, G, G],
            [G, G, G, G, W, N, N, S, S, S, S, S, S, S, S, N, N, W, G, G, G, G, G, G],
            [G, G, G, G, W, N, S, S, S, S, S, S, S, S, S, S, N, W, G, G, G, G, G, G],
            [G, G, G, G, W, N, S, K, b, S, S, K, b, S, S, S, N, W, G, G, G, G, G, G],
            [G, G, G, G, W, N, S, S, S, S, S, S, S, S, S, S, N, W, G, G, G, G, G, G],
            [G, G, G, G, W, N, S, S, S, S, S, S, S, S, S, S, N, W, G, G, G, G, G, G],
            [G, G, G, G, G, W, c, S, S, S, S, S, S, S, S, c, W, G, G, G, G, G, G, G],
            [G, G, G, G, G, W, W, w, W, W, W, W, W, W, w, W, W, G, G, G, G, G, G, G],
            [G, G, G, G, G, G, W, W, W, W, W, W, W, W, W, G, G, G, G, G, G, G, G, G],
            [G, G, G, G, G, G, W, N, W, W, W, W, W, N, W, G, G, G, G, G, G, G, G, G],
            [G, G, G, G, G, R, R, R, R, R, R, R, R, R, R, R, R, G, G, G, G, G, G, G],
            [G, G, G, G, R, r, R, R, R, R, R, R, R, R, R, R, r, R, G, G, G, G, G, G],
            [G, G, G, G, R, R, R, R, R, R, R, R, R, R, R, R, R, R, G, G, G, G, G, G],
            [G, G, G, G, R, R, r, R, R, R, R, R, R, R, R, r, R, R, G, G, G, G, G, G],
            [G, G, G, G, R, R, R, R, R, R, R, R, R, R, R, R, R, R, G, G, G, G, G, G],
            [G, G, G, G, R, R, R, R, R, R, R, R, R, R, R, R, R, R, G, G, G, G, G, G],
            [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
            [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
            [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
            [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
            [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
            [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
        ];
        _; // satisfy TS
    }
    drawMerchantPortrait() {
        const G = '#3A5030';
        const H = '#6A3810', h = '#C87820'; // hair
        const S = '#FCCFA0', c = '#D4A070';
        const K = '#140A00', g = '#44AA55';
        const O = '#BB8800', o = '#886600'; // orange vest
        return this.simplePortrait(G, H, h, S, c, K, g, O, o);
    }
    drawAdventurerPortrait() {
        const G = '#2A3840';
        const H = '#AA3300', h = '#DD6600'; // orange-red hair
        const S = '#FCCFA0', c = '#D4A070';
        const K = '#140A00', g = '#338866';
        const O = '#775533', o = '#553311'; // brown vest
        return this.simplePortrait(G, H, h, S, c, K, g, O, o);
    }
    drawChildPortrait() {
        const G = '#2A2050';
        const H = '#6A3810', h = '#C87820';
        const S = '#FCCFA0', c = '#D4A070';
        const K = '#140A00', g = '#FF44AA';
        const O = '#CC44AA', o = '#993388';
        return this.simplePortrait(G, H, h, S, c, K, g, O, o);
    }
    drawScientistPortrait() {
        const G = '#202840';
        const H = '#AAAAAA', h = '#DDDDDD'; // white hair
        const S = '#FCCFA0', c = '#D4A070';
        const K = '#140A00', g = '#4488AA';
        const O = '#E0E8F0', o = '#C0C8D0'; // white coat
        return this.simplePortrait(G, H, h, S, c, K, g, O, o);
    }
    // Generic portrait builder
    simplePortrait(bg, H, h, S, c, K, g, O, o) {
        const _ = '';
        _;
        const out = Array.from({ length: 24 }, () => Array(24).fill(bg));
        // Hair
        for (let x = 6; x < 18; x++) {
            out[2][x] = H;
            out[3][x] = H;
        }
        for (let x = 5; x < 19; x++) {
            out[4][x] = H;
            out[5][x] = H;
        }
        out[3][5] = H;
        out[3][18] = H;
        // Face
        for (let y = 6; y < 12; y++)
            for (let x = 5; x < 19; x++)
                out[y][x] = S;
        // Eyes
        out[7][7] = K;
        out[7][8] = K;
        out[7][9] = g;
        out[7][14] = K;
        out[7][15] = K;
        out[7][16] = g;
        // Cheeks
        out[9][6] = c;
        out[9][17] = c;
        // Mouth
        out[10][9] = c;
        out[10][10] = c;
        out[10][11] = c;
        // Neck
        for (let y = 12; y < 14; y++)
            for (let x = 9; x < 15; x++)
                out[y][x] = S;
        // Clothes
        for (let y = 14; y < 24; y++)
            for (let x = 4; x < 20; x++)
                out[y][x] = O;
        for (let y = 14; y < 24; y++) {
            out[y][4] = o;
            out[y][19] = o;
        }
        // Hair sides
        out[6][5] = H;
        out[7][5] = H;
        out[8][5] = H;
        out[6][18] = H;
        out[7][18] = H;
        out[8][18] = H;
        out[5][6] = h;
        out[4][8] = h;
        out[4][14] = h;
        return out;
    }
    // ── Environment sprites ────────────────────────────────────────────────────
    buildEnvironmentSprites() {
        // Tree: 16×32 (two tile-heights)
        const TW = 16, TH = 32;
        const ctT = this.textures.createCanvas('tree', TW, TH);
        const ctxT = ctT.context;
        const palT = {
            '.': null,
            G: '#1E6020', g: '#145015', L: '#2A8030', l: '#3A9840',
            k: '#0A2010',
            B: '#5A3A18', b: '#3E2208',
        };
        const treeRows = [
            '......GGGG......', '....GGGGGGGG....', '...GLLLLLLLG....', '..GLLLGLGLLG....',
            '.GLLLLLLLLLLG...', 'GGLLLLLLLLLLLG..', 'GLLLLLLGLLLLLLG.', 'GLLLLLLLLLLLLG..',
            '.GLLLLLLLLLLG...', '..GLLLLLLLLG....', '...GLLLLLLG.....', '....GkLLLG......',
            '.....GGGGG......', '......BBB.......', '......BBb.......', '......BBB.......',
            '......bBB.......', '......BBb.......', '......BBB.......', '......bBB.......',
            '......BBb.......', '......BBB.......', '......bBB.......', '......BBb.......',
            '......BBB.......', '......bBB.......', '......BBb.......', '......BBB.......',
            '......BBBB......', '......BBBB......', '......BBBB......', '......BBBB......',
        ];
        treeRows.forEach((row, gy) => {
            for (let gx = 0; gx < row.length; gx++) {
                const col = palT[row[gx]];
                if (col) {
                    ctxT.fillStyle = col;
                    ctxT.fillRect(gx, gy, 1, 1);
                }
            }
        });
        ctT.refresh();
        // Building (house): 32×32
        const BW = 32, BH = 32;
        const ctB = this.textures.createCanvas('building', BW, BH);
        const ctxB = ctB.context;
        const palB = {
            '.': null,
            R: '#8B3A2A', r: '#6A2A1A', W: '#DDD8C8', w: '#B8B0A0',
            D: '#6A4020', d: '#4A2810', G: '#4A8840', g: '#306030',
            B: '#1040A0', b: '#0A2860', Y: '#E8D080', y: '#C8B050',
            S: '#888880', s: '#666660', T: '#704030', t: '#502010',
        };
        const buildingRows = [
            'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
            'RrrRRRRRRRRRRRRRRRRRRRRRRRRRrrR',
            'RRRYYYYYYYYYYYYYYYYYYYYYYYYYRRRR',
            'RRRYRRRRRRRRRRRRRRRRRRRRRRRYRRRR',
            'RRRyRRRRRRRRRRRRRRRRRRRRRRRyRRR',
            'RRRRyRRRRRRRRRRRRRRRRRRRRRyRRRR',
            'RRRRRyyyyyyyyyyyyyyyyyyyyyrRRRRR',
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
        ];
        buildingRows.forEach((row, gy) => {
            for (let gx = 0; gx < row.length; gx++) {
                const col = palB[row[gx]];
                if (col) {
                    ctxB.fillStyle = col;
                    ctxB.fillRect(gx, gy, 1, 1);
                }
            }
        });
        ctB.refresh();
        // Gate / portal: 16×32 (glowing gate for time travel)
        const GW = 16, GH = 32;
        const ctG = this.textures.createCanvas('gate', GW, GH);
        const ctxG = ctG.context;
        const palG = {
            '.': null,
            A: '#1020A0', a: '#081060', B: '#2040C0', b: '#3060E0',
            C: '#5080FF', c: '#80A0FF', D: '#A0C0FF', d: '#C0D8FF',
            G: '#202020', g: '#101010',
        };
        const gateRows = [
            '......dddd......', '....dDDDDDDd....', '...dDCCCCCCDd...', '..dDCBBBBBBCDd..',
            '..dDCBbbbbBCDd..', '..DCBbAAAAbBCDd.', '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.',
            '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.',
            '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.',
            '..DCBbAGGAbBCDd.', '..DCBbAGGAbBCDd.', '..DCBbAAAAbBCDd.', '..dDCBbbbbBCDd..',
            '..dDCBBBBBBCDd..', '...dDCCCCCCDd...', '....dDDDDDDd....', '......dddd......',
            '......ggGG......', '......ggGG......', '......ggGG......', '......ggGG......',
            '......ggGG......', '......ggGG......', '......ggGG......', '......ggGG......',
        ];
        gateRows.forEach((row, gy) => {
            for (let gx = 0; gx < row.length; gx++) {
                const col = palG[row[gx]];
                if (col) {
                    ctxG.fillStyle = col;
                    ctxG.fillRect(gx, gy, 1, 1);
                }
            }
        });
        ctG.refresh();
        // Save point crystal: 12×16
        const SW = 12, SH = 16;
        const ctS = this.textures.createCanvas('save_crystal', SW, SH);
        const ctxS = ctS.context;
        const crystalRows = [
            '....YYYY....', '...YYYYY....', '..YYYYYYY...', '..YYYYYYY...',
            '.YYYYWWYYY..', '..YYWWYYYY..', '..YYWWYYYY..', '..YYYYWYYY..',
            '.YYYYWYYYY..', '..YYYYWYY...', '..YYYYYYYYY.', '..YYYYYYYY..',
            '...YYYYYY...', '....YYYY....', '....YYYY....', '....YYYY....',
        ];
        const palS = { '.': null, Y: '#AACCFF', W: '#FFFFFF', y: '#88AADD' };
        crystalRows.forEach((row, gy) => {
            for (let gx = 0; gx < row.length; gx++) {
                const col = palS[row[gx]];
                if (col) {
                    ctxS.fillStyle = col;
                    ctxS.fillRect(gx, gy, 1, 1);
                }
            }
        });
        ctS.refresh();
    }
    // ── UI assets ─────────────────────────────────────────────────────────────
    buildUIAssets() {
        // Menu cursor (arrow)
        const ct = this.textures.createCanvas('cursor', 8, 8);
        const ctx = ct.context;
        ctx.fillStyle = '#FFE060';
        [[0, 3, 1, 2], [1, 2, 1, 4], [2, 1, 1, 6], [3, 0, 1, 8]].forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
        ct.refresh();
        // ATB bar fill gradient
        const atb = this.textures.createCanvas('atb_fill', 48, 4);
        const actx = atb.context;
        const grad = actx.createLinearGradient(0, 0, 48, 0);
        grad.addColorStop(0, '#2060C0');
        grad.addColorStop(0.5, '#40A0FF');
        grad.addColorStop(1, '#80D0FF');
        actx.fillStyle = grad;
        actx.fillRect(0, 0, 48, 4);
        atb.refresh();
        // HP bar fill
        const hpBar = this.textures.createCanvas('hp_fill', 48, 4);
        const hctx = hpBar.context;
        const hg = hctx.createLinearGradient(0, 0, 48, 0);
        hg.addColorStop(0, '#A01020');
        hg.addColorStop(0.5, '#E04060');
        hg.addColorStop(1, '#FF8080');
        hctx.fillStyle = hg;
        hctx.fillRect(0, 0, 48, 4);
        hpBar.refresh();
    }
}
