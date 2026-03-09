import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { Title } from './scenes/Title';
import { World } from './scenes/World';
import { CANVAS } from './data/constants';
// ── Phaser game configuration ─────────────────────────────────────────────────
const config = {
    type: Phaser.AUTO,
    width: CANVAS.WIDTH,
    height: CANVAS.HEIGHT,
    // Integer zoom = pixel-perfect SFC aesthetic
    zoom: CANVAS.SCALE,
    backgroundColor: '#000000',
    roundPixels: true,
    pixelArt: true, // forces NEAREST filter on all textures
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { x: 0, y: 0 },
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [Boot, Preloader, Title, World],
};
new Phaser.Game(config);
