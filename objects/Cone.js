function generateCone(
    radius,
    height,
    segments,
    color
) {
    const vertices = [];
    const faces = [];

    // Tip
    vertices.push(
        0,
        height,
        0,
        color[0],
        color[1],
        color[2]
    );

    // Ring dasar
    for (let i = 0; i < segments; i++) {
        const angle =
            i * 2 * Math.PI / segments;

        const x =
            radius * Math.cos(angle);

        const z =
            radius * Math.sin(angle);

        vertices.push(
            x,
            0,
            z,
            color[0],
            color[1],
            color[2]
        );
    }

    // Center base
    const baseCenterIndex =
        vertices.length / 6;

    vertices.push(
        0,
        0,
        0,
        color[0],
        color[1],
        color[2]
    );

    // Side faces
    for (let i = 0; i < segments; i++) {
        const current = 1 + i;
        const next =
            1 + ((i + 1) % segments);

        faces.push(
            0,
            current,
            next
        );
    }

    // Base faces
    for (let i = 0; i < segments; i++) {
        const current = 1 + i;
        const next =
            1 + ((i + 1) % segments);

        faces.push(
            baseCenterIndex,
            next,
            current
        );
    }

    return {
        vertices,
        faces
    };
}
