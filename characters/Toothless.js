/*
    STEP 18 - CONTINUOUS ANATOMY AND SURFACE-CONFORMING FACE

    Native WebGL: all meshes are generated from authored parameters.
    The GLB was inspected offline only; it is not loaded by this character.
    Torso, head and limbs use closed cubic-Bezier section lofts.
    Debug region colors remain enabled; animation is intentionally deferred.
    Quadric requirements: cone claws, elliptic-paraboloid spikes,
    trimmed hyperbolic-paraboloid wing membranes.
    Replace objects/HyperbolicParaboloid.js together with this file.
*/


function signedPower(value, power) {
    if (Math.abs(value) < 0.000001) {
        return 0;
    }

    return (
        Math.sign(value) *
        Math.pow(
            Math.abs(value),
            power
        )
    );
}


function generateSuperellipsoid(
    radiusX,
    radiusY,
    radiusZ,
    latitudeExponent,
    longitudeExponent,
    sectorCount,
    stackCount,
    color
) {
    const vertices = [];
    const faces = [];

    for (
        let i = 0;
        i <= stackCount;
        i++
    ) {
        const latitude =
            -Math.PI / 2 +
            (
                i /
                stackCount
            ) *
            Math.PI;

        const cosLat =
            Math.cos(latitude);

        const sinLat =
            Math.sin(latitude);

        for (
            let j = 0;
            j <= sectorCount;
            j++
        ) {
            const longitude =
                (
                    j /
                    sectorCount
                ) *
                Math.PI *
                2;

            const cosLon =
                Math.cos(longitude);

            const sinLon =
                Math.sin(longitude);

            const common =
                signedPower(
                    cosLat,
                    latitudeExponent
                );

            const x =
                radiusX *
                common *
                signedPower(
                    cosLon,
                    longitudeExponent
                );

            const y =
                radiusY *
                signedPower(
                    sinLat,
                    latitudeExponent
                );

            const z =
                radiusZ *
                common *
                signedPower(
                    sinLon,
                    longitudeExponent
                );

            vertices.push(
                x,
                y,
                z,

                color[0],
                color[1],
                color[2]
            );
        }
    }

    const row =
        sectorCount + 1;

    for (
        let i = 0;
        i < stackCount;
        i++
    ) {
        for (
            let j = 0;
            j < sectorCount;
            j++
        ) {
            const a =
                i * row + j;

            const b =
                a + row;

            const c =
                a + 1;

            const d =
                b + 1;

            faces.push(
                a,
                b,
                c
            );

            faces.push(
                c,
                b,
                d
            );
        }
    }

    return {
        vertices,
        faces
    };
}


function generateTaperedSuperellipsoid(
    radiusX,
    radiusY,
    radiusZ,
    latitudeExponent,
    longitudeExponent,
    backScale,
    frontScale,
    sectorCount,
    stackCount,
    color
) {
    const mesh =
        generateSuperellipsoid(
            radiusX,
            radiusY,
            radiusZ,
            latitudeExponent,
            longitudeExponent,
            sectorCount,
            stackCount,
            color
        );

    for (
        let i = 0;
        i < mesh.vertices.length;
        i += 6
    ) {
        const z =
            mesh.vertices[i + 2];

        const normalizedZ =
            Math.max(
                0,
                Math.min(
                    1,
                    (
                        z /
                        radiusZ +
                        1
                    ) /
                    2
                )
            );

        const scale =
            backScale *
                (
                    1 -
                    normalizedZ
                ) +
            frontScale *
                normalizedZ;

        mesh.vertices[i] *=
            scale;
    }

    return mesh;
}


