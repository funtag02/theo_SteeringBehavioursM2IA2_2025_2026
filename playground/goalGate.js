class GoalGate extends Obstacle {
    constructor(x1, y1, x2, y2) {
      super(x1, y1, 0, "green"); // Hérite d'Obstacle, mais le rayon est inutile ici
      this.start = createVector(x1, y1); // Premier point de la porte
      this.end = createVector(x2, y2);   // Deuxième point de la porte
      this.color = "green";              // Couleur du segment
      this.crossed = false;              // Indique si la porte a été traversée
    }
  
    show() {
      // Dessiner le segment vert
      push();
      stroke(this.color);
      strokeWeight(4);
      line(this.start.x, this.start.y, this.end.x, this.end.y);

      let gatePostSize = 25; // Taille des points de la porte
  
      // Dessiner les deux cibles (points de la porte)
      fill("white");
      noStroke();
      circle(this.start.x, this.start.y, gatePostSize); // Premier point
      circle(this.end.x, this.end.y, gatePostSize);    // Deuxième point
      pop();
    }
  
    // Vérifie si un véhicule traverse la porte
    checkCrossing(vehicle) {
      // Vérifie si le véhicule est proche du segment
      const d = distToSegment(vehicle.pos, this.start, this.end);
      if (d < vehicle.r) { // Si le véhicule est assez proche
        if (!this.crossed) {
          this.crossed = true; // Marque la porte comme traversée
          return true;         // Retourne vrai pour indiquer un point gagné
        }
      }
      return false;
    }
  }
  
  // Fonction utilitaire pour calculer la distance entre un point et un segment
  function distToSegment(p, v, w) {
    const l2 = p5.Vector.dist(v, w) ** 2;
    if (l2 === 0) return p5.Vector.dist(p, v);
    const t = max(0, min(1, p5.Vector.sub(p, v).dot(p5.Vector.sub(w, v)) / l2));
    const projection = p5.Vector.add(v, p5.Vector.sub(w, v).mult(t));
    return p5.Vector.dist(p, projection);
  }