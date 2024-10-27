import Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys.js';
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.PRELOAD_SCENE);
    }

    preload() {
        // Add progress box and progress bar
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);
        
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });
        
        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
        });
        
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });

   // Load spritesheet for the protagonist
   this.load.spritesheet('protagonist', '../assets/mainCH2.png', { frameWidth: 100, frameHeight: 100 });
   this.load.spritesheet('monster', '../assets/waterspirit.png', { frameWidth: 150, frameHeight: 150 });
   this.load.spritesheet('boat', '../assets/boat.png', { frameWidth: 200, frameHeight: 200 });
   this.load.spritesheet('boatOnBoard', '../assets/boatOnBoard.png', { frameWidth: 248, frameHeight: 250 });
   this.load.spritesheet('fishermansHut', '../assets/Hut.png', { frameWidth: 429, frameHeight: 398 });

   this.load.spritesheet('noticeBoard', '../assets/noticeboard.png', { frameWidth: 200, frameHeight: 200 });
   this.load.spritesheet('to_town', '../assets/to_town.png', { frameWidth: 120, frameHeight: 120 });

   this.load.spritesheet('fishermansHut', '../assets/Hut.png', { frameWidth: 429, frameHeight: 398 });
   this.load.image('hook', '../assets/hook2.png');
   this.load.image('pike', '../assets/pike_game.png');
   this.load.image('roach', '../assets/roach_game.png');
   this.load.image('zander', '../assets/roach_game.png');
   this.load.image('perch', '../assets/roach_game.png');
   this.load.image('fish', '../assets/fish.png');
   this.load.image('underwater_bg', '/assets/underwater_bg.png');
   this.load.image('missing_scene_bg', '/assets/b_n_white_fisherman_bg.png');
   this.load.image('serene_village', '/assets/serene_village.png');
   this.load.image('fishing_village_deserted', '/assets/fishing_village_deserted.png');
   this.load.image('families_leaving', '/assets/families_leaving.png');
   this.load.image('eero', '/assets/eero.png');
  
   this.load.audio('light-rain', '../assets/sade.mp3');
   this.load.audio('main_tune', '../assets/test.wav');
   this.load.audio('rain-inside', '../assets/rain-inside.mp3');
   this.load.audio('catch', '../assets/score_sound.wav');
   
 
   // Load tileset and tilemap
   this.load.tilemapTiledJSON('map', '/assets/maps/worldmap.json');

   
   
   this.load.image('spruce', '/assets/spruce.png', { frameWidth: 150, frameHeight: 150 });
   this.load.scenePlugin('AnimatedTiles', '/phaser-animated-tiles/src/plugin/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
   this.load.image('dark_tiles', 'assets/maps/terrain_dark.png');
   this.load.tilemapTiledJSON('map_inside', '/assets/maps/hut_inside.json');
   this.load.image('inside_tiles', '/assets/hut_inside.png'); // Change the key to 'inside_tiles'
   this.load.tilemapTiledJSON('map_forest_road', '/assets/maps/FORESTY_ROAD.json');
   this.load.image('FORESTY_ROAD', '/assets/foresty_road.png'); 
    }

  create() {
    var logo = this.add.image(400, 300, 'logo');
    this.scene.start(SCENE_KEYS.INTRO_SCENE);
  }

  update() {
      // Your update logic...
  }
}