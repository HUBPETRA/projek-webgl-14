// Senjata bergerak dalam ruang lokal tangan. Semua mesh dibuat sekali saja.
class KaiWeapon {
  constructor(gl, program, hand, side) {
    this.hand = hand;
    this.side = side;
    this.builder = new CharacterBuilder(gl, program, 0);
    const B = this.builder,
      jade = [0.12, 0.72, 0.32];
    this.handle = B.cylinder(0.065, 0.70, 0, 0, 0, [0.18, 0.30, 0.13], 90);
    this.blade = B.jadeBlade(0, 0, 0.35, jade, 90);
    this.rest = [this.handle, this.blade].map(p => new Float32Array(p.MODEL_MATRIX));
    this.links = [];
    for (let i = 0; i < 64; i++) this.links.push(B.torus(0.058, 0.018, 0, 0, 0, [0.53, 0.57, 0.49]));
    this.tip = [0, 0, 0];
    this.anchor = [0, 0, 0];
    this.spinAxis = [0.32, 0.84, 0.44];
    this.spinAngle = 0;
    this.spinWeight = 0;
  }
  update(t, spinWeight, throwWeight, fallWeight) {
    const s = this.side;
    // Arbitrary axis [0.32, 0.84, 0.44]: bukan hanya rotasi X/Y/Z.
    this.spinAngle = t * 5.6 + s * 0.9;
    this.spinWeight = spinWeight;
    const rotation = Mat4.axisRotation(this.spinAxis, this.spinAngle);
    const orbit = Mat4.point(rotation, [0, 0, 1.12]);
    let end = [s * 0.18, -0.04, 0.20].map((v, i) => v + (orbit[i] - v) * spinWeight);
    // Lemparan menuju lawan, dalam koordinat dunia; kembali ke ruang tangan.
    const start = Mat4.point(this.hand.world, [s * 0.12, 0, 0.12]);
    const target = this.targetOverride || [3.30, 2.25, -0.05];
    const localTarget = Mat4.point(Mat4.inverseRigid(this.hand.world), target);
    end = end.map((v, i) => v + (localTarget[i] - v) * throwWeight);
    // Saat tumbang, senjata diturunkan ke lantai dengan transisi halus.
    const floor = [-3.3 + s * 0.9, 0.17, 1.1 + s * 0.5];
    const localFloor = Mat4.point(Mat4.inverseRigid(this.hand.world), floor);
    end = end.map((v, i) => v + (localFloor[i] - v) * fallWeight);
    const localAnchor = [s * 0.08, 0, 0.10];
    this.anchor = Mat4.point(this.hand.world, localAnchor);
    this.tip = Mat4.point(this.hand.world, end);
    const len = Math.hypot(...end.map((v, i) => v - localAnchor[i]));
    const count = Math.min(64, Math.max(4, Math.ceil(len / 0.105) + 2));
    for (let i = 0; i < this.links.length; i++) {
      const mesh = this.links[i];
      mesh.visible = i < count;
      if (!mesh.visible) continue;
      const u = (i + 0.5) / count;
      const world = this.anchor.map((v, k) => v + (this.tip[k] - v) * u);
      const sag = (1 - throwWeight) * (0.12 + 0.18 * (1 - spinWeight));
      world[1] = Math.max(0.10, world[1] - Math.sin(Math.PI * u) * sag);
      // Mata rantai bergantian 90 derajat; arah garis mengikuti ujung rantai.
      const d = this.tip.map((v, k) => v - this.anchor[k]);
      const n = Math.hypot(...d) || 1;
      const axis = [-d[1], d[0], 0],
        angle = Math.acos(Math.max(-1, Math.min(1, d[2] / n)));
      const align = Mat4.axisRotation(axis, angle);
      mesh.MODEL_MATRIX = Mat4.multiply(Mat4.translation(...world), Mat4.multiply(align, Mat4
        .axisRotation([0, 0, 1], i % 2 * Math.PI / 2)));
    }
    let orientation = Mat4.multiply(this.hand.world, spinWeight > 0.01 ? rotation : Mat4
      .identity());
    orientation[12] = this.tip[0];
    orientation[13] = this.tip[1];
    orientation[14] = this.tip[2];
    if (fallWeight > 0.99) orientation = Mat4.multiply(Mat4.translation(...this.tip), Mat4
      .axisRotation([0, 0, 1], Math.PI / 2));
    [this.handle, this.blade].forEach((mesh, i) => mesh.MODEL_MATRIX = Mat4.multiply(orientation,
      this.rest[i]));
  }
  draw(v, p) {
    for (const mesh of this.builder.parts)
      if (mesh.visible !== false) mesh.render(v, p);
  }
}