/*
    Thin 3D almond/lens mesh.
    Berbeda dari ellipsoid karena ujung kiri dan kanan
    dibuat lebih tajam seperti mata Toothless.
*/
function generateAlmondEye(
    halfWidth,
    halfHeight,
    depth,
    segments,
    color
) {
    const vertices = [];
    const faces = [];

    const frontZ =
        depth / 2;

    const backZ =
        -depth / 2;

    // Front ring
    for (
        let i = 0;
        i < segments;
        i++
    ) {
        const theta =
            (
                i /
                segments
            ) *
            Math.PI *
            2;

        const x =
            halfWidth *
            Math.cos(theta);

        const s =
            Math.sin(theta);

        /*
            Exponent > 1 membuat sisi kiri/kanan
            lebih runcing daripada ellipse biasa.
        */
        const y =
            halfHeight *
            Math.sign(s) *
            Math.pow(
                Math.abs(s),
                1.45
            );

        const bulge =
            1 -
            Math.min(
                1,
                Math.abs(x) /
                halfWidth
            );

        vertices.push(
            x,
            y,
            frontZ +
                bulge *
                depth *
                0.16,

            color[0],
            color[1],
            color[2]
        );
    }

    // Back ring
    for (
        let i = 0;
        i < segments;
        i++
    ) {
        const theta =
            (
                i /
                segments
            ) *
            Math.PI *
            2;

        const x =
            halfWidth *
            Math.cos(theta);

        const s =
            Math.sin(theta);

        const y =
            halfHeight *
            Math.sign(s) *
            Math.pow(
                Math.abs(s),
                1.45
            );

        vertices.push(
            x,
            y,
            backZ,

            color[0],
            color[1],
            color[2]
        );
    }

    const frontCenter =
        vertices.length / 6;

    vertices.push(
        0,
        0,
        frontZ +
            depth *
            0.18,

        color[0],
        color[1],
        color[2]
    );

    const backCenter =
        vertices.length / 6;

    vertices.push(
        0,
        0,
        backZ,

        color[0],
        color[1],
        color[2]
    );

    for (
        let i = 0;
        i < segments;
        i++
    ) {
        const next =
            (
                i + 1
            ) %
            segments;

        // Front face
        faces.push(
            frontCenter,
            i,
            next
        );

        // Back face
        faces.push(
            backCenter,
            segments + next,
            segments + i
        );

        // Side wall
        faces.push(
            i,
            segments + i,
            next
        );

        faces.push(
            next,
            segments + i,
            segments + next
        );
    }

    return {
        vertices,
        faces
    };
}



/* STEP 18: authored cross-section surfaces, not reference mesh data.
 * Profiles are editable design controls. Cubic Hermite interpolation is
 * expressed as cubic Bezier control points, so every longitudinal strip
 * is a cubic Bezier curve. Closed rings share vertices (no seam normals).
 */
function t18Profile(rows, t) {
    const n = rows.length - 1;
    const u = Math.max(0, Math.min(n, t));
    const i = Math.min(n - 1, Math.floor(u)), f = u - i;
    return rows[i].map((a, k) => {
        const b = rows[i + 1][k];
        const m0 = (rows[Math.min(n, i + 1)][k] - rows[Math.max(0, i - 1)][k]) * .5;
        const m1 = (rows[Math.min(n, i + 2)][k] - rows[i][k]) * .5;
        const q = 1 - f;
        return q*q*q*a + 3*q*q*f*(a+m0/3) + 3*q*f*f*(b-m1/3) + f*f*f*b;
    });
}

// Row: [axis position, center A, center B, radius A, radius B+, radius B-].
// axis z: A=x, B=y. axis y: A=x, B=z.
function t18Loft(rows, axis, colorAt, exponent = 1, steps = 8, sides = 48) {
    const vertices = [], faces = [], count = (rows.length - 1) * steps;
    for (let i = 0; i <= count; i++) {
        const r = t18Profile(rows, i/count*(rows.length-1));
        const color = colorAt(i/count, r);
        for (let j = 0; j < sides; j++) {
            const a = j/sides*Math.PI*2, sn = Math.sin(a);
            const A = r[1] + Math.max(.0001,r[3])*signedPower(Math.cos(a),exponent);
            const B = r[2] + Math.max(.0001,sn>=0?r[4]:r[5])*signedPower(sn,exponent);
            const pos = axis === 'z' ? [A,B,r[0]] : [A,r[0],B];
            vertices.push(...pos,...color);
            if (i < count) {
                const x=i*sides+j, y=i*sides+(j+1)%sides;
                faces.push(x,y,x+sides,y,y+sides,x+sides);
            }
        }
    }
    // Separate pole vertices cap both ends without zero-area ring triangles.
    for (const [ring, row, flip] of [[0,rows[0],false],[count,rows[rows.length-1],true]]) {
        const pole=vertices.length/6;
        vertices.push(...(axis==='z'?[row[1],row[2],row[0]]:[row[1],row[0],row[2]]),...colorAt(ring/count,row));
        for(let j=0;j<sides;j++) {
            const a=ring*sides+j,b=ring*sides+(j+1)%sides;
            faces.push(pole,flip?b:a,flip?a:b);
        }
    }
    return {vertices,faces};
}

function t18Color(stops, t) {
    const u=Math.max(0,Math.min(stops.length-1,t*(stops.length-1)));
    const i=Math.min(stops.length-2,Math.floor(u)),f=u-i;
    return stops[i].map((v,k)=>v+(stops[i+1][k]-v)*f);
}

