function generateCylinder(
    radius,
    height,
    segments,
    color
) {

    const vertices = [];
    const faces = [];

    const half =
        height / 2;

    for (
        let i = 0;
        i <= segments;
        i++
    ) {

        const angle =
            i *
            2 *
            Math.PI /
            segments;

        const x =
            radius *
            Math.cos(angle);

        const z =
            radius *
            Math.sin(angle);

        vertices.push(
            x,
            -half,
            z,

            color[0],
            color[1],
            color[2]
        );

        vertices.push(
            x,
            half,
            z,

            color[0],
            color[1],
            color[2]
        );

    }

    for (
        let i = 0;
        i < segments;
        i++
    ) {

        const p =
            i * 2;

        faces.push(
            p,
            p + 1,
            p + 2
        );

        faces.push(
            p + 1,
            p + 3,
            p + 2
        );

    }

    return {
        vertices,
        faces
    };
}