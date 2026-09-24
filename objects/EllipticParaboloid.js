function generateEllipticParaboloid(
    radiusX,
    radiusZ,
    height,
    segments,
    stacks,
    color
) {
    const vertices = [];
    const faces = [];

    /*
        Elliptic paraboloid.

        Base berada di y = 0.
        Ujung berada di y = height.

        Semakin mendekati ujung,
        radius semakin kecil.
    */

    for (let i = 0; i <= stacks; i++) {
        const v = i / stacks;

        const y = v * height;

        /*
            Dari persamaan paraboloid:

            x²/a² + z²/b² = 1 - y/h
        */

        const radiusFactor =
            Math.sqrt(1 - v);

        for (let j = 0; j <= segments; j++) {
            const theta =
                j * 2 * Math.PI / segments;

            const x =
                radiusX *
                radiusFactor *
                Math.cos(theta);

            const z =
                radiusZ *
                radiusFactor *
                Math.sin(theta);

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

    for (let i = 0; i < stacks; i++) {
        for (let j = 0; j < segments; j++) {
            const first =
                i * (segments + 1) + j;

            const second =
                first + segments + 1;

            faces.push(
                first,
                second,
                first + 1
            );

            faces.push(
                second,
                second + 1,
                first + 1
            );
        }
    }

    return {
        vertices,
        faces
    };
}