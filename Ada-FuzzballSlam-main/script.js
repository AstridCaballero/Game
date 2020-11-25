"use strict";

var vp_width = 920, vp_height = 690;//decalre variables to hold the viewport size
var max_crates = 10;

//declare global variables to hold the framework objects
var viewport, world, engine, body, elastic_constraint;

var crate = []; //create an empty array that will be used to hold all the crate instances
var ground;
var leftwall;
var rightwall;

var fuzzball;
var launcher;

// // instantiate classes
// var ground = new c_ground(vp_width/2, vp_height-10, vp_width, 20);
// var crate = new c_crate(get_random(500, 650), 400, 120, 120);
// var fuzzball = new c_fuzzball (400, 200, 60);

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
	//p5 defined function
	
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

	fuzzball = new c_fuzzball(400, 200, 60); // create a fuzzball object

	//loop through each of the crate indexes
	for(let i = 0; i < max_crates; i++) { //loop for each instance of a crate
		crate[i] = new c_crate(700, (150*i)-200, 120, 120);		
	} 

	//create a launcher object using the fuzzball body
	launcher = new c_launcher(400, 200, fuzzball.body);

	frameRate(60);
}


function paint_background() {
	// access the game object for the world, use this as a background image for the game
	background('#4c738b');

	ground.show(); // execute the show function for the boundary objects
	leftwall.show();
	rightwall.show();
}


function paint_assets() {
	for (let i = 0; i < crate.lenght; i++){ // Loop through the crate array and show each
		crate[i].show()
	}
	fuzzball.show(); //show the fuzzball
	launcher.show(); //show the launcher indicator
}


function draw() {
	//this p5 defined function runs every refresh cycle
	paint_background(); // paint the default background 
	
	Matter.Engine.update(engine); // run the matter engine update
	paint_assets(); // paint the assets

	if(elastic_constraint.body !== null) {
		let pos = elastic_constraint.body.position; // create a shortcut alias
		fill("#ff0000"); // set a fill colour
		ellipse(po.x, pos.y, 20, 20); // indicate the body that has been selected 

		let mouse = elastic_constraint.mouse.position;
		stroke("#00ff00");
		line(pos.x, pos.y, mouse.x, mouse.y);
	}
}


function keyPressed() {
	if (keyCode === ENTER) {
		console.log("enter key press");
		fuzzball = new c_fuzzball(400, 200, 60);
	}

	if (keyCode === 32) {
		console.log("space key press");
		launcher.release(); // execute the release method
	}
}

function mouseReleased() {
	setTimeout(() => {
		launcher.release();
	}, 100);
}


