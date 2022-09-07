Y_AXIS = 1;
X_AXIS = 2;
var t;

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

class Particle{
  constructor(fill, posx, posy, framenum){
    this.color = fill;
    this.position = new p5.Vector(posx, posy);
    this.velocity = p5.Vector.random2D().mult(0.5);
    this.maxgrowth = floor(random(7,12));
    this.radius = 0;
    this.birthday = framenum;
    this.deathday = this.maxgrowth + floor(random(50,90));
    this.age = 0;
    this.death_flag = false;
      }
    
// Custom method for updating the variables
  moveParticle(){
    this.position.add(p5.Vector.random2D().mult(.2));
  }
    
  lifecycle(){
      if (this.age < this.maxgrowth){
              this.radius = this.age;
          }

      else if (this.death_flag){
          this.radius -= 1;
      }
      else if (this.age >= this.maxgrowth){
          this.radius = this.maxgrowth
      }
  

      
      else{print("wtf")}
    }
      
   draw(){
    noStroke();
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.radius,this.radius);

  }

}

var cnv;

function setup() {
  let width = 500;
  let height = 500;
  cnv = createCanvas(width, height);
  var cnvx = (windowWidth - width) / 2;
  var cnvy = (windowHeight - height) / 2;
  //cnv.position(cnvx, cnvy);
  background(255, 255, 255);
  frameRate(30)
 
}

let particles = [[],[],[],[],[],
[],[],[],[],[],
[],[],[],[],[],
[],[],[],[],[],
[],[],[],[],[]]

let turnover_rate = [20, 20, 20 , 20, 20,
40, 40, 40 , 40, 40,
60, 60, 60 , 60, 60,
80, 80, 80 , 80, 80,
120, 120, 120 , 120, 120]

let turnover_magnitude = [1,2,3,4,5,
1,2,3,4,5,
1,2,3,4,5,
1,2,3,4,5,
1,2,3,4,5]

let bounds = [
[50, 50], [150, 50],[250, 50],[350, 50],[450, 50],
[50, 150], [150, 150],[250, 150],[350, 150],[450, 150],
[50, 250], [150, 250],[250, 250],[350, 250],[450, 250],
[50, 350], [150, 350],[250, 350],[350, 350],[450, 350],
[50, 450], [150, 450],[250, 450],[350, 450],[450, 450]]

function draw() {
    
  background(255, 255, 255);
    
  new_particles = 10

  for(let j = 0; j < 25; j++){
    for(let i = 0; i < new_particles; i++){
      if(particles[j].length<10){
        let x1 = bounds[j][0] + random(-25,25);
        let y1 = bounds[j][1] + random(-25,25);
        let pix = color(0,0,0,100);
        particles[j].push(new Particle(pix,x1,y1,frameCount));
      }
    }

    if(frameCount % turnover_rate[j] === 0){
      shuffleArray(particles[j])
      for(let k = 0; k < turnover_magnitude[j]; k++){   
        particles[j][k].death_flag = true;
      }
      
    }

    for (let i = 0; i < particles[j].length; i++){
        if (particles[j][i].radius<=0 & particles[j][i].death_flag){
            particles[j].splice(i,1)
        }
    }

    for (let i = 0; i < particles[j].length; i++){
      particles[j][i].age +=1;
      particles[j][i].lifecycle();
      particles[j][i].moveParticle();
      particles[j][i].draw();
    }

  }

  strokeWeight(1);
  noStroke();
  fill(0)
  textSize(15);
  text( "Turnover magnitude --->", 200, 490)
  

  push();
  let angle2 = radians(270);
  translate(12, 300);
  rotate(angle2);
  // Draw the letter to the screen
  text("Turnover tempo --->", 0, 0);
  line(0, 0, 150, 0);
  pop();

}

function windowResized() {
  var cnvx = (windowWidth - width) / 2;
  var cnvy = (windowHeight - height) / 2;
  cnv.position(cnvx, cnvy);
}
