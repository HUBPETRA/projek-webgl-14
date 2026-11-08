// Helper geometri dan batching untuk lingkungan restoran.
class Environment {
  constructor(gl, program) {
    this.builder = new CharacterBuilder(gl, program, 0);
    this.gl = gl;
    this.program = program;
    this.create();
    this.batch();
  }
  box(x, y, z, w, h, d, color) {
    const v = [],
      f = [];
    const sides = [
      [
        [1, -1, -1],
        [1, 1, -1],
        [1, 1, 1],
        [1, -1, 1]
      ],
      [
        [-1, -1, 1],
        [-1, 1, 1],
        [-1, 1, -1],
        [-1, -1, -1]
      ],
      [
        [-1, 1, -1],
        [-1, 1, 1],
        [1, 1, 1],
        [1, 1, -1]
      ],
      [
        [-1, -1, 1],
        [-1, -1, -1],
        [1, -1, -1],
        [1, -1, 1]
      ],
      [
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1]
      ],
      [
        [1, -1, -1],
        [-1, -1, -1],
        [-1, 1, -1],
        [1, 1, -1]
      ]
    ];
    for (const side of sides) {
      const n = v.length / 6;
      for (const p of side) v.push(p[0] * w / 2, p[1] * h / 2, p[2] * d / 2, ...color);
      f.push(n, n + 2, n + 1, n, n + 3, n + 2);
    }
    return this.builder.addMesh({
      vertices: v,
      faces: f
    }, x, y, z);
  }
  roof(x, y, z, w, d, h) {
    const B = this.builder,
      gold = [0.78, 0.54, 0.19],
      tile = [0.38, 0.29, 0.16],
      trim = [0.98, 0.72, 0.28];
    for (const side of [-1, 1]) {
      const point = (u, v) => [x + (u - 0.5) * w, y + h * Math.pow(1 - v, 1.6) + 0.32 * Math.pow(
        Math.abs(u - 0.5) * 2, 7) * v, z + side * d / 2 * v];
      B.surface(point, 40, 12, gold, (u, v) => gold.map(c => c * (0.83 + 0.17 * Math.pow(Math.cos(
        u * Math.PI * 32), 2))));
      for (let i = 0; i <= 30; i++) {
        const u = i / 30;
        B.curve([point(u, 0), point(u, 0.28), point(u, 0.65), point(u, 1)], 0.025, tile);
      }
      B.curve([point(0, 1), point(0.25, 1), point(0.75, 1), point(1, 1)], 0.085, trim);
    }
    B.cylinder(0.10, w, x, y + h, z, trim, 0, 0, 90);
    for (const s of [-1, 1]) B.curve([
      [x + s * w / 2, y + h, z],
      [x + s * (w / 2 + 0.3), y + h, z],
      [x + s * (w / 2 + 0.45), y + h + 0.4, z],
      [x + s * (w / 2 + 0.35), y + h + 0.6, z]
    ], 0.10, trim, 0.025);
  }
  batch() {
    const out = [];
    let vertices = [],
      faces = [];
    const flush = () => {
      if (!vertices.length) return;
      out.push(new MyObject(this.gl, vertices, faces, this.program));
      vertices = [];
      faces = [];
    };
    for (const mesh of this.builder.parts) {
      if (vertices.length / 6 + mesh.vertices.length / 6 > 58000) flush();
      const offset = vertices.length / 6;
      for (let i = 0; i < mesh.vertices.length; i += 6) vertices.push(...Mat4.point(mesh
        .MODEL_MATRIX, mesh.vertices.slice(i, i + 3)), ...mesh.vertices.slice(i + 3, i + 6));
      for (const index of mesh.faces) faces.push(index + offset);
      this.gl.deleteBuffer(mesh.vertexBuffer);
      this.gl.deleteBuffer(mesh.indexBuffer);
    }
    flush();
    this.builder.parts = out;
  }
  draw(v, p) {
    this.builder.draw(v, p);
  }
}
