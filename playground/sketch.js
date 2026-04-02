let target;
let vehicles = [];
let points = [];
let obstacles = [];
let gates = [];
let snakeLength;
let rayon = 16; // va redéfinir la taille des véhicules (seulement ceux qu'on dirige, pas les autres entités)
let obstacleMinHeight, obstacleMaxHeight, obstacleMinWidth, obstacleMaxWidth;

// Appelée avant de démarrer l'animation
function preload() {
  // en général on charge des images, des fontes de caractères etc.
  font = loadFont('./assets/inconsolata.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  snakeLength = 2;
  nbObstacles = 3;
  nbGates = 4; 
  // si on traverse une porte et qu'on gagne un point, on augmente le nombre de véhicules du snake de 1, et on crée une nouvelle porte à un endroit aléatoire 

  // valeurs par copilot
  obstacleMinHeight = height / 4;
  obstacleMaxHeight = height - height / 4;
  obstacleMinWidth = width / 4;
  obstacleMaxWidth = width - width / 4;

  // La cible, ce sera la position de la souris
  target = createVector(random(width), random(height));
  creerObstacles(nbObstacles);
  creerGates(nbGates); // doit être appelé après la création des obstacles pour éviter les collisions avec des obstacles
  // on cree des vehicules, autant que de points
  creerVehicules(snakeLength);

  // points = font.textToPoints("Master 2 IA2", width / 2 - 200, height / 2 + 50, 128, { "sampleFactor": 0.15 });
}

function creerObstacles(n) {
  const minDistance = height / 4; // Distance minimale entre les obstacles

  for (let i = 0; i < n; i++) {
    let x, y, r;
    let valid = false;

    while (!valid) {
      // Générer un obstacle avec des coordonnées aléatoires
      x = random(width);
      y = random(height);
      r = random(20, 50); // Rayon aléatoire pour l'obstacle

      valid = true;

      // Vérifier la distance avec les autres obstacles
      for (let obstacle of obstacles) {
        const distance = dist(x, y, obstacle.pos.x, obstacle.pos.y);
        if (distance < minDistance + r + obstacle.r) {
          valid = false;
          break;
        }
      }
    }

    // Ajouter l'obstacle au tableau
    obstacles.push(new Obstacle(x, y, r));
  }
}

function creerVehicules(n) {
  for (let i = 0; i < n; i++) {
    let v = new Vehicle(random(width), random(height));
    vehicles.push(v);
    v.r = rayon;
  }
}

function creerGates(n) {
  const minDistanceBetweenGates = width / 4; // Distance minimale entre les gates
  const minDistanceFromObstacles = width / 10; // Distance minimale entre une gate et un obstacle
  // const maxDistanceFromObstacles = width / 4; // Distance maximale entre une gate et un obstacle

  const vehicleWidth = 16;
  const minGateWidth = vehicleWidth * 4;

  console.log(rayon);

  for (let i = 0; i < n; i++) {
    let x1, y1, x2, y2;
    let valid = false;

    let attempts = 0;
    while (!valid && attempts < 400) {
      attempts++;

      // Générer le premier point dans une zone large
      x1 = random(width / 4, (3 * width) / 4);
      y1 = random(height / 4, (3 * height) / 4);

      // Générer le deuxième point avec une distance plus grande pour élargir la gate
      x2 = x1 + random(-width / 6, width / 6);
      y2 = y1 + random(-height / 6, height / 6);

      const gateWidth = dist(x1, y1, x2, y2);

      if (gateWidth < minGateWidth) {
        continue; // si jamais la gate est trop petite
      }

      valid = true;

      // Vérifier la distance avec les autres gates
      for (let gate of gates) {
        const gateCenter = createVector((gate.start.x + gate.end.x) / 2, (gate.start.y + gate.end.y) / 2);
        const newGateCenter = createVector((x1 + x2) / 2, (y1 + y2) / 2);

        if (p5.Vector.dist(gateCenter, newGateCenter) < minDistanceBetweenGates) {
          valid = false;
          break;
        }
      }

      // Vérifier la distance avec les obstacles
      for (let obstacle of obstacles) {
        const newGateCenter = createVector((x1 + x2) / 2, (y1 + y2) / 2);
        const distanceToObstacle = p5.Vector.dist(newGateCenter, obstacle.pos);

        // if (distanceToObstacle < minDistanceFromObstacles || distanceToObstacle > maxDistanceFromObstacles) {
        // AVANT (impossible) :
        // if (distanceToObstacle < minDistanceFromObstacles || distanceToObstacle > maxDistanceFromObstacles)
        
        // APRÈS : on exige seulement que la gate ne soit pas sur un obstacle
        if (distanceToObstacle < minDistanceFromObstacles) {
          valid = false;
          break;
        }
      }
    }

    if (attempts >= 400) {
      console.warn("Impossible de placer une gate après 400 tentatives.");
      break;
    }

    // Ajouter la gate au tableau
    gates.push(new GoalGate(x1, y1, x2, y2));
  }
}
// appelée 60 fois par seconde
function draw() {
  // couleur pour effacer l'écran
  background("black");
  //background(0);
  // pour effet psychedelique
  // background(0, 0, 0, 10);

  target.x = mouseX;
  target.y = mouseY;

  console.log(obstacles.length);

  /*
  points.forEach((point) => {
    ellipse(point.x, point.y, 6);
  });
  */

  obstacles.forEach((obstacle, index) => {
    //console.log("obstacle n°" + index + " x: " + obstacle.pos.x + " y: " + obstacle.pos.y);
    // obstacle.update();
    // obstacle.edges();
    obstacle.show();
  });

  gates.forEach( (gate, index) => {
    // gate.edges();
    gate.show();
  });

  /*
  // dessin de la cible à la position de la souris
  push();
  fill(255, 0, 0);
  noStroke();
  ellipse(target.x, target.y, 32);
  pop();
  */

  // les véhicules bougent aléatoirement, et évitent les obstacles

  vehicles.forEach((vehicle, index) => {

    if (index != 0) {
      steeringForce = vehicle.arrive(vehicles[index-1].pos, 40);
    } else {
      // le premier véhicule suit la souris avec arrivée
      steeringForce = vehicle.arrive(target, 0);
    }
       vehicle.applyForce(steeringForce);
       vehicle.update();
      vehicle.show();
  });

}

function keyPressed() {
  if (key === 'd') {
    Vehicle.debug = !Vehicle.debug;
  } 
}