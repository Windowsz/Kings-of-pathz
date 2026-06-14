export class ScoreManager {
  private score: number = 0;

  public addPoints(points: number): void {
    this.score += points;
    this.updateScoreDisplay();
  }

  public getScore(): number {
    return this.score;
  }

  public reset(): void {
    this.score = 0;
    this.updateScoreDisplay();
  }

  private updateScoreDisplay(): void {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.innerText = this.score.toString();
    }
  }
}
