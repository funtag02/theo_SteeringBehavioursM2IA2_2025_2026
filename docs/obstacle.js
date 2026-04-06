class Obstacle extends Vehicle {
    constructor(x, y, r) {
      super(x, y);
      this.pos = createVector(x, y);
      this.r = r;
    }
  
    show() {
      stroke("red");
      strokeWeight(2);
      fill("red");
      push();
      translate(this.pos.x, this.pos.y);
      circle(0, 0, this.r * 2);
      pop();
    }
}