class Toothless {
    constructor(GL, shaderProgram) {
        this.GL = GL;
        this.shaderProgram = shaderProgram;

        // =====================================================
        // REFERENCE SCALE
        // =====================================================
        // Proporsi model ini dibangun ulang dari GLB referensi.
        // Arah karakter:
        // +Z = depan / kepala
        // -Z = belakang / ekor
        // +Y = atas
        // X  = kiri / kanan

        this.bodyParts = [];
        this.headParts = [];
        this.faceParts = [];

        this.frontLegParts = [];
        this.backLegParts = [];
        this.feet = [];
        this.claws = [];

        this.wings = [];
        this.wingSpines = [];

        this.tailParts = [];
        this.tailFins = [];

        this.dorsalSpikes = [];
        this.headSpikes = [];

        this.createAnatomicalBody();
        this.createHead();
        this.createLegs();
        this.createWings();
        this.createTail();
        this.createDorsalDetails();
    }


    // =========================================================
    // HELPERS
    // =========================================================

    makeEllipsoid(
        rx,
        ry,
        rz,
        x,
        y,
        z,
        color,
        rotationX = 0,
        rotationY = 0,
        rotationZ = 0,
        sectorCount = 32,
        stackCount = 22
    ) {
        const mesh = generateEllipsoid(
            rx,
            ry,
            rz,
            sectorCount,
            stackCount,
            color
        );

        const object = new MyObject(
            this.GL,
            mesh.vertices,
            mesh.faces,
            this.shaderProgram
        );

        LIBS.translateX(
            object.MODEL_MATRIX,
            x
        );

        LIBS.translateY(
            object.MODEL_MATRIX,
            y
        );

        LIBS.translateZ(
            object.MODEL_MATRIX,
            z
        );

        if (rotationX !== 0) {
            LIBS.rotateX(
                object.MODEL_MATRIX,
                LIBS.degToRad(rotationX)
            );
        }

        if (rotationY !== 0) {
            LIBS.rotateY(
                object.MODEL_MATRIX,
                LIBS.degToRad(rotationY)
            );
        }

        if (rotationZ !== 0) {
            LIBS.rotateZ(
                object.MODEL_MATRIX,
                LIBS.degToRad(rotationZ)
            );
        }

        return object;
    }


    makeBezierTube(
        P0,
        P1,
        P2,
        P3,
        startRadius,
        endRadius,
        color,
        pathSegments = 22,
        radialSegments = 10
    ) {
        const mesh = generateBezierTail(
            P0,
            P1,
            P2,
            P3,
            startRadius,
            endRadius,
            pathSegments,
            radialSegments,
            color
        );

        return new MyObject(
            this.GL,
            mesh.vertices,
            mesh.faces,
            this.shaderProgram
        );
    }


    makeParaboloid(
        rx,
        rz,
        height,
        x,
        y,
        z,
        color,
        rotationX = 0,
        rotationY = 0,
        rotationZ = 0
    ) {
        const mesh =
            generateEllipticParaboloid(
                rx,
                rz,
                height,
                22,
                14,
                color
            );

        const object = new MyObject(
            this.GL,
            mesh.vertices,
            mesh.faces,
            this.shaderProgram
        );

        LIBS.translateX(
            object.MODEL_MATRIX,
            x
        );

        LIBS.translateY(
            object.MODEL_MATRIX,
            y
        );

        LIBS.translateZ(
            object.MODEL_MATRIX,
            z
        );

        if (rotationX !== 0) {
            LIBS.rotateX(
                object.MODEL_MATRIX,
                LIBS.degToRad(rotationX)
            );
        }

        if (rotationY !== 0) {
            LIBS.rotateY(
                object.MODEL_MATRIX,
                LIBS.degToRad(rotationY)
            );
        }

        if (rotationZ !== 0) {
            LIBS.rotateZ(
                object.MODEL_MATRIX,
                LIBS.degToRad(rotationZ)
            );
        }

        return object;
    }


