function generateExtrudedPolygon(points2D, depth, color) {
    const vertices = [];
    const faces = [];
    const half = depth / 2;
    const n = points2D.length;

    for (const point of points2D) {
        vertices.push(point[0], point[1], half, color[0], color[1], color[2]);
    }
    for (const point of points2D) {
        vertices.push(point[0], point[1], -half, color[0], color[1], color[2]);
    }

    // Front and back are triangulated as fans. The supplied jade blade
    // silhouette is convex enough for this simple procedural mesh.
    for (let i = 1; i < n - 1; i++) {
        faces.push(0, i, i + 1);
        faces.push(n, n + i + 1, n + i);
    }

    for (let i = 0; i < n; i++) {
        const next = (i + 1) % n;
        faces.push(i, n + i, next);
        faces.push(next, n + i, n + next);
    }

    return { vertices, faces };
}
