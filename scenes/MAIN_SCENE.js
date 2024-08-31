import "../style.css";
import Phaser from "phaser";
import RainFX from '../assets/objects/weather.js';
// main.js
import { characterPositionInWorldMap, sizes, hitboxWidth, hitboxHeight, hitboxOffsetX, hitboxOffsetY, dockIndex, huthitboxX, huthitboxY, hutboxOffsetY, hutboxOffsetX } from '../config.js';
import { SCENE_KEYS } from "./scene-keys.js";
import HUT_SCENE from './HUT_SCENE.js'; // Import SceneTwo from scene-two.js
import FISHING_SCENE from './FISHING_SCENE';
let last_direction;


export default class MAIN_SCENE extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.MAIN_SCENE);
    this.hungerLevel = 100; // Initial hunger level
    this.hungerDecreaseRate = 0.01; // Rate at which hunger level decreases
    this.groundTilePositions = [];
    this.isOnBoat = false; // Add this flag in the create method
    this.bucketSize = 3;
    this.fishCaught = 0;
    this.hutAvailable = false;
    this.readNoticeBoardAvailable = false;
    this.monster = null;  // Reference to the monster
    this.dangerEffectTimer = null; // Reference to the danger effect timer
  }

  preload() {

    this.load.scenePlugin('AnimatedTiles', '/phaser-animated-tiles/src/plugin/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
  
    
  }

  create(data) {
         // If there's data passed from the fishing scene, update the number of fish caught
    if (data && data.fishCaught !== undefined) {
          this.fishCaught = data.fishCaught;
          console.log("fis data passed")
      }
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

    this.boat = this.physics.add.sprite(3300, 700, 'boat');
    this.noticeBoard = this.physics.add.sprite(3260, 162, 'noticeBoard');
    this.to_town = this.physics.add.sprite(3600, 140, 'to_town');
    this.fishermansHut = this.physics.add.sprite(characterPositionInWorldMap + 500, 190, 'fishermansHut');
    this.fishermansHut.body.setSize(huthitboxX, huthitboxY);
    this.fishermansHut.body.setOffset(hutboxOffsetX, hutboxOffsetY);
    this.fishermansHut.setImmovable(true); // Make the hut immovable
    this.noticeBoard.setImmovable(true); // Make the hut immovable
    this.to_town.setImmovable(true); // Make the hut immovable
    this.fishermansHut.body.moves = false; // Ensure the hut does not move at all
    this.boat.setOrigin(0.5, 0.5);
    
    this.boatOnBoard = this.physics.add.sprite(this.boat.x, this.boat.y, 'boatOnBoard');
    // Display the bucket size text
    this.bucketText = this.add.text(16, 16, `Caught: ${this.fishCaught} / ${this.bucketSize}`, { font: '24px Arial', fill: '#ffffff' }).setScrollFactor(0);
    // Rocking animation using tweens
    this.tweens.add({
        targets: this.boat,
        y: '+=5',
        angle: 2,
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });

    const map = this.make.tilemap({ key: 'map' });
  
    this.animatedTiles.init(map);
    this.physics.world.createDebugGraphic();

// Add the tilesets
const darkTileset = map.addTilesetImage('dark_tiles', 'dark_tiles');

// Create layers from tilemap data using different tilesets
const groundLayer = map.createLayer('Groundlayer', darkTileset, 0, 0);

const grassLayer = map.createLayer('grass_and_tree_layer', darkTileset, 0, 0);
const stoneLayer = map.createLayer('stones_n_stuff', darkTileset, 0, 0);

const waterLayer = map.createLayer('waterlayer', darkTileset, 0, 0); // waterlayer initialized last.

const fisharea2 = map.createLayer('fisharea2', darkTileset, 0, 0); 
const fisharea3 = map.createLayer('fisharea3', darkTileset, 0, 0); 
const fisharea4 = map.createLayer('fisharea4', darkTileset, 0, 0); 


    // Create hunger level progress bar
    this.hungerBox = this.add.graphics();
    this.hungerBox.fillStyle(0x222222, 0.8);
    this.hungerBox.fillRect(600, 20, 200, 30); // Adjust position and size as needed

    this.hungerBar = this.add.graphics();
    this.updateHungerBar();
    // Add and play the light-rain audio

    if (!this.game.lightRainSound) {
      //play the main tune
      this.game.lightRainSound = this.sound.add('light-rain', {
          loop: true, // Loop the audio
          volume: 0.8 // Set the volume level
      });
      this.game.lightRainSound.play();
  }

    if (!this.game.maintune) {
      //play the main tune
      this.game.maintune = this.sound.add('main_tune', {
          loop: true, // Loop the audio
          volume: 0.5 // Set the volume level
      });
      this.game.maintune.play();
  }
    // Add hunger level text inside the progress bar
    this.hungerText = this.add.text(700, 35, 'Village hunger level', {
      font: '18px monospace',
      fill: '#ffffff'
    });
    this.hungerText.setOrigin(0.5, 0.5);
    this.hungerBox.setDepth(1000);
    this.bucketText.setDepth(1000)
    this.hungerBar.setDepth(1001);
    this.hungerText.setDepth(1002);
    this.protagonist.setDepth(4);
    this.to_town.setDepth(3);
    this.noticeBoard.setDepth(3);
    this.fishermansHut.setDepth(3);
    this.boat.setDepth(4);
    this.boatOnBoard.setDepth(4);
    // Adjust the depth of layers as needed
    groundLayer.setDepth(1);
    waterLayer.setDepth(0);
    grassLayer.setDepth(1);
    stoneLayer.setDepth(2);

// Assuming groundLayer is already created and added

    this.anims.create({
      key: 'monster_move_street',
      frames: this.anims.generateFrameNumbers('monster', { start: 3, end: 4 }),
      frameRate: 10,
      repeat: -1 // Loop indefinitely
  });

  this.anims.create({
      key: 'monster_move_water',
      frames: this.anims.generateFrameNumbers('monster', { start: 0, end: 1 }), // Assuming frames 2 and 3 are for water animation
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

  // Create animations for boatOnBoard

        // Up animation
        this.anims.create({
          key: 'boatUp',
          frames: this.anims.generateFrameNumbers('boatOnBoard', { start: 6, end: 8 }),
          frameRate: 10,
          repeat: -1
      });
      // idle up
      this.anims.create({
        key: 'idle-up',
        frames: this.anims.generateFrameNumbers('boatOnBoard', { frames: [6] }), // Adjust the frame numbers as needed
        frameRate: 5,
        repeat: -1
      });

      // Right animation
      this.anims.create({
          key: 'boatRight',
          frames: this.anims.generateFrameNumbers('boatOnBoard', { start: 3, end: 5 }),
          frameRate: 10,
          repeat: -1
      });
          // idle right
          this.anims.create({
            key: 'idle-up',
            frames: this.anims.generateFrameNumbers('boatOnBoard', { frames: [6] }), // Adjust the frame numbers as needed
            frameRate: 5,
            repeat: -1
          });
      

      // Down animation
      this.anims.create({
          key: 'boatDown',
          frames: this.anims.generateFrameNumbers('boatOnBoard', { start: 0, end: 2 }),
          frameRate: 10,
          repeat: -1
      });
          // idle down
          this.anims.create({
            key: 'idle-up',
            frames: this.anims.generateFrameNumbers('boatOnBoard', { frames: [0] }), // Adjust the frame numbers as needed
            frameRate: 5,
            repeat: -1
          });

      // Left animation
      this.anims.create({
          key: 'boatLeft',
          frames: this.anims.generateFrameNumbers('boatOnBoard', { start: 9, end: 11 }),
          frameRate: 10,
          repeat: -1
      });
          // idle left
          this.anims.create({
            key: 'idle-left',
            frames: this.anims.generateFrameNumbers('boatOnBoard', { frames: [9] }), // Adjust the frame numbers as needed
            frameRate: 5,
            repeat: -1
          });
      // Play the idle animation by default (assuming initial direction is down)
      this.boatOnBoard.play('boatDown');


    // Set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
   
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
 

 // Enable debug rendering for the tilemap layer representing water
waterLayer.renderDebug = true;

// Add collision callback with console logging

 
 
 this.groundLayer = groundLayer;
 this.waterLayer = waterLayer;
 this.grassLayer = grassLayer;
 this.stoneLayer = stoneLayer;
 this.fisharea2 = fisharea2
 this.fisharea3 = fisharea3
 this.fisharea4 = fisharea4


// Set up collision detection for water layer
waterLayer.setCollisionBetween(1, 10000, true); // Adjust tile indexes as needed


// Set up collision detection for grass layer
grassLayer.setCollisionBetween(1, 10000, true); // Adjust tile indexes as needed
stoneLayer.setCollisionBetween(1, 10000, true); // Adjust tile indexes as needed

this.physics.add.collider(this.boatOnBoard, this.groundLayer);
this.physics.add.collider(this.boatOnBoard, this.grassLayer);
groundLayer.setCollisionBetween(1,1000, true);

// Add colliders for the protagonist with both layers

this.physics.add.collider(this.waterLayer, this.protagonist);
this.physics.add.collider(this.protagonist, this.stoneLayer);
this.physics.add.collider(this.protagonist, this.grassLayer);
//this.physics.add.collider(this.protagonist, this.walls);
this.cameras.main.startFollow(this.protagonist);
this.enterHutText = this.add.text(this.protagonist.x, this.protagonist.y, 'Press f to enter the hut', { font: '24px Arial', fill: '#ffffff' });
this.boardBoatText = this.add.text(this.protagonist.x, this.protagonist.y, 'Press f to board the boat', { font: '24px Arial', fill: '#ffffff' });
this.disembarkText = this.add.text(this.boatOnBoard.x, this.boatOnBoard.y, 'Press f to disembark', { font: '24px Arial', fill: '#ffffff' });
this.missingboardtext = this.add.text(this.protagonist.x, this.protagonist.y, 'Press f to investigate', { font: '24px Arial', fill: '#ffffff' });

this.enterHutText.setDepth(100);
this.boardBoatText.setDepth(100);
this.disembarkText.setDepth(100);
this.missingboardtext.setDepth(100);
this.enterHutText.setVisible(false);
this.boardBoatText.setVisible(false);
this.boatOnBoard.setVisible(false); // Initially invisible
this.disembarkText.setVisible(false); // Initially invisible
this.missingboardtext.setVisible(false); // Initially invisible
console.log(this.protagonist.x + " " + this.protagonist.y)
        // Add shutdown event listener
        this.events.on('shutdown', this.shutdown, this);
  // Get ground layer tile positions
  this.groundTilePositions = this.getGroundLayerTilePositions();


  if (this.groundTilePositions && this.groundTilePositions.length > 0) {
      // Calculate shortest distance
      const shortestDistance = this.calculateShortestDistanceToGround();
      
  } 
  console.log("orginal boatonboard" + " " + this.boatOnBoard.x + " " + this.boatOnBoard.y)
     // If there's data passed from the fishing scene, update the player's position
     if (data && data.playerPosition) {
      this.boatOnBoard.setPosition(data.playerPosition.x, data.playerPosition.y);
      // Destroy protagonist and boat
              this.protagonist.setVisible(false);
              this.boat.setVisible(false);

              // Make the boatOnBoard visible and start its animation
              this.boatOnBoard.setVisible(true);
              this.isOnBoat=true;
             // Set camera to follow the new boat
             this.cameras.main.startFollow(this.boatOnBoard);

              console.log("Boarded the boat");
  }
   // Add event listener for pressing "T" to switch to fishing scene
   this.input.keyboard.on('keydown-T', () => {
    if (this.isOnBoat) {
        const playerPosition = {
            x: this.boatOnBoard.x,
            y: this.boatOnBoard.y
        };

        this.scene.start('FISHING_SCENE', { playerPosition: playerPosition, fishCaught: this.fishCaught, bucketSize: this.bucketSize });
    } else {
        console.log("Player is not on the boat.");
    }
});

    // Set camera bounds to match the game world bounds
    this.cameras.main.setBounds(0, 0);
     // Make the camera follow the player

   // Add collider between protagonist and fisherman's hut
   this.physics.add.collider(this.protagonist, this.fishermansHut, this.onProtagonistHutCollision, null, this);
   
   this.physics.add.collider(this.protagonist, this.to_town, console.log("hit"), null, this);
   this.physics.add.collider(this.protagonist, this.noticeBoard, this.onProtagonistNoticeboardCollision, null, this);

  // Periodically check for monster spawning
  this.time.addEvent({
          delay: 2000, // Check every 2 seconds
          callback: this.checkForMonsterSpawn,
          callbackScope: this,
          loop: true
      });
  }

    update() {
  //console.log(this.protagonist.x + " " + this.protagonist.y)
      dockIndex.forEach(index => {
        if(index == this.grassLayer.getTileAtWorldXY(this.protagonist.x, this.protagonist.y))
          this.waterLayer.setCollisionBetween(1, 1000, false);
    });
      
      // Reset velocity
      this.protagonist.setVelocity(0);
      this.physics.collide(this.protagonist, this.walls, () => {
        
    }, null, this);


    this.checkProtagonistDistanceToStoneLayer();
    this.checkProtagonistDistanceToTownRoad();
    if (this.groundTilePositions.length > 0 && this.isOnBoat == true) {
      // Calculate shortest distance to ground
      const shortestDistance = this.calculateShortestDistanceToGround();
  
      // Check if the boat is close to the ground layer
      if (shortestDistance <= 143) {  // Adjust the distance threshold as needed
        this.disembarkText.setVisible(true);
        this.disembarkText.setPosition(this.boatOnBoard.x, this.boatOnBoard.y - 50); // Slightly above the boat
        
  
        // Check if the player presses the "f" key
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F), 500)) {
          this.disembark();
          this.cameras.main.startFollow(this.protagonist);
        }
      } else {
        this.disembarkText.setVisible(false);
      }
    }
  


     // Decrease hunger level over time
     this.hungerLevel -= this.hungerDecreaseRate;
     if (this.hungerLevel < 0) {
         this.hungerLevel = 0; // Prevent hunger level from going below 0
     }
     this.updateHungerBar();
  
     // Call this to update the position of the hunger bar
     this.updateHungerBarPosition();

      const distanceToBoat = Phaser.Math.Distance.Between(this.protagonist.x, this.protagonist.y, this.boat.x, this.boat.y);
      
      // Update "Enter hut" text position to follow the player
      this.enterHutText.setPosition(this.protagonist.x, this.protagonist.y);
      // Check the distance between the protagonist and the fisherman's hut
    const distance = Phaser.Math.Distance.Between(this.protagonist.x, this.protagonist.y, this.fishermansHut.x, this.fishermansHut.y);
    const distanceToNoticeBoard = Phaser.Math.Distance.Between(this.protagonist.x, this.protagonist.y, this.noticeBoard.x, this.noticeBoard.y);
   
    if (distance > 250) { // Adjust the threshold as needed
      this.enterHutText.setVisible(false);
      this.hutAvailable = false;
  }
  if (distanceToNoticeBoard > 100) { // Adjust the threshold as needed
    this.missingboardtext.setVisible(false);
    this.readNoticeBoardAvailable = false;
}
  if (this.hutAvailable == true && this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F), 500)){
      // Launch Scene Two
      this.scene.start(SCENE_KEYS.HUT_SCENE, {
        playerPosition: this.playerPosition,
        fishCaught: this.fishCaught 
      });
      this.shutdown(); // Manually call the shutdown method
      }
      
      if (this.readNoticeBoardAvailable == true && this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F), 500)) { // Adjust the threshold as needed
                // Launch missing scene
                this.scene.start(SCENE_KEYS.MISSING_SCENE, {
                  playerPosition: this.playerPosition,
                  fishCaught: this.fishCaught 
                });
                this.shutdown(); // Manually call the shutdown method
                }