    makeClaw(
        x,
        y,
        z,
        rotationX = 180,
        rotationZ = 0
    ) {
        const clawColor = [
            0.95,
            0.95,
            0.95
        ];

        const mesh = generateCone(
            0.048,
            0.18,
            16,
            clawColor
        );

        const claw = new MyObject(
            this.GL,
            mesh.vertices,
            mesh.faces,
            this.shaderProgram
        );

        LIBS.translateX(
            claw.MODEL_MATRIX,
            x
        );

        LIBS.translateY(
            claw.MODEL_MATRIX,
            y
        );

        LIBS.translateZ(
            claw.MODEL_MATRIX,
            z
        );

        LIBS.rotateX(
            claw.MODEL_MATRIX,
            LIBS.degToRad(rotationX)
        );

        if (rotationZ !== 0) {
            LIBS.rotateZ(
                claw.MODEL_MATRIX,
                LIBS.degToRad(rotationZ)
            );
        }

        this.claws.push(claw);
    }


    makeSuperellipsoid(
        rx,
        ry,
        rz,
        latitudeExponent,
        longitudeExponent,
        x,
        y,
        z,
        color,
        rotationX = 0,
        rotationY = 0,
        rotationZ = 0,
        sectorCount = 32,
        stackCount = 22
    ) {
        const mesh =
            generateSuperellipsoid(
                rx,
                ry,
                rz,
                latitudeExponent,
                longitudeExponent,
                sectorCount,
                stackCount,
                color
            );

        const object =
            new MyObject(
                this.GL,
                mesh.vertices,
                mesh.faces,
                this.shaderProgram
            );

        LIBS.translateX(
            object.MODEL_MATRIX,
            x
        );

        LIBS.translateY(
            object.MODEL_MATRIX,
            y
        );

        LIBS.translateZ(
            object.MODEL_MATRIX,
            z
        );

        if (rotationX !== 0) {
            LIBS.rotateX(
                object.MODEL_MATRIX,
                LIBS.degToRad(
                    rotationX
                )
            );
        }

        if (rotationY !== 0) {
            LIBS.rotateY(
                object.MODEL_MATRIX,
                LIBS.degToRad(
                    rotationY
                )
            );
        }

        if (rotationZ !== 0) {
            LIBS.rotateZ(
                object.MODEL_MATRIX,
                LIBS.degToRad(
                    rotationZ
                )
            );
        }

        return object;
    }


    makeTaperedSuperellipsoid(
        rx,
        ry,
        rz,
        latitudeExponent,
        longitudeExponent,
        backScale,
        frontScale,
        x,
        y,
        z,
        color,
        rotationX = 0,
        rotationY = 0,
        rotationZ = 0
    ) {
        const mesh =
            generateTaperedSuperellipsoid(
                rx,
                ry,
                rz,
                latitudeExponent,
                longitudeExponent,
                backScale,
                frontScale,
                32,
                22,
                color
            );

        const object =
            new MyObject(
                this.GL,
                mesh.vertices,
                mesh.faces,
                this.shaderProgram
            );

        LIBS.translateX(
            object.MODEL_MATRIX,
            x
        );

        LIBS.translateY(
            object.MODEL_MATRIX,
            y
        );

        LIBS.translateZ(
            object.MODEL_MATRIX,
            z
        );

        if (rotationX !== 0) {
            LIBS.rotateX(
                object.MODEL_MATRIX,
                LIBS.degToRad(
                    rotationX
                )
            );
        }

        if (rotationY !== 0) {
            LIBS.rotateY(
                object.MODEL_MATRIX,
                LIBS.degToRad(
                    rotationY
                )
            );
        }

        if (rotationZ !== 0) {
            LIBS.rotateZ(
                object.MODEL_MATRIX,
                LIBS.degToRad(
                    rotationZ
                )
            );
        }

        return object;
    }


    makeAlmondEye(
        halfWidth,
        halfHeight,
        depth,
        x,
        y,
        z,
        color,
        rotationY,
        rotationZ
    ) {
        const mesh =
            generateAlmondEye(
                halfWidth,
                halfHeight,
                depth,
                34,
                color
            );

        const object =
            new MyObject(
                this.GL,
                mesh.vertices,
                mesh.faces,
                this.shaderProgram
            );

        LIBS.translateX(
            object.MODEL_MATRIX,
            x
        );

        LIBS.translateY(
            object.MODEL_MATRIX,
            y
        );

        LIBS.translateZ(
            object.MODEL_MATRIX,
            z
        );

        LIBS.rotateY(
            object.MODEL_MATRIX,
            LIBS.degToRad(
                rotationY
            )
        );

        LIBS.rotateZ(
            object.MODEL_MATRIX,
            LIBS.degToRad(
                rotationZ
            )
        );

        return object;
    }


    // =========================================================
    // BODY
    // =========================================================

    makeProfile(rows, axis, colors, exponent = 1) {
        const mesh = t18Loft(rows,axis,(t)=>t18Color(colors,t),exponent);
        return new MyObject(this.GL,mesh.vertices,mesh.faces,this.shaderProgram);
    }

