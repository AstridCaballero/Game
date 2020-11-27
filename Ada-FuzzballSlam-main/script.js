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

//variables related to the images
var img;
var lnchImg;

//musical variables
var music;
var hit;

// variables to calculate during the game
var score = 0;
var lives = 3;
var countGround = 0;

// variable to keep track of the state of the game
var gameState = 'start';


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

function audiotrack() { //this works and there is now an off/on button outside the viewport 
	if(music.isPlaying()) {
		console.log("stopping audio");
		music.stop();
	} else {
		music.setVolume(0.15);
		console.log("starting audio");
		music.loop();
	}
}

function preload() {
	//Load background
	img = loadImage("https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/SlamBackground920x690.png");	

	//music/audio
	music = loadSound("https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/AmbientLoop.mp3");
	hit = loadSound("https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Hit.mp3");
}

function setup() {
	//this p5 defined function runs automatically once the preload function is done
	viewport = createCanvas(vp_width, vp_height); // set the viewport (canvas) size
	viewport.parent("viewport_container"); // move the canvas so it's inside the target div
	
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
		// will pick only the fuzzball, not the crate(s)		

	}

	// see docs on https://brm.io/matter-js/docs/classes/Constraint.html#properties
	elastic_constraint = Matter.MouseConstraint.create(engine, options);
	Matter.World.add(world, elastic_constraint); // add the elastic constraint object to the world
	
	ground = new c_ground(vp_width/2, vp_height-30, vp_width, 20, "ground"); // create a ground object
	leftwall = new c_ground(-15, vp_height/2, 20, vp_height, "leftwall");
	rightwall = new c_ground(vp_width+15, vp_height/2, 20, vp_height, "rightwall");

	fuzzball = new c_fuzzball(250, vp_height-150, 60, "fuzzball"); // create a fuzzball object

	//loop through each of the crate indexes
	for(let i = 0; i < max_crates; i++) { //loop for each instance of a crate
		// last crate in the array is the crate at the bottom of the pile of crates to start the game
		// so lets set that one to "hitGround = true" before checking for collisions
		if (i == max_crates - 1){
			crate[i] = new c_crate(get_random(680, 710), (150*i)-300, 120, 120);
			crate[i].hitGround ='True';
			countGround += 1;
		}
		else {
			crate[i] = new c_crate(get_random(680, 710), (150*i)-300, 120, 120);
		}				
	} 

	//create a launcher object using the fuzzball body
	launcher = new c_launcher(250, vp_height-150, fuzzball.body);

	frameRate(60);
}


function paint_background() {
	// access the game object for the world, use this as a background image for the game
	background(img);

	ground.show(); // execute the show function for the boundary objects
	leftwall.show();
	rightwall.show();
}


function paint_assets() {
	
	for (let i = 0; i < crate.length; i++){ // Loop through the crate array and show each
		crate[i].show()
	}

	launcher.show();  //show the launcher 
	fuzzball.show(); //show the fuzzball
}