// Update "Board the boat" text position to follow the player
this.boardBoatText.setPosition(this.protagonist.x, this.protagonist.y - 30); // Slightly above the protagonist

// Display "Board the boat" text if the player is close to the boat
if (distanceToBoat <= 200 && this.isOnBoat == false) {
    this.boardBoatText.setVisible(true);
    // Check if the player presses the "f" key
  if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F), 500)) {
              // Destroy protagonist and boat
              this.protagonist.setVisible(false);
              this.boat.setVisible(false);

              // Make the boatOnBoard visible and start its animation
              this.boatOnBoard.setVisible(true);
              this.isOnBoat=true;
             // Set camera to follow the new boat
             this.cameras.main.startFollow(this.boatOnBoard);

              console.log("Boarded the boat");
      }
} else {
    this.boardBoatText.setVisible(false);
}



// Calculate the distance to the nearest ground tile
const groundTiles = this.groundLayer.getTilesWithinWorldXY(this.boatOnBoard.x, this.boatOnBoard.y - 50, 64, 64);
let closestDistance = Infinity;
groundTiles.forEach(tile => {
    const distance = Phaser.Math.Distance.Between(this.boatOnBoard.x, this.boatOnBoard.y, tile.getCenterX(), tile.getCenterY());
    if (distance < closestDistance) {
        closestDistance = distance;
    }
});


