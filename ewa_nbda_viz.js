
//define colors from mariana sublime theme
mar_black = [0, 0, 0];
mar_blue = [210, 50, 60];
mar_blue2 = [209, 13, 35];
mar_blue3 = [210, 15, 24];
mar_blue4 = [210, 13, 45];
mar_blue5 = [180, 36, 54];
mar_blue6 = [221, 12, 69];
mar_green = [114, 31, 68];
mar_grey = [0, 0, 20];
mar_orange = [32, 93, 66];
mar_orange2 = [32, 85, 55];
mar_orange3 = [40, 94, 68];
mar_pink = [300, 30, 68];
mar_red = [357, 79, 65];
mar_red2 = [13, 93, 66];
mar_white = [0, 0, 100];
mar_white2 = [0, 0, 97];
mar_white3 = [219, 28, 88];

function softmax(logits) {
    const maxLogit = Math.max(...logits);
    const scores = logits.map(l => Math.exp(l - maxLogit));
    const denom = scores.reduce((a, b) => a + b);
    return scores.map(s => s / denom);
}

function *enumerate(array) {
   for (let i = 0; i < array.length; i += 1) {
      yield [i, array[i]];
   }
}

// generate cumulative distribution function from weights
function cdf(weights) {
    // calculate total
    var total = 0;
    for(var i=0; i<weights.length; i++) {
        total += weights[i];
    }
    // generate CDF, normalizing with total
    var cumul = [];
    cumul[0] = weights[0]/total;
    for(i=1; i<weights.length; i++) {
        cumul[i] = cumul[i-1] + (weights[i]/total);
    }
    return cumul;
}

// pick the index using the random value
function selectInd(cumul,rand) {
    for(var i=0; (i < cumul.length) && (rand > cumul[i]); ++i) {};
    return i;
}

class Agent{
  constructor(ID){
    this.ID=ID;
    this.position = new p5.Vector(random(225,width-70), random(45,height-90));
    this.velocity = p5.Vector.random2D().mult(0.5);
    this.r_const = random(15,25);
    this.r = this.r_const;
    this.color = color(...mar_white2);
    this.neighbor_vector = [];
    this.naive = true;
    this.repertoire = [{name: "a", Evec: 0, Ivec: 0, Svec: 0, Pvec: 0}]; //name Evec Ivec Svec Pvec
    this.rho = 0.5;
    this.alpha = 1;
    print(this.alpha);
    this.production_memory = [];
    this.production_frame;
    this.learned_b=0;
    this.produced_b=0;
  }
  
  Evec_update(produced_behavior){
    var reward = 1;
    let new_Evec;
    this.repertoire.forEach(element => {
      if (element.name === produced_behavior){
        new_Evec = (1 - this.rho) * element.Evec + this.rho * reward;
    }
    else {
        new_Evec = (1 - this.rho) * element.Evec;
    }
    element.Evec = new_Evec;
  });
  }
  
  Ivec_update(){
    var alpha=this.alpha;
    var Evec_by_alpha = this.repertoire.map( function (element){ return element.Evec * alpha});
    var Ivec = softmax(Evec_by_alpha);
    this.repertoire.forEach(function callback(element,index){element.Ivec = Ivec[index]})
  }
  
  produce_behavior(){
    var names = this.repertoire.map( function (element){ return element.name});
    var Pvec = this.repertoire.map( function (element){ return element.Ivec});
    var dist = cdf(Pvec)
    var dice = Math.random(); // 0 : 1
    var produced_behavior = names[selectInd(dist,dice)];
    if (produced_behavior=="b" & this.produced_b==0){
      num_produced_b +=1;
      this.produced_b=num_produced_b;
      
    }
    return produced_behavior;
  }
  
  production_submodel(){
    var produced_behavior = this.produce_behavior();
    this.Evec_update(produced_behavior);
    this.Ivec_update()
    this.production_memory.push(produced_behavior);
    this.production_frame = frameCount;
    return produced_behavior
  }
  
  trim_production_memory(){
    if (this.production_memory.length < 25) {
    } 
    else{
        this.production_memory.shift();
    }
    if (this.production_memory.length >= 25) { print("memory window not respected")}
  }

  seeded(){
    this.repertoire.push({name: "b", Evec: 0, Ivec: 0, Svec: 0, Pvec: 0})
    this.naive = false;
    num_know_b += 1;
    this.learned_b = num_know_b;
  }
  