function draw() {
	//this p5 defined function runs every refresh cycle
	paint_background(); // paint the default background 
	
	Matter.Engine.update(engine); // run the matter engine update
	// check game status
	// if game status is "start" it will tell the player to start playing	
	if(gameState === 'start'){
		startGame()				
		}		
	else {			
		// is game status is 'play' then load the crate, fuzzball and launcher			
		paint_assets(); // paint the assets		
		
		if(elastic_constraint.body !== null) {				
			// console.log("elastic")		
			let pos = elastic_constraint.body.position; // create a shortcut alias
			fill("#ff0000"); // set a fill colour
			ellipse(pos.x, pos.y, 20, 20); // indicate the body that has been selected 

			let mouse = elastic_constraint.mouse.position;
			stroke("#000000");
			line(pos.x, pos.y, mouse.x, mouse.y);			
		}
		// displays the score
		noStroke();
		gameText();				

		// REFACTOR!
		// check collision to get points
		for (let i = 0; i < crate.length; i++){ // Loop through the crate array
			// check if fuzzball has collided with a crate using the Matter.SAT.collides function
			circleRect_Intersection(fuzzball, crate[i]);	
			//Collision Ground-crate
			rectRect_Intersection(crate[i], ground);
			// collision_ground = Matter.SAT.collides(crate[i].body, ground.body);			
			// //The ground has a property called hitCrate set to 'false' by default
			// // Only add points to the score when crate[i] hits the floor for the first time
			// if((collision_ground.collided) && (crate[i].hitGround == 'False')) {									
			// 	crate[i].hitGround = 'True';
			// 	score += 20;
			// 	countGround += 1;
			// 	//If all the crates have hit the floor then add 20 points 
			// 	//to count the one that was laready on the floor
			// 	if(countGround === crate.length){
			// 		score += 20;	
					// display 'move to next level'
					// add +1 to level
					// add +1 to max_crates
					// load the game with new crates
					// here the reset comes
					// go to either game over, next level, exit(timer)			
				// }
			// }									
		}		
	}	
}

// text setup for score and lives
function gameText(){ 
	// display score text
	document.getElementById('score').innerText = "Score: " + score;
	document.getElementById('score').style.visibility = 'visible';
	// display lives text
	document.getElementById('lives').innerText = "Lives: " + lives;
	document.getElementById('lives').style.visibility = 'visible';
}


function keyPressed() {
	if (keyCode === ENTER || keyCode === RETURN) {// TODO RETURN NEEDED?
		console.log("enter key press");
		// Remove matter fuzzball
		// Matter.World.remove(world.fuzzball);
		// Matter.World.remove(world.launcher);
		//load a new ball, launcher and elastic_constraint
		fuzzball = new c_fuzzball(250, vp_height-150, 60);		
		launcher = new c_launcher(250, vp_height-150, fuzzball.body);
		launcher.attach(fuzzball.body);	//attaches a body (in this case fuzzball) to the launcher object 
		// noLoop(); // stops the draw cycle, the result is a frozen image	
	}

	// if (keyCode === 32) {
	// 	console.log("space key press");
	// 	launcher.release(); // NB currently this drops the fuzzball but doesn't "launch" it
	// }
	// trigger the play state of the game
	if (keyCode === 80){
		console.log("p key press");
		//remove start text
		removestartGame();
		//change update state
		gameState = 'play';		
	}
}

function mouseReleased() { 
	setTimeout(() => {
		launcher.release();
	}, 100);
}

// displays the text at the start state of the game
function startGame() {	
	document.getElementById('fuzzball').style.visibility='visible';
	document.getElementById('start').style.visibility='visible';
	
}

// hides the text when 'p' letter is pressed because the game changes to the play status
function removestartGame() {	
		document.getElementById('fuzzball').style.visibility='hidden';
		document.getElementById('start').style.visibility='hidden';
}

// checks for collision/intersection between a circle body and a rectangle[i] body
// collision fuzzball-crate
function circleRect_Intersection(circle, rectIdx){
	// check if fuzzball has collided with a crate using the Matter.SAT.collides function
	let collision_fuzzball = Matter.SAT.collides(circle.body, rectIdx.body);			
	// crate have a propertty called hitfuzz set to false by default
	// Only add points to score when the crate is hit for the first time			
	if ((collision_fuzzball.collided) && (rectIdx.hitFuzz == 'False')) {			
		rectIdx.hitFuzz = 'True';
		score += 10;				
	}
}

// Check for collision between rectangle[i] and rectangle
// Collision Ground-crate
function rectRect_Intersection(rectIdx, rect){	
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
			// display 'move to next level'
			// add +1 to level
			// add +1 to max_crates
			// load the game with new crates
			// here the reset comes
			// go to either game over, next level, exit(timer)			
		}
	}	
}