const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to fill the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial size setup

const mouse = [window.innerWidth/4, 450];
window.addEventListener('mousemove', (e) => {
    mouse[0] = e.clientX;
    mouse[1] = e.clientY;
});

const bones = [];

function pinv(matrix) {
    return math.pinv(matrix); // Math.js pseudo-inverse
}

const root = new Bone();
root.position[0] = window.innerWidth / 2;
root.position[1] = 100;
root.len = 100;
root.noIk = true;

let lastBone = root;

// Get from query string
let BONE_QTY = document.location.search.split('bone_quantity=')[1] || 3;

for(let i = 0; i < BONE_QTY - 1; i++) {
    const bone = new Bone();
    bone.angle = 0;
    bone.len = 100;
    bone.minAngle = null;
    bone.maxAngle = null;
    bone.setParent(lastBone);
    lastBone = bone;
}

bones.forEach(b => b.saveRelaxedState());

let lastTime = performance.now();

function update() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;

    bones.forEach(b => b.update(deltaTime));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const target = mouse;

    lastBone.ik(target, { maxIt: 50 });

    bones.sort((a, b) => a.zIndex - b.zIndex).forEach(b => b.draw());

    ctx.beginPath();
    ctx.arc(mouse[0], mouse[1], 5, 0, Math.PI * 2);
    ctx.fillStyle = 'green';
    ctx.fill();

    lastTime = currentTime;
    requestAnimationFrame(update);
}

update();
