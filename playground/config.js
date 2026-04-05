// ============================================================
// config.js — Paramètres globaux du jeu (modifier ici uniquement)
// ============================================================

const CONFIG = {

  // --- Snake ---
  snake: {
    initialLength: 2,       // Nombre de segments au départ
    segmentSpacing: 40,     // Distance de freinage entre segments (arrive)
  },

  // --- Portes ---
  gates: {
    total: 10,              // Nombre total de portes par partie
    minOpeningFactor: 4,    // Ouverture min = minOpeningFactor × Vehicle.defaultR
    spawnMargin: 0.25,      // Zone de spawn : entre margin et 1-margin (relatif à width/height)
    minDistanceBetween: null, // calculé dynamiquement (width / 4) dans setup()
    minDistanceFromObstacles: null, // calculé dynamiquement (width / 10) dans setup()
    maxAttempts: 100,

    // Taux de spawn (somme doit faire 1.0)
    spawnRates: {
      normal:    0.60,
      ephemeral: 0.25,
      trap:      0.15,
    },

    // Durée de vie des portes éphémères (ms)
    ephemeralDuration: 8000,

    // Points
    points: {
      normal:         +10,
      ephemeral:      +20,
      trap:           -15,
      hitPost:        -5,   // toucher une extrémité
      perSegmentLost: -2,   // par segment perdu lors d'une mort partielle
    },
  },

  // --- Obstacles ---
  obstacles: {
    count: 3,
    minRadius: 20,
    maxRadius: 50,
    minDistanceBetween: null, // calculé dynamiquement (height / 4) dans setup()
  },

  // --- Mobs ---
  mobs: {
    // Points gagnés en tuant un mob
    points: {
      zombie:   +5,
      creeper:  +10,
      enderman: +15,
      sheep:    +3,
    },

    // Dégâts au snake
    damage: {
      seekerHitsHead:   -8,  // zombie / enderman / creeper touche la tête
      wandererHitsBody: -8,  // mouton touche un segment
      creeperExplosion: -20, // explosion du creeper
    },

    // Seuils d'apparition (longueur du snake)
    spawnThresholds: {
      zombie:   0,
      sheep:    0,
      enderman: 8,
      creeper:  10,
    },

    zombie: {
      maxSpeed: 1.5,
      maxForce: 0.08,
      r: 14,
      hitsToKill: 1,
      color: "#4a7c4e",       // vert zombie minecraft
    },

    sheep: {
      maxSpeed: 1.2,
      maxForce: 0.06,
      r: 13,
      hitsToKill: 2,
      color: "#d4c5b0",       // blanc cassé
      colorHit: "#a08060",    // couleur après 1er hit
    },

    creeper: {
      maxSpeed: 2.0,
      maxForce: 0.12,
      r: 14,
      hitsToKill: 1,
      color: "#3dba3d",       // vert creeper
      explosionRadius: 60,    // rayon d'explosion (pixels)
      triggerRadius: null,    // calculé dynamiquement (3 × Vehicle.defaultR) dans setup()
    },

    enderman: {
      maxSpeed: 3.5,
      maxForce: 0.20,
      r: 16,
      hitsToKill: 1,
      color: "#1a001a",       // noir/violet enderman
      teleportInterval: 5000, // ms entre chaque téléportation
      teleportRange: null,    // calculé dynamiquement (width / 4) dans setup()
    },
  },

  // --- Boules de feu ---
  fireball: {
    maxSpeed: 6,
    maxForce: 0.4,
    r: 8,
    color: "#ff6600",
    lifespan: 180,            // frames avant disparition si pas d'impact
  },

  // --- Difficulté dynamique (selon longueur du snake) ---
  difficulty: {
    // À chaque palier, on augmente le maxSpeed des mobs seekers de speedBoost
    thresholds: [
      { snakeLength: 4,  extraZombies: 1, speedBoost: 0 },
      { snakeLength: 6,  extraZombies: 0, speedBoost: 0.3 },
      { snakeLength: 8,  extraZombies: 0, speedBoost: 0 },   // enderman spawn
      { snakeLength: 10, extraZombies: 0, speedBoost: 0 },   // creeper spawn
      { snakeLength: 12, extraZombies: 0, speedBoost: 0.3 }, // force boost
    ],
  },
};
