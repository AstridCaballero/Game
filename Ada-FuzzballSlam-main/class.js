"use strict";

var defaultCategory = 0x0001, //this category is assigned to all objects that cannot be interacted with via the mouse
    Category1 = 0x0002 //this category is assigned to all objects that can be interacted with via a mouse 

class c_launcher {
    constructor(x, y, body, img) { // see docs on http://brm.io/matter-js/docs/classes/Constraint.html#properties
        let options = {
            pointA: {
                x: x,
                y: y
            },
            bodyB: body, 
            stiffness: 0.02,
            length: 1,
            collisionFilter: {
                category: defaultCategory
            }
        }
        // create the constraint 
        this.launch = Matter.Constraint.create(options);
        Matter.World.add(world, this.launch); // add to the matter world
        //image part of the class instead of a global variable
        this.img = img;
    }
    release() {
        //release the constrained body by setting it to null
        this.launch.bodyB = null;
    }

    show() {
        //check to see if there is an active body
        if(this.launch.bodyB) {
            stroke(255);
            let posA = this.launch.pointA; // create a shortcut alias for the launcher
            let posB = this.launch.bodyB.position; //create a shortcut alias for the fuzzball relative to the launcher
            line(posA.x, posA.y, posB.x, posB.y); //draw a line between the two points
        push();    
            translate((posA.x-50), posA.y);
            line(posA.x, posA.y, posB.x, posB.y); //draw a line between the two points
            imageMode(CENTER);
            //image part of the class instead of a global variable 
            image(this.img, 0, 0);
        pop();    
            
        }
    }
    // method to attach the launcher to the fuzzball
    attach(body) {
        this.launch.bodyB = body;
    }
}

class c_ground {
    constructor(x, y, width, height) {
        let options = {
            isStatic: true,
            restitution: 0.99,
            friction: 0.20,
            density: 1, 
            collisionFilter: {
                category: defaultCategory
            }          
        }
        //create the body 
        this.body = Matter.Bodies.rectangle(x, y, width, height, options);
        Matter.World.add(world, this.body); // add to the matter world

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;        
    }

    body() {
        return this.body; // return the created body
    }

    show() {
        let pos = this.body.position; // create a shortcut alias
        rectMode(CENTER); // switch centre to be centre rather than left
    }
}


class c_crate {
    constructor(x, y, width, height, img) {
        let options = {            
            restitution: 0.99,
            friction: 0.5,
            density: 0.90,
            frictionAir: 0.032, 
            collisionFilter: {
                category: defaultCategory
            }          
        }
        // create the body
        this.body = Matter.Bodies.rectangle(x, y, width, height, options);
        Matter.World.add(world, this.body); // add to the matter world

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hitFuzz = 'False';  // flag to help checking if the crate has been already hit once by the fuzzball      
        this.hitGround = 'False'; // flag to help checking if the crate has already hit the ground once.
        this.img = img;
    }  
    
    body() {
        return this.body; //return the created body 
    }

    show() {
        let pos = this.body.position; // create a shortcut alias
        let angle = this.body.angle;

        push(); // p5 translation
            stroke("#000000");
            imageMode(CENTER); // switch centre to be centre rather than left, top
            translate(pos.x, pos.y);
            rotate(angle);
            //image part of the class instead of a global variable 
            image(this.img, 0, 0, this.width, this.height)
        pop();
    }
}


class c_fuzzball {
    constructor(x, y, diameter, img) {
        let options = {            
            restitution: 0.90, // how bouncy the body is
            friction: 0.5, // when the fuzzball rolls on the ground will roll faster or slower depending on the friction
            density: 0.99, 
            frictionAir: 0.005, // resistance given by the air           
            collisionFilter: {
                category: Category1
            }          
        }        

        this.body = Matter.Bodies.circle(x, y, diameter/2, options); // matter.js used radius rather than diameter
        Matter.World.add(world, this.body);

        this.x = x;
        this.y = y;
        this.diameter = diameter;   
        this.count = 0;   
        this.img = img;
        this.hitGround = 'False'; // flag to start check if the fuzzball has stopped moving
        this.released =  'False'; // flag to check if fuzzball has been released
    }

    body() {
        return this.body;
    }

    // will remove the body of a fuzzball from the world. THis is important before creating a new fuzzball
    remove(){
        Matter.World.remove(world, this.body);
    }

    show() {
        let pos = this.body.position;
        let angle = this.body.angle;

        push(); // p5 translation
            translate(pos.x, pos.y);
            rotate(angle);           
            imageMode(CENTER); // switch centre to be centre rather than left, top
            //image part of the class instead of a global variable            
            image(this.img, 0, 0, this.diameter, this.diameter);
        pop();
    }
}

// the c_obstacle class inherits from c_ground and has its own properties 'colour' and numPoints
// also it has override the method show() and has a method to create a star
// so obstacle creates a static rectangle body that displays a star
class c_obstacle extends c_ground{
    constructor(x, y, width, height){                     
        super(x, y, width, height);       

        this.colour = '#000000';        
        this.numPoints = 7;        
    } 
    
    createStar(){
        // create the star
        // code taken from https://p5js.org/examples/form-star.html
        let angle = TWO_PI / this.numPoints;
        let halfAngle = angle / 2.0;

        beginShape(); // allows to start creating a polygon
        for (let a = 0; a < TWO_PI; a += angle) {
            let sx = 0 + cos(a) * this.height;
            let sy = 0 + sin(a) * this.height;
            vertex(sx, sy);
            sx = 0 + cos(a + halfAngle) * this.width;
            sy = 0 + sin(a + halfAngle) * this.width;
            vertex(sx, sy);
        }
        endShape(CLOSE);   //closes the polygon
    }

    //overriding the c_ground show function
    show(){          
        let pos = this.body.position; 
        fill(this.colour);
        translate(pos.x, pos.y); // takes the x and y of the body and set them as the origin
        rotate(frameCount / 200.0); // rotates the body
        // calls a method within the class
        this.createStar();  // calls the method createStar() that has been created inside the function         
    }    
}