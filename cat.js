const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to fill the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial size setup

const mouse = [0, 0];
window.addEventListener('mousemove', (e) => {
    mouse[0] = e.clientX;
    mouse[1] = e.clientY;
});

const bones = [];

function pinv(matrix) {
    return math.pinv(matrix); // Math.js pseudo-inverse
}

const bodyHeight = 200;
const floor = window.innerHeight;

let scale = 1.0;

// Phone / tablet: reduce scale
if (window.innerWidth < 800) {
    scale = 0.4;
}

const cat = new Bone();
cat.stableAngle = -0.05;
cat.angle = cat.stableAngle;
cat.position[0] = window.innerWidth / 2;
cat.position[1] = floor - bodyHeight;
cat.len = 100 * scale;
cat.noIk = true;
cat.flipX = false;

const body = new Bone();
body.angle = Math.PI - 0.1;
body.noIk = true;
body.flipX = false;
body.image = "./images/body.png";
body.imageOffset = [-50 * scale, -30 * scale];
body.imageAngle = Math.PI;
body.imageScale = 2.3;
body.setParent(cat);
body.zIndex = 1;
body.len = 100 * scale;

const backBody = new Bone();
backBody.setParent(cat);
backBody.angle = 0.1;
backBody.position[0] = 0;
backBody.position[1] = 0;
backBody.len = 100 * scale;
backBody.noIk = true;


const backLeg1 = new Bone();
backLeg1.setParent(backBody);
backLeg1.position[0] = 0;
backLeg1.position[1] = 0;
backLeg1.image = "./images/leg.png";
backLeg1.imageOffset = [-50 * scale, -50 * scale];
backLeg1.imageAngle = 3 * Math.PI / 2;
backLeg1.imageScale = 0.6;
backLeg1.zIndex = 2;
backLeg1.len = 100 * scale;

const backLeg1Foot = new Bone();
backLeg1Foot.setParent(backLeg1);
backLeg1Foot.image = "./images/paw.png";
backLeg1Foot.imageOffset = [-40 * scale, -40 * scale];
backLeg1Foot.imageAngle = -0.5 * Math.PI;
backLeg1Foot.imageScale = 0.4;
backLeg1Foot.zIndex = 2;
backLeg1Foot.len = 100 * scale;


const backLeg2 = new Bone();
backLeg2.setParent(backBody);
backLeg2.position[0] = 0;
backLeg2.position[1] = 0;
backLeg2.image = "./images/leg.png";
backLeg2.imageOffset = [-50 * scale, -50 * scale];
backLeg2.imageAngle = 3 * Math.PI / 2;
backLeg2.imageScale = 0.6;
backLeg2.len = 100 * scale;


const backLeg2Foot = new Bone();
backLeg2Foot.setParent(backLeg2);
backLeg2Foot.image = "./images/paw.png";
backLeg2Foot.imageOffset = [-20 * scale, -40 * scale];
backLeg2Foot.imageAngle = -0.5 * Math.PI;
backLeg2Foot.imageScale = 0.4;
backLeg2Foot.len = 100 * scale;


const frontLeg1 = new Bone();
frontLeg1.angle = -Math.PI / 2;
frontLeg1.setParent(body);
frontLeg1.position[1] = 0;
frontLeg1.image = "./images/leg.png";
frontLeg1.imageOffset = [00, -20 * scale];
frontLeg1.imageAngle = 3 * Math.PI / 2;
frontLeg1.imageScale = 0.6;
frontLeg1.zIndex = 2;
frontLeg1.len = 100 * scale;

const frontLeg1Foot = new Bone();
frontLeg1Foot.setParent(frontLeg1);
frontLeg1Foot.image = "./images/paw.png";
frontLeg1Foot.imageOffset = [0, -80 * scale];
frontLeg1Foot.imageAngle = -1 / 2 * Math.PI - 0.2;
frontLeg1Foot.imageScale = 0.4;
frontLeg1Foot.zIndex = 3;
frontLeg1Foot.len = 100 * scale;


const frontLeg2 = new Bone();
frontLeg2.angle = -Math.PI / 2;
frontLeg2.setParent(body);
frontLeg2.position[1] = 0;
frontLeg2.image = "./images/leg.png";
frontLeg2.imageOffset = [0, -20 * scale];
frontLeg2.imageAngle = 3 * Math.PI / 2;
frontLeg2.imageScale = 0.6;
frontLeg2.len = 100 * scale;

