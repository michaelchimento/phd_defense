Y_AXIS = 1;
X_AXIS = 2;
var t;



function preload() {
  img = loadImage('img/greti.png');
}

class Particle{
  constructor(fill, posx, posy, framenum){
    this.color = fill;
    this.color[3]=150;
    this.position = new p5.Vector(posx, posy);
    this.velocity = p5.Vector.random2D().mult(0.5);
    this.maxgrowth = floor(random(10,25));
    this.radius = 0;
    this.birthday = framenum;
    this.deathday = this.maxgrowth + floor(random(50,90));
    this.age = 0;
      }
    
// Custom method for updating the variables
  moveParticle(){
    this.position.add(p5.Vector.random2D().mult(.4));
  }
    
  lifecycle(){
          if (this.age < this.maxgrowth){
              this.radius = this.age;
          }
      else if (this.age >= this.maxgrowth && this.age <= (this.deathday-this.maxgrowth)){
          this.radius = this.maxgrowth
      }
  
      else if (this.age > (this.deathday-this.maxgrowth)){
          this.radius -= 1;
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
  let width = 400;
  print(width)
  let height = 700;
  print(height)
  cnv = createCanvas(width, height);
  var cnvx = (windowWidth - width) / 2;
  var cnvy = (windowHeight - height) / 2;
  cnv.position(cnvx, cnvy);
  background(255, 255, 255);
  frameRate(30)
  
  imageMode(CENTER);

  img.loadPixels();
    
 
}

let particles = []

function draw() {
    
  background(255, 255, 255);
    
  new_particles = floor(random(1,300))
    
    for(let i = 0; i < new_particles; i++){
        if(random() < .5 & particles.length<500){
    let x1 = floor(random(img.width));
    let y1 = floor(random(img.height));
    let pix = img.get(x1, y1);
    if (pix[3]>110){
        particles.push(new Particle(pix,x1,y1,frameCount));
    }
    
    }
    }
    
  
    
    for (let i = 0; i < particles.length; i++){
        if (particles[i].age >= particles[i].deathday){
            particles.splice(i,1)
        }
    }
    
    for (let i = 0; i < particles.length; i++){
        particles[i].age +=1;
        if (particles[i].age < particles[i].deathday){
            particles[i].lifecycle();
            particles[i].moveParticle();
            particles[i].draw();
        }
        
    //print(num_particles + particles.length)
        
  }
}

function windowResized() {
  var cnvx = (windowWidth - width) / 2;
  var cnvy = (windowHeight - height) / 2;
  cnv.position(cnvx, cnvy);
}
