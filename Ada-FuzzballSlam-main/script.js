"use strict";

var vp_width = 920, vp_height = 690; // declare variables to hold the viewport size

// declare global variables to hold the framework objects
var viewport, world, engine, body, elastic_constraint;

var crate = []; // create an empty array that will be used to hold all the crate instances

// declare 3 instances of the class ground
var ground; 
var leftwall;
var rightwall;

// declare the fuzzball and related launcher
var fuzzball;
var launcher;

// declare the obstacle
var obstacle;

// declare the variables related to the images
var imgBackground;
var imgLauncher;
var imgCrate;
var imgFuzzball;

// declare the musical variables
var music;
var hit;
var button;

// declare the variables used to calculate score and lives during gameplay
var score = 0;
var lives = 3;
var countGround = 0;

// variable to keep track of the state of the game
var gameState = 'start';
var level = 1;
var max_crates = 3; // maximum number of crates at start of game

// declare the variables used to display points as they are accrued – +20, +10, -2 
var start_time_crate;
var start_time_ground;
var start_time_obst;

// this will be used to add an element of randomness to various elements of the game
function get_random(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min) // the max is exclusive and the min is inclusive
}

// this function is used to play a noise upon collision between the fuzzball and crate(s) or obstacle
function hittrack() { 
	hit.setVolume(0.2);
	if(hit.isPlaying()) {
		hit.stop();
		hit.play();
		console.log("hit!");
	} else {
		hit.play();
		console.log("hit!");
	}
}

// this function is used to play the audio on a loop and is called later for an on/off button 
function audiotrack() { 
	hit.setVolume(0.2);
	if (music.isPlaying() == true) {
		console.log("stopping audio");
		music.stop();
	} else if (music.isPlaying() == false) {
		console.log("starting audio");
		music.play();
	}
}	

function preload() {
	// load the background image
	imgBackground = loadImage("https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/SlamBackground920x690.png");	

	// load the audio files
	music = loadSound("https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/AmbientLoop.mp3");
	hit = loadSound("https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Hit.mp3");
}

// this p5 defined function runs automatically once the preload function is done
function setup() {
	viewport = createCanvas(vp_width, vp_height); // set the viewport (canvas) size
	viewport.parent("viewport_container"); // move the canvas so it's inside the target div
	
	// this is a function called into setup from the below 
	reset_sketch();	
}

// this function is crucial to the loop of gameplay 
function reset_sketch(){
	// this loads the images for objects used during gameplay
	imgLauncher = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Launcher146x108.png');
	imgCrate = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Crate120x120.png');       
	imgFuzzball = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Fuzzball60x60.png');          

	// these enable the matter engine
	engine = Matter.Engine.create();
	world = engine.world;
	body = Matter.Body;	


	// this enables the 'matter' mouse controller and attach it to the viewport object using p5s elt property
	let vp_mouse = Matter.Mouse.create(viewport.elt);
	// this updates the pixel ratio with the p5 density value this supports retina screens etc.
	vp_mouse.pixelRatio = pixelDensity(); 
	// this option ensures the mouse only interacts with classes of objects with a category of Category1 assigned 
	let options = {
		mouse: vp_mouse,
		collisionFilter: {
			mask: Category1
		}				
	}

	// this allows for the "slingsot" action of the launcher 
	elastic_constraint = Matter.MouseConstraint.create(engine, options);
	Matter.World.add(world, elastic_constraint); // this adds the elastic constraint object to the world
	
	// the class c_ground is called here via three variables to create the walls and ground
	ground = new c_ground(vp_width/2, vp_height+50, vp_width, 175); 
	leftwall = new c_ground(-88, vp_height/2, 175, vp_height);
	rightwall = new c_ground(vp_width+88, vp_height/2, 175, vp_height);

	// this creates the fuzzball 
	fuzzball = new c_fuzzball(250, vp_height-150, 60, imgFuzzball);

	// this creates the launcher object using the fuzzball body 
	launcher = new c_launcher(250, vp_height-150, fuzzball.body, imgLauncher);
	
	// this loops through each of the crate indexes
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
	
	// this creates an obstacle for Level 2 and beyond 
	if (level > 1){
		obstacle = new c_obstacle(get_random(400, 500), get_random(400, 450), 50, 20);
	}
	// this indicates that there are 60 frames per second
	frameRate(60);
};


function paint_background() {
	// this accesses the game object for the world and uses it as a background image for the game
	background(imgBackground);

	// this executes the show function for the boundary objects
	ground.show(); 
	leftwall.show();
	rightwall.show();
}


function paint_assets() {
	// this loops through the crate array and shows each
	for (let i = 0; i < crate.length; i++){
		crate[i].show()
	}

	// these show the launcher, fuzzball and function game_text respectively (see below)
	launcher.show();   
	fuzzball.show(); 
	game_text();

	// this shows the obstacle from level 2 onwards
	if (level > 1){
		obstacle.show();				
	}
}