    createAnatomicalBody() {
        // One continuous skin from sacrum to neck; debug color marks regions.
        // [z, x, y, half width, upper height, lower height]
        this.trunkProfile = [
            [.25,0,-.445,.185,.19,.19],
            [.55,0,-.32,.22,.24,.20],
            [.95,0,-.16,.30,.29,.25],
            [1.35,0,-.035,.335,.31,.28],
            [1.80,0,.025,.38,.365,.35],
            [2.20,0,.12,.425,.365,.40],
            [2.48,0,.22,.385,.33,.38],
            [2.72,0,.335,.30,.29,.33],
            [2.96,0,.43,.265,.245,.24],
            [3.18,0,.455,.235,.185,.17]
        ];
        this.bodyParts.push(this.makeProfile(this.trunkProfile,'z',[
            [.18,.72,.80],[.28,.76,.32],[.95,.79,.18],
            [.94,.52,.18],[.88,.25,.20],[.58,.38,.88],[.93,.42,.72]
        ],.90));
    }

    createHead() {
        // One craniofacial surface: temple, forehead and muzzle are sections
        // of the same mesh, rather than intersecting boxes/cheek balls.
        this.skullProfile = [
            [2.88,0,.47,.22,.16,.12],
            [3.03,0,.48,.36,.22,.17],
            [3.20,0,.47,.405,.25,.20],
            [3.38,0,.425,.375,.245,.18],
            [3.55,0,.36,.32,.205,.12],
            [3.69,0,.305,.25,.14,.075],
            [3.79,0,.275,.14,.065,.035],
            [3.825,0,.267,.012,.012,.010]
        ];
        this.headParts.push(this.makeProfile(this.skullProfile,'z',[
            [.82,.26,.52],[.92,.33,.16],[.92,.33,.16],[.22,.80,.88]
        ],.91));

        // Thin jaw follows the cheek/muzzle outline. Its front upper edge
        // sits just below the upper lip; the dark interior is a recessed
        // volume, never a floating mouth tube.
        const jawRows = this.skullProfile.slice(1).map(r=>[
            r[0]-.003,0,r[2]-.028,r[3]*.973,.023,r[5]+.008
        ]);
        this.headParts.push(this.makeProfile(jawRows,'z',[[.20,.44,.90],[.20,.44,.90]],.91));
        const interior=this.skullProfile.slice(1).map(r=>[
            r[0]-.001,0,r[2]-.013,r[3]*.985,.016,r[5]+.008
        ]);
        this.faceParts.push(this.makeProfile(interior,'z',[[.045,.055,.065],[.045,.055,.065]],.91));

        // Surface coordinate lookup. Eye lenses and lids conform to the
        // SAME skull instead of floating in a front-facing plane.
        // Cache the editable profile so surface-conforming face generation
        // does not repeatedly solve the same cubic sections on page load.
        const sections=Array.from({length:513},(_,i)=>t18Profile(this.skullProfile,i/512*(this.skullProfile.length-1)));
        const headSection=z=> {
            let lo=0,hi=512;
            while(hi-lo>1){const mid=(lo+hi)>>1;if(sections[mid][0]<z)lo=mid;else hi=mid;}
            const f=Math.max(0,Math.min(1,(z-sections[lo][0])/(sections[hi][0]-sections[lo][0])));
            return sections[lo].map((v,k)=>v+(sections[hi][k]-v)*f);
        };
        const surface=(z,theta,side,offset=0)=> {
            const r=headSection(z), sn=Math.sin(theta);
            return [side*(r[3]*signedPower(Math.cos(theta),.91)+offset*Math.cos(theta)),
                r[2]+(sn>=0?r[4]:r[5])*signedPower(sn,.91)+offset*sn,z];
        };
        const eyeSurface=(u,v,side,offset=0)=> {
            const z=3.52+.12*u, y=.435-.008*u+.075*v;
            const r=headSection(z);
            const ratio=(y-r[2])/(y>=r[2]?r[4]:r[5]);
            const theta=Math.asin(Math.max(-.995,Math.min(.995,signedPower(ratio,1/.91))));
            return surface(z,theta,side,offset);
        };
        for (const side of [-1,1]) {
            // Closed convex almond lens. Outer ring is the embedded lid;
            // center is a brighter iris. Back shell is inside the skull.
            const lens=(pupil=false)=> {
                const vertices=[],faces=[],R=12,S=48;
                for(let shell=0;shell<2;shell++) {
                    for(let i=0;i<=R;i++)for(let j=0;j<S;j++) {
                        const r=Math.max(.0001,i/R),a=j/S*Math.PI*2;
                        const u=r*Math.cos(a),v=r*signedPower(Math.sin(a),1.25);
                        let eu=u;
                        const ev=pupil?v*.76:v;
                        if(pupil) {
                            // Solve for constant world-X center: the slit stays
                            // vertical from the front despite the sloping snout.
                            const target=Math.abs(eyeSurface(0,0,side)[0])+.012*u;
                            let lo=-.88,hi=.88;
                            for(let k=0;k<16;k++) {
                                const mid=(lo+hi)/2;
                                if(Math.abs(eyeSurface(mid,ev,side)[0])>target)lo=mid;else hi=mid;
                            }
                            eu=(lo+hi)/2;
                        }
                        const bulge=.025*(1-eu*eu-ev*ev);
                        const off=shell===1?-.012:.007+bulge+(pupil?.006:0);
                        const pos=eyeSurface(eu,ev,side,off);
                        let col=pupil?[.018,.023,.026]:(r>.90?[.12,.19,.10]:[.48-.20*r,.92-.17*r,.10+.035*r]);
                        vertices.push(...pos,...col);
                        if(i<R){const q=shell*(R+1)*S+i*S+j,n=shell*(R+1)*S+i*S+(j+1)%S;faces.push(q,n,q+S,n,n+S,q+S);}
                    }
                }
                const back=(R+1)*S;
                for(let j=0;j<S;j++){const a=R*S+j,b=R*S+(j+1)%S;faces.push(a,back+a,b,b,back+a,back+b);}
                return new MyObject(this.GL,vertices,faces,this.shaderProgram);
            };
            this.faceParts.push(lens(),lens(true));
            // Brow ribbon: broad skin fold attached along the upper lid.
            const vertices=[],faces=[],N=32;
            for(let i=0;i<=N;i++) {
                const u=-1+2*i/N,arch=Math.pow(Math.max(0,1-u*u),.64);
                for(let j=0;j<=6;j++) {
                    const v=j/6;
                    const off=.003+.021*Math.sin(Math.PI*v)*arch;
                    vertices.push(...eyeSurface(u,arch+v*.24*arch,side,off),.57,.34,.90);
                    if(i<N&&j<6){const a=i*7+j;faces.push(a,a+1,a+7,a+1,a+8,a+7);}
                }
            }
            this.headParts.push(new MyObject(this.GL,vertices,faces,this.shaderProgram));
            // Small nostril embedded in the short nose.
            this.faceParts.push(this.makeEllipsoid(.020,.009,.012,side*.09,.324,3.786,[.055,.09,.10],-18,side*20,0,20,12));

            // Broad flattened ear fins sweep backward and narrow at tips.
            this.headParts.push(this.makeProfile([
                [.56,side*.33,3.12,.075,.13,.13],
                [.70,side*.385,3.06,.085,.13,.13],
                [.84,side*.39,2.96,.073,.105,.105],
                [.90,side*.355,2.86,.044,.063,.063],
                [.94,side*.32,2.82,.006,.012,.012]
            ],'y',[[.96,.38,.72],[.96,.38,.72]],1));
            // Two pairs of lateral sensory fins with roots buried in skull.
            for(const [y,z,w] of [[.46,3.12,.085],[.34,3.14,.065]]) {
                this.headParts.push(this.makeProfile([
                    [z+.06,side*.35,y,.052,w,.06],
                    [z-.08,side*.425,y+.012,.060,w,.05],
                    [z-.22,side*.455,y+.055,.007,.012,.010]
                ],'z',[[.80,.32,.58],[.96,.38,.72]]));
            }
            // Elliptic paraboloids remain true quadrics, rooted in crown.
            this.headSpikes.push(this.makeParaboloid(.055,.067,.18,side*.135,.66,3.10,[.90,.90,.92],-35,0,side*-12));
        }
    }

