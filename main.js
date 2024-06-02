import "./style.css";
import Phaser from "phaser";
import RainFX from './assets/objects/weather.js';
// main.js
import { characterPositionInWorldMap, sizes, hitboxWidth, hitboxHeight, hitboxOffsetX, hitboxOffsetY, collidableTileIndexes, dockIndex } from './config.js';
import SceneTwo from './scene-two.js'; // Import SceneTwo from scene-two.js

let last_direction;
let spirit_terrain;


class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
  }

  preload() {
    // Load spritesheet for the protagonist
    this.load.spritesheet('protagonist', '/assets/mainCH2.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('enemy', '/assets/waterspirit.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('boat', '/assets/boat.png', { frameWidth: 200, frameHeight: 200 });
   
   
   
    
  
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
    this.boat = this.physics.add.sprite(3300, 700, 'boat');
 

    // Set up properties for the water spirit
    this.enemy.speed = 100; // Adjust the speed as needed
  
   
    this.enemy.setDepth(1);
    const map = this.make.tilemap({ key: 'map' });
  
    this.animatedTiles.init(map);
    this.physics.world.createDebugGraphic();

// Add the tilesets
const darkTileset = map.addTilesetImage('dark_tiles', 'dark_tiles');

// Create layers from tilemap data using different tilesets
const groundLayer = map.createLayer('Groundlayer', darkTileset, 0, 0);

const grassLayer = map.createLayer('grass_and_tree_layer', darkTileset, 0, 0);
const stoneLayer = map.createLayer('stones_n_stuff', darkTileset, 0, 0);

// Create hut layer using the hut tileset
const hutLayer = map.createLayer('hutLayer', darkTileset, 0, 0);
const transportlayer = map.createLayer('transportlayer', darkTileset, 0, 0);

const walls = map.createLayer('walls', darkTileset, 0, 0);
const waterLayer = map.createLayer('waterlayer', darkTileset, 0, 0); // waterlayer initialized last.
this.protagonist.setDepth(4);
this.boat.setDepth(4);
    // Adjust the depth of layers as needed
    groundLayer.setDepth(1);
    waterLayer.setDepth(0);
    grassLayer.setDepth(1);
    stoneLayer.setDepth(2);
    hutLayer.setDepth(30);
    walls.setDepth(2);
    transportlayer.setDepth(2);
   
// Enable collision for the specified tile indexes
// Set collision for specified tile indexes in the waterLayer




    this.anims.create({
      key: 'enemy_move_street',
      frames: this.anims.generateFrameNumbers('enemy', { start: 3, end: 4 }),
      frameRate: 10,
      repeat: -1 // Loop indefinitely
  });

  this.anims.create({
      key: 'enemy_move_water',
      frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 1 }), // Assuming frames 2 and 3 are for water animation
      frameRate: 10,
      repeat: -1 // Loop indefinitely
  });
    // Define animations
    //up
    this.anims.create({
      key: 'move-up',
      frames: this.anims.generateFrameNumbers('protagonist', { start: 1, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
     //idle up
    this.anims.create({
      key: 'idle-up',
      frames: this.anims.generateFrameNumbers('protagonist', { frames: [0] }), // Adjust the frame numbers as needed
      frameRate: 5,
      repeat: -1
    });
     //down
    this.anims.create({
      key: 'move-down',
      frames: this.anims.generateFrameNumbers('protagonist', { start: 28, end: 37 }),
      frameRate: 10,
      repeat: -1
    });
      //idle down
    this.anims.create({
      key: 'idle-down',
      frames: this.anims.generateFrameNumbers('protagonist', { frames: [27] }), // Adjust the frame numbers as needed
      frameRate: 5,
      repeat: -1
    });
    //left
    this.anims.create({
      key: 'move-left',
      frames: this.anims.generateFrameNumbers('protagonist', { start: 18, end: 26 }),
      frameRate: 10,
      repeat: -1
    });
    //idle left
    this.anims.create({
      key: 'idle-left',
      frames: this.anims.generateFrameNumbers('protagonist', { frames: [18] }), // Adjust the frame numbers as needed
      frameRate: 5,
      repeat: -1
    });
    //right
    this.anims.create({
      key: 'move-right',
      frames: this.anims.generateFrameNumbers('protagonist', { start: 10, end: 17 }),
      frameRate: 10,
      repeat: -1
    });
    //idle right
    this.anims.create({
      key: 'idle-right',
      frames: this.anims.generateFrameNumbers('protagonist', { frames: [9] }), // Adjust the frame numbers as needed
      frameRate: 5,
      repeat: -1
    });
   
    // Set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
   
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
 

 // Enable debug rendering for the tilemap layer representing water
waterLayer.renderDebug = true;

// Add collision callback with console logging

 
 // Play the appropriate animation based on the collision result
 if (spirit_terrain == "street") {
     this.enemy.play('enemy_move_street');
     //console.log("spirit on street");
  
 } else {
     this.enemy.play('enemy_move_water');
     //console.log("spirit on water");
 }
 
 this.groundLayer = groundLayer;
 this.waterLayer = waterLayer;
 this.grassLayer = grassLayer;
 this.stoneLayer = stoneLayer;
 this.hutLayer = hutLayer;
 this.walls = walls;
 this.transportlayer = transportlayer;


 collidableTileIndexes.forEach(index => {
  map.setCollision(index, true, this.walls);
});
// Set up collision detection for water layer
waterLayer.setCollisionBetween(1, 1000, true); // Adjust tile indexes as needed

// Set up collision detection for walls layer
walls.setCollisionBetween(1, 1000, true); // Adjust tile indexes as needed



// Add colliders for the protagonist with both layers

this.physics.add.collider(this.waterLayer, this.protagonist);
this.physics.add.collider(this.protagonist, this.walls);
this.cameras.main.startFollow(this.protagonist);
this.enterHutText = this.add.text(this.protagonist.x, this.protagonist.y, 'Press f to enter the hut', { font: '24px Arial', fill: '#ffffff' });
this.enterHutText.setDepth(100);

console.log(this.protagonist.x)

  }

  update() {
    dockIndex.forEach(index => {
      if(index == this.grassLayer.getTileAtWorldXY(this.protagonist.x, this.protagonist.y))
        this.waterLayer.setCollisionBetween(1, 1000, false);
  });
    
    // Reset velocity
    this.protagonist.setVelocity(0);
    this.physics.collide(this.protagonist, this.walls, () => {
      console.log("hit");
  }, null, this);
 
    //console.log(this.waterLayer.culledTiles[0])
    const tileIndex112 = this.transportlayer.findByIndex(940);
    const tileCenterX = this.transportlayer.tileToWorldX(tileIndex112.x);
    const tileCenterY = this.transportlayer.tileToWorldY(tileIndex112.y);
    const distance = Phaser.Math.Distance.Between(this.protagonist.x, this.protagonist.y, tileCenterX, tileCenterY);
    
    // Update "Enter hut" text position to follow the player
    this.enterHutText.setPosition(this.protagonist.x, this.protagonist.y);
    
    if (distance <= 150) {
      // Display "Enter hut" text if the player is close to the hut
      this.enterHutText.setVisible(true);
      
      // Check if the player presses the "f" key
      if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F), 500)) {
          // Launch Scene Two
          this.scene.start("SceneTwo", {
            "message": "Entered hut" 
          });
      }
  } else {
      // Hide "Enter hut" text if the player is not close to the hut
      this.enterHutText.setVisible(false);
  }
  


    // Handle keyboard input..
    if (this.cursors.up.isDown) {
      this.protagonist.setVelocityY(-160);
      this.protagonist.anims.play('move-up', true)
      last_direction = "up";
    } else if (this.cursors.down.isDown) {
      this.protagonist.setVelocityY(160);
      this.protagonist.anims.play('move-down', true)
      last_direction = "down";
    } else if (this.cursors.left.isDown) {
      this.protagonist.setVelocityX(-160);
      this.protagonist.anims.play('move-left', true)
      last_direction = "left";
    } else if (this.cursors.right.isDown) {
      this.protagonist.setVelocityX(160);
      this.protagonist.anims.play('move-right', true)
      last_direction = "right";
    } else {
      // If no movement keys are pressed, play the idle animation for the current direction
      if (last_direction == "up") {
        this.protagonist.anims.play('idle-up', true);
      } else if (last_direction == "down") {
        this.protagonist.anims.play('idle-down', true);
      } else if (last_direction == "left") {
        this.protagonist.anims.play('idle-left', true);
      } else if (last_direction == "right") {
        this.protagonist.anims.play('idle-right', true);
      } else {
        // If no movement keys are pressed and velocity is zero, play the default idle animation
        this.protagonist.anims.play('idle-up', true);
      }
      
    }
    this.physics.moveToObject(this.enemy, this.protagonist, this.enemy.speed);
     // Play the appropriate animation based on the collision result
 if (spirit_terrain == "street") {
  this.enemy.play('enemy_move_street', true);
  //console.log("spirit on street");

} else {
  this.enemy.play('enemy_move_water', true);
  //console.log("spirit on water", true);
  
}
this.logProtagonistTileIndex()
//this.handleEnterHut()



}

logProtagonistTileIndex() {
  const tile = this.grassLayer.getTileAtWorldXY(this.protagonist.x, this.protagonist.y);
  if (tile) {
      console.log("Protagonist tile index in grasslayer:", tile.index);
      
  }
  
}
  updateInfo() {
 
        const tileIndex = this.groundLayer.getTileAtWorldXY(this.enemy.x, this.enemy.y, true).index;
        if (tileIndex === 485 || tileIndex === 702 || tileIndex === 549 || tileIndex === 583 || tileIndex === 670 || tileIndex === 734 || tileIndex === 735) {
          spirit_terrain = "street"
        } else spirit_terrain = "water"
    
    
    };

  handleEnterHut() {
    const tileIndex = this.groundLayer.getTileAtWorldXY(this.protagonist.x, this.protagonist.y, true).index;
    console.log(tileIndex)
    
};


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