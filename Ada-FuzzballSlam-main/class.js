"use strict";

var defaultCategory = 0x0001, Category1 = 0x0002, Category2 = 0x0004

class c_launcher {
    constructor(x, y, body) { // see docs on http://brm.io/matter-js/docs/classes/Constraint.html#properties
        let options = {
            pointA: {
                x: x,
                y: y
            },
            bodyB: body, 
            stiffness: 0.02,
            length: 1
        }
        // create the constraint 
        this.launch = Matter.Constraint.create(options);
        Matter.World.add(world, this.launch); // add to the matter world
        //image part of the class instead of a global variable
        this.img = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Launcher146x108.png');
    }
    release() {
        //release the constrained body by setting it to null
        this.launch.bodyB = null;
    }

    show() {
        //check to see if there is an active body
        if(this.launch.bodyB) {
            let posA = this.launch.pointA; // create a shortcut alias
            let posB = this.launch.bodyB.position;

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
            density: 0.99,           
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
        rectMode(CENTER); // switch centre to be centre rather than left, top
        //fill("#ffffff"); // set the fill colour
        //rect(pos.x, pos.y, this.width, this.height) // draw the rectangle 
    }
}


class c_crate {
    constructor(x, y, width, height) {
        let options = {            
            restitution: 0.99,
            friction: 0.5,
            density: 0.90,
            frictionAir: 0.032,           
        }
        // create the body
        this.body = Matter.Bodies.rectangle(x, y, width, height, options);
        Matter.World.add(world, this.body); // add to the matter world

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hitFuzz = 'False';        
        this.hitGround = 'False'; 
        this.img = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Crate120x120.png');       
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
    constructor(x, y, diameter) {
        let options = {            
            restitution: 0.90,
            friction: 0.5,
            density: 0.99,
            frictionAir: 0.005,           
            }        

        this.body = Matter.Bodies.circle(x, y, diameter/2, options); // matter.js used radius rather than diameter
        Matter.World.add(world, this.body);

        this.x = x;
        this.y = y;
        this.diameter = diameter;   
        this.count = 0;   
        this.img = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Fuzzball60x60.png');          
    }

    body() {
        return this.body;
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
