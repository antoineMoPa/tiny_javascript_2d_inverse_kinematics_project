const DRAW_GIZMOS = document.location.search.includes("gizmos");
const BONE_MODE = document.location.search.includes("bone_mode");

if (BONE_MODE) {
    document.body.style.background = "white";
}

class Bone {
    parent = null;
    child = null;
    position = [0,0];
    acceleration = [0, 0];
    len = 100;
    angle = 0.4 * Math.PI;
    minAngle = -2.0 * Math.PI;
    maxAngle = 2.0 * Math.PI;
    stableAngle = null;
    noIk = false;
    _image = null;
    imageOffset = [0, 0];
    imageAngle = 0;
    imageScale = 1;
    zIndex = 0;

    state = [];
    relaxedState = null;

    constructor() {
        bones.push(this);
    }

    saveState() {
        return {
            angle: this.angle,
        };
    }

    saveRelaxedState() {
        this.relaxedState = this.saveState();
    }

    restoreRelaxedState() {
        let bone = this;

        do {
            bone.setState(bone.relaxedState);
            bone = bone.parent;
        } while (bone && !bone.noIk);
    }

    setState(state) {
        this.angle = state.angle;
    }

    pushState() {
        this.state.push(this.saveState());
    }

    popState() {
        if (this.state.length == 0) {
            throw new Error("nothing to pop");
        }
        this.setState(this.state.pop());
    }

    setParent(parent) {
        this.parent = parent;
        parent.child = this;
    }

    applyConstraints() {
        this.angle = ((this.angle + Math.PI/2) % (2 * Math.PI)) - Math.PI/2;
        if (this.minAngle !== null && this.angle < this.minAngle) {
            this.angle = this.minAngle;
        }
        if (this.maxAngle !== null && this.angle > this.maxAngle) {
            this.angle = this.maxAngle;
        }
    }

    localEffectorMatrix(deltaAngle = 0) {
        const c = Math.cos(this.angle + deltaAngle);
        const s = Math.sin(this.angle + deltaAngle);
        const x = this.len * c;
        const y = this.len * s;

        return [
             [c, -s, x],
             [s, c, y],
             [0, 0, 1]
        ];
    }

    parentMatrix(deltaAngle = 0) {
        if (this.parent) {
            return this.parent.transformMatrix(deltaAngle);
        }
        else {
            return [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ];
        }
    }

    offsetMatrix() {
        return [
            [1, 0, this.position[0]],
            [0, 1, this.position[1]],
            [0, 0, 1]
        ];
    }

    transformMatrix(deltaAngle = 0) {
        const T = this.localEffectorMatrix(deltaAngle);

        return math.multiply(this.offsetMatrix(), this.parentMatrix(deltaAngle), T);
    }

