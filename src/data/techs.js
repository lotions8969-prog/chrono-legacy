export const TECHS = {
    // ── Hero (slot 0) ─────────────────────────────────────────────────────────
    SLASH: {
        key: 'SLASH', name: 'Slash',
        target: 'single_enemy', mpCost: 0, power: 1.3,
        element: 'physical', participants: 1,
        effectKey: 'slash', desc: 'Swift blade strike.',
    },
    FIRE: {
        key: 'FIRE', name: 'Fire',
        target: 'single_enemy', mpCost: 8, power: 2.0,
        element: 'fire', participants: 1,
        effectKey: 'fire', desc: 'Scorch a single foe.',
    },
    // ── Mage (slot 1) ─────────────────────────────────────────────────────────
    ICE: {
        key: 'ICE', name: 'Ice',
        target: 'all_enemies', mpCost: 10, power: 1.6,
        element: 'ice', participants: 1,
        effectKey: 'ice', desc: 'Freeze all enemies.',
    },
    LIGHTNING: {
        key: 'LIGHTNING', name: 'Lightning',
        target: 'single_enemy', mpCost: 12, power: 2.4,
        element: 'lightning', participants: 1,
        effectKey: 'lightning', desc: 'Electric bolt strike.',
    },
    HEAL: {
        key: 'HEAL', name: 'Heal',
        target: 'single_ally', mpCost: 8, power: 1.8,
        element: 'heal', participants: 1,
        effectKey: 'heal', desc: 'Restore an ally\'s HP.',
    },
    // ── Dual Techs (Phase 3) ──────────────────────────────────────────────────
    FIRE_SWORD: {
        key: 'FIRE_SWORD', name: 'Fire Sword',
        target: 'single_enemy', mpCost: 20, power: 4.0,
        element: 'fire', participants: 2,
        requires: [0, 1],
        effectKey: 'firesword', desc: '⚡ Dual Tech! Blade of inferno.',
    },
    ICE_TACKLE: {
        key: 'ICE_TACKLE', name: 'Ice Tackle',
        target: 'all_enemies', mpCost: 24, power: 3.0,
        element: 'ice', participants: 2,
        requires: [0, 1],
        effectKey: 'icetackle', desc: '⚡ Dual Tech! Frozen charge.',
    },
};
/** Techs for hero (party slot 0) */
export const HERO_TECHS = ['SLASH', 'FIRE', 'FIRE_SWORD', 'ICE_TACKLE'];
/** Techs for mage (party slot 1) */
export const MAGE_TECHS = ['ICE', 'LIGHTNING', 'HEAL', 'FIRE_SWORD', 'ICE_TACKLE'];
