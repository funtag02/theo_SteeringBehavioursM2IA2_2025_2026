// ============================================================
// creeper.js — Creeper : pursue la tête + explose à portée
// ============================================================

class Creeper extends Mob {
  constructor(x, y) {
    super(x, y, CONFIG.mobs.creeper);
    this.exploding    = false;   // en train d'exploser ?
    this.explodeTimer = 0;       // frames depuis le début de l'explosion
    this.explodeDuration = 30;   // frames d'animation d'explosion
    this.hasExploded  = false;   // l'explosion a-t-elle déjà fait des dégâts ?
  }

  // Retourne true si l'explosion doit infliger des dégâts ce frame
  checkExplosionDamage() {
    return this.exploding && !this.hasExploded && this.explodeTimer > 10;
  }

  update(snakeHead, obstacles) {
    const triggerRadius = CONFIG.mobs.creeper.triggerRadius;

    if (this.exploding) {
      this.explodeTimer++;
      if (this.explodeTimer >= this.explodeDuration) {
        this.dead = true;
      }
      return; // pas de mouvement pendant l'explosion
    }

    // Pursue la tête
    const pursueForce = this.pursue(snakeHead);
    const avoidForce  = this.avoid(obstacles);

    let force = createVector(0, 0);
    force.add(avoidForce.mult(2));
    force.add(pursueForce);

    this.applyForce(force);
    super.update();

    // Déclencher l'explosion si assez proche
    const d = p5.Vector.dist(this.pos, snakeHead.pos);
    if (d < triggerRadius) {
      this.exploding = true;
    }
  }

  // Appelé depuis sketch.js pour marquer les dégâts comme appliqués
  markExploded() {
    this.hasExploded = true;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    if (this.exploding) {
      // Animation d'explosion
      const progress = this.explodeTimer / this.explodeDuration;
      const explosionR = CONFIG.mobs.creeper.explosionRadius * progress;
      fill(255, map(progress, 0, 1, 200, 50), 0, map(progress, 0, 1, 200, 0));
      noStroke();
      circle(0, 0, explosionR * 2);

    } else {
      // Corps carré vert creeper
      fill(this.color);
      stroke("#1a8a1a");
      strokeWeight(2);
      rectMode(CENTER);
      rect(0, 0, this.r * 2, this.r * 2);

      // Visage creeper
      fill(0, 180, 0);
      noStroke();
      const s = this.r * 0.3;
      // Yeux
      rect(-this.r * 0.35, -this.r * 0.2, s, s);
      rect( this.r * 0.35, -this.r * 0.2, s, s);
      // Bouche en T inversé
      rect(0, this.r * 0.15, s * 0.8, s * 1.5);
      rect(-s * 0.8, this.r * 0.4, s * 2.4, s * 0.8);
    }

    pop();
  }
}
