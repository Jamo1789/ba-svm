import Phaser from "phaser";

export default class FISHING_SCENE extends Phaser.Scene {
  constructor() {
    super({ key: "FISHING_SCENE" });
  }

  preload() {}

  create() {
    this.add.text(400, 300, 'Fishing Scene', { font: '48px Arial', fill: '#ffffff' }).setOrigin(0.5, 0.5);
  }

  update() {}
}
