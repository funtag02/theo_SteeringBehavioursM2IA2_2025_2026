// ============================================================
// zombie.js — Zombie : seek lent vers la tête du snake
// ============================================================

class Zombie extends Mob {
  constructor(x, y) {
    super(x, y, CONFIG.mobs.zombie);
  }

  update(snakeHead, obstacles) {
    // Seek vers la tête du snake
    const seekForce = this.seek(snakeHead.pos);

    // Éviter les obstacles
    const avoidForce = this.avoid(obstacles);

    // Composition des forces
    let force = createVector(0, 0);
    force.add(avoidForce.mult(2));  // priorité à l'évitement
    force.add(seekForce);

    this.applyForce(force);
    super.update();
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    // Corps carré style Minecraft
    fill(this.color);
    stroke("#2a4a2e");
    strokeWeight(2);
    rectMode(CENTER);
    rect(0, 0, this.r * 2, this.r * 2);

    // Yeux rouges
    fill(255, 0, 0);
    noStroke();
    const eyeSize = this.r * 0.35;
    rect(-this.r * 0.3, -this.r * 0.2, eyeSize, eyeSize);
    rect( this.r * 0.3, -this.r * 0.2, eyeSize, eyeSize);

    pop();
  }
}
