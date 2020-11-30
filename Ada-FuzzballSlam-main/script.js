"use strict";

var vp_width = 920, vp_height = 690;//declare variables to hold the viewport size
var max_crates = 3;

//declare global variables to hold the framework objects
var viewport, world, engine, body, elastic_constraint;

var crate = []; //create an empty array that will be used to hold all the crate instances
var ground;
var leftwall;
var rightwall;

var fuzzball;
var launcher;
// declare obstacle
var obstacle;

//variables related to the images
var imgBackground;
var imgLauncher;
var imgCrate;
var imgFuzzball;

//musical variables
var music;
var hit;
var button;

// variables to calculate during the game
var score = 0;
var lives = 3;
var displayScore = false;
var countGround = 0;
// var timer;

// variable to keep track of the state of the game
var gameState = 'start';
var level = 1;


function apply_velocity() {
	Matter.Body.setVelocity( fuzzball.body, {x: get_random(0, 20), y: get_random(0, 20)*-1});
};

function apply_angularvelocity() {
	for (let i = 0; i < crate.length; i++ ){
		Matter.Body.setAngularVelocity( crate[i].body, Math.PI/get_random(3, 20));
	}	
};

function apply_force() {
	for (let i = 0; i < crate.length; i++) {
		Matter.Body.applyForce( crate[i].body, {
			x: crate[i].body.position.x,
			y: crate[i].body.position.y
		}, {
			x: 0.05,
			y: get_random(50, 200)*-1
		});
	}	
};

function get_random(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min) // the max is exclusive and the min is inclusive
}

function hittrack() { // this won't work until we associate it with a collision event
	hit.setVolume(0.2);
	if(hit.isPlaying()) {
		hit.stop();
		hit.play();
	} else {
		hit.play();
	}
}

function audiotrack() { 
	if (music.isPlaying() == true) {
		console.log("stopping audio");
		music.stop();
	} else if (music.isPlaying() == false) {
		console.log("starting audio");
		music.play();
	}
}	

function preload() {
	//Load background
	imgBackground = loadImage("https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/SlamBackground920x690.png");	

	//music/audio
	music = loadSound("https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/AmbientLoop.mp3");
	hit = loadSound("https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Hit.mp3");
}

function setup() {
	//this p5 defined function runs automatically once the preload function is done
	viewport = createCanvas(vp_width, vp_height); // set the viewport (canvas) size
	viewport.parent("viewport_container"); // move the canvas so it's inside the target div
	
	// will reset when clicking a button
	reset_sketch();	
	// var button_reset = createButton("reset");
	// button_reset.mousePressed(reset_sketch); // when clicking button_reset the function resetScketch will run
}

function reset_sketch(){
	// load images
	imgLauncher = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Launcher146x108.png');
	imgCrate = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Crate120x120.png');       
	imgFuzzball = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Fuzzball60x60.png');          

	//enable the matter engine
	engine = Matter.Engine.create();
	world = engine.world;
	body = Matter.Body;	


	// enable the 'matter' mouse controller and attach it to the viewport object using p5s elt property
	// stops user from pulling outside the fuzzball
	let vp_mouse = Matter.Mouse.create(viewport.elt);
	vp_mouse.pixelRatio = pixelDensity(); // update the pixel ratio with the p5 density value this supports
	//retina screens, etc
	let options = {
		mouse: vp_mouse,
		collisionFilter: {
			mask: Category1
		}				
	}

	// see docs on https://brm.io/matter-js/docs/classes/Constraint.html#properties
	elastic_constraint = Matter.MouseConstraint.create(engine, options);
	Matter.World.add(world, elastic_constraint); // add the elastic constraint object to the world
	
	ground = new c_ground(vp_width/2, vp_height+50, vp_width, 175); // create a ground object
	leftwall = new c_ground(-88, vp_height/2, 175, vp_height);
	rightwall = new c_ground(vp_width+88, vp_height/2, 175, vp_height);

	fuzzball = new c_fuzzball(250, vp_height-150, 60, imgFuzzball); // create a fuzzball object

	//create audio on/off button
	button = createImg("https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Universal_(103).png");
	button.position(50, vp_height/2 - 275);
	button.size(50, 50);
	button.mousePressed(audiotrack);
	//rect(x, y, w, h, 10)

	//create a launcher object using the fuzzball body
	launcher = new c_launcher(250, vp_height-150, fuzzball.body, imgLauncher);
	
	//loop through each of the crate indexes
	for(let i = 0; i < max_crates; i++) { //loop for each instance of a crate
		// last crate in the array is the crate at the bottom of the pile of crates to start the game
		// so lets set that one to "hitGround = true" before checking for collisions
		if (i == max_crates - 1){
			crate[i] = new c_crate(get_random(680, 710), (150*i)-300, 120, 120, imgCrate);
			crate[i].hitGround ='True';
			countGround += 1; // tracking the number of crate that have hit the floor
		}
		else {
			crate[i] = new c_crate(get_random(680, 710), (150*i)-300, 120, 120, imgCrate);
		}				
	} 
	
	// create an obstacle
	if (level > 1){
		obstacle = new c_obstacle(get_random(400, 500), get_random(400, 450), 50, 20);
	}
	frameRate(60);
};


