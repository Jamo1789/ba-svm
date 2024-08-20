import { SCENE_KEYS } from "./scene-keys.js";
import { characterPositionInWorldMap, sizes, hitboxWidth, hitboxHeight, hitboxOffsetX, hitboxOffsetY, dockIndex } from '../config.js';
let last_direction;
export default class FORESTY_ROAD extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.FORESTY_ROAD);
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
        const gameConfig = this.sys.game.config;
    
        // Update canvas size if needed
        gameConfig.width = 1024; // Set the desired width
        gameConfig.height = 1024; // Set the desired height
    
        // Resize the game canvas
        this.scale.resize(gameConfig.width, gameConfig.height);
      
        // Load the tilemap
        const map = this.make.tilemap({ key: 'map_forest_road' });
    
        // Create the ground layer using the tilemap and tileset
        const forestTileset = map.addTilesetImage('FORESTY_ROAD', 'FORESTY_ROAD'); // Change the key to 'inside_tiles'
        const groundLayer3 = map.createLayer('FORESTY_ROAD', forestTileset, 0, 0);
        const wallsLayer2 = map.createLayer('OBJECT_LAYER', forestTileset, 0, 0);
                // Set collision for tile index 1
                wallsLayer2.setCollision();
        // Create the protagonist sprite
        this.protagonist = this.physics.add.sprite(539, 911, 'protagonist');
        this.protagonist.body.setSize(hitboxWidth, hitboxHeight);
        this.protagonist.body.setOffset(hitboxOffsetX, hitboxOffsetY);

        // Set the depth of layers
        groundLayer3.setDepth(0);
        this.protagonist.setDepth(1);
    
  

        // Enable collision between the protagonist and the ground layer
        this.physics.add.collider(this.protagonist, groundLayer3);
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
          this.exitForestyRoadText = this.add.text(this.protagonist.x, this.protagonist.y, 'Press f to exit road', { font: '24px Arial', fill: '#ffffff' });
          this.exitForestyRoadText.setDepth(100);

          this.wallsLayer2 = wallsLayer2 
                // Store a reference to the ground layer for later use if needed
        this.groundLayer3 = groundLayer3;
        this.protagonist.body.setCollideWorldBounds(true);
        
        wallsLayer2.setCollisionBetween(1, 1000, true); // Adjust tile indexes as needed
        this.physics.add.collider(this.protagonist, this.wallsLayer2);
        // Display the bucket size text
    this.bucketText = this.add.text(16, 16, `Caught: ${this.fishCaught} / ${this.bucketSize}`, { font: '24px Arial', fill: '#ffffff' }).setScrollFactor(0);
    }
    

    update() {
      console.log(this.protagonist.x + " " + "x value" + " " + this.protagonist.y)
        this.protagonist.setVelocity(0);
        //determine the text diplsay tile
    const tileIndex1005 = this.groundLayer3.findByIndex(1005);
    const tileCenterX = this.groundLayer3.tileToWorldX(tileIndex1005.x);
    const tileCenterY = this.groundLayer3.tileToWorldY(tileIndex1005.y);
    const distance = Phaser.Math.Distance.Between(this.protagonist.x, this.protagonist.y, tileCenterX, tileCenterY);
    // Update "Enter hut" text position to follow the player
    this.exitForestyRoadText.setPosition(this.protagonist.x, this.protagonist.y - 50);
       
    if (distance <= 70) {
        // Display "Enter hut" text if the player is close to the hut
        this.exitForestyRoadText.setVisible(true);
        
        // Check if the player presses the "f" key
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F), 500)) {
            // Launch Scene Two
            this.scene.start(SCENE_KEYS.MAIN_SCENE, {
              "message": "Exit road" 
            });
        }
    } else {
        // Hide "Enter hut" text if the player is not close to the hut
        this.exitForestyRoadText.setVisible(false);
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