if(this.isOnBoat==false){
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
  } else {
    this.protagonist.setVelocity(0);
  }
  

if (this.boatOnBoard.visible) {
  // Handle input and play corresponding animations

  if (this.cursors.up.isDown) {
      this.boatOnBoard.setVelocityY(-100);
      this.boatOnBoard.setVelocityX(0); // Ensure only vertical movement
      this.boatOnBoard.play('boatUp', true);
  } else if (this.cursors.right.isDown) {
      this.boatOnBoard.setVelocityX(100);
      this.boatOnBoard.setVelocityY(0); // Ensure only horizontal movement
      this.boatOnBoard.play('boatRight', true);
  } else if (this.cursors.down.isDown) {
      this.boatOnBoard.setVelocityY(100);
      this.boatOnBoard.setVelocityX(0); // Ensure only vertical movement
      this.boatOnBoard.play('boatDown', true);
  } else if (this.cursors.left.isDown) {
      this.boatOnBoard.setVelocityX(-100);
      this.boatOnBoard.setVelocityY(0); // Ensure only horizontal movement
      this.boatOnBoard.play('boatLeft', true);
  } else {
      // Stop the boat and show the idle frame
      this.boatOnBoard.setVelocity(0, 0);

      // Ensure idle animation based on the last direction
      if (this.boatOnBoard.anims.currentAnim.key === 'boatUp') {
          this.boatOnBoard.setFrame(6);
      } else if (this.boatOnBoard.anims.currentAnim.key === 'boatRight') {
          this.boatOnBoard.setFrame(3);
      } else if (this.boatOnBoard.anims.currentAnim.key === 'boatDown') {
          this.boatOnBoard.setFrame(0);
      } else if (this.boatOnBoard.anims.currentAnim.key === 'boatLeft') {
          this.boatOnBoard.setFrame(9);
      }
  }
}
this.logProtagonistTileIndex()

