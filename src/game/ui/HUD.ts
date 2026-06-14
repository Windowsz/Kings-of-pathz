/** Manages the DOM heads-up display: health, damage flash and the game-over panel. */
export class HUD {
  private healthFill: HTMLElement | null;
  private healthText: HTMLElement | null;
  private flash: HTMLElement | null;
  private gameOver: HTMLElement | null;
  private finalScore: HTMLElement | null;

  constructor(onRestart: () => void) {
    this.healthFill = document.getElementById('hp-fill');
    this.healthText = document.getElementById('hp-text');
    this.flash = document.getElementById('damage-flash');
    this.gameOver = document.getElementById('game-over');
    this.finalScore = document.getElementById('final-score');

    document.getElementById('restart-btn')?.addEventListener('click', () => {
      this.hideGameOver();
      onRestart();
    });
  }

  updateHealth(hp: number, maxHp: number): void {
    const ratio = Math.max(0, hp / maxHp);
    if (this.healthFill) {
      this.healthFill.style.width = `${ratio * 100}%`;
      this.healthFill.style.background =
        ratio > 0.5 ? '#5dd66b' : ratio > 0.25 ? '#f2c94c' : '#eb5757';
    }
    if (this.healthText) this.healthText.innerText = `${Math.ceil(hp)} / ${maxHp}`;
  }

  showDamageFlash(): void {
    if (!this.flash) return;
    this.flash.classList.add('show');
    setTimeout(() => this.flash?.classList.remove('show'), 150);
  }

  showGameOver(score: number): void {
    if (this.finalScore) this.finalScore.innerText = score.toString();
    this.gameOver?.classList.add('show');
  }

  hideGameOver(): void {
    this.gameOver?.classList.remove('show');
  }
}