    createLegs() {
        // Each leg is a single closed, variable-section skin including paw.
        // Elbow/knee and hock are offsets in its Bezier centerline.
        for(const side of [-1,1]) {
            const front=[
                [.26,side*.355,2.38,.14,.19,.19],
                [.05,side*.425,2.34,.18,.23,.22],
                [-.22,side*.49,2.23,.125,.17,.16],
                [-.40,side*.51,2.28,.135,.16,.15],
                [-.61,side*.51,2.39,.155,.19,.17],
                [-.78,side*.49,2.48,.173,.23,.17],
                [-.86,side*.48,2.51,.19,.25,.19],
                [-.895,side*.48,2.51,.16,.21,.16]
            ];
            this.frontLegParts.push(this.makeProfile(front,'y',[
                [.94,.25,.23],[.94,.25,.23],[.96,.80,.20],[.38,.88,.24]
            ],.96));
            const back=[
                [-.02,side*.255,1.04,.19,.27,.25],
                [-.20,side*.40,1.11,.235,.30,.24],
                [-.38,side*.47,1.27,.18,.21,.20],
                [-.53,side*.48,1.08,.115,.15,.15],
                [-.67,side*.48,1.03,.105,.14,.13],
                [-.80,side*.49,1.17,.15,.22,.16],
                [-.86,side*.49,1.25,.19,.25,.19],
                [-.895,side*.49,1.25,.16,.21,.16]
            ];
            this.backLegParts.push(this.makeProfile(back,'y',[
                [.20,.82,.78],[.20,.82,.78],[.66,.38,.92],[.96,.42,.74]
            ],.95));
            for(const [x,z] of [[.48,2.51],[.49,1.25]]) {
                for(const dx of [-.12,-.04,.04,.12]) {
                    // Cone base intersects paw; tip points forward/slightly down.
                    this.makeClaw(side*x+dx,-.843,z+.18-(Math.abs(dx)>.08?.027:0),102,0);
                }
            }
        }
    }

