import "./style.css";
import sizes from './config.js';
import { SCENE_KEYS } from "./scenes/scene-keys.js";
import PreloadScene from './scenes/PRELOAD_SCENE.js';
import MAIN_SCENE from './scenes/MAIN_SCENE.js'; // Import SceneTwo from scene-two.js
import HUT_SCENE from './scenes/HUT_SCENE.js'; // Import SceneTwo from scene-two.js



const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      debug: true, // Set to true to enable debugging (displays collision bodies)
    },
  },
  scene: [PreloadScene, MAIN_SCENE, HUT_SCENE],
};

const game = new Phaser.Game(config);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE)