class Agent{
  constructor(ID){
    this.ID=ID;
    this.position = new p5.Vector(random(0,width), random(0,height));
    this.velocity = p5.Vector.random2D().mult(.5);
    this.r = random(3,11);
    this.m = this.r * 0.1;
    this.color = color(100);
    this.neighbor_vector = [];
    //print(this.x, this.y);

  }

  // Custom method for updating the variables
  moveParticle() {
    if(this.position.x < 0 || this.position.x > width)
      this.velocity.x*=-1;
    if(this.position.y < 0 || this.position.y > height)
      this.velocity.y*=-1;
  }


  // this function creates the connections(lines)
// between particles which are less than a certain distance apart
  connectAgents(agents) {
    agents.forEach(element =>{
    if (this.ID !== element.ID){
      //this.checkCollision(element)
      let dist_ij = dist(this.position.x,this.position.y,element.position.x,element.position.y);
      if(dist_ij < max_dist) {
        //print(element)
        this.neighbor_vector.push(element.ID)
        stroke(0,100);
        //try logging this for a weird effect, slows down the whole sim and all edges get the same weight? not sure whats going on
        strokeWeight(sqrt(1/dist_ij)*3);
        line(this.position.x,this.position.y,element.position.x,element.position.y);
      }
      else if (element.ID in this.neighbor_vector){
        this.neighbor_vector.pop(element.ID)
      }
    }
      
    });
  }

   draw() {
    this.position.add(this.velocity);
    noStroke();
    fill(this.color);
    circle(this.position.x, this.position.y, this.r);
  }
}

function seed() {
  let focal = random(0,num_agents);
}

num_agents = 100;
let agents = [];


function setup() {
  let width=700;
  let height=1000;
  cnv = createCanvas(width, height);
  frameRate(30);
  var cnvx = (windowWidth - width) / 2;
  var cnvy = (windowHeight - height) / 2;
  cnv.position(cnvx, cnvy);



  agent_speed = 1;
  max_dist = 100;


  for (let i = 0; i < num_agents; i++) {
      agents[i] = new Agent(i);
    }
  }

function draw() {
  background(255);

  for (let i = 0; i < num_agents; i++) {
    agents[i].moveParticle();
    agents[i].connectAgents(agents);
    agents[i].draw();
  }


}

function windowResized() {
  var cnvx = (windowWidth - width) / 2;
  var cnvy = (windowHeight - height) / 2;
  cnv.position(cnvx, cnvy);
}