const frontLeg2Foot = new Bone();
frontLeg2Foot.setParent(frontLeg2);
frontLeg2Foot.image = "./images/paw.png";
frontLeg2Foot.imageOffset = [0, -80 * scale];
frontLeg2Foot.imageAngle = -1 / 2 * Math.PI - 0.2;
frontLeg2Foot.imageScale = 0.4;
frontLeg2Foot.len = 100 * scale;


const head = new Bone();
head.image = "./images/head.png";
head.imageOffset = [-60 * scale,-60 * scale];
head.imageAngle = -1.0 + Math.PI;
head.imageScale = 1.5;
head.setParent(body);
head.minAngle = -1;
head.maxAngle = 2;
head.zIndex = 2;
head.len = 80 * scale;

let jump = false;

document.addEventListener('mousedown', () => {
    jump = true;
});

const ear = new Bone();
ear.setParent(head);
ear.position[0] = 0;
ear.position[1] = 0;
ear.len = 20 * scale;
ear.angle = 0.4;

const tail1 = new Bone();
tail1.setParent(backBody);
tail1.position[0] = 0;
tail1.position[1] = 0;
tail1.len = 50 * scale;
tail1.angle = -0.4;
tail1.image = "./images/tail.png";
tail1.imageOffset = [-20 * scale, -60 * scale];
tail1.imageAngle = Math.PI/2;
tail1.imageScale = 0.5;


const tail2 = new Bone();
tail2.setParent(tail1);
tail2.position[0] = 0;
tail2.position[1] = 0;
tail2.len = 50 * scale;
tail2.angle = -0.2;
tail2.image = "./images/tail.png";
tail2.imageOffset = [-20 * scale, -60 * scale];
tail2.imageAngle = Math.PI/2;
tail2.imageScale = 0.5;


const tail3 = new Bone();
tail3.setParent(tail2);
tail3.position[0] = 0;
tail3.position[1] = 0;
tail3.len = 50 * scale;
tail3.angle = -0.2;
tail3.image = "./images/tail.png";
tail3.imageOffset = [-20 * scale, -60 * scale];
tail3.imageAngle = Math.PI/2;
tail3.imageScale = 0.5;


bones.forEach(b => b.saveRelaxedState());


function moveLegToNearestGridSpot(leg, offset) {
    leg.pushState();
    leg.restoreRelaxedState();

    const { start, end } = leg.positions();
    leg.popState();
    let direction = leg.rootParent().flipX ? 1 : -1;

    const size = 70 * scale;
    let x = end[0] - offset * size * 2;


    let gridSnappedX;

    if (direction < 0) {
        gridSnappedX = Math.floor(x / size / 2) * size * 2 + size * 2 + offset * size * 2;
    } else {
        gridSnappedX = Math.ceil(x / size / 2) * size * 2 - size * 2 + offset * size * 2;
    }

    let x1 = gridSnappedX;
    let y1 = end[1];
    let target1 = [x1, y1];
    let x2 = gridSnappedX + size * direction * 2.0;
    let y2 = end[1];
    let target2 = [x2, y2];

    const pointVec = math.subtract(end, target1)
    const targetsVec = math.subtract(target2, target1);
    let projection = math.dot(pointVec, targetsVec) / math.norm(math.dot(targetsVec, targetsVec));
    let f = null;

    if (projection < 0) {
        f = 0.0;
    }
    else if (projection > 1) {
        f = 1.0;
    }
    else {
        f = projection;
    }

    f = 1.0 - f;

    // Controls how much time the foot stays on the floor
    f *= 1.8;

    f = math.max(math.min(f, 1.0), 0.0);

    const blendFactor = f;
    const mix1 = math.multiply(target1, blendFactor);
    const mix2 = math.multiply(target2, 1.0 - blendFactor);
    const target = math.add(mix1, mix2);

    target[1] -= Math.sin(blendFactor * Math.PI) * 10.0;

    // Make sure target is not bellow floor
    target[1] = Math.min(target[1], floor);

    if (DRAW_GIZMOS) {
        // draw target
        ctx.beginPath()
        ctx.arc(target1[0], target1[1], 5, 0, Math.PI * 2);
        ctx.fillStyle = "#FF0000";
        ctx.fill();

        ctx.beginPath()
        ctx.arc(target2[0], target2[1], 5, 0, Math.PI * 2);
        ctx.fillStyle = "#00FF00";
        ctx.fill();

        ctx.beginPath()
        ctx.arc(target[0], target[1], 5, 0, Math.PI * 2);
        ctx.fillStyle = "#00FFFF";
        ctx.fill();
    }

    leg.ik(target);
}

