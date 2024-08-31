import Phaser from "phaser";
import { SCENE_KEYS } from "./scene-keys.js";

export default class FISHING_SCENE extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.FISHING_SCENE);
    this.bucketSize = 3; // Maximum bucket size
    this.fishCaught = 0;
    this.caughtFish = []; // Array to store caught fish details
  }

  preload() {}

  create(data) {
  
              if (data && data.fishCaught !== undefined) {
                this.fishCaught = data.fishCaught;
                console.log("fis data passed")
            }
          // Store the player's starting position passed from MAIN_SCENE
            this.startingPosition = data.playerPosition;
            this.fishCaught = data.fishCaught || 0;
            this.bucketSize = data.bucketSize || 3;
          
            // Add the underwater background image and resize it
            const canvas_w = this.game.canvas.width;
            const canvas_h = this.game.canvas.height;
            this.cameras.main.setBounds(0, 0,this.game.canvas.width, this.game.canvas.height);
           
            this.background = this.add.image(0, 0, 'underwater_bg').setOrigin(0);
            this.background.setDisplaySize(canvas_w, canvas_h);
            // Enable physics in the scene
            this.physics.world.setBounds(0, 0, canvas_w, canvas_h);

            // Create the player using the hook image
            this.player = this.physics.add.image(16, 16, 'hook').setDepth(2);
            this.physics.add.existing(this.player);

            // Ensure the player's physics body is dynamic and affected by gravity
            this.player.body.setCollideWorldBounds(true);
            this.player.setCircle(this.player.width / 2); // Optional: add some bounce to the player
            // Disable gravity initially
            this.player.body.allowGravity = false;

            // Make the camera follow the player
            this.cameras.main.startFollow(this.player);

            const canvasWidth = this.game.canvas.width;
            const canvasHeight = this.game.canvas.height;



            // Add visual cues (markers)
            for (let k = 50; k < this.cameras.main.height; k += 100) {
                this.add.text(this.cameras.main.width / 2, k, k.toString(), { font: '16px Arial', fill: '#000000' }).setDepth(1).setOrigin(0.5);
            }

            // Set up a flag to track whether the player is being controlled by the mouse
            this.isDragging = true;
            this.isReturning = false; // Flag to track if the ball is returning


            // Array of fish keys
            const fishData = [
              { key: 'fish', width: 32, height: 32, value: 10 },
              { key: 'perch', width: 32, height: 32, value: 15 },
              { key: 'pike', width: 100, height: 100, value: 25 },
              { key: 'roach', width: 35, height: 35, value: 5 },
              { key: 'zander', width: 40, height: 40, value: 20 }
            ];
            

            // Create fish group with random fish types and sizes
            this.fishGroup = this.add.group();
            const numFish = Phaser.Math.Between(5, 15);
            for (let i = 0; i < numFish; i++) {
              const fishInfo = fishData[Phaser.Math.Between(0, fishData.length - 1)];
              const y = Phaser.Math.Between(50, canvas_h - 50);
              const fish = this.add.image(Phaser.Math.Between(50, canvas_w - 50), y, fishInfo.key).setDepth(1);
              fish.setDisplaySize(fishInfo.width, fishInfo.height);
              fish.speed = Phaser.Math.Between(50, 100) * (Math.random() < 0.5 ? 1 : -1);
              fish.value = fishInfo.value;
              fish.type = fishInfo.key;
              fish.spawnTime = this.time.now;
              fish.swimOut = false;
              this.fishGroup.add(fish);
              
           
          }
            // Initialize the score counter with bucket size
            this.score = 0;
            this.scoreText = this.add.text(16, 16, `Caught: ${this.fishCaught} / ${this.bucketSize}`, { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
            // Add event listener for mouse move
            this.input.on('pointermove', (pointer) => {
              if (this.isDragging) {
                  this.player.x = pointer.x;
              }
          });
        // Add event listener for mouse down
        this.input.on('pointerdown', () => {
          if (!this.isReturning) {
            this.isDropping = true;
            this.isReturning = false;
            this.isDragging = false;
            this.player.body.allowGravity = false;
            this.player.body.setVelocity(0, 300); // Start dropping the hook
          }
        });

        // Add catch sound
        this.catchSound = this.sound.add('catch');

        // Add event listener for returning to MAIN_SCENE
       
        this.input.keyboard.on('keydown-T', () => {
          // Return to MAIN_SCENE and pass the updated number of fish caught back
          this.scene.start('MAIN_SCENE', { playerPosition: this.startingPosition, fishCaught: this.fishCaught, caughtFish: this.caughtFish });
      });

  }

  update() {
    console.log(this.caughtFish)
    // If you want to see the player falling without the camera follow, you can initially stop following
    if (!this.cameras.main._follow) {
      this.cameras.main.scrollY += 1; // Adjust the scroll speed as needed to see the falling effect
  }

  // Move fish horizontally
  const currentTime = this.time.now;
  this.fishGroup.getChildren().forEach((fish) => {
      if (fish.active) {
          if (!fish.swimOut && currentTime - fish.spawnTime >= 30000) { // 5 seconds for example
              fish.speed *= 2; // Increase speed to simulate swimming out
              fish.swimOut = true;
          }

          fish.x += fish.speed * 0.016; 
          if (fish.swimOut && (fish.x < 0 || fish.x > this.game.canvas.width)) {
              fish.destroy();
          } else {
              if (fish.x < 0 || fish.x > this.game.canvas.width) {
                  fish.speed *= -1; 
                  fish.setFlipX(fish.speed < 0); 
              }
          }
      }
  });

  // Check if the player has reached the bottom
  if (this.player.y >= this.physics.world.bounds.height - this.player.body.halfHeight) {
      this.isReturning = true;
      this.player.body.allowGravity = false;
      this.player.body.setVelocityY(-300); // Adjust the speed as needed
  }

  // Stop horizontal movement when the ball is returning
  if (this.isReturning) {
      this.player.body.setVelocityX(0);
      // Stop the ball when it reaches the top
      if (this.player.y <= this.player.body.halfHeight) {
          this.player.body.setVelocityY(0);
          this.isReturning = false;
          this.player.body.allowGravity = false;

          // Allow player to choose where the ball drops again
          this.isDragging = true; // Re-enable dragging
      }

      this.fishGroup.getChildren().forEach((fish) => {
        if (fish.active && Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), fish.getBounds())) {
          if (this.fishCaught < this.bucketSize) {
            fish.destroy();
            
            this.fishCaught += 1;
            this.scoreText.setText(`Caught: ${this.fishCaught} / ${this.bucketSize}`);
            this.catchSound.play();
            this.caughtFish.push({ type: fish.type, value: fish.value });
          }
        }
      });
  }
  }
}