    createWings() {
        const span=8.15,chord=2.55,strength=.19;
        for(const side of [-1,1]) {
            const place=(mesh)=> {
                const obj=new MyObject(this.GL,mesh.vertices,mesh.faces,this.shaderProgram);
                LIBS.translateX(obj.MODEL_MATRIX,side*.32);
                LIBS.translateY(obj.MODEL_MATRIX,.40);
                LIBS.translateZ(obj.MODEL_MATRIX,2.32);
                LIBS.rotateX(obj.MODEL_MATRIX,LIBS.degToRad(7));
                return obj;
            };
            this.wings.push(place(generateHyperbolicParaboloidWing(
                side,span,chord,84,24,strength,side<0?[.22,.78,.98]:[.22,.92,.60])));
            const bone=(sample,r0,r1,color)=> {
                const vertices=[],faces=[],N=64,S=10;
                for(let i=0;i<=N;i++) {
                    const t=i/N,p=sample(t),a=sample(Math.max(0,t-.001)),b=sample(Math.min(1,t+.001));
                    const tangent=normalizeVector(b.map((v,k)=>v-a[k]));
                    const n=normalizeVector(crossVector(tangent,[0,1,0])),bn=crossVector(tangent,n);
                    const r=r0*(1-t)+r1*t;
                    for(let j=0;j<S;j++) {
                        const angle=j/S*Math.PI*2;
                        vertices.push(...p.map((v,k)=>v+r*(n[k]*Math.cos(angle)+bn[k]*Math.sin(angle))),...color);
                        if(i<N){const x=i*S+j,y=i*S+(j+1)%S;faces.push(x,x+S,y,y,x+S,y+S);}
                    }
                }
                return place({vertices,faces});
            };
            // The leading arm and all fingers use the membrane's sampler.
            this.wingSpines.push(bone(t=>sampleToothlessWing(side,span,chord,t,0,strength),.085,.017,[.98,.56,.18]));
            const endpoints=[.17,.33,.50,.67,.83,.95];
            const colors=[[.95,.26,.26],[.98,.72,.18],[.94,.90,.18],[.40,.88,.24],[.26,.72,.95],[.74,.38,.95]];
            endpoints.forEach((end,i)=> {
                const sample=t=> {
                    const uv=cubicBezier([.245,.02,0],[.245,.33,0],[end,.76,0],[end,1,0],t);
                    return sampleToothlessWing(side,span,chord,uv[0],uv[1],strength);
                };
                this.wingSpines.push(bone(sample,.047,.013,colors[i]));
            });
        }
    }

