// ============================================================
// enderman.js — Enderman : pursue rapide + téléportation
// ============================================================

class Enderman extends Mob {
  constructor(x, y) {
    super(x, y, CONFIG.mobs.enderman);
    this.lastTeleport = millis(); // timestamp dernière téléportation
    this.teleporting  = false;
    this.teleportTimer = 0;
    this.teleportDuration = 20;  // frames d'animation
  }

  update(snakeHead, obstacles) {
    const now = millis();
    const teleportRange = CONFIG.mobs.enderman.teleportRange;

    // Vérifier si c'est l'heure de se téléporter
    if (!this.teleporting && now - this.lastTeleport > CONFIG.mobs.enderman.teleportInterval) {
      this.teleporting  = true;
      this.teleportTimer = 0;

      // Nouvelle position aléatoire dans teleportRange autour de la tête
      const angle = random(TWO_PI);
      const dist  = random(teleportRange * 0.3, teleportRange);
      this.pos.x  = constrain(snakeHead.pos.x + cos(angle) * dist, this.r, width  - this.r);
      this.pos.y  = constrain(snakeHead.pos.y + sin(angle) * dist, this.r, height - this.r);
      this.vel.set(0, 0); // reset vitesse après téléportation

      this.lastTeleport = now;
    }

    if (this.teleporting) {
      this.teleportTimer++;
      if (this.teleportTimer >= this.teleportDuration) {
        this.teleporting = false;
      }
      return; // pas de force pendant l'animation
    }

    // Pursue la tête du snake
    const pursueForce = this.pursue(snakeHead);
    const avoidForce  = this.avoid(obstacles);

    let force = createVector(0, 0);
    force.add(avoidForce.mult(1.5));
    force.add(pursueForce);

    this.applyForce(force);
    super.update();
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    if (this.teleporting) {
      // Flash violet pendant la téléportation
      const alpha = map(this.teleportTimer, 0, this.teleportDuration, 255, 0);
      fill(160, 0, 255, alpha);
      noStroke();
      circle(0, 0, this.r * 3);
    }

    // Corps fin et grand (style Enderman)
    fill(this.color);
    stroke("#8800cc");
    strokeWeight(1.5);
    rectMode(CENTER);
    // Corps allongé
    rect(0, this.r * 0.2, this.r * 1.2, this.r * 1.6);
    // Tête carrée plus large
    rect(0, -this.r * 0.8, this.r * 1.6, this.r * 1.2);

    // Yeux violets
    fill(180, 0, 255);
    noStroke();
    const eyeSize = this.r * 0.3;
    rect(-this.r * 0.35, -this.r * 0.85, eyeSize, eyeSize);
    rect( this.r * 0.35, -this.r * 0.85, eyeSize, eyeSize);

    pop();
  }
}
