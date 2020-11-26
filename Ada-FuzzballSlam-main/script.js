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
var fbImg;
var crImg;
var lnchImg;

// variables to calculate during the game
var score = 0;
var lives = 0;



// variable to keep track of the state of the game
var gameState = 'start';;


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

function preload() {
	img = loadImage("https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/SlamBackground920x690.png");
	fbImg = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Fuzzball60x60.png');
	crImg = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Crate120x120.png');
	lnchImg = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Launcher146x108.png');
	
}

function collisions(event) {
	
	event.pairs.forEach((collide) => { //event.pairs[0].bodyA.label
		
		console.log(collide.bodyA.label);

		if((collide.bodyA.label === "fuzzball" && collide.bodyB.label === "crate") || (collide.bodyA.label === "crate" && collide.bodyB.label === "fuzzball")) {
			crate.color = "#ff0000";
		} else {
			crate.colour = "#ffffff";
		}

		// if((collide.bodyA.label === "fuzzball" && collide.bodyB.label === "crate")) || (collide.bodyA.label === "crate" && collide.bodyB.label === "fuzzball")) {
		// 	crate.color = "#ff0000";
		// } else {
		// 	crate.color = "#ffffff";
		// }
	});
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
	let vp_mouse = Matter.Mouse.create(viewport.elt);
	vp_mouse.pixelRatio = pixelDensity(); // update the pixel ratio with the p5 density value this supports
	//retina screens, etc
	let options = {
		mouse: vp_mouse
	}

	// see docs on https://brm.io/matter-js/docs/classes/Constraint.html#properties
	elastic_constraint = Matter.MouseConstraint.create(engine, options);
	Matter.World.add(world, elastic_constraint); // add the elastic constraint object to the world
	
	ground = new c_ground(vp_width/2, vp_height-10, vp_width, 20); // create a ground object
	leftwall = new c_ground(0, vp_height/2, 20, vp_height);
	rightwall = new c_ground(vp_width, vp_height/2, 20, vp_height);

	fuzzball = new c_fuzzball(200, vp_height-100, 60); // create a fuzzball object

	//loop through each of the crate indexes
	for(let i = 0; i < max_crates; i++) { //loop for each instance of a crate
		crate[i] = new c_crate(get_random(680, 710), (150*i)-300, 120, 120);		
	} 

	//create a launcher object using the fuzzball body
	launcher = new c_launcher(200, vp_height-100, fuzzball.body);

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
	 //show the launcher indicator
	launcher.show();
	fuzzball.show(); //show the fuzzball
		
	
}


function draw() {
	//this p5 defined function runs every refresh cycle
	paint_background(); // paint the default background 
	
	Matter.Engine.update(engine); // run the matter engine update
	// check game status
	// if game status is "start" it will tell the player to start playing	
	if(gameState === 'start'){
		// noStroke();
		gameText();
		//display message to play the game
		fill(255,255,255);
		noStroke();
		rect((vp_width/2)- 15, (vp_height/2) - 6 , 250, 50, 20);
		fill(0,0,0);
		textSize(32);
		text("press p to play ", (vp_width/2) -120, vp_height/2);		
		}		
	else {			
		// is game status is 'play' then load the crate, fuzzball and launcher			
		paint_assets(); // paint the assets		
		
		if(elastic_constraint.body !== null) {	
			console.log("elastic")		
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
	}
	
}

// text setup for score and lives
function gameText(){
	//displays the score
	fill(255,255,255);
	noStroke();
	rect(770, 30, 170, 50, 10);// last parameter rounds the corners of the rectangle
	fill(0,0,0);
	textSize(32);
	text("Score: " + score , 700, 40);	

	// displays lives	
	fill(255,255,255);
	noStroke();
	rect(108, 30, 180, 50, 10);
	fill(0,0,0);
	text("Lives left " + lives, 30, 40);
	
}


function keyPressed() {
	if (keyCode === ENTER || keyCode === RETURN) {// TODO RETURN NEEDED?
		console.log("enter key press");
		//load a new ball, launcher and elastic_constraint
		fuzzball = new c_fuzzball(200, vp_height-100, 60);
		launcher = new c_launcher(200, vp_height-100, fuzzball.body);
		launcher.attach(fuzzball.body);	//ataches a body (in this case fuzzball) to the launcher object 	
		
		// noLoop();	
	}

	if (keyCode === 32) {
		console.log("space key press");
		launcher.release(); // currently this drops the fuzzball but doesn't "launch" it
	}
	if (keyCode === 80){
		console.log("p key press");
		gameState = 'play';
		console.log(gameState);
	}
}

function mouseReleased() {
	setTimeout(() => {
		launcher.release();
	}, 100);
}