    createTail() {
        const tailColor = [
            0.98,
            0.64,
            0.22
        ];

        /*
            Reference side-view:
            tail turun dari pelvis,
            mencapai titik terendah sekitar pertengahan,
            lalu sedikit naik lagi menuju ujung.
        */

        const P0 = [
            0,
            -0.35,
            0.64
        ];

        const P1 = [
            0.02,
            -0.65,
            -0.30
        ];

        const P2 = [
            -0.04,
            -0.82,
            -2.05
        ];

        const P3 = [
            0,
            -0.62,
            -3.72
        ];

        this.tailParts.push(
            this.makeBezierTube(
                P0,
                P1,
                P2,
                P3,
                0.215,
                0.040,
                tailColor,
                64,
                28
            )
        );


        // Small lateral stabilizer fins near tail root
        const stabilizerColor = [
            0.68,
            0.38,
            0.95
        ];

        for (const side of [-1, 1]) {
            const mesh =
                generateBezierTailFin(
                    [
                        0,
                        -0.665,
                        -0.78
                    ],
                    side,
                    1.14,
                    0.64,
                    0.060,
                    14,
                    4,
                    stabilizerColor
                );

            this.tailFins.push(
                new MyObject(
                    this.GL,
                    mesh.vertices,
                    mesh.faces,
                    this.shaderProgram
                )
            );
        }


        // Tail tip fins
        const blackFin = [
            0.25,
            0.48,
            0.95
        ];

        const redFin = [
            0.98,
            0.18,
            0.18
        ];

        let mesh =
            generateBezierTailFin(
                P3,
                1,
                0.74,
                0.50,
                0.065,
                16,
                5,
                blackFin
            );

        this.tailFins.push(
            new MyObject(
                this.GL,
                mesh.vertices,
                mesh.faces,
                this.shaderProgram
            )
        );

        mesh =
            generateBezierTailFin(
                P3,
                -1,
                0.78,
                0.54,
                0.070,
                16,
                5,
                redFin
            );

        this.tailFins.push(
            new MyObject(
                this.GL,
                mesh.vertices,
                mesh.faces,
                this.shaderProgram
            )
        );
    }


    // =========================================================
    // DORSAL DETAILS
    // =========================================================

    createDorsalDetails() {
        const spikeColor = [
            0.96,
            0.96,
            0.18
        ];

        /*
            More numerous, smaller dorsal spikes.
            Bentuk lebih dekat ke reference daripada
            lima cone besar.
        */

        const spikeData = [];
        for(let i=0;i<10;i++) {
            const t=7.6-i*.70,r=t18Profile(this.trunkProfile,t);
            const size=.12-i*.006;
            spikeData.push([0,r[2]+r[4]-.025,r[0],.048-i*.002,.043-i*.0018,size,-22]);
        }
        // Tail spikes are attached to sampled Bezier positions, not guessed y.
        for(let i=1;i<=8;i++) {
            const t=i/10;
            const p=cubicBezier([0,-.35,.64],[.02,-.65,-.30],[-.04,-.82,-2.05],[0,-.62,-3.72],t);
            const radius=.215*(1-t)+.040*t;
            spikeData.push([p[0],p[1]+radius-.020,p[2],.033*(1-t)+.008,.025,.11*(1-t)+.025,-25]);
        }

        for (
            const data of spikeData
        ) {
            const [
                x,
                y,
                z,
                rx,
                rz,
                height,
                rotX
            ] = data;

            this.dorsalSpikes.push(
                this.makeParaboloid(
                    rx,
                    rz,
                    height,
                    x,
                    y,
                    z,
                    spikeColor,
                    rotX
                )
            );
        }
    }


    // =========================================================
    // ANIMATION PLACEHOLDER
    // =========================================================

    update(time) {
        // Hierarchical animation will be added after
        // the rebuilt proportions are approved.
    }


    // =========================================================
    // DRAW
    // =========================================================

    renderArray(
        array,
        VIEW_MATRIX,
        PROJECTION_MATRIX
    ) {
        for (
            const object of array
        ) {
            object.render(
                VIEW_MATRIX,
                PROJECTION_MATRIX
            );
        }
    }


    draw(
        VIEW_MATRIX,
        PROJECTION_MATRIX
    ) {
        /*
            Depth test menentukan visibility,
            tetapi urutan ini tetap dibuat secara logis.
        */

        this.renderArray(
            this.tailFins,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );

        this.renderArray(
            this.tailParts,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );


        this.renderArray(
            this.wings,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );

        this.renderArray(
            this.wingSpines,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );


        this.renderArray(
            this.backLegParts,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );

        this.renderArray(
            this.frontLegParts,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );


        this.renderArray(
            this.bodyParts,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );

        this.renderArray(
            this.dorsalSpikes,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );


        this.renderArray(
            this.feet,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );

        this.renderArray(
            this.claws,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );


        this.renderArray(
            this.headSpikes,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );

        this.renderArray(
            this.headParts,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );

        this.renderArray(
            this.faceParts,
            VIEW_MATRIX,
            PROJECTION_MATRIX
        );
    }
}