  viz_behavior(){
    if ( this.production_memory[this.production_memory.length-1] == "a" ){
      noFill();
      strokeWeight(3);
      
      if(frameCount - this.production_frame < 20){
        stroke(...mar_red, (20 - (frameCount-this.production_frame)) / 20);
        arc(this.position.x, this.position.y, this.r_const + 10, this.r_const + 10, PI, TWO_PI);
      }
      
    }
    
    else if ( this.production_memory[this.production_memory.length-1] == "b" ){
      noFill();
      strokeWeight(3);
      
      if(frameCount - this.production_frame < 20){
      stroke(...mar_green, (20 - (frameCount-this.production_frame)) / 20);
      arc(this.position.x, this.position.y, this.r_const + 10, this.r_const + 10, PI, TWO_PI);
    }

    }
  }

  acquire(behavior){
    //sum knowledgable neighbors
    let sum_knowledgable = 0;
    this.neighbor_vector.forEach(element =>{
        agents[element].repertoire.forEach(entry =>{
            if (entry.name === behavior){
                sum_knowledgable += 1 * agents[element].production_memory.filter(x => x == behavior).length / agents[element].production_memory.length;
            }
        })
    }
    )

    let taizt = 0;

    if (rule=="sum"){
      taizt = sum_knowledgable
    }
    
    else {
      console.log("unknown transmission rule")
    }

    //base_rate * (s * num_know + asocial learning)
    let acq_rate = .5 * 1 * taizt;

    let acq_prob = 1 - exp( - acq_rate);

    let dice_roll = random(0,1);

    if (dice_roll < acq_prob){
      this.repertoire.push({name: behavior, Evec: 0, Ivec: 0, Svec: 0, Pvec: 0});
      this.naive = false;
      num_know_b += 1;
      this.learned_b = num_know_b;
    }

  }

  // Custom method for updating the variables
  moveParticle() {
    if(this.position.x < 0 || this.position.x > width){
      this.velocity.x*=-1;}
    if(this.position.y < 0 || this.position.y > height){
      this.velocity.y*=-1;
    }
      
    this.position.add(p5.Vector.random2D().mult(.4));
  }


  // this function creates the connections(lines)
// between particles which are less than a certain distance apart
  connectAgents(agents) {
    agents.forEach(element =>{
    if (this.ID !== element.ID){
      var dice = random();
      if (dice < .20){
        if (!this.neighbor_vector.includes(element.ID)){
          this.neighbor_vector.push(element.ID)
        }
        if (!element.neighbor_vector.includes(this.ID)){
          element.neighbor_vector.push(this.ID)
        }
      var dist_ij = dist(this.position.x,this.position.y,element.position.x,element.position.y);
      stroke(...mar_white);
        //try logging this for a weird effect, slows down the whole sim and all edges get the same weight? not sure whats going on
        strokeWeight(1);
        line(this.position.x,this.position.y,element.position.x,element.position.y);
      }
  }})
  }

drawEdges(agents) {
    agents.forEach(element =>{
    if (this.ID !== element.ID && this.neighbor_vector.includes(element.ID)){
      var dist_ij = dist(this.position.x,this.position.y,element.position.x,element.position.y);
      stroke(...mar_black);
        //try logging this for a weird effect, slows down the whole sim and all edges get the same weight? not sure whats going on
        strokeWeight(1);
        line(this.position.x,this.position.y,element.position.x,element.position.y);
      }
  })}

showOrders(){
  strokeWeight(.5);
  stroke(color(...mar_white))
  fill(...mar_white)
  textSize(13);
  text( "Oa= " + this.learned_b + "; Op= " + this.produced_b, this.position.x-25, this.position.y-15)
}

draw() {
    strokeWeight(0.75)

    fill(...mar_blue2);
    strokeWeight(0.75);
    stroke(this.color);
    circle(this.position.x, this.position.y, this.r);

    if (this.repertoire.length === 1){
      fill(...mar_red);
      arc(this.position.x, this.position.y, this.r_const, this.r_const, 0, PI);
    }
    else if (this.repertoire.length === 2) {
      noStroke();
      fill(...mar_green);
      arc(this.position.x, this.position.y, this.r_const, this.r_const, PI, TWO_PI);
      fill(...mar_red);
      arc(this.position.x, this.position.y, this.r_const, this.r_const, 0, PI);
    }
    
    this.viz_behavior()
    this.trim_production_memory()

  }
}



function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
}

function windowResized() {
  centerCanvas();
}

let num_agents = 16;
let agents = [];
var cnv;

//sum, proportional, threshold, conformity
let rule="sum";
var num_know_b = 0;
var num_produced_b = 0;

W = 800;
H = 600;

let flag;

let data_y = [];
let data_x = [];

let example_agent;


