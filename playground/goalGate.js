// ============================================================
// goalGate.js — Portes (normale, éphémère, piégée)
// Extends Vehicle via Obstacle
// ============================================================

// Types de portes
const GATE_TYPE = {
  NORMAL:    'normal',
  EPHEMERAL: 'ephemeral',
  TRAP:      'trap',
};

class GoalGate extends Obstacle {
  constructor(x1, y1, x2, y2, type = GATE_TYPE.NORMAL) {
    super(x1, y1, 0);
    this.start    = createVector(x1, y1);
    this.end      = createVector(x2, y2);
    this.type     = type;
    this.crossed  = false;
    this.dead     = false;  // true = à supprimer de la liste

    // Timer pour les portes éphémères
    this.createdAt = millis();
    this.duration  = CONFIG.gates.ephemeralDuration;

    // Couleurs selon le type
    this.lineColor = this._getLineColor();
    this.postColor = this.type === GATE_TYPE.TRAP ? '#ff4444' : 'white';
  }

  _getLineColor() {
    switch (this.type) {
      case GATE_TYPE.TRAP:      return '#ff2222';
      case GATE_TYPE.EPHEMERAL: return '#00ffcc';
      default:                  return '#00ff44';
    }
  }

  // Temps restant en [0,1] pour les portes éphémères
  _timeRatio() {
    return constrain(1 - (millis() - this.createdAt) / this.duration, 0, 1);
  }

  // Vérifie expiration (éphémère uniquement)
  checkExpiration() {
    if (this.type === GATE_TYPE.EPHEMERAL && !this.crossed) {
      if (millis() - this.createdAt > this.duration) {
        this.dead = true;
      }
    }
  }

  // Vérifie si le centre d'un véhicule passe à travers le segment
  // On utilise une détection côté pour savoir si le snake a traversé
  checkCrossing(vehicle) {
    if (this.crossed || this.dead) return false;
    const d = distToSegment(vehicle.pos, this.start, this.end);
    if (d < vehicle.r * 1.2) {
      this.crossed = true;
      this.dead    = true;
      return true;
    }
    return false;
  }

  // Vérifie si un véhicule touche une des extrémités (poteaux)
  checkPostCollision(vehicle) {
    if (this.dead) return false;
    const dStart = p5.Vector.dist(vehicle.pos, this.start);
    const dEnd   = p5.Vector.dist(vehicle.pos, this.end);
    const postR  = 12; // rayon de collision des poteaux
    return dStart < vehicle.r + postR || dEnd < vehicle.r + postR;
  }

  // Points gagnés (ou perdus) en passant la porte
  getPassPoints() {
    return CONFIG.gates.points[this.type];
  }

  show() {
    push();

    // --- Ligne principale ---
    stroke(this.lineColor);
    strokeWeight(4);
    line(this.start.x, this.start.y, this.end.x, this.end.y);

    // --- Barre de temps restant (éphémère uniquement) ---
    if (this.type === GATE_TYPE.EPHEMERAL && !this.dead) {
      const ratio = this._timeRatio();
      const gx    = (this.start.x + this.end.x) / 2;
      const gy    = (this.start.y + this.end.y) / 2;
      const barW  = 50;

      // Fond
      stroke(80);
      strokeWeight(3);
      line(gx - barW / 2, gy - 20, gx + barW / 2, gy - 20);

      // Remplissage
      stroke(lerpColor(color('#ff2222'), color('#00ffcc'), ratio));
      line(gx - barW / 2, gy - 20, gx - barW / 2 + barW * ratio, gy - 20);

      // Scintillement léger
      if (ratio < 0.3) {
        stroke(255, 80);
        strokeWeight(6);
        if (frameCount % 10 < 5) {
          line(this.start.x, this.start.y, this.end.x, this.end.y);
        }
      }
    }

    // --- Poteaux ---
    const gatePostSize = 24;
    fill(this.postColor);
    noStroke();
    circle(this.start.x, this.start.y, gatePostSize);
    circle(this.end.x,   this.end.y,   gatePostSize);

    // Label type (debug)
    if (Vehicle.debug) {
      fill(255);
      noStroke();
      textSize(11);
      textAlign(CENTER, CENTER);
      const cx = (this.start.x + this.end.x) / 2;
      const cy = (this.start.y + this.end.y) / 2;
      text(this.type, cx, cy - 28);
    }

    pop();
  }
}

// -------------------------------------------------------
// Utilitaire : distance d'un point p au segment [v, w]
// -------------------------------------------------------
function distToSegment(p, v, w) {
  const l2 = p5.Vector.dist(v, w) ** 2;
  if (l2 === 0) return p5.Vector.dist(p, v);
  const t = max(0, min(1, p5.Vector.sub(p, v).dot(p5.Vector.sub(w, v)) / l2));
  const projection = p5.Vector.add(v, p5.Vector.sub(w, v).mult(t));
  return p5.Vector.dist(p, projection);
}

// -------------------------------------------------------
// Factory : crée une porte d'un type aléatoire selon CONFIG
// -------------------------------------------------------
function randomGateType() {
  const r   = random(1);
  const rates = CONFIG.gates.spawnRates;
  if (r < rates.trap)                   return GATE_TYPE.TRAP;
  if (r < rates.trap + rates.ephemeral) return GATE_TYPE.EPHEMERAL;
  return GATE_TYPE.NORMAL;
}
