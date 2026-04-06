// ============================================================
// sheep.js — Mouton : wander aléatoire, 2 hits pour mourir
// ============================================================

class Sheep extends Mob {
  constructor(x, y) {
    super(x, y, CONFIG.mobs.sheep);
  }

  takeHit() {
    this.hits++;
    if (this.hits === 1) {
      // Premier hit : changement de couleur visible
      this.color = CONFIG.mobs.sheep.colorHit;
    }
    if (this.hits >= this.hitsToKill) {
      this.dead = true;
      return true;
    }
    return false;
  }

  update(obstacles) {
    // Wander + évitement obstacles
    const wanderForce = this.wander();
    const avoidForce  = this.avoid(obstacles);

    let force = createVector(0, 0);
    force.add(avoidForce.mult(2));
    force.add(wanderForce);

    this.applyForce(force);

    // Rester dans les bords de l'écran
    const boundForce = this.boundaries(0, 0, width, height, 40);
    this.applyForce(boundForce);

    super.update();
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    // Corps rond laineux
    fill(this.color);
    stroke("#888");
    strokeWeight(1.5);
    circle(0, 0, this.r * 2);

    // Petite tête
    fill("#e8d8c0");
    noStroke();
    circle(this.r * 0.5, -this.r * 0.3, this.r * 0.8);

    // Indicateur de vie restante (2 hits)
    if (this.hits === 1) {
      fill(255, 100, 100, 180);
      noStroke();
      circle(0, 0, this.r * 0.5);
    }

    pop();
  }
}
