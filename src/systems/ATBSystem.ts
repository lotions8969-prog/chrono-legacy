// ── ATB (Active Time Battle) gauge system ────────────────────────────────────
// Each BattleUnit has an `atb` value (0–100).
// `spd` controls fill rate.  At spd=15, gauge fills in ~6.7 seconds.

export interface BattleUnit {
  id              : string;       // unique id (e.g. 'hero', 'mage', 'slime_0')
  name            : string;
  sprite          : Phaser.GameObjects.Sprite;
  hp              : number;
  maxHp           : number;
  mp              : number;
  maxMp           : number;
  atk             : number;
  def             : number;
  spd             : number;
  atb             : number;       // 0–100
  isPlayerUnit    : boolean;
  partyIndex      : number;       // 0-based slot in playerUnits array (-1 for enemies)
  techs           : string[];     // TechKey list
  waitingForInput : boolean;      // ATB full and waiting for player command
}

export class ATBSystem {
  /** Update all unit gauges.
   *  Returns units whose ATB just hit 100 this frame (can act).
   */
  tick(units: BattleUnit[], dt: number): BattleUnit[] {
    const justReady: BattleUnit[] = [];
    const sec = dt / 1000;

    for (const u of units) {
      if (u.hp <= 0) continue;
      if (u.waitingForInput) continue;   // already waiting, don't over-fill
      if (u.atb >= 100) continue;

      u.atb += u.spd * sec;              // scale: spd=15 → 100 in ~6.7 s
      if (u.atb >= 100) {
        u.atb = 100;
        justReady.push(u);
      }
    }
    return justReady;
  }

  /** Reset a unit's ATB to 0 after it acts. */
  reset(unit: BattleUnit): void {
    unit.atb             = 0;
    unit.waitingForInput = false;
  }

  /** Drain MP and reset. Returns false if not enough MP. */
  consumeMp(unit: BattleUnit, cost: number): boolean {
    if (unit.mp < cost) return false;
    unit.mp -= cost;
    return true;
  }
}