function paint_background() {
	// access the game object for the world, use this as a background image for the game
	background(imgBackground);

	ground.show(); // execute the show function for the boundary objects
	leftwall.show();
	rightwall.show();
	button.show();
}


function paint_assets() {
	
	for (let i = 0; i < crate.length; i++){ // Loop through the crate array and show each
		crate[i].show()
	}

	launcher.show();  //show the launcher 
	fuzzball.show(); //show the fuzzball
	button.show(); //shows the on/off button for music 
	game_text();	// shows score, level and lifes
	// add obstacle from level 2
	if (level > 1){
		obstacle.show();				
	}
}

function draw() {
	//this p5 defined function runs every refresh cycle
	paint_background(); // paint the default background 
	
	Matter.Engine.update(engine); // run the matter engine update
	// check game status
	// if game status is "start" it will tell the player to start playing	
	if(gameState === 'start'){		
		text_start();				
		}	
	else if (gameState == 'gameover'){
		music.stop();
		text_gameover();
	}	
	else if (gameState == 'levelup'){			
		text_levelup();
		// update game state to be able to continue playing
		setTimeout(() => {			
			gameState = 'play';	
		}, 3000);
		noLoop;	
	}
	else {						
		// is game status is 'play' then load the crate, fuzzball and launcher			
		paint_assets(); 
		
		// check collision to get points
		get_points();
		
		// check if fuzzball hit the ground to track next level or gameover		
		fuzzGround_intersection(fuzzball, ground);			
		if(fuzzball.hitGround == 'True') {		
				
			// if ball has been launched and has stopped moving
			if(fuzzball.released = 'True' && fuzzball.body.speed < 0.28){ // body looks static when speed is around 2.7
				// if body has stopped and there are not more lives then Game over
				if(lives == 0){
					// if all crates on the floor
					if (countGround == max_crates){
						// next level
						levelUp();	
					}
					else { // not all crates on floor and no more lives						
						gameOver();
					}					
				}
				else {					
					// if not all crates are on the ground
					if (countGround !== max_crates){
						reset_launcher();					
					}
					else { // if all crates on the floor	
						// next level
						levelUp();	
					}					
				}									
			}
		}		
	}	
}

function big_text(info, x, y){
	textFont('Bungee Shade');
	textSize(52);
	fill("#000000");	
	text(info, x, y);
 }

 function small_text(info, x, y){
	textFont('Anton');
	textSize(32);	
	fill("#000000");	
	text(info, x, y);
 }

function text_background(x, y, w, h){
	fill(255,255,255);
	noStroke();
	rect(x, y, w, h, 10);// last parameter rounds the corners of the rectangle
}
// text setup for score and lives
function game_text(){ 
	// display score text	
	text_background(770, 30, 170, 50);	
	small_text("Score: " + score, 710, 42);		

	// display lives text
	text_background(108, 30, 180, 50);		
	small_text("Lives left " + lives, 40, 42);		
	
	// displays level
	text_background(vp_width/2 - 20, 30, 170, 50);
	small_text("Level " + level, vp_width/2 - 60, 40);
}

function displayScoreText() {
	if  ((score += 10) && (displayScore = false)) {
		// displayScore = true; // this part is not linking in properly 
		small_text("10 points!", 710, 85);
		setTimeout(() => {
			// displayScore = false;
			console.log("stop displaying score");
		}, 10000);	
	} 
}


// displays the text at the start state of the game
function text_start() {
	// display name of game
	big_text("fuzzball", vp_width/2 - 160, vp_height/2 - 40);	

	// display instruction to start game
	small_text("hit enter to play", vp_width/2 - 100, vp_height/2 + 10);	
}

// display game over text
function text_gameover(){			
	big_text("Game Over", vp_width/2 - 160, vp_height/2 - 40);	
	small_text("hit enter to restart the game", vp_width/2 - 160, vp_height/2 + 10);		
 }

 function text_levelup(){
	 // display level
	big_text("Level " + level, vp_width/2 - 120, vp_height/2 - 40);	
 }