if (this.isOnBoat == true && this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T), 500)) {
  this.startFishing();
}
else{
  console.log("not on boat")
}
        // Update monster position to chase the player
    if (this.monster) {
          this.moveMonsterTowardsPlayer();
          this.checkCollision();
      }
}

logProtagonistTileIndex() {
  const tile = this.grassLayer.getTileAtWorldXY(this.protagonist.x, this.protagonist.y);
  if (tile) {
      console.log("Protagonist tile index in grasslayer:", tile.index);
      
  }
  
  
}
updateHungerBar() {
    this.hungerBar.clear();
    this.hungerBar.fillStyle(0xff0000, 1); // Red color for the bar
    this.hungerBar.fillRect(610, 25, 180 * (this.hungerLevel / 100), 20); // Adjust position and size as needed
}


  handleEnterHut() {
    const tileIndex = this.groundLayer.getTileAtWorldXY(this.protagonist.x, this.protagonist.y, true).index;
    console.log(tileIndex)
    
};
createHungerBar() {
    this.hungerBox = this.add.graphics();
    this.hungerBox.fillStyle(0x222222, 0.8);
    this.hungerBox.fillRect(0, 0, 200, 30); // Position will be updated dynamically

    this.hungerBar = this.add.graphics();
    this.updateHungerBar();

    this.hungerText = this.add.text(100, 15, 'Village hunger level', {
      font: '18px monospace',
      fill: '#ffffff'
    });
    this.hungerText.setOrigin(0.5, 0.5);

    this.hungerBox.setDepth(1000);
    this.hungerBar.setDepth(1001);
    this.hungerText.setDepth(1002);
}
updateHungerBar() {
    this.hungerBar.clear();
    this.hungerBar.fillStyle(0xff0000, 1);
    this.hungerBar.fillRect(10, 5, 180 * (this.hungerLevel / 100), 20); // Position relative to hungerBox
}
shutdown() {
  if (this.lightRainSound) {
      this.lightRainSound.stop();
  }
}
updateHungerBarPosition() {
    const camera = this.cameras.main;
    const screenWidth = this.scale.width;

    // Set positions relative to the top right corner of the camera view
    this.hungerBox.setPosition(camera.scrollX + screenWidth - 220, camera.scrollY + 20);
    this.hungerBar.setPosition(camera.scrollX + screenWidth - 210, camera.scrollY + 25);
    this.hungerText.setPosition(camera.scrollX + screenWidth - 110, camera.scrollY + 35);
}
getGroundLayerTilePositions() {
  const tilePositions = [];

  // Get the bounds of the ground layer
  const layerWidth = this.groundLayer.width;
  const layerHeight = this.groundLayer.height;

  // Iterate through each tile in the ground layer
  for (let y = 0; y < layerHeight; y++) {
      for (let x = 0; x < layerWidth; x++) {
          const tile = this.groundLayer.getTileAt(x, y);
          if (tile) {
              tilePositions.push({ x: tile.getCenterX(), y: tile.getCenterY() });
          }
      }
  }

  return tilePositions;
}

