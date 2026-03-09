// ── State Machine ─────────────────────────────────────────────────────────────
// Generic, zero-dependency state machine.
// Usage:
//   const sm = new StateMachine();
//   sm.add('idle', { onEnter, onUpdate, onExit }).add('walk', { ... });
//   sm.set('idle');
//   sm.update(delta); // call every frame

interface StateCallbacks {
  onEnter?  : ()           => void;
  onUpdate? : (dt: number) => void;
  onExit?   : ()           => void;
}

export class StateMachine {
  private readonly map   : Map<string, StateCallbacks> = new Map();
  private _current       : string | null = null;
  private _previous      : string | null = null;
  private transitioning  = false;

  /** Register a state. Returns `this` for chaining. */
  add(key: string, callbacks: StateCallbacks): this {
    this.map.set(key, callbacks);
    return this;
  }

  /**
   * Transition to `key`.
   * No-op if already in that state or a transition is in progress.
   */
  set(key: string): void {
    if (this.transitioning || this._current === key) return;
    if (!this.map.has(key)) {
      console.warn(`[StateMachine] Unknown state: "${key}"`);
      return;
    }

    this.transitioning = true;
    if (this._current) this.map.get(this._current)?.onExit?.();
    this._previous = this._current;
    this._current  = key;
    this.map.get(key)!.onEnter?.();
    this.transitioning = false;
  }

  /** Call every frame with the delta time (ms). */
  update(dt: number): void {
    if (this._current) this.map.get(this._current)?.onUpdate?.(dt);
  }

  get current()  : string | null { return this._current; }
  get previous() : string | null { return this._previous; }
  is(key: string): boolean       { return this._current === key; }
}
