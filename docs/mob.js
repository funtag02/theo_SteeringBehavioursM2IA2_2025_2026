// ============================================================
// mob.js — Classe de base pour tous les mobs (extends Vehicle)
// ============================================================

class Mob extends Vehicle {
  constructor(x, y, cfg) {
    super(x, y);
    this.maxSpeed = cfg.maxSpeed;
    this.maxForce = cfg.maxForce;
    this.r        = cfg.r;
    this.color    = cfg.color;
    this.hitsToKill = cfg.hitsToKill;
    this.hits     = 0;       // dégâts reçus
    this.dead     = false;
  }

  // Reçoit un hit d'une boule de feu
  // Retourne true si le mob est mort
  takeHit() {
    this.hits++;
    if (this.hits >= this.hitsToKill) {
      this.dead = true;
      return true;
    }
    return false;
  }

  // Vérifie la collision avec un véhicule (segment du snake ou tête)
  collidesWith(vehicle) {
    const d = p5.Vector.dist(this.pos, vehicle.pos);
    return d < this.r + vehicle.r;
  }

  // Méthode de base show() — surchargée par chaque sous-classe
  show() {
    push();
    fill(this.color);
    stroke(255);
    strokeWeight(1.5);
    translate(this.pos.x, this.pos.y);
    circle(0, 0, this.r * 2);
    pop();
  }

  // update() hérité de Vehicle — les sous-classes appellent applyForce() avant
}
