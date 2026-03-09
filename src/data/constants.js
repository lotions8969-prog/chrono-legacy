// ── Canvas / Rendering ────────────────────────────────────────────────────────
export const CANVAS = {
    WIDTH: 256,
    HEIGHT: 224,
    SCALE: 3,
};
// ── Tile ──────────────────────────────────────────────────────────────────────
export const TILE = {
    SIZE: 16,
};
// ── Player Physics ────────────────────────────────────────────────────────────
// All values in pixels / second (or pixels / second²)
export const PHYSICS = {
    MAX_WALK_SPEED: 80,
    MAX_RUN_SPEED: 145,
    ACCELERATION: 560, // how fast we reach top speed
    FRICTION: 720, // how fast we stop
};
// ── Scene keys ────────────────────────────────────────────────────────────────
export const SCENE = {
    BOOT: 'Boot',
    PRELOADER: 'Preloader',
    TITLE: 'Title',
    WORLD: 'World',
};
// ── Tile indices (must match Preloader tileset order) ─────────────────────────
export const TILES = {
    GRASS: 0,
    WATER: 1,
    ROCK: 2,
    PATH: 3,
    FLOWER: 4,
};
/** Tile indices that should block the player */
export const BLOCKING_TILES = [TILES.WATER, TILES.ROCK];
