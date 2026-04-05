// ============================================================
// hud.js — Affichage score, chrono, état de la partie
// ============================================================

class HUD {
  constructor() {
    this.score       = 0;
    this.startTime   = millis();
    this.elapsedMs   = 0;
    this.frozen      = false;   // true quand la partie est terminée
    this.gameOver    = false;   // collision snake sur lui-même
    this.gameWon     = false;   // toutes les portes passées
  }

  // Ajoute (ou retire) des points — minimum 0
  addScore(delta) {
    this.score = max(0, this.score + delta);
  }

  // Fige le chrono et marque la fin de partie
  freeze(won = true) {
    if (!this.frozen) {
      this.elapsedMs = millis() - this.startTime;
      this.frozen    = true;
      this.gameWon   = won;
      this.gameOver  = !won;
    }
  }

  // Temps écoulé formaté mm:ss.d
  getTimeString() {
    const ms      = this.frozen ? this.elapsedMs : millis() - this.startTime;
    const totalS  = floor(ms / 1000);
    const minutes = floor(totalS / 60);
    const seconds = totalS % 60;
    const tenths  = floor((ms % 1000) / 100);
    return nf(minutes, 2) + ':' + nf(seconds, 2) + '.' + tenths;
  }

  draw(gatesLeft, totalGates) {
    push();
    textFont('monospace');
    noStroke();

    // --- Barre du haut ---
    fill(0, 0, 0, 160);
    rect(0, 0, width, 44);

    // Score
    fill(255, 220, 50);
    textSize(20);
    textAlign(LEFT, CENTER);
    text('⭐ ' + this.score, 16, 22);

    // Chrono
    fill(180, 230, 255);
    textAlign(CENTER, CENTER);
    text('⏱ ' + this.getTimeString(), width / 2, 22);

    // Portes restantes
    fill(100, 255, 150);
    textAlign(RIGHT, CENTER);
    text('🚪 ' + gatesLeft + ' / ' + totalGates, width - 16, 22);

    pop();

    // --- Popup fin de partie ---
    if (this.frozen) {
      this._drawEndPopup();
    }
  }

  _drawEndPopup() {
    push();

    // Fond semi-transparent
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);

    // Panneau
    const pw = 420, ph = 260;
    const px = width / 2 - pw / 2;
    const py = height / 2 - ph / 2;

    fill(30, 30, 30, 240);
    stroke(this.gameWon ? '#44ff88' : '#ff4444');
    strokeWeight(3);
    rect(px, py, pw, ph, 16);

    // Titre
    textFont('monospace');
    textAlign(CENTER, TOP);
    textSize(32);
    fill(this.gameWon ? '#44ff88' : '#ff6666');
    noStroke();
    text(this.gameWon ? '🎉 PARTIE TERMINÉE !' : '💀 GAME OVER', width / 2, py + 28);

    // Score
    textSize(22);
    fill(255, 220, 50);
    text('Score : ' + this.score, width / 2, py + 88);

    // Temps
    textSize(18);
    fill(180, 230, 255);
    text('Temps : ' + this.getTimeString(), width / 2, py + 126);

    // Instruction relance
    textSize(14);
    fill(160, 160, 160);
    text('Appuie sur R pour rejouer', width / 2, py + 200);

    pop();
  }
}