    startPointMatrix(deltaAngle = 0) {
        const rootParent = this.rootParent();
        const T1 = [
            [1, 0, -rootParent.position[0]],
            [0, 1, -rootParent.position[1]],
            [0, 0, 1]
        ];
        const T2 = [
            [1, 0, rootParent.position[0]],
            [0, 1, rootParent.position[1]],
            [0, 0, 1]
        ];
        const S = [
            [rootParent.flipX? -1 : 1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];

        let m = math.multiply(this.offsetMatrix(), this.parentMatrix(deltaAngle));
        m = math.multiply(T1, m);
        m = math.multiply(S, m);
        m = math.multiply(T2, m);

        return m;
    }

    endEffectorMatrix(deltaAngle = 0) {
        const rootParent = this.rootParent();
        const T1 = [
            [1, 0, -rootParent.position[0]],
            [0, 1, -rootParent.position[1]],
            [0, 0, 1]
        ];
        const T2 = [
            [1, 0, rootParent.position[0]],
            [0, 1, rootParent.position[1]],
            [0, 0, 1]
        ];
        const S = [
            [rootParent.flipX? -1 : 1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];

        let m = this.transformMatrix(deltaAngle);
        m = math.multiply(T1, m);
        m = math.multiply(S, m);
        m = math.multiply(T2, m);

        return m;
    }

    positions() {
        const startMatrix = this.startPointMatrix();
        const endMatrix = this.endEffectorMatrix();
        const start = [startMatrix[0][2], startMatrix[1][2]];
        const end = [endMatrix[0][2], endMatrix[1][2]];

        return { start, end };
    }

    rootParent() {
        let bone = this;
        while (bone.parent) {
            bone = bone.parent;
        }
        return bone;
    }

    update(deltaTime) {
        const damping = 0.99;
        if (math.norm(this.acceleration) > 0.001){
            this.position = math.add(this.position, math.multiply(this.acceleration, deltaTime));
        }

        if (this.stableAngle) {
            const factor = 0.005 * deltaTime;
            this.angle = this.angle * (1.0 - factor) + this.stableAngle * factor;
        }
    }

    ik(target, { maxIt } = { maxIt: 30 }) {
        const MAX_IT = maxIt;
        for (let i = 0; i < MAX_IT; i++) {
            let jacobian = [];

            let bone = this;
            let bones = [];

            while (bone) {
                // Find impact of a angle change on the end effector position
                const matrixPlusDelta = bone.endEffectorMatrix(0.1);
                const matrixMinusDelta = bone.endEffectorMatrix(-0.1);
                const diff = math.subtract(matrixPlusDelta, matrixMinusDelta);

                jacobian.push([
                    diff[0][2], // Position x
                    diff[1][2], // Position y
                ]);

                if (bone.noIk) {
                    break;
                }

                bones.push(bone);
                bone = bone.parent;
            }

            jacobian = math.transpose(jacobian); // Rows become columns

            const jacobianPinv = pinv(jacobian);
            const endEffectorMatrix = this.lastChild().endEffectorMatrix();
            const endEffectorPosition = [endEffectorMatrix[0][2], endEffectorMatrix[1][2]];

            const error = math.subtract(target, endEffectorPosition);

            const deltaTheta = math.multiply(jacobianPinv, error);

            const epsilon = 0.3;

            for (let i = 0; i < bones.length; i++) {
                bones[i].angle += deltaTheta[i] * epsilon;
            }

            if (math.norm(error) < 1) {
                break;
            }
        }
    }

    drawLine() {
        ctx.beginPath();
        const startMatrix = this.startPointMatrix();
        const endMatrix = this.endEffectorMatrix();

        const x1 = startMatrix[0][2];
        const y1 = startMatrix[1][2];
        const x2 = endMatrix[0][2];
        const y2 = endMatrix[1][2];

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.stroke();

        if (DRAW_GIZMOS) {
            ctx.beginPath();
            ctx.arc(x1, y1, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x2, y2, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'blue';
            ctx.fill();
        }
    }

    set image(url) {
        this._image = new Image();
        this._image.src = url;
    }

    globalAngle() {
        let angle = this.angle;
        let bone = this.parent;
        while (bone) {
            angle += bone.angle;
            bone = bone.parent;
        }
        return angle;
    }

    drawImage() {
        const startMatrix = this.startPointMatrix();
        const endMatrix = this.endEffectorMatrix();
        const start = [startMatrix[0][2], startMatrix[1][2]];
        const end = [endMatrix[0][2], endMatrix[1][2]];
        const midPoint = math.multiply(0.5, math.add(start, end));

        let angle = this.globalAngle();
        const rootParent = this.rootParent();

        ctx.save();

        ctx.translate(midPoint[0], midPoint[1]);

        if (rootParent.flipX) {
            ctx.scale(-1, 1);
        }

        ctx.rotate(angle + this.imageAngle);
        ctx.translate(this.imageOffset[0], this.imageOffset[1]);
        ctx.scale(this.imageScale, this.imageScale);
        const imageAspectRatio = this._image.width / this._image.height;

        ctx.drawImage(this._image, 0, 0, this.len, this.len / imageAspectRatio);

        ctx.restore();
    }

    draw() {
        if (BONE_MODE) {
            this.drawLine();
            return;
        }
        if (this._image) {
            this.drawImage();
        }
    }

    lastChild() {
        let bone = this;
        while (bone.child) {
            bone = bone.child;
        }
        return bone;
    }
}