let lastTime = performance.now();

function update() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;

    bones.forEach(b => b.update(deltaTime));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const target = mouse;
    const bodyStartMatrix = body.startPointMatrix();
    const bodyEndMatrix = backBody.endEffectorMatrix();
    const frontLegBaseTarget = [bodyStartMatrix[0][2], bodyStartMatrix[1][2] + 150];
    const backLegBaseTarget = [bodyEndMatrix[0][2], bodyEndMatrix[1][2] + 150];

    let frontLeg1Target = frontLegBaseTarget;
    let frontLeg2Target = math.add(frontLegBaseTarget, [10, 0]);
    let backLeg1Target = backLegBaseTarget;
    let backLeg2Target = math.add(backLegBaseTarget, [10, 0]);

    // Move body closer to target on x axis
    const deltaX = target[0] - cat.position[0];

    if (jump) {
        // cat.acceleration[1] = -20.0;
        // cat.angle = 2.0;
        jump = false;
    }
    if (cat.position[1] < floor - bodyHeight) {
        cat.acceleration[1] = 0.5;
    } else {
        // floor stops acceleration abruptly
        cat.acceleration[1] *= 0.1;
    }

    cat.flipX = deltaX > 0;

    const shouldMove = Math.abs(deltaX) > 15;

    const clampedDeltaX = Math.max(Math.min(deltaX, 10), -10);

    if (shouldMove) {
        cat.position[0] += clampedDeltaX * deltaTime * 0.0001 * math.norm(deltaX);
    }

    // For debugging:
    // cat.position[0] = mouse[0];

    try {
        moveLegToNearestGridSpot(frontLeg1Foot, 0);
        moveLegToNearestGridSpot(frontLeg2Foot, 0.5);
        moveLegToNearestGridSpot(backLeg1Foot, 0);
        moveLegToNearestGridSpot(backLeg2Foot, 0.5);
    } catch (e) {
        console.error(e);
    }

    // Set angle so head is looking at mouse.
    // Some oscilation for head angle
    const { start } = head.positions();
    const mouseHeadDiff = math.subtract(mouse, start);

    const angleBlendFac = deltaTime * 0.01;
    if (cat.flipX) {
        let angleTarget = -math.atan2(mouseHeadDiff[1], mouseHeadDiff[0]) + 1.0;
        head.angle = (angleTarget * angleBlendFac) + (head.angle * (1.0 - angleBlendFac)) ;
        head.angle += Math.cos(-performance.now() / 500) * 0.1;
        head.angle = head.angle % Math.PI;
    }
    else {
        let angleTarget = math.atan2(mouseHeadDiff[1], mouseHeadDiff[0]) + 4.0;
        head.angle = angleTarget;
        head.angle += Math.cos(-performance.now() / 500) * 0.1;
        head.angle = head.angle % Math.PI;
    }

    head.applyConstraints();

    // Move tail
    tail1.angle = 0.4 * Math.cos(performance.now() * 0.002) * Math.cos(performance.now() * 0.0001);
    tail2.angle = 0.3 * Math.cos(performance.now() * 0.002 + 1.0) * Math.cos(performance.now() * 0.0001);
    tail3.angle = 0.2 * Math.cos(performance.now() * 0.002 + 2.0) * Math.cos(performance.now() * 0.0001);


    bones.sort((a, b) => a.zIndex - b.zIndex).forEach(b => b.draw());

    // ctx.beginPath();
    // ctx.arc(mouse[0], mouse[1], 5, 0, Math.PI * 2);
    // ctx.fillStyle = 'green';
    // ctx.fill();

    lastTime = currentTime;
    requestAnimationFrame(update);
}

update();
