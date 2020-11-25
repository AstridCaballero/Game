"use strict";

var vp_width = 920, vp_height = 690;
var world, engine, body;

//enable the matter engine
engine = Matter.Engine.create();
world = engine.world;
body = Matter.Body;

// instantiate classes
var ground = new c_ground(vp_width/2, vp_height-10, vp_width, 20);
var crate = new c_crate(get_random(500, 650), 400, 120, 120);
var fuzzball = new c_fuzzball (400, 200, 60);

function apply_velocity() {
	Matter.Body.setVelocity(fuzzball.body, {x:10, y:-5});
};

function apply_angularvelocity() {
	Matter.Body.setAngularVelocity(crate.body, Math.PI/6);
};

function apply_force() {
	Matter.Body.applyForce(crate.body, {
		x: crate.body.position.x,
		y: crate.body.position.y
	}, {
		x: 0.05,
		y: -500.05
	});
};


function get_random(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min) // the max is exclusive and the min is 
}

function preload() {
	//p5 defined function
	
}

function setup() {
	//this p5 defined function runs automatically once the preload function is done
	var viewport = createCanvas(vp_width, vp_height); // set the viewport (canvas) size
	viewport.parent("viewport_container"); // move the canvas so it's inside the target div
	frameRate(60);
}


function paint_background() {
	// access the game object for the world, use this as a background image for the game
	background('#4c738b');
}


function paint_assets() {
	ground.show();
	crate.show();
	fuzzball.show();
}


function draw() {
	//this p5 defined function runs every refresh cycle
	paint_background();
	Matter.Engine.update(engine);
	paint_assets();
}




