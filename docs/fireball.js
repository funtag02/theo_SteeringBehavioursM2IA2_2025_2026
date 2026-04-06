// ============================================================
// fireball.js — Boule de feu : seek vers le mob cible
// ============================================================

class Fireball extends Vehicle {
  constructor(x, y, targetMob) {
    super(x, y);
    this.maxSpeed   = CONFIG.fireball.maxSpeed;
    this.maxForce   = CONFIG.fireball.maxForce;
    this.r          = CONFIG.fireball.r;
    this.target     = targetMob;   // référence au mob cible
    this.lifespan   = CONFIG.fireball.lifespan;
    this.frameCount = 0;
    this.dead       = false;

    // Donner une vitesse initiale vers la cible
    let dir = p5.Vector.sub(targetMob.pos, this.pos);
    dir.setMag(this.maxSpeed);
    this.vel = dir;
  }

  update(mobs) {
    this.frameCount++;

    // Expiration
    if (this.frameCount > this.lifespan) {
      this.dead = true;
      return;
    }

    // Si la cible est morte, on continue en ligne droite
    if (!this.target.dead) {
      const seekForce = this.seek(this.target.pos);
      this.applyForce(seekForce);
    }

    super.update();

    // Vérifier collision avec tous les mobs
    for (let mob of mobs) {
      if (mob.dead) continue;
      const d = p5.Vector.dist(this.pos, mob.pos);
      if (d < this.r + mob.r) {
        mob.takeHit();
        this.dead = true;
        return;
      }
    }

    // Hors écran
    if (this.pos.x < 0 || this.pos.x > width ||
        this.pos.y < 0 || this.pos.y > height) {
      this.dead = true;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    // Halo orange
    noStroke();
    fill(255, 100, 0, 80);
    circle(0, 0, this.r * 3.5);

    // Corps de la boule
    fill(CONFIG.fireball.color);
    stroke(255, 200, 0);
    strokeWeight(1.5);
    circle(0, 0, this.r * 2);

    // Centre blanc chaud
    fill(255, 255, 200);
    noStroke();
    circle(0, 0, this.r * 0.8);

    pop();
  }
}