function draw() {
	// this p5 defined function runs every refresh cycle
	paint_background(); // this paints the default background 
	
	// this runs the matter engine update
	Matter.Engine.update(engine); 
	
	// this checks status/state of the game: if game status is "start" it will show text_start and indicate what the user needs to do to play 	
	if(gameState === 'start'){		
		text_start();	
		}	
	else if (gameState == 'gameover'){ // shows the text_gameover, stops the music
		music.stop();
		text_gameover();
	}	
	else if (gameState == 'levelup'){ // this shows the text_levelup and allows the user to proceed to the next level 		
		text_levelup();
		// this updates the game state 
		setTimeout(() => {			
			gameState = 'play';	
		}, 3000);
		noLoop;	
	}
	else {						
		// if the game status is 'play' then the crate, fuzzball and launcher, game_text (and obstacle) are loaded via the paint_assets function 		
		paint_assets(); 				
		
		// this function checks for collision in order to get points
		get_points();

		// this displays points when the fuzzball hits a crate
		if (frameCount >= start_time_crate && frameCount < start_time_crate + 30){
			big_text("+ 10", vp_width/2 - 100, vp_height/4);
		}
		// this displays points when the fuzzball hits the ground
		if (frameCount >= start_time_ground && frameCount < start_time_ground + 30 && fuzzball.hitGround == 'True'){
			big_text("+ 20", vp_width/2 - 100, vp_height/4 + 20);
		}

		// this displays points when the fuzzball hits the ground
		if (frameCount >= start_time_obst && frameCount < start_time_obst + 30){
			big_text("- 2", vp_width/2 - 100, vp_height/4 + 40);
		}
		
		
		// this checks if the fuzzball has hit the ground, to track whether it is time to move to the next level or indicate gameover		
		fuzzGround_intersection(fuzzball, ground);			
		if(fuzzball.hitGround == 'True') {		
				
			// this checks if the fuzzball has been launched and whether it has stopped moving
			if(fuzzball.released = 'True' && fuzzball.body.speed < 0.28){ // the fuzzball body looks static when its speed is around 2.7
				// if there are no more lives
				if(lives == 0){
					// if all the crates are on the floor
					if (countGround == max_crates){
						// this moves the state of game to levelUp
						levelUp();	
					}
					else { // all crates are not on the floor and there are no more lives, gameover						
						gameOver();
					}					
				}
				else { // if there are still lives but not all the crates are on the ground, reset for another turn					
					if (countGround !== max_crates){
						reset_launcher();					
					}
					else { // if all the crates on the floor move the state of the game to levelUp	
						levelUp();	
					}					
				}									
			}
		}		
	}	
}

// this function is used for titles as well as displaying points as they are scored
function big_text(info, x, y){
	textFont('Bungee Shade');
	textSize(52);
	fill("#000000");	
	text(info, x, y);
 }
// this function is used for game_text, amongst others 
function small_text(info, x, y){
	textFont('Anton');
	textSize(32);	
	fill("#000000");	
	text(info, x, y);
 }
// this creates a background for the game_text 
function text_background(x, y, w, h){
	fill(255,255,255);
	noStroke();
	rect(x, y, w, h, 10);// last parameter rounds the corners of the rectangle
}
// this function includes the text setup for score, lives left, and level
function game_text(){ 
	// displays the score text	
	text_background(770, 30, 170, 50);	
	small_text("Score: " + score, 710, 42);		

	// displays the lives left text
	text_background(108, 30, 180, 50);		
	small_text("Lives left " + lives, 40, 42);		
	
	// displays the level
	text_background(vp_width/2 - 20, 30, 170, 50);
	small_text("Level " + level, vp_width/2 - 60, 40);

	// this creates an audio on/off button
	button = createImg("https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Universal_(103).png");
	button.position(108, 70, 'fixed'); 
	button.size(50, 50); 
	button.mousePressed(audiotrack);
}

// this displays the text at the start of the game
function text_start() {
	// displays name of game
	big_text("fuzzball", vp_width/2 - 160, vp_height/2 - 40);	

	// displays instruction to start the game
	small_text("hit enter to play", vp_width/2 - 100, vp_height/2 + 10);	
}

// displays the gameover text
function text_gameover(){			
	big_text("Game Over", vp_width/2 - 160, vp_height/2 - 40);	
	small_text("hit enter to restart the game", vp_width/2 - 160, vp_height/2 + 10);		
 }
// displays the levelup text
function text_levelup(){
	 // display level
	big_text("Level " + level, vp_width/2 - 120, vp_height/2 - 40);	
 }

// this function allows the user to press enter or return 
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

// this function sets a timeout function for each turn or round
function mouseClicked() { 
	if(elastic_constraint.body !== null) { // if the mouse has activated the elastic constraint
		setTimeout(() => {
			launcher.release();	// release after 1 millisecond to get momentum	
		}, 100);
		// reduce lives but don't decrease beyond zero
		if (lives > 0) {
			lives -= 1;	
		}		
		// the fuzzball has a property 'released' to track if the fuzzball has been launched
		fuzzball.released = 'True';				
	}	
}

