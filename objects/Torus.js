function generateTorus(
    majorRadius,
    minorRadius,
    majorSegments,
    minorSegments,
    color
) {
    const vertices = [];
    const faces = [];
    const row = minorSegments + 1;

    for (let i = 0; i <= majorSegments; i++) {
        const u = i * 2 * Math.PI / majorSegments;
        const cu = Math.cos(u);
        const su = Math.sin(u);

        for (let j = 0; j <= minorSegments; j++) {
            const v = j * 2 * Math.PI / minorSegments;
            const cv = Math.cos(v);
            const sv = Math.sin(v);
            const ring = majorRadius + minorRadius * cv;

            vertices.push(
                ring * cu,
                minorRadius * sv,
                ring * su,
                color[0], color[1], color[2]
            );
        }
    }

    for (let i = 0; i < majorSegments; i++) {
        for (let j = 0; j < minorSegments; j++) {
            const a = i * row + j;
            const b = a + row;
            faces.push(a, b, a + 1);
            faces.push(a + 1, b, b + 1);
        }
    }

    return { vertices, faces };
}