function setup() {
  colorMode(HSL);
  cnv=createCanvas(W, H);

  centerCanvas();
  frameRate(30);

  agent_speed = 1;
  max_dist = 75;

  for (let i = 0; i < num_agents; i++) {
      agents[i] = new Agent(i);
    }

  for (let i = 0; i < num_agents; i++) {
      agents[i].connectAgents(agents)
    }

  example_agent = new Agent(25)
  example_agent.position.x = 100
  example_agent.position.y = 300
  example_agent.repertoire = [{name : "a", Evec: 0, Ivec: 0, Svec: 0, Pvec: 0}, {name : "b", Evec: 0, Ivec: 0, Svec: 0, Pvec: 0}]
  example_agent.r_const = 100

  }



function draw() {
  background(...mar_blue2);

  example_agent.draw();
  example_agent.moveParticle();
  if (frameCount% 30 ==0 ){
      var produced_behavior = example_agent.production_submodel();
  }

  strokeWeight(.5);
  stroke(...mar_black);
  fill(...mar_black)
  textSize(15);
  text( "fill: repertoire", example_agent.position.x-40+random(-.5,.5), example_agent.position.y+5+random(-.5,.5))
  text( "arc:", example_agent.position.x-10, example_agent.position.y-70)
  text( "behavioral production", example_agent.position.x-60, example_agent.position.y-60)
  textSize(30);
  stroke(...mar_orange2);
  fill(...mar_orange2)
  text( "Agent", example_agent.position.x-40+random(-.5,.5), example_agent.position.y-100+random(-.5,.5))
  stroke(...mar_orange);
  fill(...mar_orange)
  text( "Agent", example_agent.position.x-40+random(-.5,.5), example_agent.position.y-100+random(-.5,.5))

  textSize(15);
  stroke(...mar_red);
  fill(...mar_red)
  text( "Established behavior", example_agent.position.x-60, example_agent.position.y+75)
  stroke(...mar_green);
  fill(...mar_green)
  text( "Novel behavior", example_agent.position.x-60, example_agent.position.y+90)

  if(num_produced_b < num_agents){
    for (let i = 0; i < num_agents; i++) {
      agents[i].drawEdges(agents);
      if (agents[i].repertoire.length > 0){
        var dice = random();
        if (dice < .05){
            var produced_behavior = agents[i].production_submodel();
        }
        else{ var produced_behavior = "c";}
      }

    }
  
  
  for (let i = 0; i < num_agents; i++){
    agents[i].draw();
    agents[i].moveParticle();
    if (agents[i].repertoire.length < 2){
        var repertoire = agents[i].repertoire.map( function (element){ return element.name});
        ["a","b"].forEach(behavior =>{if (!repertoire.includes(behavior)){agents[i].acquire(behavior);}})
    } 
  }
  
  strokeWeight(1);

  stroke(...mar_white2);
  fill(...mar_white2)
  textSize(25);
  text( "Risk-neutral agents", 225, height-75)

  stroke(color(...mar_pink));
  fill(...mar_pink)
  textSize(20);
  var percentage = 100*num_know_b/num_agents
  text( percentage.toFixed(1) + "% have acquired knowledge of novel behavior", 225, height-55)

  var percentage_2 = 100*num_produced_b/num_agents
  text( percentage_2.toFixed(1) + "% have produced the novel behavior", 225, height-30)


  if (frameCount===1){
    capturer.start()
  }

  if (frameCount===30){
    seed = floor(random(0,num_agents))
    console.log(seed)
    agents[seed].seeded();
  }

  }

  else{
    if (!flag){
      flag = frameCount;
    }
  


  for (let i = 0; i < num_agents; i++){
    agents[i].drawEdges(agents);
    
  }

  for (let i = 0; i < num_agents; i++){
    agents[i].draw();
    agents[i].moveParticle();
    agents[i].showOrders();
  }

  let oA = []
  let oP = []

  agents.forEach(element =>{
    oA.push(element.learned_b)
    oP.push(element.produced_b)
  })

  vec = oA.map(function(item, index){ return Math.abs(item - oP[index])})

  var total = 0;

  for (let i = 0; i < vec.length; i++) {
    total += vec[i];
  }

  divergence = 1/(num_agents-1) * total;

  strokeWeight(1);
  stroke(...mar_white2);
  fill(...mar_white2)
  textSize(25);
  text( "Risk-neutral agents", 225, height-75)

  stroke(color(...mar_pink))
  fill(...mar_pink)
  textSize(20);
  text("Divergence score: " +  divergence.toFixed(2), 225, height-55)

  }

capturer.capture(canvas)
  
if (frameCount==(flag+240)){
  
    }  

}