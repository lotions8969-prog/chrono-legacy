// ── Canvas / Rendering ────────────────────────────────────────────────────────
export const CANVAS = {
  WIDTH  : 256,
  HEIGHT : 224,
  SCALE  : 3,
} as const;

// ── Tile ──────────────────────────────────────────────────────────────────────
export const TILE = {
  SIZE: 16,
} as const;

// ── Player Physics ────────────────────────────────────────────────────────────
export const PHYSICS = {
  MAX_WALK_SPEED : 80,
  MAX_RUN_SPEED  : 145,
  ACCELERATION   : 560,
  FRICTION       : 720,
} as const;

// ── Scene keys ────────────────────────────────────────────────────────────────
export const SCENE = {
  BOOT      : 'Boot',
  PRELOADER : 'Preloader',
  TITLE     : 'Title',
  WORLD     : 'World',
} as const;

// ── Tile indices ──────────────────────────────────────────────────────────────
export const TILES = {
  GRASS     : 0,
  WATER     : 1,
  ROCK      : 2,
  PATH      : 3,
  FLOWER    : 4,
  SAND      : 5,
  DARK_GRASS: 6,
  BRIDGE    : 7,
  WOOD_FLOOR  : 8,
  COBBLESTONE : 9,
} as const;

/** Tile indices that block the player */
export const BLOCKING_TILES = [TILES.WATER, TILES.ROCK];

// ── Dialogue / Story ──────────────────────────────────────────────────────────
export const DIALOGUE_INTERACT_KEY = 'Z';
