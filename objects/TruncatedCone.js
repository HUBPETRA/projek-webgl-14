function generateTruncatedCone(
    bottomRadius,
    topRadius,
    height,
    segments,
    color
) {
    const vertices = [];
    const faces = [];
    const half = height / 2;

    for (let i = 0; i <= segments; i++) {
        const angle = i * 2 * Math.PI / segments;
        const c = Math.cos(angle);
        const s = Math.sin(angle);

        vertices.push(
            bottomRadius * c, -half, bottomRadius * s,
            color[0], color[1], color[2]
        );

        vertices.push(
            topRadius * c, half, topRadius * s,
            color[0], color[1], color[2]
        );
    }

    for (let i = 0; i < segments; i++) {
        const p = i * 2;
        faces.push(p, p + 1, p + 2);
        faces.push(p + 1, p + 3, p + 2);
    }

    const bottomCenter = vertices.length / 6;
    vertices.push(0, -half, 0, color[0], color[1], color[2]);
    const topCenter = vertices.length / 6;
    vertices.push(0, half, 0, color[0], color[1], color[2]);

    for (let i = 0; i < segments; i++) {
        const p = i * 2;
        faces.push(bottomCenter, p + 2, p);
        faces.push(topCenter, p + 1, p + 3);
    }

    return { vertices, faces };
}
