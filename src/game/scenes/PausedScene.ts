import Phaser from 'phaser'

export default class PausedScene extends Phaser.Scene {
  private onResumeCallback?: () => void

  constructor() {
    super({ key: 'paused' })
  }

  init(data: { onResume?: () => void }) {
    this.onResumeCallback = data.onResume
  }

  create() {
    // Dim background (optional)
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6).setOrigin(0)

    // Pause text
    const text = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Game Paused\nClick or Press any key to resume', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    })
    text.setOrigin(0.5)

    // Resume on input
    this.input.once('pointerdown', () => this.resumeGame())
    this.input.keyboard?.once('keydown', () => this.resumeGame())
  }

  private resumeGame() {
    if (this.onResumeCallback) {
      this.onResumeCallback()
    }
  }
}