function keyPressed() {
	// triggers the play state of the game
	if (keyCode === ENTER || keyCode === RETURN){
		console.log("enter key press");		
		//change update state
		if (gameState == 'start'){
			gameState = 'play';
			music.loop();
		}
		else if(gameState == 'gameover'){
			gameState = 'start';			
		}				
	}
}

function mouseClicked() { 
	if(elastic_constraint.body !== null) { // if the mouse has activated the elastic constraint
		setTimeout(() => {
			launcher.release();	// release after 1 milisecond to get momentum	
		}, 100);
		// reduce lives but don't decrease beyond zero
		if (lives > 0) {
			lives -= 1;	
		}		
		// fuzzball has a property 'released' to track if the fuzzball has been launched
		fuzzball.released = 'True';				
	}	
}

// checks for collision/intersection between a circle body and a rectangle[i] body
// collision fuzzball-crate
function crateFuzz_intersection(circle, rectIdx){
	// check if fuzzball has collided with a crate using the Matter.SAT.collides function
	let collision_crate = Matter.SAT.collides(circle.body, rectIdx.body);
	if (collision_crate.collided) {
		hit.play(); // this will play the hit sound each and every time the fuzzball hits a crate, regardless of whether points are applied
	}			
	// crates have a property called hitfuzz set to false by default
	// Only add points to score when the crate is hit for the first time			
	if ((collision_crate.collided) && (rectIdx.hitFuzz == 'False')) {			
		rectIdx.hitFuzz = 'True';
		score += 10;
		displayScoreText();
	}
}

// collision fuzzball-crate
function obstacleFuzz_intersection(circle, rect){
	// check if fuzzball has collided with a crate using the Matter.SAT.collides function
	let collision_obst = Matter.SAT.collides(circle.body, rect.body);			
	// crate have a propertty called hitfuzz set to false by default
	// Only add points to score when the crate is hit for the first time			
	if (collision_obst.collided && score > 0) {
		score -= 2;				
	}
}

// Check for collision between rectangle[i] and rectangle
// Collision Ground-crate
function crateGround_Intersection(rectIdx, rect){	
	let collision_ground = Matter.SAT.collides(rectIdx.body, rect.body);			
	//The crate has a property called hitGround set to 'false' by default
	// Only add points to the score when crate[i] hits the floor for the first time
	if((collision_ground.collided) && (rectIdx.hitGround == 'False')) {									
		rectIdx.hitGround = 'True';
		score += 20;
		countGround += 1;
		//If all the crates have hit the floor then add 20 points 
		//to count the one that was laready on the floor
		if(countGround === crate.length){
			score += 20;
									
		}
	}	
}

// check if fuzzball collided with the ground to be able to track the end of the round or the game
function fuzzGround_intersection(circle, rect){
	// check if fuzzball has collided with a crate using the Matter.SAT.collides function
	let collision_fuzzball = Matter.SAT.collides(circle.body, rect.body);				
	// fuzzball have a propertty called hitGround set to false by default
	// Only add points to score when the crate is hit for the first time			
	if ((collision_fuzzball.collided) && (circle.hitGround == 'False')) {			
		circle.hitGround = 'True';								
	}
} 

function levelUp(){
	level = level + 1;
	lives = 3;
	max_crates = max_crates + 1;
	countGround = 0;
	reset_sketch();						
	gameState = 'levelup';
}
 
function gameOver(){
	setTimeout(() => {
		// change the state of the game
		gameState = 'gameover';	
		level = 1;
		lives = 3;
		score = 0;
		max_crates = 3;	
		countGround = 0;
		crate =[];
		reset_sketch();
	}, 1000);
}

function reset_launcher(){
	setTimeout(() => {							
		// Remove matter fuzzball
		fuzzball.remove();
		//load a new ball, launcher and elastic_constraint
		fuzzball = new c_fuzzball(200, vp_height-100, 60, imgFuzzball);		
		//attach the new fuzzball back to the launcher
		launcher.attach(fuzzball.body);
	}, 5000);
}

function get_points(){	
	for (let i = 0; i < crate.length; i++){ // Loop through the crate array
		// check if fuzzball has collided with a crate using the Matter.SAT.collides function
		crateFuzz_intersection(fuzzball, crate[i]);			


		//Collision Ground-crate			
		crateGround_Intersection(crate[i], ground);														
	}
	
	// when level is greater than 1 check if fuzzball hit obstacle and take points away from score
	if (level > 1){
		obstacleFuzz_intersection(fuzzball, obstacle);	
	}
}
