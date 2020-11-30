"use strict";

var defaultCategory = 0x0001, //this category is assigned to all objects that cannot be interacted with via the mouse
    Category1 = 0x0002 //this category is assigned to all objects that can be interacted with via a mouse 

class c_launcher {
    constructor(x, y, body) { // see docs on http://brm.io/matter-js/docs/classes/Constraint.html#properties
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
        this.img = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Launcher146x108.png');
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
    constructor(x, y, width, height) {
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
        this.img = loadImage('https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/Fuzzball60x60.png');          
        this.hitGround = 'False';
        this.released =  'False';
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

// the c_obstacle class inherits from c_crate and has its own property 'colour'
// also it has override the method show()
class c_obstacle extends c_ground{
    constructor(x, y, r1, r2){                     
        super(x, y);
        let options = {
            isStatic: true,
            restitution: 0.05,
            friction: 0.20,
            density: 1, 
            collisionFilter: {
                category: defaultCategory
            }          
        }
        //create the body 
        this.body = Matter.Bodies.circle(x, y, r1, options);
        Matter.World.add(world, this.body); // add to the matter world

        this.colour = '#000000'; 
        this.r1 = r1;
        this.r2 = r2;
        this.numPoints = 7;        
    } 
    
    createStar(){
        //create the star
        // code taken from https://p5js.org/examples/form-star.html
        let angle = TWO_PI / this.numPoints;
        let halfAngle = angle / 2.0;
        
        beginShape();        
        for (let a = 0; a < TWO_PI; a += angle) {
            let sx = 0 + cos(a) * this.r2;
            let sy = 0 + sin(a) * this.r2;
            vertex(sx, sy);
            sx = 0 + cos(a + halfAngle) * this.r1;
            sy = 0 + sin(a + halfAngle) * this.r1;
            vertex(sx, sy);
        }
        endShape(CLOSE);    
    }

    //overriding the c_ground show function
    show(){          
        let pos = this.body.position;                 
        
        
        
        fill(this.colour);
        translate(pos.x, pos.y);
        rotate(frameCount / 200.0);
        this.createStar();           
    }    
}




//wrapping up all the function related to collision
// class c_intersection{
//     constructor(bodyA, bodyB, score, countGround = 0, crate_length = 0){
//         this.bodyA = bodyA,
//         this.bodyB = bodyB,
//         this.score = score,
//         this.countGround = countGround,
//         this.hitGround = bodyA.hitGround,
//         // this.hitFuzz = bodyB.hitFuzz,
//         this.crate_length = crate_length
//     }

//     crateFuzz_intersection(){
//         console.log(this.hitFuzz)
//         // check if fuzzball has collided with a crate using the Matter.SAT.collides function
//         let collision_crate = Matter.SAT.collides(this.bodyA.body, this.bodyB.body);			
//         // crate have a propertty called hitfuzz set to false by default
//         // Only add points to score when the crate is hit for the first time			
//         if ((collision_crate.collided) && (this.bodyB.hitFuzz == 'False')) {			
//             this.bodyB.hitFuzz = 'True';
//             this.score += 10;				
//         }
//     }
// }