calculateShortestDistanceToGround() {
  let shortestDistance = Infinity;
  const boatX = this.boatOnBoard.x;
  const boatY = this.boatOnBoard.y;

  this.groundTilePositions.forEach(tilePos => {
      const distance = Phaser.Math.Distance.Between(boatX, boatY, tilePos.x, tilePos.y);
      if (distance < shortestDistance) {
          shortestDistance = distance;
      }
  });

  return shortestDistance;
}
disembark() {
  // Find the nearest ground tile position
  let nearestGroundTile = this.groundTilePositions[0];
  let minDistance = Phaser.Math.Distance.Between(this.boatOnBoard.x, this.boatOnBoard.y, nearestGroundTile.x, nearestGroundTile.y);

  this.groundTilePositions.forEach(tile => {
    let distance = Phaser.Math.Distance.Between(this.boatOnBoard.x, this.boatOnBoard.y, tile.x, tile.y);
    if (distance < minDistance) {
      minDistance = distance;
      nearestGroundTile = tile;
    }
  });

  // Relocate the boat next to the ground tile
  this.boat.setPosition(nearestGroundTile.x + 50, nearestGroundTile.y); // Adjust the offset as needed

  // Relocate the protagonist to the ground tile
  this.protagonist.setPosition(nearestGroundTile.x, nearestGroundTile.y - 50);

  // Hide the boatOnBoard asset
  this.boatOnBoard.setVisible(false);
  this.boatOnBoard.body.enable = true; // Disable physics on boatOnBoard if necessary
  this.boat.setVisible(true);

  // Show the protagonist
  this.protagonist.setVisible(true);
  this.protagonist.body.enable = true;

  // Reset the isOnBoat flag
  this.isOnBoat = false;
  this.disembarkText.setVisible(false);
}
startFishing() {
  this.scene.start('FISHING_SCENE');
}
// Define the collision callback
onProtagonistHutCollision(protagonist, fishermansHut) {
  // Handle what happens when the protagonist collides with the fisherman's hut
  console.log('Protagonist collided with Fisherman\'s Hut');
  this.enterHutText.setVisible(true);
  this.hutAvailable = true;
}
onProtagonistNoticeboardCollision(protagonist, noticeBoard) {
  // Handle what happens when the protagonist collides with the fisherman's hut
  console.log('Protagonist collided with noticeboard');
  this.missingboardtext.setPosition(this.protagonist.x, this.protagonist.y - 50);
  this.missingboardtext.setVisible(true);
  this.readNoticeBoardAvailable = true;
}
getAllTilesWithIndex(index) {
  const tiles = [];
  this.stoneLayer.forEachTile(tile => {
      if (tile.index === index) {
          tiles.push(tile);
      }
  });
  return tiles;
}

checkProtagonistDistanceToStoneLayer() {
  const tiles = this.getAllTilesWithIndex(2273);
  let isNearStoneLayer = false;

  tiles.forEach(tile => {
      const distance = Phaser.Math.Distance.Between(this.protagonist.x, this.protagonist.y, tile.pixelX + tile.width / 2, tile.pixelY + tile.height / 2);
      if (distance < 50) {
          isNearStoneLayer = true;
          this.missingboardtext.setPosition(this.protagonist.x, this.protagonist.y - 50);
          this.missingboardtext.setVisible(true);
      } else {
          this.missingboardtext.setVisible(false);
      }
  });

  // Check for "F" key press and if the protagonist is near the stone layer
  if (isNearStoneLayer) {
      this.input.keyboard.once('keydown-F', () => {
          this.scene.start(SCENE_KEYS.MISSING_SCENE);
      });
  }
}
checkProtagonistDistanceToTownRoad(){
  const tiles = this.getAllTilesWithIndex(2287); 
  let isNearTownRoad = false;

  tiles.forEach(tile => {
      const distance = Phaser.Math.Distance.Between(this.protagonist.x, this.protagonist.y, tile.pixelX + tile.width / 2, tile.pixelY + tile.height / 2);
        if (distance < 50) {
        isNearTownRoad = true;
          //this.missingboardtext.setPosition(this.protagonist.x, this.protagonist.y - 50);
          //this.missingboardtext.setVisible(true);
      } else {
          //this.missingboardtext.setVisible(false);
      }
  });

  // Check for "F" key press and if the protagonist is near the stone layer
  if (isNearTownRoad) {
      this.input.keyboard.once('keydown-F', () => {
          this.scene.start(SCENE_KEYS.FORESTY_ROAD);
      });
  }
}
/*----------------------MONSTER SECTION START----------------------------*/
checkForMonsterSpawn() {
  if (this.monster) {
      return;  // Don't spawn a new monster if one is already present
  }

  const spawnProbability = 0.2; // 20% chance to start spawning a monster
  if (Math.random() < spawnProbability) {
      this.startDangerEffect();
  }
}
startDangerEffect() {
  // Keep flashing the screen until the monster is spawned
  if (!this.dangerEffectTimer) {
      this.dangerEffectTimer = this.time.addEvent({
          delay: 500, // Flash every 500 milliseconds
          callback: this.flashScreen,
          callbackScope: this,
          loop: true
      });
  }

  // Delay the monster spawn to allow the flash effect to be noticeable
  this.time.delayedCall(2000, this.spawnMonster, [], this); // 2 seconds delay before spawning
}
flashScreen() {
  this.cameras.main.flash(250, 255, 0, 0); // Flash duration 250ms
}

//spawn monster with flash effect

spawnMonster() {
  if (!this.monster) {
      // Spawn a monster at a random position
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const y = Phaser.Math.Between(50, this.scale.height - 50);
      this.monster = this.physics.add.sprite(x, y, 'monster');
      this.monster.setDepth(4);

      // Stop the flashing effect
      if (this.dangerEffectTimer) {
          this.dangerEffectTimer.remove(false);
          this.dangerEffectTimer = null;
      }
  }
}

moveMonsterTowardsPlayer() {
  const monsterSpeed = 100;

  this.physics.moveToObject(this.monster, this.protagonist, monsterSpeed);
}


checkCollision() {
  const distance = Phaser.Math.Distance.Between(
      this.protagonist.x, this.protagonist.y, 
      this.monster.x, this.monster.y
  );

  //if (distance < (this.box.width / 2 + this.monster.width / 2)) {
    //  this.changeScene();
  //}
}


/*----------------------MONSTER SECTION END----------------------------*/ 

}