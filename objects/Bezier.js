function cubicBezier(P0, P1, P2, P3, t) {
    const u = 1 - t;

    const uu = u * u;
    const uuu = uu * u;

    const tt = t * t;
    const ttt = tt * t;

    return [
        uuu * P0[0] +
            3 * uu * t * P1[0] +
            3 * u * tt * P2[0] +
            ttt * P3[0],

        uuu * P0[1] +
            3 * uu * t * P1[1] +
            3 * u * tt * P2[1] +
            ttt * P3[1],

        uuu * P0[2] +
            3 * uu * t * P1[2] +
            3 * u * tt * P2[2] +
            ttt * P3[2]
    ];
}


function sampleBezier(
    P0,
    P1,
    P2,
    P3,
    segments
) {
    const points = [];

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;

        points.push(
            cubicBezier(
                P0,
                P1,
                P2,
                P3,
                t
            )
        );
    }

    return points;
}



// ============================================================
// BEZIER TAIL TUBE
// ============================================================

function cubicBezierDerivative(
    P0,
    P1,
    P2,
    P3,
    t
) {
    const u =
        1 - t;

    return [
        3 * u * u *
            (P1[0] - P0[0]) +
        6 * u * t *
            (P2[0] - P1[0]) +
        3 * t * t *
            (P3[0] - P2[0]),

        3 * u * u *
            (P1[1] - P0[1]) +
        6 * u * t *
            (P2[1] - P1[1]) +
        3 * t * t *
            (P3[1] - P2[1]),

        3 * u * u *
            (P1[2] - P0[2]) +
        6 * u * t *
            (P2[2] - P1[2]) +
        3 * t * t *
            (P3[2] - P2[2])
    ];
}


function normalizeVector(v) {
    const length =
        Math.hypot(
            v[0],
            v[1],
            v[2]
        );

    if (length < 0.000001) {
        return [0, 0, 1];
    }

    return [
        v[0] / length,
        v[1] / length,
        v[2] / length
    ];
}


function crossVector(a, b) {
    return [
        a[1] * b[2] -
            a[2] * b[1],

        a[2] * b[0] -
            a[0] * b[2],

        a[0] * b[1] -
            a[1] * b[0]
    ];
}


function dotVector(a, b) {
    return (
        a[0] * b[0] +
        a[1] * b[1] +
        a[2] * b[2]
    );
}


