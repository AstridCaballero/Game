"use strict";

class c_ground {
    constructor(x, y, width, height) {
        let options = {
            isStatic: true,
            restitutions: 0.99,
            friction: 0.20,
            density: 0.99,
        }
        this.body = Matter.Bodies.rectangle(x, y, width, height, options);
        Matter.World.add(world, this.body);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    body() {
        return this.body;
    }

    show() {
        const pos = this.body.position;
        noStroke();
        fill('#ffffff');
        rectMode(CENTER); // switch centre to be centre rather than left, top
        rect(pos.x, pos.y, this.width, this.height)
    }
}


class c_crate {
    constructor(x, y, width, height) {
        let options = {            
            restitutions: 0.99,
            friction: 0.030,
            density: 0.99,
            frictionAir: 0.032,
        }
        this.body = Matter.Bodies.rectangle(x, y, width, height, options);
        Matter.World.add(world, this.body);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    body() {
        return this.body;
    }

    show() {
        const pos = this.body.position;
        const angle = this.body.angle;

        push(); // p5 translation
            translate(pos.x, pos.y);
            rotate(angle);
            noStroke();
            fill('#ffffff');
            rectMode(CENTER); // switch centre to be centre rather than left, top
            rect(0, 0, this.width, this.height)
        pop();
    }
}


class c_fuzzball {
    constructor(x, y, diameter) {
        let options = {            
            restitutions: 0.90,
            friction: 0.005,
            density: 0.95,
            frictionAir: 0.005,
        }
        this.body = Matter.Bodies.circle(x, y, diameter/2, options); // matter.js used radius rather than diameter
        Matter.World.add(world, this.body);

        this.x = x;
        this.y = y;
        this.diameter = diameter;
    }
    body() {
        return this.body;
    }

    show() {
        const pos = this.body.position;
        const angle = this.body.angle;

        push(); // p5 translation
            translate(pos.x, pos.y);
            rotate(angle);
            noStroke();
            fill('#ffffff');
            ellipseMode(CENTER); // switch centre to be centre rather than left, top
            circle(0, 0, this.diameter);
        pop();
    }
}