// the following functions check for a collision/intersection between a circle body and a rectangle[i] body

// collision fuzzball-crate
function crateFuzz_intersection(circle, rectIdx){
	// check if the fuzzball has collided with a crate using the Matter.SAT.collides function
	let collision_crate = Matter.SAT.collides(circle.body, rectIdx.body);
	if (collision_crate.collided) {
		hit.play(); // this will play the hit sound each and every time the fuzzball hits a crate, regardless of whether points are applied 
	}			
	// the crates have a property called hitfuzz, set to false by default
	// this ensures points are only added to score when the crate is hit for the first time			
	if ((collision_crate.collided) && (rectIdx.hitFuzz == 'False')) {			
		rectIdx.hitFuzz = 'True';
		score += 10; // this adds 10 points to the total score
		// in order to display points, this function gets the framecount at the moment of the collision
		start_time_crate = frameCount; 			
	}
}

// collision fuzzball-obstacle
function obstacleFuzz_intersection(circle, rect){
	// check if fuzzball has collided with a crate using the Matter.SAT.collides function
	let collision_obst = Matter.SAT.collides(circle.body, rect.body);			
	// crate have a propertty called hitfuzz set to false by default
	// Only add points to score when the crate is hit for the first time			
	if (collision_obst.collided && score > 0) {
		score -= 2; // this minuses 2 points from the total score 
		hit.play();	// this will play the hit sound when the fuzzball hits the obstacle	
		// in order to display points, this function gets the framecount at the moment of the collision
		start_time_obst = frameCount;			
	}
}

// the following function checks for a collision/intersection between a rectangle and a rectangle[i] body

// collision ground-crate
function crateGround_Intersection(rectIdx, rect){	
	let collision_ground = Matter.SAT.collides(rectIdx.body, rect.body);			
	//The crate has a property called hitGround set to 'false' by default
	// Only add points to the score when crate[i] hits the floor for the first time
	if((collision_ground.collided) && (rectIdx.hitGround == 'False')) {									
		rectIdx.hitGround = 'True';
		score += 20; // this adds 20 points to the total score 
		countGround += 1; // this adds 1 to the countGround in order to check how many crates are on the ground 
		// in order to display points, this function gets the framecount at the moment of the collision
		start_time_ground = frameCount;
		//If all the crates have hit the floor then add 20 bonus points in order to count the one that was already on the floor  
		if(countGround === crate.length){
			score += 20; // add the points as above
			// in order to display points, this function gets the framecount at the moment of the collision
			start_time_ground = frameCount; 
									
		}
	}	
}
// the following function checks for a collision/intersection between a circle and a rectangle body

// checks if the fuzzball has collided with the ground to be able to track the end of the round or the game
function fuzzGround_intersection(circle, rect){
	// check if fuzzball has collided with the ground using the Matter.SAT.collides function
	let collision_fuzzball = Matter.SAT.collides(circle.body, rect.body);				
	// the fuzzball has a property called hitGround, set to false by default			
	if ((collision_fuzzball.collided) && (circle.hitGround == 'False')) {			
		circle.hitGround = 'True';								
	}
} 

// this function is called to allow the user to progress to the next level 
function levelUp(){
	level = level + 1;
	lives = 3;
	max_crates = max_crates + 1;
	countGround = 0;
	reset_sketch();						
	gameState = 'levelup';
}

// this function is called to indicate that the game is over
function gameOver(){
	setTimeout(() => {
		// this changes the game state
		gameState = 'gameover';	
		level = 1;
		lives = 3;
		score = 0;
		max_crates = 3;	
		countGround = 0;
		crate = [];
		reset_sketch();
	}, 1000);
}

// this function resets the launcher at the end of one round and the beginning of the next 
function reset_launcher(){
	setTimeout(() => {							
		// this removes the matter fuzzball from the world 
		fuzzball.remove();
		// this loads a new ball, launcher and elastic_constraint
		fuzzball = new c_fuzzball(200, vp_height-100, 60, imgFuzzball);		
		// this attachs the new fuzzball to the above launcher
		launcher.attach(fuzzball.body);
	}, 5000);
}

// this function is called in order to get and apply points 
function get_points(){	
	for (let i = 0; i < crate.length; i++){ // loop through the crate array
		// check if the fuzzball has collided with a crate using the Matter.SAT.collides function
		crateFuzz_intersection(fuzzball, crate[i]);	

		//Collision Ground-crate			
		crateGround_Intersection(crate[i], ground);														
	}
	
	// when the level is greater than level 1, check if the fuzzball has hit the obstacle 
	if (level > 1){
		obstacleFuzz_intersection(fuzzball, obstacle);	
	}
}
