////////////////////////////////////////////////////////////////////////////////
// CURL NOISE LOGIC
var sketch = function (p) {
    var
        title = 'perlin',
        winW, winH,
        noiseScale = 10000000000,
        particles = [],
        polarities = [],
        ages = [],
        maxParticles = 2000,
        maxSpeed = 2,
        barrier,
        barrierSize,
        emitter;
    ////////////////////////////////////////////////////////////////////////////
    // Sets up sketch.
    p.setup = function () {
        // p.noiseSeed(53);
        winW = document.getElementsByTagName('html')[0].clientWidth;
        winH = document.getElementsByTagName('html')[0].clientHeight;
        p.createCanvas(winW, winH);
        p.colorMode(p.HSB, 360, 100, 100, 1);
        setSizes();
    };

    ////////////////////////////////////////////////////////////////////////////
    // Draws.
    p.draw = function () {
        // var hue = p.color((p.frameCount/10) % 360, 100, 100, 1);
        // p.background(0, 0.02);
        if (particles.length < maxParticles) {
            // particles.push(emitter.copy());
            particles.push(p.createVector(Math.random() * winW, Math.random() * winH));
            polarities.push(1);
            ages.push(1000);
        }
        p.noFill();
        // p.stroke(270, 100, 100, 0.5);
        p.stroke((p.frameCount/10) % 360, 100, 100, 1);
        for (var i = 0; i < particles.length; i++) {
            if (ages[i] > 0) {
                var loc = particles[i],
                    vel = curl(loc.x, loc.y, 1).setMag(maxSpeed);
                    // vel = curl(loc.x, loc.y, p.frameCount).setMag(maxSpeed);
                vel.mult(polarities[i]);
                loc.add(vel);
                // wall(loc, i);
                // contain(loc, i);
                p.ellipse(loc.x, loc.y, 2, 2);
                ages[i] -= 1;
                // if (ages[i] <= 0) {
                //     particles[i] = emitter.copy();
                //     polarities[i] = 1;
                //     ages[i] = 1000;
                // } else { ages[i] -= 1 };
            }
        }
    };
    ////////////////////////////////////////////////////////////////////////////
    // Window resizing logic
    p.windowResized = function () {
        winW = document.getElementsByTagName('html')[0].clientWidth;
        winH = document.getElementsByTagName('html')[0].clientHeight;
        p.resizeCanvas(winW, winH);
        setSizes();
        particles = [];
        polarities = [];
        ages = [];
    };
    ////////////////////////////////////////////////////////////////////////////
    // Sets barrier and emitter info based on window size.
    function setSizes() {
        barrier = p.createVector(winW/2, winH/2);
        barrierSize = p.min(winW - 50, winH - 50);
        emitter = p.createVector(winW/2, winH/2);
    }
    ////////////////////////////////////////////////////////////////////////////
    // Uses finite difference method to compute curl of a gradient of a
    // potential field.
    function curl(x, y, t) {
        var eps = 1,
            n1, n2, a, b;
        // Change in x wrt y.
        n1 = rampedPotential(x, (y + eps), t);
        n2 = rampedPotential(x, (y - eps), t);
        a = (n1 - n2)/(2 * eps);
        // Change in y wrt x.
        n1 = rampedPotential((x + eps), y, t);
        n2 = rampedPotential((x - eps), y, t);
        b = (n1 - n2)/(2 * eps);
        return p.createVector(a, -b);
    }
    function gradient(x, y, t) {
        var eps = 1,
            n1, n2, a, b;
        // Change in x wrt y.
        n1 = scaledNoise(x, (y + eps), t);
        n2 = scaledNoise(x, (y - eps), t);
        a = (n1 - n2)/(2 * eps);
        // Change in y wrt x.
        n1 = scaledNoise((x + eps), y, t);
        n2 = scaledNoise((x - eps), y, t);
        b = (n1 - n2)/(2 * eps);
        return p.createVector(b, a);
    }

    function perlin(x, y, t) {
        var a, b;
        a = scaledNoise(x, 1, t);
        b = scaledNoise(1, y, t);
        return p.createVector(a, b);
    }
    ////////////////////////////////////////////////////////////////////////////
    // Computes value of Perlin noise at a coordinate.
    function scaledNoise(x, y, t) {
        return p.noise(x * noiseScale, y * noiseScale, t * noiseScale);
    }
    ////////////////////////////////////////////////////////////////////////////
    // Modulates the potential field by applying a ramp through zero based on
    // distance to the closest boundary point.
    function rampedPotential(x, y, t) {
        return scaledNoise(x, y, t);// * ramp(x, y);
    }
    ////////////////////////////////////////////////////////////////////////////
    // Smoothly ramps through zero based on distance to the closest boundary
    // point and width of the modified region of Perlin space (noiseScale).
    function ramp(x, y) {
        var v = barrier.copy().sub(x, y),
            d = v.mag()-barrierSize/2,
            r = d/noiseScale;
        if (r >= 1) { return 1; }
        if (r <= -1) { return -1; }
        return (15/8)*r - (10/8)*Math.pow(r, 3) + (3/8)*Math.pow(r, 5);
    }
    ////////////////////////////////////////////////////////////////////////////
    // Keeps particles inside the barrier.
    function contain(v, i) {
        var d = p5.Vector.sub(barrier, v);
        // Check if particle has moved outside boundary.
        if (d.mag() >= barrierSize/2) {
            // Move particle back inside boundary.
            d.setMag(maxSpeed + 1);
            v.add(d);
            // Reverse particle's directional polarity.
            polarities[i] *= -1;
        }
    }

    function perlinVel (x, y, t) {
        var v = p.createVector();
            n = scaledNoise(x, y, t);
        n = p.map(n, 0, 1, 0, p.TWO_PI);
        v.x = p.cos(n);
        v.y = p.sin(n);
        return v;
    }
    function wall(loc, i) {
        var newVel = p.createVector(0, 0);
        if (loc.x <= 0) { newVel.x = -loc.x; }
        else if (loc.x >= winW) { newVel.x = winW - loc.x; }
        if (loc.y <= 0) { newVel.y = -loc.y; }
        else if (loc.y >= winH) { newVel.y = winH - loc.y; }
        if (newVel.x != 0 || newVel.y != 0) {
            newVel.setMag(maxSpeed + 1);
            loc.add(newVel);
            polarities[i] *= -1;
        }
    }
};
// Create a new canvas running 'sketch' as a child of the element with id 'p5-sketch'.
var p5sketch = new p5(sketch, 'p5-sketch');