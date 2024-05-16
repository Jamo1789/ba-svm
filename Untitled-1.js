import "./style.css";
import Phaser from "phaser";
import RainFX from './assets/objects/weather.js';
// main.js
import { characterPositionInWorldMap, sizes, hitboxWidth, hitboxHeight, hitboxOffsetX, hitboxOffsetY, collidableTileIndexes, waterIndex } from './config.js';
import SceneTwo from './scene-two.js'; // Import SceneTwo from scene-two.js

let last_direction;
let spirit_terrain;


class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
  }

  preload() {
    // Load spritesheet for the protagonist
    this.load.spritesheet('protagonist', '/assets/mainCH.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('enemy', '/assets/waterspirit.png', { frameWidth: 150, frameHeight: 150 });
   
   
   
    
  
    // Load tileset and tilemap
    this.load.tilemapTiledJSON('map', '/assets/maps/worldmap.json');

    
    
    this.load.image('spruce', '/assets/spruce.png', { frameWidth: 150, frameHeight: 150 });
    this.load.scenePlugin('AnimatedTiles', '/phaser-animated-tiles/src/plugin/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    this.load.image('dark_tiles', 'assets/maps/terrain_dark.png');
  }

  create() {

    //resize canvas when coming from scene-two
    const gameConfig = this.sys.game.config;
            // Create the weather effects
            this.renderer.pipelines.addPostPipeline('rainPostFX', RainFX);
            this.cameras.main.setPostPipeline(RainFX);
    

    // Resize the game canvas
    this.scale.resize(sizes.width, sizes.height);
  // Create the protagonist sprite
    this.protagonist = this.physics.add.sprite(characterPositionInWorldMap, 250, 'protagonist');
    this.protagonist.body.setCollideWorldBounds(true);

    // Set the size and offset of the hitbox

    this.protagonist.body.setSize(hitboxWidth, hitboxHeight);
    this.protagonist.body.setOffset(hitboxOffsetX, hitboxOffsetY);
    
     // Initialize the hitbox sprite for collision detection

    this.enemy = this.physics.add.sprite(200, 100, 'enemy');
 

    // Set up properties for the water spirit
    this.enemy.speed = 100; // Adjust the speed as needed
    this.protagonist.setDepth(4);
   
    this.enemy.setDepth(1);
    const map = this.make.tilemap({ key: 'map' });
  
    this.animatedTiles.init(map);
    this.physics.world.createDebugGraphic();

// Add the tilesets
const darkTileset = map.addTilesetImage('dark_tiles', 'dark_tiles');

// Create layers from tilemap data using different tilesets
const groundLayer = map.createLayer('Groundlayer', darkTileset, 0, 0);
const waterLayer = map.createLayer('waterlayer', darkTileset, 0, 0);
const grassLayer = map.createLayer('grass_and_tree_layer', darkTileset, 0, 0);
const stoneLayer = map.createLayer('stones_n_stuff', darkTileset, 0, 0);

// Create hut layer using the hut tileset
const hutLayer = map.createLayer('hutLayer', darkTileset, 0, 0);
const transportlayer = map.createLayer('transportlayer', darkTileset, 0, 0);
const walls = map.createLayer('walls', darkTileset, 0, 0);


    // Adjust the depth of layers as needed
    groundLayer.setDepth(1);
    waterLayer.setDepth(1);
    grassLayer.setDepth(1);
    stoneLayer.setDepth(2);
    hutLayer.setDepth(30);
    walls.setDepth(2);
    transportlayer.setDepth(2);
   
// Enable collision for the specified tile indexes
// Set collision for specified tile indexes in the waterLayer
waterIndex.forEach(index => {
  map.setCollision(index, true, this.waterLayer);
});

    collidableTileIndexes.forEach(index => {
      map.setCollision(index, true, this.walls);
  });


    // Define animations.....
  
   
    // Set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
   
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
 

 // Enable debug rendering for the tilemap layer representing water
waterLayer.renderDebug = true;
 
 this.groundLayer = groundLayer;
 this.waterLayer = waterLayer;
 this.grassLayer = grassLayer;
 this.stoneLayer = stoneLayer;
 this.hutLayer = hutLayer;
 this.walls = walls;
 this.transportlayer = transportlayer;


  // Listen for collision between protagonist and walls
  this.physics.add.collider(this.protagonist, this.walls, () => {
    // Disable movement controls for the protagonist
    //this.protagonist.setVelocity(0); // Stop the protagonist's movement
    console.log("wall hit")
    });
 // Set up collision detection between the protagonist and the waterLayer
 this.physics.add.collider(this.protagonist, this.waterLayer);
   // Set up camera to follow the player
   this.cameras.main.startFollow(this.protagonist);
this.enterHutText = this.add.text(this.protagonist.x, this.protagonist.y, 'Press f to enter the hut', { font: '24px Arial', fill: '#ffffff' });
this.enterHutText.setDepth(100);
this.physics.add.existing(this.protagonist);

this.physics.add.collider(this.protagonist, this.waterLayer);

  }

  update() {
    
    // Reset velocity
    this.protagonist.setVelocity(0);
    this.physics.collide(this.protagonist, this.waterIndex, () => {
      console.log("hit");
  }, null, this);
 
   //some irrelevant logic....
   


    // Handle keyboard input......



 
    this.physics.moveToObject(this.enemy, this.protagonist, this.enemy.speed);
     // Play the appropriate animation based on the collision result





}



}


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
  scene: [GameScene, SceneTwo],
};

const game = new Phaser.Game(config);