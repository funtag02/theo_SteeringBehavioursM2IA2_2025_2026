let target;
let vehicules = [];

// la fonction setup est appelée une fois au démarrage du programme par p5.js
function setup() {
  // on crée un canvas de 800px par 800px
  createCanvas(windowWidth, windowHeight);

  // On crée le slider et on le positionne
  vitesseMaxSlider = createSlider(1, 20, 10, 1);
  vitesseMaxSlider.position(920, 10);
  vitesseMaxSlider.size(80);
  // je crée un label juste devant en X
  let labelVitesseMax = createDiv('Vitesse Max:')
  labelVitesseMax.position(810, 10);
  labelVitesseMax.style('color', 'white');
  labelVitesseMax.style('font-size', '18px');
  let nbVehicules = 5;

  creerVehicules(nbVehicules);
  // La cible est un vecteur avec une position aléatoire dans le canvas
  // dirigée par la souris ensuite dans draw()
  target = createVector(random(width), random(height));
}

function creerVehicules(nbV){
  for (let i = 0; i < nbV; i++) {
    let x = random(width);
    let y = random(height);
    vehicules.push(new Vehicle(x, y));
  }
}

function createSlider(min, max, value, step){
  let slider = document.createElement("input");
  slider.type = "range";
  slider.min = min;
  slider.max = max;
  slider.value = value;
  slider.step = step;
  document.body.appendChild(slider);
  return slider;
}

// ici, ne surtout pas faire de new sauf s'il se passe quelque chose (je refais pas un meme slider 60 fois par seconde par exemple)
// la fonction draw est appelée en boucle par p5.js, 60 fois par seconde par défaut
// Le canvas est effacé automatiquement avant chaque appel à draw
function draw() {
  // fond noir pour le canvas
  background("purple");

  // A partir de maintenant toutes les formes pleines seront en rouge
  fill("red");
  // pas de contours pour les formes.
  noStroke();

  // mouseX et mouseY sont des variables globales de p5.js, elles correspondent à la position de la souris
  // on les stocke dans un vecteur pour pouvoir les utiliser avec la méthode seek (un peu plus loin)
  // du vehicule
  target.x = mouseX;
  target.y = mouseY;

  // Dessine un cercle de rayon 32px à la position de la souris
  // la couleur de remplissage est rouge car on a appelé fill(255, 0, 0) plus haut
  // pas de contours car on a appelé noStroke() plus haut
  circle(target.x, target.y, 32);


  vehicules.forEach((vehicule) => {
    // je deplace et dessine le vehicule 
    // je recupere la valeur du slider et je la mets dans le véhicule
    vehicule.maxSpeed = vitesseMaxSlider.value();
    vehicule.applyBehaviors(target);
    vehicule.update();
    vehicule.show();

    if (vehicule.pos.dist(target) < vehicule.r + 16) {
      // si le véhicule est proche de la cible, on le replace à une position aléatoire
      vehicule.pos = createVector(random(width), random(height));
    }
  });

}
