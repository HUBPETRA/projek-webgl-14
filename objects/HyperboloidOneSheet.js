function generateHyperboloidOneSheet(
    radiusX,
    radiusZ,
    height,
    segments,
    stacks,
    waistFactor,
    color
) {
    const vertices = [];
    const faces = [];
    const half = height / 2;
    const row = segments + 1;

    for (let i = 0; i <= stacks; i++) {
        const t = i / stacks;
        const y = -half + t * height;
        const normalizedY = y / half;

        // One-sheet hyperboloid profile: smallest at the center,
        // wider toward both ends.
        const scale = waistFactor * Math.sqrt(1 + 0.85 * normalizedY * normalizedY);

        for (let j = 0; j <= segments; j++) {
            const angle = j * 2 * Math.PI / segments;
            vertices.push(
                radiusX * scale * Math.cos(angle),
                y,
                radiusZ * scale * Math.sin(angle),
                color[0], color[1], color[2]
            );
        }
    }

    for (let i = 0; i < stacks; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * row + j;
            const b = a + row;
            faces.push(a, b, a + 1);
            faces.push(a + 1, b, b + 1);
        }
    }

    return { vertices, faces };
}
