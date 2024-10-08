import "./style.css";
import sizes from './config.js';
import { SCENE_KEYS } from "./scenes/scene-keys.js";
import PreloadScene from './scenes/PRELOAD_SCENE.js';
import INTRO_SCENE from './scenes/INTRO_SCENE.js';
import MAIN_SCENE from './scenes/MAIN_SCENE.js'; 
import HUT_SCENE from './scenes/HUT_SCENE.js';
import FISHING_SCENE from './scenes/FISHING_SCENE.js'; 
import MISSING_SCENE from "./scenes/MISSING_SCENE.js";
import FORESTY_ROAD from "./scenes/FORESTROAD_SCENE.js";



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
  scene: [PreloadScene, INTRO_SCENE, MAIN_SCENE, HUT_SCENE, FISHING_SCENE, MISSING_SCENE, FORESTY_ROAD],
};

const game = new Phaser.Game(config);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE)