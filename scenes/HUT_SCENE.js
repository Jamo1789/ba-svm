import { SCENE_KEYS } from "./scene-keys";
import { characterPositionInWorldMap, sizes, hitboxWidth, hitboxHeight, hitboxOffsetX, hitboxOffsetY, dockIndex } from '../config.js';
let last_direction;
export default class HUT_SCENE extends Phaser.Scene {
    constructor() {
        super({ key: "HUT_SCENE" });
        this.bucketSize = 3; // Maximum bucket size
        this.fishCaught = 0;
    }

    // Initialize the scene with data from the previous scene
    init(data) {
        this.message = data.message;
    }

    preload() {
        // Load tileset and tilemap

        // Load player

    }

    create(data) {
        if (data && data.fishCaught !== undefined) {
          this.fishCaught = data.fishCaught;
          console.log("fis data passed")
    }
      //check monster state
        if(data.monsterExists){
          console.log("monster waiting at" + " " + data.monsterPositionX)
          
        }
            // Capture monster data if present
          this.monsterExists = data.monsterExists || false;
          this.monsterPositionX = data.monsterPositionX;
          this.monsterPositionY = data.monsterPositionY;
        const gameConfig = this.sys.game.config;
    
        // Update canvas size if needed
        gameConfig.width = 500; // Set the desired width
        gameConfig.height = 500; // Set the desired height
    
        // Resize the game canvas
        this.scale.resize(gameConfig.width, gameConfig.height);
      
        // Load the tilemap
        const map = this.make.tilemap({ key: 'map_inside' });
    
        // Create the ground layer using the tilemap and tileset
        const hutTileset = map.addTilesetImage('inside_tiles', 'inside_tiles'); // Change the key to 'inside_tiles'
        const groundLayer2 = map.createLayer('inside_ground', hutTileset, 0, 0);
        const wallsLayer = map.createLayer('walls', hutTileset, 0, 0);
                // Set collision for tile index 1
                wallsLayer.setCollision();
        // Create the protagonist sprite
        this.protagonist = this.physics.add.sprite(240, 410, 'protagonist');
        this.protagonist.body.setSize(hitboxWidth, hitboxHeight);
        this.protagonist.body.setOffset(hitboxOffsetX, hitboxOffsetY);
        this.rainInsideSound = this.sound.add('rain-inside', {
          loop: true, // Loop the audio
          volume: 1.5 // Set the volume level
      });
    
      this.rainInsideSound.play();
        // Set the depth of layers
        groundLayer2.setDepth(0);
        this.protagonist.setDepth(1);
    
  

        // Enable collision between the protagonist and the ground layer
        this.physics.add.collider(this.protagonist, groundLayer2);
        this.anims.create({
            key: 'move-up',
            frames: this.anims.generateFrameNumbers('protagonist', { start: 1, end: 2 }),
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
            frames: this.anims.generateFrameNumbers('protagonist', { start: 7, end: 8 }),
            frameRate: 10,
            repeat: -1
          });
            //idle down
          this.anims.create({
            key: 'idle-down',
            frames: this.anims.generateFrameNumbers('protagonist', { frames: [6] }), // Adjust the frame numbers as needed
            frameRate: 5,
            repeat: -1
          });
          //left
          this.anims.create({
            key: 'move-left',
            frames: this.anims.generateFrameNumbers('protagonist', { start: 10, end: 11 }),
            frameRate: 10,
            repeat: -1
          });
          //idle left
          this.anims.create({
            key: 'idle-left',
            frames: this.anims.generateFrameNumbers('protagonist', { frames: [11] }), // Adjust the frame numbers as needed
            frameRate: 5,
            repeat: -1
          });
          //right
          this.anims.create({
            key: 'move-right',
            frames: this.anims.generateFrameNumbers('protagonist', { start: 4, end: 5 }),
            frameRate: 10,
            repeat: -1
          });
          //idle right
          this.anims.create({
            key: 'idle-right',
            frames: this.anims.generateFrameNumbers('protagonist', { frames: [3] }), // Adjust the frame numbers as needed
            frameRate: 5,
            repeat: -1
          });
          //enable keyboard input
          this.cursors = this.input.keyboard.createCursorKeys();
          this.exitHutText = this.add.text(this.protagonist.x, this.protagonist.y, 'Press f to exit the hut', { font: '24px Arial', fill: '#ffffff' });
          this.exitHutText.setDepth(100);

          this.wallsLayer = wallsLayer 
                // Store a reference to the ground layer for later use if needed
        this.groundLayer2 = groundLayer2;
        this.protagonist.body.setCollideWorldBounds(true);
        
        wallsLayer.setCollisionBetween(1, 1000, true); // Adjust tile indexes as needed
        this.physics.add.collider(this.protagonist, this.wallsLayer);
        // Display the bucket size text
    this.bucketText = this.add.text(16, 16, `Caught: ${this.fishCaught} / ${this.bucketSize}`, { font: '24px Arial', fill: '#ffffff' }).setScrollFactor(0);
    }
    

    update() {
        this.protagonist.setVelocity(0);
        //determine the text diplsay tile
    const tileIndex162 = this.groundLayer2.findByIndex(162);
    const tileCenterX = this.groundLayer2.tileToWorldX(tileIndex162.x);
    const tileCenterY = this.groundLayer2.tileToWorldY(tileIndex162.y);
    const distance = Phaser.Math.Distance.Between(this.protagonist.x, this.protagonist.y, tileCenterX, tileCenterY);
    // Update "Enter hut" text position to follow the player
    this.exitHutText.setPosition(this.protagonist.x, this.protagonist.y);
        
    if (distance <= 70) {
        // Display "Enter hut" text if the player is close to the hut
        this.exitHutText.setVisible(true);
        
        // Check if the player presses the "f" key
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F), 500)) {
          const dataToPass = {
              message: "Exit hut",
              playerPosition: this.playerPosition, // Pass the player's current position
              fishCaught: this.fishCaught, // Pass the number of fish caught
              monsterExists: this.monsterExists,
              monsterPositionX: this.monsterPositionX,
              monsterPositionY: this.monsterPositionY
          };
      
          this.scene.start(SCENE_KEYS.MAIN_SCENE, dataToPass);
      }
    } else {
        // Hide "Enter hut" text if the player is not close to the hut
        this.exitHutText.setVisible(false);
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
    }
}
