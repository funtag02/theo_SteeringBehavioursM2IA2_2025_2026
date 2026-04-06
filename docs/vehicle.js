class Vehicle {
  static debug = false;

  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 4;
    this.maxForce = 0.2;
    this.r = 16;

    // pour arrival
    this.rayonZoneDeFreinage = 100;

    // pour comportement wander
    // pour comportement wander
    this.distanceCercle = 150;
    this.wanderRadius = 50;
    this.wanderTheta = -Math.PI / 2;
    this.displaceRange = 0.3;

  }

  // Permet de rester dans les limites d'une zone rectangulaire.
  // Lorsque le véhicule s'approche d'un bord vertical ou horizontal
  // on calcule la vitesse désirée dans la direction "réfléchie" par
  // rapport au bord (comme au billard).
  // Par exemple, si le véhicule s'approche du bord gauche à moins de 
  // 25 pixels (valeur par défaut de la variable d),
  // on calcule la vitesse désirée en gardant le x du vecteur vitesse
  // et en mettant son y positif. x vaut maxSpeed et y vaut avant une valeur
  // négative (puisque le véhicule va vers la gauche), on lui donne un y positif
  // ça c'est pour la direction à prendre (vitesse désirée). Une fois la direction
  // calculée on lui donne une norme égale à maxSpeed, puis on calcule la force
  // normalement : force = vitesseDesiree - vitesseActuelle
  // paramètres = un rectangle (bx, by, bw, bh) et une distance d
  boundaries(bx, by, bw, bh, d) {
    let vitesseDesiree = null;

    const xBordGauche = bx + d;
    const xBordDroite = bx + bw - d;
    const yBordHaut = by + d;
    const yBordBas = by + bh - d;

    // si le véhicule est trop à gauche ou trop à droite
    if (this.pos.x < xBordGauche) {
      // 
      vitesseDesiree = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > xBordDroite) {
      vitesseDesiree = createVector(-this.maxSpeed, this.vel.y);
    }

    if (this.pos.y < yBordHaut) {
      vitesseDesiree = createVector(this.vel.x, this.maxSpeed);
    } else if (this.pos.y > yBordBas) {
      vitesseDesiree = createVector(this.vel.x, -this.maxSpeed);
    }

    if (vitesseDesiree !== null) {
      vitesseDesiree.setMag(this.maxSpeed);
      const force = p5.Vector.sub(vitesseDesiree, this.vel);
      force.limit(this.maxForce);
      return vitesseDesiree;
    }

    if (Vehicle.debug) {
      // dessin du cadre de la zone
      push();

      noFill();
      stroke("white");
      strokeWeight(2);
      rect(bx, by, bw, bh);

      // et du rectangle intérieur avec une bordure rouge de d pixels
      stroke("red");
      rect(bx + d, by + d, bw - 2 * d, bh - 2 * d);

      pop();
    }

    // si on est pas près du bord (vitesse désirée nulle), on renvoie un vecteur nul
    return createVector(0, 0);
  }

  
  wander() {
    // point devant le véhicule, centre du cercle
    let pointDevant = this.vel.copy();
    pointDevant.setMag(this.distanceCercle);
    pointDevant.add(this.pos);

    push();
    if (Vehicle.debug) {
      // on dessine le cercle en rouge
      // on le dessine sous la forme d'une petit cercle rouge
      fill("red");
      noStroke();
      circle(pointDevant.x, pointDevant.y, 8);

      // on dessine le cercle autour
      // Cercle autour du point
      noFill();
      stroke(255);
      circle(pointDevant.x, pointDevant.y, this.wanderRadius * 2);

      // on dessine une ligne qui relie le vaisseau à ce point
      // c'est la ligne blanche en face du vaisseau
      strokeWeight(2);
      // ligne en pointillés
      stroke(255, 255, 255, 80);
      drawingContext.setLineDash([5, 15]);
      stroke(255, 255, 255, 80);
      line(this.pos.x, this.pos.y, pointDevant.x, pointDevant.y);

    }

    // On va s'occuper de calculer le point vert SUR LE CERCLE
    // il fait un angle wanderTheta avec le centre du cercle
    // l'angle final par rapport à l'axe des X c'est l'angle du vaisseau
    // + cet angle
    let theta = this.wanderTheta + this.vel.heading();
    let pointSurLeCercle = createVector(0, 0);
    pointSurLeCercle.x = this.wanderRadius * cos(theta);
    pointSurLeCercle.y = this.wanderRadius * sin(theta);

    // on rajoute ces distances au point rouge au centre du cercle
    pointSurLeCercle.add(pointDevant);

    if (Vehicle.debug) {
      // on le dessine sous la forme d'un cercle vert
      fill("green");
      noStroke();
      circle(pointSurLeCercle.x, pointSurLeCercle.y, 16);

      // on dessine le vecteur qui va du centre du vaisseau
      // à ce point vert sur le cercle
      stroke("yellow");
      strokeWeight(1);
      // pas en pointillés mais une ligne pleine
      drawingContext.setLineDash([]);
      line(this.pos.x, this.pos.y, pointSurLeCercle.x, pointSurLeCercle.y);
    }

    // entre chaque image on va déplacer aléatoirement
    // le point vert en changeant un peu son angle...
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    // D'après l'article, la force est égale au vecteur qui va du
    // centre du vaisseau, à ce point vert. On va aussi la limiter
    // à this.maxForce
    // REMPLACER LA LIGNE SUIVANTE !
    let force = p5.Vector.sub(pointSurLeCercle, this.pos);
    // On met la force à maxForce
    force.setMag(this.maxForce);

    pop();

    // et on la renvoie au cas où....
    return force;
  }

  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);
    return pursuit;
  }

  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    fill(0, 255, 0);
    circle(target.x, target.y, 16);
    return this.seek(target);
  }

  arrive(target, d=0) {
    // 2nd argument true enables the arrival behavior
    // 3rd argument d is the distance behind the target
    // for "snake" behavior
    return this.seek(target, true, d);
  }

  flee(target) {
    // recopier code de flee de l'exemple précédent
    // inverse de seek !
    return this.seek(target).mult(-1);
  }

  seek(target, arrival = false, d=0) {
    let valueDesiredSpeed = this.maxSpeed;

    if (arrival) {
      // On définit un rayon de freinage de n pixels autour de la cible
      // si la distance entre le véhicule courant et la cible
      // est inférieure à ce rayon, on ralentit le véhicule
      // desiredSpeed devient inversement proportionnelle à la distance
      // si la distance est petite, force = grande
      // Vous pourrez utiliser la fonction P5 
      // v = map(valeur, valeurMin, valeurMax, nouvelleValeurMin, nouvelleValeurMax)
      // qui prend une valeur entre valeurMin et valeurMax et la transforme en une valeur
      // entre nouvelleValeurMin et nouvelleValeurMax

      // 1 - dessiner le cercle de rayon 100 autour de la target
      if (Vehicle.debug) {
        push();
        stroke(255, 255, 255);
        noFill();
        circle(target.x, target.y, this.rayonZoneDeFreinage);
        pop();
      }

      // 2 - calcul de la distance entre la cible et le véhicule
      let distance = p5.Vector.dist(this.pos, target);

      // 3 - si distance < rayon du cercle, alors on modifie desiredSPeed
      // qui devient inversement proportionnelle à la distance.
      // si d = rayon alors desiredSpeed = maxSpeed
      // si d = 0 alors desiredSpeed = 0
      if (distance < this.rayonZoneDeFreinage) {
        valueDesiredSpeed = map(distance, d, this.rayonZoneDeFreinage, 0, this.maxSpeed);
      }
    }

    // Ici on calcule la force à appliquer au véhicule
    // pour aller vers la cible (avec ou sans arrivée)
    // un vecteur qui va vers la cible, c'est pour le moment la vitesse désirée
    let desiredSpeed = p5.Vector.sub(target, this.pos);
    desiredSpeed.setMag(valueDesiredSpeed);
   
    // Force = desiredSpeed - currentSpeed
    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  avoid(obstacles) {
    // TODO


    // il regarde par exemple 20 frames devant lui
    let ahead = this.vel.copy()
    ahead.mult(30);
    if (Vehicle.debug)
      // on le dessine avec ma méthode this.drawVector(pos vecteur, color)
      this.drawVector(this.pos, ahead, "yellow");

    // on calcule la distance entre le point au bout du vecteur ahead
    // et le centre de l'obstacle le plus proche
    let pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);

    if (Vehicle.debug) {
      // on dessine le point pour vérifier
      push()
      fill("red");
      circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 10);
      pop();
    }
    // 1 - on duplique le vecteur vitesse
    // calcul d'un vecteur ahead devant le véhicule
    // ahead2 est deux fois plus petit
    let ahead2 = this.vel.copy()
    ahead2.mult(15);
    if (Vehicle.debug) {
      // on le dessine avec ma méthode this.drawVector(pos vecteur, color)
      this.drawVector(this.pos, ahead2, "purple");
    }
    // on calcule la distance entre le point au bout du vecteur ahead
    // et le centre de l'obstacle le plus proche
    let pointAuBoutDeAhead2 = p5.Vector.add(this.pos, ahead2);
    if (Vehicle.debug) {
      // on dessine le point pour vérifier
      push()
      fill("lightblue");
      circle(pointAuBoutDeAhead2.x, pointAuBoutDeAhead2.y, 10);
      pop();

      // on dessine la zone d'évitement
      push()
      stroke(255, 50)
      strokeWeight(this.largeurZoneEvitementDevantVaisseau * 2)
      line(this.pos.x, this.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y)
      pop()
    }
    // On cherche l'obstacle le plus proche
    let obstacleLePlusProche = this.getObstacleLePlusProche(obstacles);

    // on regarde aussi le vehicule le plus proche
    let vehiculeLePlusProche = this.getVehiculeLePlusProche(vehicules)
    let distance4 = 1000000;

    /*
    if (vehiculeLePlusProche !== undefined) {
      // on calcule la distance4 entre le vaisseau et
      // ce vehicule
      distance4 = this.pos.dist(vehiculeLePlusProche.pos);
    }
*/
    let distance = obstacleLePlusProche.pos.dist(pointAuBoutDeAhead);
    let distance2 = obstacleLePlusProche.pos.dist(pointAuBoutDeAhead2);
    let distance3 = obstacleLePlusProche.pos.dist(this.pos);

    let pointLePlusProche = pointAuBoutDeAhead;

    if (distance2 < distance) {
      distance = distance2;
      pointLePlusProche = pointAuBoutDeAhead2
    }

    if (distance3 < distance) {
      distance = distance3;
      pointLePlusProche = this.pos;
    }
    if (distance4 < distance) {
      // on a bien un vaisseau qui est plus près que l'obstacle le plus proche
      if (distance4 < 2 * this.r) {
        // il y a collision, on calcule la force
        let force = p5.Vector.sub(this.pos, vehiculeLePlusProche.pos);

        if (Vehicle.debug)
          this.drawVector(vehiculeLePlusProche.pos, force, "yellow");

        force.setMag(this.maxForce);
        return force;

      }
    } else {
      if (distance < obstacleLePlusProche.r + this.largeurZoneEvitementDevantVaisseau) {
        // on calcule le vecteur qui part du centre du cercle et qui va
        // jusqu'au point au bout de ahead
        let force = p5.Vector.sub(pointLePlusProche, obstacleLePlusProche.pos);

        if (Vehicle.debug)
          this.drawVector(obstacleLePlusProche.pos, force, "yellow");

        force.setMag(this.maxForce/2);
        return force;
      }
    }
    return createVector(0, 0);
  }

  getObstacleLePlusProche(obstacles) {
    let plusPetiteDistance = 100000000;
    let obstacleLePlusProche = undefined;

    obstacles.forEach(o => {
      // Je calcule la distance entre le vaisseau et l'obstacle
      const distance = this.pos.dist(o.pos);

      if (distance < plusPetiteDistance) {
        plusPetiteDistance = distance;
        obstacleLePlusProche = o;
      }
    });

    return obstacleLePlusProche;
  }

  getVehiculeLePlusProche(vehicules) {
    let plusPetiteDistance = Infinity;
    let vehiculeLePlusProche = undefined;

    vehicules.forEach(v => {
      if (v != this) {
        // Je calcule la distance entre le vaisseau et le vehicule
        const distance = this.pos.dist(v.pos);
        if (distance < plusPetiteDistance) {
          plusPetiteDistance = distance;
          vehiculeLePlusProche = v;
        }
      }
    });

    return vehiculeLePlusProche;
  }


  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  show() {
    
    stroke(255);
    strokeWeight(2);
    fill(255);
    stroke(0);
    strokeWeight(2);
    push();
    translate(this.pos.x, this.pos.y);
    // if(this.vel.mag() > 0.2)
    rotate(this.vel.heading());

    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
    pop();
    /*
   push();
   // on dessine le vehicule comme un cercle
   fill("blue");
   stroke("white");
   strokeWeight(2);
   translate(this.pos.x, this.pos.y);
   circle(0, 0, this.r * 2);  
   pop();
   */
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}