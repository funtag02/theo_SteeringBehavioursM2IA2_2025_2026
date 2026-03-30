// 'use strict';

let target;
let vehicules = [];
let imgVehicule, imgTarget, imgBackground; // Variables pour les images
let vitesseMaxSlider; // Déclare la variable vitesseMaxSlider ici

// La fonction preload est appelée avant setup pour charger les ressources
function preload() {
  imgVehicule = loadImage('assets/6_7_boyy.png'); // Charge l'image pour les véhicules
  imgTarget = loadImage('assets/e_word.jpeg'); // Charge l'image pour la cible
  imgBackground = loadImage('assets/epstisland.jpg'); // Charge l'image de fond
}

// la fonction setup est appelée une fois au démarrage du programme par p5.js
function setup() {
  createCanvas(windowWidth, windowHeight);

  vitesseMaxSlider = createSlider(1, 20, 10, 1);
  vitesseMaxSlider.position(920, 10);
  vitesseMaxSlider.size(80);

  let labelVitesseMax = createDiv('Vitesse Max:');
  labelVitesseMax.position(810, 10);
  labelVitesseMax.style('color', 'white');
  labelVitesseMax.style('font-size', '18px');

  let nbVehicules = 5;
  creerVehicules(nbVehicules);

  // La cible est un vecteur avec une position aléatoire dans le canvas
  target = new Target(random(width), random(height));
}

function creerVehicules(nbV) {
  for (let i = 0; i < nbV; i++) {
    let x = random(width);
    let y = random(height);
    vehicules.push(new Vehicle(x, y));
  }
}

function draw() {
  background("purple");
  // image(imgBackground, 0, 0, width, height);

  // Affiche la cible
  target.update();
  target.edges();
  target.show();

  vehicules.forEach((vehicule) => {
    vehicule.maxSpeed = vitesseMaxSlider.value();
    vehicule.applyBehaviors(target.pos);
    vehicule.update();
    vehicule.edges();
    vehicule.show();

    if (vehicule.pos.dist(target.pos) < vehicule.r + 16) {
      vehicule.pos = createVector(random(width), random(height));
    }
  });
}