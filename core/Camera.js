class Camera {
    constructor(canvas) {
        this.canvas =
            canvas;

        /*
            Kamera dibuat cukup jauh agar Shifu, Oogway,
            dan Kai dapat terlihat bersama dalam satu scene.
        */
        this.target = [
            0.45,
            0.70,
            0.10
        ];

        this.distance =
            22.0;

        this.yaw =
            0.0;

        this.pitch =
            0.05;

        this.minDistance =
            3.0;

        this.maxDistance =
            45.0;

        this.isDragging =
            false;

        this.lastMouseX =
            0;

        this.lastMouseY =
            0;

        this.rotateSpeed =
            0.008;

        this.zoomSpeed =
            0.018;

        this.initControls();
    }


    initControls() {
        this.canvas.addEventListener(
            "mousedown",
            (event) => {
                this.isDragging =
                    true;

                this.lastMouseX =
                    event.clientX;

                this.lastMouseY =
                    event.clientY;
            }
        );


        window.addEventListener(
            "mouseup",
            () => {
                this.isDragging =
                    false;
            }
        );


        window.addEventListener(
            "mousemove",
            (event) => {
                if (
                    !this.isDragging
                ) {
                    return;
                }

                const dx =
                    event.clientX -
                    this.lastMouseX;

                const dy =
                    event.clientY -
                    this.lastMouseY;

                this.lastMouseX =
                    event.clientX;

                this.lastMouseY =
                    event.clientY;

                this.yaw +=
                    dx *
                    this.rotateSpeed;

                this.pitch +=
                    dy *
                    this.rotateSpeed;


                const maxPitch =
                    80 *
                    Math.PI /
                    180;

                if (
                    this.pitch >
                    maxPitch
                ) {
                    this.pitch =
                        maxPitch;
                }

                if (
                    this.pitch <
                    -maxPitch
                ) {
                    this.pitch =
                        -maxPitch;
                }
            }
        );


        this.canvas.addEventListener(
            "wheel",
            (event) => {
                event.preventDefault();

                this.distance +=
                    event.deltaY *
                    this.zoomSpeed;

                if (
                    this.distance <
                    this.minDistance
                ) {
                    this.distance =
                        this.minDistance;
                }

                if (
                    this.distance >
                    this.maxDistance
                ) {
                    this.distance =
                        this.maxDistance;
                }
            },
            {
                passive: false
            }
        );


        this.canvas.addEventListener(
            "dblclick",
            () => {
                this.reset();
            }
        );
    }


    reset() {
        this.distance =
            22.0;

        this.yaw =
            0.0;

        this.pitch =
            0.05;
    }


    getPosition() {
        const cosPitch =
            Math.cos(
                this.pitch
            );

        const sinPitch =
            Math.sin(
                this.pitch
            );

        const sinYaw =
            Math.sin(
                this.yaw
            );

        const cosYaw =
            Math.cos(
                this.yaw
            );


        return [
            this.target[0] +
                this.distance *
                cosPitch *
                sinYaw,

            this.target[1] +
                this.distance *
                sinPitch,

            this.target[2] +
                this.distance *
                cosPitch *
                cosYaw
        ];
    }


    getViewMatrix() {
        return this.lookAt(
            this.getPosition(),
            this.target,
            [0, 1, 0]
        );
    }


    lookAt(
        eye,
        center,
        up
    ) {
        let zx =
            eye[0] -
            center[0];

        let zy =
            eye[1] -
            center[1];

        let zz =
            eye[2] -
            center[2];

        let length =
            Math.hypot(
                zx,
                zy,
                zz
            );

        if (
            length === 0
        ) {
            zz = 1;

            length = 1;
        }

        zx /= length;
        zy /= length;
        zz /= length;


        let xx =
            up[1] *
                zz -
            up[2] *
                zy;

        let xy =
            up[2] *
                zx -
            up[0] *
                zz;

        let xz =
            up[0] *
                zy -
            up[1] *
                zx;

        length =
            Math.hypot(
                xx,
                xy,
                xz
            );

        if (
            length === 0
        ) {
            xx = 1;
            xy = 0;
            xz = 0;

            length = 1;
        }

        xx /= length;
        xy /= length;
        xz /= length;


        const yx =
            zy *
                xz -
            zz *
                xy;

        const yy =
            zz *
                xx -
            zx *
                xz;

        const yz =
            zx *
                xy -
            zy *
                xx;


        return new Float32Array([
            xx,
            yx,
            zx,
            0,

            xy,
            yy,
            zy,
            0,

            xz,
            yz,
            zz,
            0,

            -(
                xx *
                    eye[0] +
                xy *
                    eye[1] +
                xz *
                    eye[2]
            ),

            -(
                yx *
                    eye[0] +
                yy *
                    eye[1] +
                yz *
                    eye[2]
            ),

            -(
                zx *
                    eye[0] +
                zy *
                    eye[1] +
                zz *
                    eye[2]
            ),

            1
        ]);
    }
}
