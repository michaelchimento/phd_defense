Y_AXIS = 1;
X_AXIS = 2;

let width = 900;
let height = 700;

let cnv;

class Agent{
  constructor(entering, position){
    this.position = position;
    this.velocity = p5.Vector.random2D().mult(0.8);
    this.size= random(50,70)
    this.flipped = false;
    this.leaving = false;
    this.entering = entering;

    image(img_greti, this.position.x, this.position.y, this.size, this.size);
  }

  // Custom method for updating the variables
  moveParticle() {
    
    if(this.position.x < (width/2-300) || this.position.x > (width/2+300)){
      this.velocity.x*=-1;}
    if(this.position.y < (height/2-250) || this.position.y > (height/2+250)){
      this.velocity.y*=-1;
    }
      
    this.position.add(this.velocity);
  }

  draw(){
    if(this.position.x > (width/2-100) & this.position.x < (width/2+100)){
      this.entering= false;}

    if (!this.leaving & !this.entering){
      this.moveParticle();
      if (this.velocity.x > 0){image(img_greti_rev, this.position.x, this.position.y, this.size, this.size);}
      else {image(img_greti, this.position.x, this.position.y, this.size, this.size)}
      
    }
    else {
      this.position.add(createVector(5,0))
      image(img_greti_rev, this.position.x, this.position.y, this.size, this.size);
    }
    
  }


}

function preload() {
  img_greti = loadImage('img/digigreti.png');
  img_greti_rev = loadImage('img/digigreti_reversed.png');
  img_aviary = loadImage('img/aviary.png');
}

agents = [];
num_agents = 6;

function setup() {
  cnv = createCanvas(width, height);
  var cnvx = (windowWidth - width) / 2;
  var cnvy = (windowHeight - height) / 2;
  cnv.position(cnvx, cnvy);
  background(255, 255, 255);

  imageMode(CENTER);

  image(img_aviary, width/2, height/2,700,700);

  for (let i = 0; i < num_agents; i++) {
      agents[i] = new Agent(false, new p5.Vector(random(width/2 - 200,width/2 + 200), random(height/2 -150,height/2+150)));
    }

      
 
}


function draw() {
  background(255, 255, 255);
  image(img_aviary, width/2, height/2,700,700);
  for (let i = 0; i < agents.length; i++) {
    agents[i].draw();
  }

  if (frameCount%400==0){
    //shuffleArray(agents)
      for(let k = 0; k <2; k++){   
        agents[k].leaving = true;
        append(agents, new Agent(true,new p5.Vector(width/2 - 1000, random(height/2 -150,height/2+150))))
      }

    }

  for (let i = 0; i < agents.length; i++){
        if (agents[i].position.x > width){
            agents.splice(i,1)
        }
    }
}

function windowResized() {
  var cnvx = (windowWidth - width) / 2;
  var cnvy = (windowHeight - height) / 2;
  cnv.position(cnvx, cnvy);
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
