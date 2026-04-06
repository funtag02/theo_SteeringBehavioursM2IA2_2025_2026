// ============================================================
// sketch.js — Boucle principale p5.js
// ============================================================

let vehicules  = [];   // segments du snake [0] = tête (nom compatible avec vehicle.js)
let obstacles  = [];
let gates      = [];   // portes actives
let mobs       = [];
let fireballs  = [];
let hud;

let gatesCleared = 0;
let totalGates;

function preload() {
  font = loadFont('./assets/inconsolata.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CORNER);

  // Valeurs dynamiques de CONFIG
  CONFIG.gates.minDistanceBetween       = width / 8;
  CONFIG.gates.minDistanceFromObstacles = width / 10;
  CONFIG.mobs.creeper.triggerRadius     = 3 * 16; // 3 × r_pourDessin
  CONFIG.mobs.enderman.teleportRange    = width / 4;

  totalGates = CONFIG.gates.total;

  hud = new HUD();

  creerObstacles(CONFIG.obstacles.count);
  creerGates(totalGates);
  creerVehicules(CONFIG.snake.initialLength);
  creerMobs();
}

// -------------------------------------------------------
// Création obstacles
// -------------------------------------------------------
function creerObstacles(n) {
  const minDist = height / 4;

  for (let i = 0; i < n; i++) {
    let x, y, r;
    let valid = false;

    while (!valid) {
      x = random(width);
      y = random(height);
      r = random(CONFIG.obstacles.minRadius, CONFIG.obstacles.maxRadius);
      valid = true;

      for (let obs of obstacles) {
        if (dist(x, y, obs.pos.x, obs.pos.y) < minDist + r + obs.r) {
          valid = false;
          break;
        }
      }
    }
    obstacles.push(new Obstacle(x, y, r));
  }
}

// -------------------------------------------------------
// Création véhicules (snake)
// -------------------------------------------------------
function creerVehicules(n) {
  for (let i = 0; i < n; i++) {
    vehicules.push(new Vehicle(width / 2 - i * 40, height / 2));
  }
}

// -------------------------------------------------------
// Création gates
// -------------------------------------------------------
function creerGates(n) {
  const minDistGates = CONFIG.gates.minDistanceBetween;
  const minDistObs   = CONFIG.gates.minDistanceFromObstacles;
  const margin       = CONFIG.gates.spawnMargin;
  const minOpening   = CONFIG.gates.minOpeningFactor * 16; // 4 × r_pourDessin

  for (let i = 0; i < n; i++) {
    let x1, y1, x2, y2;
    let valid    = false;
    let attempts = 0;

    while (!valid && attempts < CONFIG.gates.maxAttempts) {
      attempts++;

      x1 = random(width * margin, width * (1 - margin));
      y1 = random(height * margin, height * (1 - margin));
      x2 = x1 + random(-width / 6, width / 6);
      y2 = y1 + random(-height / 6, height / 6);

      // Garantir ouverture minimale
      const gateSize = dist(x1, y1, x2, y2);
      if (gateSize < minOpening) {
        const dx    = x2 - x1 || 1;
        const dy    = y2 - y1 || 0;
        const scale = minOpening / gateSize;
        x2 = x1 + dx * scale;
        y2 = y1 + dy * scale;
      }

      valid = true;

      // Distance minimale entre gates
      for (let gate of gates) {
        const gc  = createVector((gate.start.x + gate.end.x) / 2, (gate.start.y + gate.end.y) / 2);
        const ngc = createVector((x1 + x2) / 2, (y1 + y2) / 2);
        if (p5.Vector.dist(gc, ngc) < minDistGates) { valid = false; break; }
      }
      if (!valid) continue;

      // Distance minimale aux obstacles
      for (let obs of obstacles) {
        const ngc = createVector((x1 + x2) / 2, (y1 + y2) / 2);
        if (p5.Vector.dist(ngc, obs.pos) < minDistObs) { valid = false; break; }
      }
    }

    if (attempts >= CONFIG.gates.maxAttempts) {
      console.warn(`Gate ${i} non placée après ${CONFIG.gates.maxAttempts} tentatives.`);
      continue;
    }

    gates.push(new GoalGate(x1, y1, x2, y2, randomGateType()));
  }
}

// -------------------------------------------------------
// Création mobs initiaux
// -------------------------------------------------------
function creerMobs() {
  for (let i = 0; i < 2; i++) {
    mobs.push(spawnMob('zombie'));
    mobs.push(spawnMob('sheep'));
  }
}

function spawnMob(type) {
  let x, y;
  let attempts = 0;
  do {
    x = random(width);
    y = random(height);
    attempts++;
  } while (
    attempts < 50 &&
    vehicules.length > 0 &&
    dist(x, y, vehicules[0].pos.x, vehicules[0].pos.y) < 150
  );

  switch (type) {
    case 'zombie':   return new Zombie(x, y);
    case 'sheep':    return new Sheep(x, y);
    case 'creeper':  return new Creeper(x, y);
    case 'enderman': return new Enderman(x, y);
  }
}

// -------------------------------------------------------
// Difficulté dynamique
// -------------------------------------------------------
let lastDifficultyLength = 0;

function updateDifficulty() {
  const len = vehicules.length;
  if (len === lastDifficultyLength) return;
  lastDifficultyLength = len;

  for (let t of CONFIG.difficulty.thresholds) {
    if (len === t.snakeLength) {
      for (let i = 0; i < t.extraZombies; i++) mobs.push(spawnMob('zombie'));
      if (t.speedBoost > 0) {
        for (let mob of mobs) {
          if (mob instanceof Zombie || mob instanceof Creeper || mob instanceof Enderman) {
            mob.maxSpeed += t.speedBoost;
          }
        }
      }
    }
  }

  const hasEnderman = mobs.some(m => m instanceof Enderman);
  if (len >= CONFIG.mobs.spawnThresholds.enderman && !hasEnderman) {
    mobs.push(spawnMob('enderman'));
  }

  const hasCreeper = mobs.some(m => m instanceof Creeper);
  if (len >= CONFIG.mobs.spawnThresholds.creeper && !hasCreeper) {
    mobs.push(spawnMob('creeper'));
  }
}

// -------------------------------------------------------
// Mort partielle
// -------------------------------------------------------
function partialDeath(fromIndex) {
  const lost = vehicules.length - fromIndex;
  if (lost <= 0) return;
  vehicules.splice(fromIndex);
  hud.addScore(CONFIG.gates.points.perSegmentLost * lost);
}

// -------------------------------------------------------
// draw() — 60 fps
// -------------------------------------------------------
function draw() {
  background(20, 20, 30);

  if (!hud.frozen) updateDifficulty();

  // --- Obstacles ---
  for (let obs of obstacles) obs.show();

  // --- Gates ---
  for (let gate of gates) {
    gate.checkExpiration();
    gate.show();
  }
  gates = gates.filter(g => !g.dead);

  // --- Snake ---
  for (let i = 0; i < vehicules.length; i++) {
    const v = vehicules[i];

    if (!hud.frozen) {
      let steeringForce;
      if (i === 0) {
        steeringForce = v.seek(createVector(mouseX, mouseY), true);
      } else {
        steeringForce = v.seek(vehicules[i - 1].pos, true);
      }
      v.applyForce(steeringForce);
      v.update();
    }

    v.show();
  }

  if (!hud.frozen && vehicules.length > 0) {
    const head = vehicules[0];

    // Collision snake sur lui-même → game over
    for (let i = 4; i < vehicules.length; i++) {
      if (p5.Vector.dist(head.pos, vehicules[i].pos) < head.r_pourDessin * 1.5) {
        hud.freeze(false);
        break;
      }
    }

    // Collisions avec les gates
    for (let gate of gates) {

      if (gate.checkCrossing(head)) {
        hud.addScore(gate.getPassPoints());

        if (gate.type !== GATE_TYPE.TRAP) {
          gatesCleared++;
          const last = vehicules[vehicules.length - 1];
          vehicules.push(new Vehicle(last.pos.x, last.pos.y));
        } else {
          partialDeath(max(1, floor(vehicules.length / 2)));
        }

        if (gatesCleared >= totalGates) hud.freeze(true);
        break;
      }

      for (let i = 0; i < vehicules.length; i++) {
        if (gate.checkPostCollision(vehicules[i])) {
          hud.addScore(CONFIG.gates.points.hitPost);
          partialDeath(max(1, i + 1));
          break;
        }
      }
    }

    // Mobs update & collisions
    for (let mob of mobs) {
      if (mob.dead) continue;

      if (mob instanceof Sheep) {
        mob.update(obstacles);
      } else {
        mob.update(head, obstacles);
      }

      // Creeper explosion
      if (mob instanceof Creeper && mob.checkExplosionDamage()) {
        mob.markExploded();
        hud.addScore(CONFIG.mobs.damage.creeperExplosion);
        for (let i = vehicules.length - 1; i >= 1; i--) {
          if (p5.Vector.dist(mob.pos, vehicules[i].pos) < CONFIG.mobs.creeper.explosionRadius) {
            vehicules.splice(i, 1);
          }
        }
      }

      // Zombie / Enderman touche la tête
      if ((mob instanceof Zombie || mob instanceof Enderman) && mob.collidesWith(head)) {
        hud.addScore(CONFIG.mobs.damage.seekerHitsHead);
        partialDeath(max(1, floor(vehicules.length / 2)));
      }

      // Mouton touche un segment
      if (mob instanceof Sheep) {
        for (let i = 0; i < vehicules.length; i++) {
          if (mob.collidesWith(vehicules[i])) {
            hud.addScore(CONFIG.mobs.damage.wandererHitsBody);
            partialDeath(max(1, i + 1));
            break;
          }
        }
      }

      mob.show();
    }

    // Nettoyage mobs morts + attribution points
    mobs = mobs.filter(m => {
      if (m.dead) {
        if (m instanceof Zombie)   hud.addScore(CONFIG.mobs.points.zombie);
        if (m instanceof Sheep)    hud.addScore(CONFIG.mobs.points.sheep);
        if (m instanceof Creeper)  hud.addScore(CONFIG.mobs.points.creeper);
        if (m instanceof Enderman) hud.addScore(CONFIG.mobs.points.enderman);
        return false;
      }
      return true;
    });

  } else {
    for (let mob of mobs) mob.show();
  }

  // --- Boules de feu ---
  for (let fb of fireballs) {
    if (!fb.dead) {
      fb.update(mobs);
      fb.show();
    }
  }
  fireballs = fireballs.filter(fb => !fb.dead);

  // --- HUD ---
  hud.draw(totalGates - gatesCleared, totalGates);
}

// -------------------------------------------------------
// Inputs
// -------------------------------------------------------
function mousePressed() {
  if (hud.frozen || vehicules.length === 0 || mobs.length === 0) return;

  let closest     = null;
  let closestDist = Infinity;
  const cursor    = createVector(mouseX, mouseY);

  for (let mob of mobs) {
    if (mob.dead) continue;
    const d = p5.Vector.dist(cursor, mob.pos);
    if (d < closestDist) {
      closestDist = d;
      closest     = mob;
    }
  }

  if (closest) {
    fireballs.push(new Fireball(vehicules[0].pos.x, vehicules[0].pos.y, closest));
  }
}

function keyPressed() {
  if (key === 'd' || key === 'D') {
    Vehicle.debug = !Vehicle.debug;
  }
  if (key === 'r' || key === 'R') {
    vehicules            = [];
    obstacles            = [];
    gates                = [];
    mobs                 = [];
    fireballs            = [];
    gatesCleared         = 0;
    lastDifficultyLength = 0;
    setup();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}