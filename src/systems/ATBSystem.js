// ── ATB (Active Time Battle) gauge system ────────────────────────────────────
// Each BattleUnit has an `atb` value (0–100).
// `spd` controls fill rate.  At spd=15, gauge fills in ~6.7 seconds.
export class ATBSystem {
    /** Update all unit gauges.
     *  Returns units whose ATB just hit 100 this frame (can act).
     */
    tick(units, dt) {
        const justReady = [];
        const sec = dt / 1000;
        for (const u of units) {
            if (u.hp <= 0)
                continue;
            if (u.waitingForInput)
                continue; // already waiting, don't over-fill
            if (u.atb >= 100)
                continue;
            u.atb += u.spd * sec; // scale: spd=15 → 100 in ~6.7 s
            if (u.atb >= 100) {
                u.atb = 100;
                justReady.push(u);
            }
        }
        return justReady;
    }
    /** Reset a unit's ATB to 0 after it acts. */
    reset(unit) {
        unit.atb = 0;
        unit.waitingForInput = false;
    }
    /** Drain MP and reset. Returns false if not enough MP. */
    consumeMp(unit, cost) {
        if (unit.mp < cost)
            return false;
        unit.mp -= cost;
        return true;
    }
}
