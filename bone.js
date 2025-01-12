const DRAW_GIZMOS = false;


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
        if (this.angle < this.minAngle) {
            this.angle = this.minAngle;
        }
        if (this.angle > this.maxAngle) {
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
        // todo: offset is not working
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
            //this.acceleration = math.multiply(this.acceleration, damping);
            this.position = math.add(this.position, math.multiply(this.acceleration, deltaTime));
        }

        if (this.stableAngle) {
            const factor = 0.005 * deltaTime;
            this.angle = this.angle * (1.0 - factor) + this.stableAngle * factor;
        }
    }

    ik(target) {
        const MAX_IT = 20;
        for (let i = 0; i < MAX_IT; i++) {
            const matrices = [];
            const matricesPlusDelta = [];
            const matricesMinusDelta = [];
            const derivativeMatrix = [];

            let bone = this;

            while (bone) {
                matrices.push(bone.endEffectorMatrix());
                const matrixPlusDelta = bone.endEffectorMatrix(0.1);
                const matrixMinusDelta = bone.endEffectorMatrix(-0.1);
                matricesPlusDelta.push(matrixPlusDelta);
                matricesMinusDelta.push(matrixMinusDelta);
                derivativeMatrix.push(math.subtract(matrixPlusDelta, matrixMinusDelta));
                bone = bone.parent;
            }

            const jacobian = derivativeMatrix;
            const jacobianPinv = jacobian.map(m => pinv(m));
            const normalizedJacobianPinv = math.multiply(jacobianPinv, 1 / math.norm(jacobianPinv));
            const epsilon = 0.001;
            const endEffectorMatrix = this.lastChild().endEffectorMatrix();
            const endEffectorPosition = [endEffectorMatrix[0][2], endEffectorMatrix[1][2]];

            const error = math.subtract(target, endEffectorPosition);
            if (math.norm(error) < 2) {
                break;
            }

            const deltaTheta = jacobianPinv.map(matrix => {
                return matrix.map((row, rowIdx) => {
                    return row.reduce((sum, value, colIdx) => {
                        if (colIdx > 1) return sum;
                        return sum + value * error[colIdx];
                    }, 0);
                });
            });

            let jointAngles = [];
            bone = this;
            while (bone) {
                jointAngles.push(bone.angle);
                bone = bone.parent;
            }

            jointAngles = jointAngles.map((angle, idx) => {
                const adjustment = deltaTheta[idx].reduce((sum, value) => sum + value, 0);
                return angle + adjustment * epsilon * Math.min(math.norm(error), 1);
            });

            bone = this;
            jointAngles.reverse();

            while (bone) {
                if (!bone.noIk) {
                    bone.angle = jointAngles.pop() % (2 * Math.PI);
                    bone.applyConstraints();
                }
                bone = bone.parent;
            }

            if (math.norm(error) < 2) {
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
        if (this._image) {
            this.drawImage();
        }
        if (DRAW_GIZMOS) {
            this.drawLine();
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