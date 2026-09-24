function generateEllipticParaboloidSection(
    radiusX,
    radiusZ,
    height,
    segments,
    stacks,
    startV,
    endV,
    color
) {
    const vertices = [];
    const faces = [];
    const row = segments + 1;

    const v0 = Math.max(0, Math.min(1, startV));
    const v1 = Math.max(v0, Math.min(1, endV));

    for (let i = 0; i <= stacks; i++) {
        const t = i / stacks;
        const v = v0 + (v1 - v0) * t;
        const y = v * height;
        const radiusFactor = Math.sqrt(Math.max(0, 1 - v));

        for (let j = 0; j <= segments; j++) {
            const angle = j * 2 * Math.PI / segments;
            vertices.push(
                radiusX * radiusFactor * Math.cos(angle),
                y,
                radiusZ * radiusFactor * Math.sin(angle),
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

    // Tutup kedua bidang potong supaya moncong dan hoof bukan tabung berlubang.
    for (const [ring, v, reverse] of [[0, v0, true], [stacks, v1, false]]) {
        const center = vertices.length / 6;
        vertices.push(0, v * height, 0, ...color);
        for (let j = 0; j < segments; j++) {
            const a = ring * row + j;
            faces.push(center, reverse ? a + 1 : a, reverse ? a : a + 1);
        }
    }
    return { vertices, faces };
}
