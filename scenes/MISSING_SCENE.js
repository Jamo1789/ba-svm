import { SCENE_KEYS } from "./scene-keys";
import { characterPositionInWorldMap, sizes, hitboxWidth, hitboxHeight, hitboxOffsetX, hitboxOffsetY, dockIndex } from '../config.js';
let last_direction;

export default class MISSING_SCENE extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.MISSING_SCENE);
        this.bucketSize = 3; // Maximum bucket size
        this.fishCaught = 0;
        this.caughtFish = []; // Array to store caught fish details
        this.dialogText = "Aino... Every time I see her face here, it feels like a dagger to my heart. I promised to protect her, to keep her safe. I failed. She's out there, somewhere in the depths of Lake Syvä. I can't give up. I have to find her. For Aino, for the village, for the promise I broke.";
        this.currentText = '';
    }

    preload() {
        // No need to preload the image here if it is already preloaded in preload_scene
    }

    create() {
        // Set the background image
        const canvasWidth = this.game.canvas.width;
        const canvasHeight = this.game.canvas.height;
        this.add.image(0, 0, 'missing_scene_bg').setOrigin(0).setDisplaySize(canvasWidth, canvasHeight);
        this.lightRainSound = this.sound.add('light-rain', {
            loop: true, // Loop the audio
            volume: 1.0 // Set the volume level
        });
        this.lightRainSound.play();

        // Add "Missing" text at the top left corner
        this.add.text(16, 16, 'Missing person', { font: 'bold 32px Arial', fill: '#FFFFFF', stroke: '#000000', strokeThickness: 3 }).setScrollFactor(0);

        // Add dialog text at the bottom center of the canvas, slightly higher to fit all rows
        this.dialogTextObject = this.add.text(canvasWidth / 2, canvasHeight - 100, '', { 
            font: 'bold 24px Arial', 
            fill: '#FFFFFF', 
            stroke: '#000000', 
            strokeThickness: 3, 
            wordWrap: { width: canvasWidth - 40 }, 
            align: 'center' 
        }).setOrigin(0.5, 1); // Set origin to (0.5, 1) to align text upwards
        
        this.showDialogLetterByLetter(this.dialogText, 50); // Adjust the speed (in ms) as needed
        this.input.keyboard.on('keydown-T', () => {
            // Return to MAIN_SCENE and pass the updated number of fish caught back
            this.scene.start('MAIN_SCENE', { playerPosition: this.startingPosition, fishCaught: this.fishCaught, caughtFish: this.caughtFish });
        });
    }

    showDialogLetterByLetter(text, speed) {
        let index = 0;
        let currentLineWidth = 0;
        const maxLineWidth = this.game.canvas.width - 40; // Allow some padding on the sides

        this.time.addEvent({
            delay: speed,
            callback: () => {
                if (index < text.length) {
                    // Add the next character to the current text
                    this.currentText += text[index];
                    this.dialogTextObject.setText(this.currentText);
                    
                    // Measure the width of the current text
                    const textMetrics = this.dialogTextObject.getTextMetrics();
                    currentLineWidth = textMetrics.width;

                    // Check if the current line width exceeds the maximum line width
                    if (currentLineWidth >= maxLineWidth && text[index] === ' ') {
                        // If it does, add a newline character
                        this.currentText += '\n';
                    }

                    // Move to the next character
                    index++;
                }
            },
            repeat: text.length - 1
        });
    }

    update() {
        // Update logic if necessary
    }
}
