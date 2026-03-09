import Phaser from 'phaser';
import { SCENE } from '../data/constants';
// ── Boot ──────────────────────────────────────────────────────────────────────
// Minimal scene: sets any global Phaser config, then hands off to Preloader.
export class Boot extends Phaser.Scene {
    constructor() { super({ key: SCENE.BOOT }); }
    create() {
        // No heavy assets loaded here; Preloader generates everything procedurally.
        this.scene.start(SCENE.PRELOADER);
    }
}
