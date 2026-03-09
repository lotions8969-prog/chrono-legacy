// ── State Machine ─────────────────────────────────────────────────────────────
// Generic, zero-dependency state machine.
// Usage:
//   const sm = new StateMachine();
//   sm.add('idle', { onEnter, onUpdate, onExit }).add('walk', { ... });
//   sm.set('idle');
//   sm.update(delta); // call every frame
export class StateMachine {
    constructor() {
        this.map = new Map();
        this._current = null;
        this._previous = null;
        this.transitioning = false;
    }
    /** Register a state. Returns `this` for chaining. */
    add(key, callbacks) {
        this.map.set(key, callbacks);
        return this;
    }
    /**
     * Transition to `key`.
     * No-op if already in that state or a transition is in progress.
     */
    set(key) {
        if (this.transitioning || this._current === key)
            return;
        if (!this.map.has(key)) {
            console.warn(`[StateMachine] Unknown state: "${key}"`);
            return;
        }
        this.transitioning = true;
        if (this._current)
            this.map.get(this._current)?.onExit?.();
        this._previous = this._current;
        this._current = key;
        this.map.get(key).onEnter?.();
        this.transitioning = false;
    }
    /** Call every frame with the delta time (ms). */
    update(dt) {
        if (this._current)
            this.map.get(this._current)?.onUpdate?.(dt);
    }
    get current() { return this._current; }
    get previous() { return this._previous; }
    is(key) { return this._current === key; }
}
