// Semua mesh diambil dari characters/ asli. Tidak ada vertex/warna/bentuk baru.
// Rentang bagian mengikuti urutan pembuat model asli; jumlah diperiksa sebelum bind.
const CharacterRigs = {
  joint(name, pivot, parent) {
    return new SceneNode(name, pivot, parent);
  },
  bind(mesh, node, offset = null) {
    node.attach(mesh, offset ? Mat4.multiply(Mat4.translation(...offset), mesh.MODEL_MATRIX) :
      mesh.MODEL_MATRIX);
  },
  oogway(gl, program) {
    const model = new Oogway(gl, program),
      parts = model.builder.parts;
    if (parts.length !== 131) throw Error(
      'Urutan model Oogway berubah; periksa adapter CharacterRigs.');
    const root = new SceneNode('oogwayRoot'),
      J = {},
      joint = (n, p, parent = root) => J[n] = this.joint('oogway_' + n, p, parent);
    const body = joint('body', [0, -0.35, 0]),
      breath = joint('breath', [0, 0.15, 0.04], body),
      neck = joint('neck', [0, 0.87, 0.15], body);
    const head = joint('head', [0, 2.18, 0.81], neck);
    joint('tail', [0, -0.83, -0.53], body);
    for (const s of [-1, 1]) {
      const shoulder = joint('shoulder' + s, [s * 0.85, 0.55, 0.04], body),
        elbow = joint('elbow' + s, [s * 1.30, 0.53, 0.06], shoulder);
      joint('wrist' + s, [s * 1.76, 0.51, 0.08], elbow);
      const hip = joint('hip' + s, [s * 0.45, -0.86, -0.02]),
        knee = joint('knee' + s, [s * 0.45, -1.43, -0.02], hip);
      joint('ankle' + s, [s * 0.45, -1.60, 0.04], knee);
    }
    // Tongkat yang sama dipasang ke tangan asli, dengan koreksi posisi genggaman.
    const staff = joint('staff', [-1.92, 0.51, 0.08], J['wrist-1']);
    staff.axis = [0.35, 0.82, 0.44];
    // Nomor ini indeks mesh (mulai 0), bukan koordinat.
    // Rentang mengikuti urutan pemanggilan builder di file model.
    parts.forEach((mesh, i) => {
      let node = breath,
        offset = null;
      if (i === 46) node = body;
      if (i === 47 || i === 75 || i === 76) node = neck;
      if (i >= 48 && i <= 74) node = head;
      for (const [s, start] of [
          [-1, 77],
          [1, 92]
        ]) {
        if (i === start || i === start + 1) node = J['shoulder' + s];
        if (i === start + 2) node = J['elbow' + s];
        if (i >= start + 3 && i <= start + 8) node = J['wrist' + s];
        if (i === start + 9) node = J['hip' + s];
        if (i >= start + 10 && i <= start + 14) node = J['ankle' + s];
      }
      if (i >= 123 && i <= 129) {
        node = staff;
        offset = [0.28, 0, 0.04];
      }
      if (i === 130) node = J.tail;
      this.bind(mesh, node, offset);
    });
    return {
      model,
      root,
      joints: J,
      staff,
      feet: [...J['ankle-1'].meshes, ...J.ankle1.meshes].map(i => i.mesh)
    };
  },
  ping(gl, program) {
    const model = new MrPing(gl, program),
      parts = model.builder.parts;
    if (parts.length !== 101) throw Error(
      'Urutan model Mr. Ping berubah; periksa adapter CharacterRigs.');
    const root = new SceneNode('mrPingRoot'),
      J = {},
      joint = (n, p, parent = root) => J[n] = this.joint('ping_' + n, p, parent);
    const body = joint('body', [0, -0.55, 0]),
      breath = joint('breath', [0, -0.35, 0], body),
      neck = joint('neck', [0, 0.37, 0.04], body);
    const head = joint('head', [0, 2.35, 0.02], neck);
    joint('jaw', [0, 2.43, 0.24], head);
    for (const s of [-1, 1]) {
      const shoulder = joint('shoulder' + s, [s * 0.55, 0.14, 0], body),
        elbow = joint('elbow' + s, [s * 1, -0.02, 0], shoulder);
      joint('wrist' + s, [s * 1.27, -0.09, 0], elbow);
      const hip = joint('hip' + s, [s * 0.31, -1.1, 0.10]),
        knee = joint('knee' + s, [s * 0.31, -1.27, 0.10], hip);
      joint('ankle' + s, [s * 0.31, -1.395, 0.10], knee);
    }
    // Sumbu miring, bukan kombinasi label rotasi Euler saja.
    body.axis = [0.42, 0.30, 0.86];
    // Nomor ini indeks mesh (mulai 0), bukan koordinat.
    // Rentang mengikuti urutan pemanggilan builder di file model.
    parts.forEach((mesh, i) => {
      let node = breath;
      if (i === 21) node = neck;
      if (i >= 22 && i <= 58) node = head;
      if (i === 46 || i === 49) node = J.jaw;
      for (const [s, start, leg] of [
          [-1, 59, 83],
          [1, 68, 92]
        ]) {
        if (i === start || i === start + 1) node = J['shoulder' + s];
        if (i === start + 2) node = J['elbow' + s];
        if (i >= start + 3 && i <= start + 8) node = J['wrist' + s];
        if (i === leg) node = J['hip' + s];
        if (i >= leg + 1 && i <= leg + 3) node = J['knee' + s];
        if (i >= leg + 4 && i <= leg + 8) node = J['ankle' + s];
      }
      this.bind(mesh, node);
    });
    return {
      model,
      root,
      joints: J,
      feet: [...J['ankle-1'].meshes, ...J.ankle1.meshes].map(i => i.mesh)
    };
  },
  keepStaffAboveFloor(staff, height = 0.025) {
    // Putar di sekitar genggaman; tongkat tidak dipindah menjauh dari tangan.
    for (let pass = 0; pass < 8; pass++) {
      let min = Infinity,
        lowest = null;
      for (const {
          mesh
        }
        of staff.meshes) {
        const v = mesh.vertices,
          m = mesh.MODEL_MATRIX;
        for (let i = 0; i < v.length; i += 6) {
          const y = m[1] * v[i] + m[5] * v[i + 1] + m[9] * v[i + 2] + m[13];
          if (y < min) {
            min = y;
            lowest = [m[0] * v[i] + m[4] * v[i + 1] + m[8] * v[i + 2] + m[12], y, m[2] * v[i] + m[
              6] * v[i + 1] + m[10] * v[i + 2] + m[14]];
          }
        }
      }
      if (min >= height - 0.0001) break;
      const grip = Mat4.point(staff.world, [0, 0, 0]),
        dx = lowest[0] - grip[0],
        dz = lowest[2] - grip[2],
        horizontal = Math.hypot(dx, dz);
      const axis = horizontal > 0.001 ? [-dz, 0, dx] : [1, 0, 0],
        angle = horizontal > 0.001 ? Math.min(0.35, Math.max(0.008, (height - min) / horizontal *
          1.12)) : 0.15;
      const around = Mat4.multiply(Mat4.translation(...grip), Mat4.multiply(Mat4.axisRotation(
        axis, angle), Mat4.translation(...grip.map(v => -v))));
      staff.world = Mat4.multiply(around, staff.world);
      for (const item of staff.meshes) item.mesh.MODEL_MATRIX = Mat4.multiply(staff.world, item
        .local);
    }
  },
  ground(root, meshes, height = 0.025) {
    let min = Infinity;
    for (const mesh of meshes) {
      const v = mesh.vertices,
        m = mesh.MODEL_MATRIX;
      for (let i = 0; i < v.length; i += 6) min = Math.min(min, m[1] * v[i] + m[5] * v[i + 1] + m[
        9] * v[i + 2] + m[13]);
    }
    if (Number.isFinite(min)) {
      root.position[1] += height - min;
      root.updateWorld();
    }
  }
};