/*
    Membuat tail sebagai tapered tube yang mengikuti
    cubic Bezier.

    Ini tetap full 3D:
    setiap titik pada center line memiliki satu ring
    vertex yang tegak lurus arah tangent kurva.
*/
function generateBezierTail(
    P0,
    P1,
    P2,
    P3,
    startRadius,
    endRadius,
    pathSegments,
    radialSegments,
    color
) {
    const vertices = [];
    const faces = [];

    for (
        let i = 0;
        i <= pathSegments;
        i++
    ) {
        const t =
            i / pathSegments;

        const center =
            cubicBezier(
                P0,
                P1,
                P2,
                P3,
                t
            );

        const tangent =
            normalizeVector(
                cubicBezierDerivative(
                    P0,
                    P1,
                    P2,
                    P3,
                    t
                )
            );

        /*
            Reference vector untuk membentuk local frame.
            Jika tangent hampir sejajar Y, pakai X.
        */
        let reference =
            [0, 1, 0];

        if (
            Math.abs(
                dotVector(
                    tangent,
                    reference
                )
            ) > 0.92
        ) {
            reference =
                [1, 0, 0];
        }

        const side =
            normalizeVector(
                crossVector(
                    reference,
                    tangent
                )
            );

        const up =
            normalizeVector(
                crossVector(
                    tangent,
                    side
                )
            );

        /*
            Radius mengecil menuju ujung.
            Smoothstep membuat taper tidak terasa linear/kaku.
        */
        const smoothT =
            t * t *
            (3 - 2 * t);

        const radius =
            startRadius *
                (1 - smoothT) +
            endRadius *
                smoothT;

        for (
            let j = 0;
            j < radialSegments;
            j++
        ) {
            const angle =
                j *
                2 *
                Math.PI /
                radialSegments;

            const cosA =
                Math.cos(angle);

            const sinA =
                Math.sin(angle);

            const x =
                center[0] +
                radius *
                (
                    side[0] * cosA +
                    up[0] * sinA
                );

            const y =
                center[1] +
                radius *
                (
                    side[1] * cosA +
                    up[1] * sinA
                );

            const z =
                center[2] +
                radius *
                (
                    side[2] * cosA +
                    up[2] * sinA
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

    for (
        let i = 0;
        i < pathSegments;
        i++
    ) {
        for (
            let j = 0;
            j < radialSegments;
            j++
        ) {
            const nextJ =
                (j + 1) %
                radialSegments;

            const a =
                i *
                radialSegments +
                j;

            const b =
                (i + 1) *
                radialSegments +
                j;

            const c =
                i *
                radialSegments +
                nextJ;

            const d =
                (i + 1) *
                radialSegments +
                nextJ;

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


// ============================================================
// BEZIER TAIL FIN
// ============================================================

/*
    Membuat tail fin sebagai solid thin mesh.

    Outline depan dan belakang menggunakan dua cubic Bezier.
    Fin memiliki thickness pada Y sehingga tidak hanya
    berupa plane 2D.
*/
function generateBezierTailFin(
    root,
    side,
    span,
    sweep,
    thickness,
    segments,
    chordSegments,
    color
) {
    const vertices = [];
    const faces = [];

    const rootX =
        root[0];

    const rootY =
        root[1];

    const rootZ =
        root[2];

    const leadingP0 = [
        rootX,
        rootY,
        rootZ + 0.20
    ];

    const leadingP1 = [
        rootX +
            side *
            span *
            0.30,

        rootY,

        rootZ + 0.10
    ];

    const leadingP2 = [
        rootX +
            side *
            span *
            0.75,

        rootY,

        rootZ -
            sweep *
            0.38
    ];

    const leadingP3 = [
        rootX +
            side *
            span,

        rootY,

        rootZ -
            sweep
    ];


    const trailingP0 = [
        rootX,
        rootY,
        rootZ - 0.20
    ];

    const trailingP1 = [
        rootX +
            side *
            span *
            0.30,

        rootY,

        rootZ - 0.48
    ];

    const trailingP2 = [
        rootX +
            side *
            span *
            0.76,

        rootY,

        rootZ -
            sweep *
            0.74
    ];

    const trailingP3 = [
        rootX +
            side *
            span,

        rootY,

        rootZ -
            sweep
    ];


    const layerVertexCount =
        (segments + 1) *
        (chordSegments + 1);

    /*
        Dua layer:
        0 = atas
        1 = bawah
    */
    for (
        let layer = 0;
        layer < 2;
        layer++
    ) {
        const yOffset =
            layer === 0
                ? thickness / 2
                : -thickness / 2;

        for (
            let i = 0;
            i <= segments;
            i++
        ) {
            const u =
                i / segments;

            const leading =
                cubicBezier(
                    leadingP0,
                    leadingP1,
                    leadingP2,
                    leadingP3,
                    u
                );

            const trailing =
                cubicBezier(
                    trailingP0,
                    trailingP1,
                    trailingP2,
                    trailingP3,
                    u
                );

            for (
                let j = 0;
                j <= chordSegments;
                j++
            ) {
                const v =
                    j / chordSegments;

                const x =
                    leading[0] +
                    (
                        trailing[0] -
                        leading[0]
                    ) *
                    v;

                /*
                    Sedikit convex profile.
                */
                const bulge =
                    Math.sin(
                        Math.PI * v
                    ) *
                    Math.sin(
                        Math.PI * u
                    ) *
                    0.035;

                const y =
                    rootY +
                    yOffset +
                    (
                        layer === 0
                            ? bulge
                            : -bulge
                    );

                const z =
                    leading[2] +
                    (
                        trailing[2] -
                        leading[2]
                    ) *
                    v;

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
    }


    const row =
        chordSegments + 1;

    /*
        Top + bottom faces.
    */
    for (
        let layer = 0;
        layer < 2;
        layer++
    ) {
        const offset =
            layer *
            layerVertexCount;

        for (
            let i = 0;
            i < segments;
            i++
        ) {
            for (
                let j = 0;
                j < chordSegments;
                j++
            ) {
                const a =
                    offset +
                    i *
                    row +
                    j;

                const b =
                    a +
                    row;

                const c =
                    a + 1;

                const d =
                    b + 1;

                if (layer === 0) {
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
                } else {
                    faces.push(
                        a,
                        c,
                        b
                    );

                    faces.push(
                        c,
                        d,
                        b
                    );
                }
            }
        }
    }


    /*
        Side walls.
        Connect boundaries top ↔ bottom.
    */
    function connectBoundary(
        topA,
        topB
    ) {
        const bottomA =
            topA +
            layerVertexCount;

        const bottomB =
            topB +
            layerVertexCount;

        faces.push(
            topA,
            bottomA,
            topB
        );

        faces.push(
            topB,
            bottomA,
            bottomB
        );
    }


    // Leading edge
    for (
        let i = 0;
        i < segments;
        i++
    ) {
        connectBoundary(
            i * row,
            (i + 1) * row
        );
    }

    // Trailing edge
    for (
        let i = 0;
        i < segments;
        i++
    ) {
        connectBoundary(
            i * row +
                chordSegments,

            (i + 1) *
                row +
                chordSegments
        );
    }

    // Root
    for (
        let j = 0;
        j < chordSegments;
        j++
    ) {
        connectBoundary(
            j,
            j + 1
        );
    }

    // Tip
    const tipStart =
        segments *
        row;

    for (
        let j = 0;
        j < chordSegments;
        j++
    ) {
        connectBoundary(
            tipStart + j,
            tipStart + j + 1
        );
    }


    return {
        vertices,
        faces
    };
}
