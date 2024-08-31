import { SCENE_KEYS } from "./scene-keys";
import { sizes } from '../config.js';

export default class INTRO_SCENE extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.INTRO_SCENE);

        this.serene_village_text = "Once, this Nordic fishing village thrived, its people living in harmony with the lake Syvä.";
        this.deserted_village_text = "But then, the children began to disappear... One by one, they were lost to the depths of the lake.";
        this.families_leaving_text = "Fear gripped the hearts of the villagers. Those who could, fled, leaving the village on the brink of collapse.";
        this.eero_text = "One man, Eero, refused to give up. Driven by the loss of his own daughter, he continues to fish from the cursed waters, risking everything.";
        
        this.textSpeed = 50;  // Speed in ms per letter
        this.currentIndex = 0;
        this.images = [];
        this.textObject = null;  // Initialize textObject
        this.skipKey = null;     // Initialize skipKey
    }

    preload() {
        console.log("Preloading assets...");
        // Preload images if not done in another scene
        this.load.image('serene_village', 'path/to/serene_village.png');
        this.load.image('fishing_village_deserted', 'path/to/fishing_village_deserted.png');
        this.load.image('families_leaving', 'path/to/families_leaving.png');
        this.load.image('eero', 'path/to/eero.png');
    }

    create() {
        const canvasWidth = sizes.canvasWidth || 960;
        const canvasHeight = sizes.canvasHeight || 640;

        console.log("Canvas size:", canvasWidth, canvasHeight);

        // Store the images for later manipulation
        this.images.push(this.add.image(0, 0, 'serene_village').setOrigin(0).setDisplaySize(canvasWidth, canvasHeight).setAlpha(0));
        this.images.push(this.add.image(0, 0, 'fishing_village_deserted').setOrigin(0).setDisplaySize(canvasWidth, canvasHeight).setAlpha(0));
        this.images.push(this.add.image(0, 0, 'families_leaving').setOrigin(0).setDisplaySize(canvasWidth, canvasHeight).setAlpha(0));
        this.images.push(this.add.image(0, 0, 'eero').setOrigin(0).setDisplaySize(canvasWidth, canvasHeight).setAlpha(0));

        // Initialize the textObject with depth and styling, but with an empty string
        this.textObject = this.add.text(canvasWidth / 2, canvasHeight - 100, '', { 
            font: 'bold 24px Arial', 
            fill: '#FFFFFF', 
            stroke: '#000000', 
            strokeThickness: 3, 
            wordWrap: { width: canvasWidth - 40 }, 
            align: 'center' 
        }).setOrigin(0.5, 1).setDepth(1000);  // Set origin to (0.5, 1) and depth to 1000

        // Initialize the skip key (F key)
        this.skipKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        
        // Start the intro sequence
        this.startIntroSequence();
        if (!this.game.maintune) {
            //play the main tune
            this.game.maintune = this.sound.add('main_tune', {
                loop: true, // Loop the audio
                volume: 0.5 // Set the volume level
            });
            this.game.maintune.play();
        }
    }

    startIntroSequence() {
        const sequence = [
            { image: this.images[0], text: this.serene_village_text },
            { image: this.images[1], text: this.deserted_village_text },
            { image: this.images[2], text: this.families_leaving_text },
            { image: this.images[3], text: this.eero_text },
        ];
        
        console.log("Starting intro sequence...");
        this.showScene(sequence, 0);
    }

    showScene(sequence, index) {
        if (index >= sequence.length) {
            // All scenes are done, start MAIN_SCENE
            this.scene.start(SCENE_KEYS.MAIN_SCENE);
            return;
        }

        const scene = sequence[index];
        const image = scene.image;
        const text = scene.text;

        console.log("Showing scene:", index);

        // Clear the old text
        this.textObject.setText('');

        // Fade in the image
        this.tweens.add({
            targets: image,
            alpha: 1,
            duration: 1000,  // 1 second fade-in
            onComplete: () => {
                console.log("Image fade-in complete. Displaying text...");
                // Show text after the image has faded in
                this.showDialogLetterByLetter(text, this.textSpeed, () => {
                    // Fade out the image after the text is displayed
                    this.tweens.add({
                        targets: image,
                        alpha: 0,
                        duration: 1000,  // 1 second fade-out
                        delay: 1000,  // Hold the image for 1 second before fading out
                        onComplete: () => {
                            console.log("Image fade-out complete. Moving to next scene...");
                            this.showScene(sequence, index + 1);  // Show the next scene
                        }
                    });
                });
            }
        });
    }

    showDialogLetterByLetter(text, speed, onComplete) {
        let currentText = '';
        let i = 0;

        const timer = this.time.addEvent({
            delay: speed,
            callback: () => {
                currentText += text[i];
                this.textObject.setText(currentText);  // Update the existing textObject
                i++;
                if (i >= text.length) {
                    timer.remove();
                    this.time.delayedCall(1000, onComplete);  // Wait 1 second before calling onComplete
                }
            },
            loop: true
        });
    }

    update() {
        // Check if the skip key (F key) is pressed
        if (Phaser.Input.Keyboard.JustDown(this.skipKey)) {
            console.log("Skip key pressed. Starting MAIN_SCENE...");
            this.scene.start(SCENE_KEYS.MAIN_SCENE);  // Immediately start the MAIN_SCENE
        }
    }
}