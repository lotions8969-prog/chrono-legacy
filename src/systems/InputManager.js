import Phaser from 'phaser';
// ── InputManager ──────────────────────────────────────────────────────────────
// Polls keyboard every frame; supports Arrow keys + WASD, Shift=run, Z=action.
export class InputManager {
    constructor(scene) {
        const kb = scene.input.keyboard;
        const K = Phaser.Input.Keyboard.KeyCodes;
        this.cursors = kb.createCursorKeys();
        this.shift = kb.addKey(K.SHIFT);
        this.z = kb.addKey(K.Z);
        this.enter = kb.addKey(K.ENTER);
        this.w = kb.addKey(K.W);
        this.a = kb.addKey(K.A);
        this.s = kb.addKey(K.S);
        this.d = kb.addKey(K.D);
    }
    /** Build a snapshot of the current input state. Call once per frame. */
    poll() {
        const { JustDown } = Phaser.Input.Keyboard;
        const left = this.cursors.left.isDown || this.a.isDown;
        const right = this.cursors.right.isDown || this.d.isDown;
        const up = this.cursors.up.isDown || this.w.isDown;
        const down = this.cursors.down.isDown || this.s.isDown;
        // Normalise diagonal so diagonal speed == cardinal speed
        let dx = (right ? 1 : 0) - (left ? 1 : 0);
        let dy = (down ? 1 : 0) - (up ? 1 : 0);
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
            dx /= len;
            dy /= len;
        }
        return {
            left, right, up, down,
            run: this.shift.isDown,
            action: JustDown(this.z),
            menu: JustDown(this.enter),
            dx, dy,
            moving: left || right || up || down,
        };
    }
}
