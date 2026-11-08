/**
 * KAI: geometri asli dibagi ke sendi, lalu dianimasikan dari DuelAnimation.
 * chestMesh dan upperChestMesh adalah dua bagian torso asli yang bernapas bersama.
 * Tidak ada ellipsoid bantalan dada tambahan.
 * Dalam loop kiri-kanan: s=-1 adalah sisi X negatif, s=1 sisi X positif.
 * Label setiap argumen menjelaskan ukuran, posisi, warna, dan rotasinya.
 */
class Kai {
  constructor(GL, shaderProgram, originX = 0) {
    this.originX = originX;
    this.root = new SceneNode('kaiRoot');
    this.joints = {};
    const joint = (name, pivot, parent) => this.joints[name] = new SceneNode(name, pivot, parent);
    const pelvis = joint('pelvis', [0, -0.65, 0], this.root);
    const torso = joint('torso', [0, -0.45, 0], pelvis);
    joint('chest', [0, 0.38, -0.035], torso);
    joint('cloth', [0, -0.74, 0.52], pelvis);
    joint('head', [0, 1.47, 0], torso);
    joint('mane', [0, 1.45, -0.15], torso);
    for (const s of [-1, 1]) {
      const shoulder = joint('shoulder' + s, [s * 0.94, 0.98, 0], torso);
      const elbow = joint('elbow' + s, [s * 1.68, 0.93, 0], shoulder);
      joint('wrist' + s, [s * 2.39, 0.93, 0], elbow);
      const hip = joint('hip' + s, [s * 0.43, -0.71, 0], pelvis);
      const knee = joint('knee' + s, [s * 0.45, -1.29, 0], hip);
      joint('ankle' + s, [s * 0.45, -1.66, 0.035], knee);
    }
    this.builder = new RigBuilder(GL, shaderProgram, 0);
    this.createModel();
    this.builder.bind();
    this.weapons = [-1, 1].map(s => new KaiWeapon(GL, shaderProgram, this.joints['wrist' + s],
      s));
    this.update(0);
  }
  createModel() {
    const B = this.builder,
      skin = [0.37, 0.39, 0.38],
      muscle = [0.40, 0.42, 0.41],
      dark = [0.24, 0.27, 0.25],
      black = [0.035, 0.047, 0.038],
      hair = [0.035, 0.075, 0.044],
      jade = [0.09, 0.53, 0.18],
      jadeBright = [0.16, 0.76, 0.30],
      iron = [0.40, 0.43, 0.39],
      leather = [0.19, 0.095, 0.045],
      ivory = [0.70, 0.70, 0.56];
    // Tubuh utama yang terlihat juga ikut bernapas; jika statis, ia menutup dada di belakangnya.
    B.joint = this.joints.chest;
    this.chestMesh = B.ellipsoid(
      /* radiusX */ 0.89,
      /* radiusY */ 1.30,
      /* radiusZ */ 0.58,
      /* posX */ 0,
      /* posY */ 0.27,
      /* posZ */ -0.04,
      /* colorRGB */ skin
    );
    // Perut bawah tetap pada torso agar sabuk dan pinggul tidak mengembang.
    B.joint = this.joints.torso;
    B.ellipsoid(
      /* radiusX */ 0.85,
      /* radiusY */ 0.88,
      /* radiusZ */ 0.60,
      /* posX */ 0,
      /* posY */ -0.01,
      /* posZ */ 0.02,
      /* colorRGB */ skin
    );
    // Permukaan torso atas asli mengikuti skala yang sama dengan badan utama.
    // Kedua mesh saling bertumpuk sejak pose awal; tidak ada lapisan bantalan baru.
    B.joint = this.joints.chest;
    this.upperChestMesh = B.ellipsoid(
      /* radiusX */ 0.99,
      /* radiusY */ 0.64,
      /* radiusZ */ 0.52,
      /* posX */ 0,
      /* posY */ 0.95,
      /* posZ */ -0.035,
      /* colorRGB */ dark
    );
    // BAHU-LENGAN-KAKI: ellipsoid otot, cylinder tulang, frustum armor.
    for (const s of [-1, 1]) {
      B.joint = this.joints['shoulder' + s];
      B.ellipsoid(
        /* radiusX */ 0.52,
        /* radiusY */ 0.36,
        /* radiusZ */ 0.41,
        /* posX */ s * 0.99,
        /* posY */ 1.00,
        /* posZ */ 0.0,
        /* colorRGB */ muscle
      );
      // Lengan horizontal: cylinder sebagai tulang, ellipsoid untuk biceps/triceps.
      B.cylinder(
        /* radius */ 0.25,
        /* height */ 0.76,
        /* posX */ s * 1.30,
        /* posY */ 0.94,
        /* posZ */ 0,
        /* colorRGB */ skin,
        /* rotateXdeg */ 0,
        /* rotateYdeg */ 0,
        /* rotateZdeg */ 90
      );
      B.ellipsoid(
        /* radiusX */ 0.43,
        /* radiusY */ 0.27,
        /* radiusZ */ 0.33,
        /* posX */ s * 1.43,
        /* posY */ 1.00,
        /* posZ */ 0.045,
        /* colorRGB */ muscle
      );
      B.ellipsoid(
        /* radiusX */ 0.42,
        /* radiusY */ 0.17,
        /* radiusZ */ 0.28,
        /* posX */ s * 1.44,
        /* posY */ 0.76,
        /* posZ */ -0.015,
        /* colorRGB */ dark
      );
      B.joint = this.joints['elbow' + s];
      B.ellipsoid(
        /* radiusX */ 0.35,
        /* radiusY */ 0.23,
        /* radiusZ */ 0.27,
        /* posX */ s * 1.87,
        /* posY */ 0.92,
        /* posZ */ 0,
        /* colorRGB */ skin
      );
      B.frustum(
        /* bottomRadius */ 0.31,
        /* topRadius */ 0.28,
        /* height */ 0.59,
        /* posX */ s * 2.01,
        /* posY */ 0.93,
        /* posZ */ 0,
        /* colorRGB */ leather,
        /* rotateXdeg */ 0,
        /* rotateYdeg */ 0,
        /* rotateZdeg */ 90
      );
      for (const x of [1.76, 2.25]) B.frustum(
        /* bottomRadius */ 0.322,
        /* topRadius */ 0.322,
        /* height */ 0.055,
        /* posX */ s * x,
        /* posY */ 0.93,
        /* posZ */ 0,
        /* colorRGB */ iron,
        /* rotateXdeg */ 0,
        /* rotateYdeg */ 0,
        /* rotateZdeg */ 90
      );
      B.joint = this.joints['wrist' + s];
      B.hyperboloid(
        /* radiusX */ 0.20,
        /* radiusZ */ 0.20,
        /* height */ 0.25,
        /* posX */ s * 2.39,
        /* posY */ 0.93,
        /* posZ */ 0,
        /* colorRGB */ dark,
        /* rotateXdeg */ 0,
        /* rotateYdeg */ 0,
        /* rotateZdeg */ 90
      );
      B.ellipsoid(
        /* radiusX */ 0.24,
        /* radiusY */ 0.16,
        /* radiusZ */ 0.20,
        /* posX */ s * 2.57,
        /* posY */ 0.93,
        /* posZ */ 0.02,
        /* colorRGB */ skin
      );
      for (let k = 0; k < 3; k++) B.ellipsoid(
        /* radiusX */ 0.11,
        /* radiusY */ 0.10,
        /* radiusZ */ 0.070,
        /* posX */ s * 2.67,
        /* posY */ 0.91,
        /* posZ */ -0.13 + k * 0.14,
        /* colorRGB */ dark
      );
      B.joint = this.joints['elbow' + s];
      // Rantai membungkus pelindung lengan, cincin bergantian menyilang.
      for (let turn = 0; turn < 3; turn++)
        for (let i = 0; i < 14; i++) {
          const a = i * Math.PI * 2 / 14,
            x = s * (1.80 + turn * 0.16 + 0.025 * Math.sin(a));
          B.torus(
            /* majorRadius */ 0.064,
            /* tubeRadius */ 0.016,
            /* posX */ x,
            /* posY */ 0.93 + 0.34 * Math.cos(a),
            /* posZ */ 0.34 * Math.sin(a),
            /* colorRGB */ iron,
            /* rotateXdeg */ 0,
            /* rotateYdeg */ 90,
            /* rotateZdeg */ i * 360 / 14 + (i % 2 ? 55 : 0)
          );
        }
      for (let k = 0; k < 3; k++) B.segment(
        /* startXYZ */ [s * (1.86 + k * 0.15), 1.18, -0.03],
        /* endXYZ */ [s * (1.88 + k * 0.15), 1.42, -0.02],
        /* startRadius */ 0.064,
        /* endRadius */ 0,
        /* colorRGB */ iron
      );
      B.joint = this.joints['hip' + s];
      B.ellipsoid(
        /* radiusX */ 0.39,
        /* radiusY */ 0.37,
        /* radiusZ */ 0.36,
        /* posX */ s * 0.43,
        /* posY */ -0.99,
        /* posZ */ -0.03,
        /* colorRGB */ skin
      );
      B.joint = this.joints['knee' + s];
      B.ellipsoid(
        /* radiusX */ 0.25,
        /* radiusY */ 0.24,
        /* radiusZ */ 0.25,
        /* posX */ s * 0.45,
        /* posY */ -1.29,
        /* posZ */ 0,
        /* colorRGB */ skin
      );
      B.cylinder(
        /* radius */ 0.23,
        /* height */ 0.65,
        /* posX */ s * 0.45,
        /* posY */ -1.40,
        /* posZ */ 0.00,
        /* colorRGB */ skin
      );
      B.joint = this.joints['ankle' + s];
      B.paraboloidSection(
        /* radiusX */ 0.235,
        /* radiusZ */ 0.22,
        /* height */ 0.45,
        /* posX */ s * 0.45,
        /* posY */ -1.69,
        /* posZ */ 0.035,
        /* colorRGB */ dark,
        /* rotateXdeg */ 90,
        /* rotateYdeg */ 0,
        /* rotateZdeg */ 0,
        /* startV */ 0,
        /* endV */ 0.80
      );
      for (const d of [-1, 1]) B.paraboloidSection(
        /* radiusX */ 0.106,
        /* radiusZ */ 0.11,
        /* height */ 0.19,
        /* posX */ s * 0.45 + d * 0.12,
        /* posY */ -1.78,
        /* posZ */ 0.34,
        /* colorRGB */ black,
        /* rotateXdeg */ 90,
        /* rotateYdeg */ 0,
        /* rotateZdeg */ 0,
        /* startV */ 0,
        /* endV */ 0.82
      );
    }
    // KEPALA: ellipsoid wajah, paraboloid moncong, Bezier alis dan tanduk.
    B.joint = this.joints.head;
    // Pangkal leher tertutup surai, kepala yak relatif kecil.
    B.ellipsoid(
      /* radiusX */ 0.40,
      /* radiusY */ 0.40,
      /* radiusZ */ 0.34,
      /* posX */ 0,
      /* posY */ 1.47,
      /* posZ */ 0.00,
      /* colorRGB */ dark
    );
    B.ellipsoid(
      /* radiusX */ 0.43,
      /* radiusY */ 0.50,
      /* radiusZ */ 0.34,
      /* posX */ 0,
      /* posY */ 1.90,
      /* posZ */ 0.10,
      /* colorRGB */ dark
    );
    B.ellipsoid(
      /* radiusX */ 0.31,
      /* radiusY */ 0.30,
      /* radiusZ */ 0.23,
      /* posX */ 0,
      /* posY */ 1.71,
      /* posZ */ 0.32,
      /* colorRGB */ skin
    );
    B.paraboloidSection(
      /* radiusX */ 0.29,
      /* radiusZ */ 0.145,
      /* height */ 0.24,
      /* posX */ 0,
      /* posY */ 1.69,
      /* posZ */ 0.39,
      /* colorRGB */ [0.48, 0.49, 0.46],
      /* rotateXdeg */ 90,
      /* rotateYdeg */ 0,
      /* rotateZdeg */ 0,
      /* startV */ 0,
      /* endV */ 0.82
    );
    B.ellipsoid(
      /* radiusX */ 0.24,
      /* radiusY */ 0.10,
      /* radiusZ */ 0.10,
      /* posX */ 0,
      /* posY */ 1.79,
      /* posZ */ 0.585,
      /* colorRGB */ dark
    );
    for (const s of [-1, 1]) {
      B.ellipsoid(
        /* radiusX */ 0.055,
        /* radiusY */ 0.033,
        /* radiusZ */ 0.020,
        /* posX */ s * 0.14,
        /* posY */ 1.80,
        /* posZ */ 0.667,
        /* colorRGB */ black
      );
      B.ellipsoid(
        /* radiusX */ 0.12,
        /* radiusY */ 0.073,
        /* radiusZ */ 0.041,
        /* posX */ s * 0.17,
        /* posY */ 2.02,
        /* posZ */ 0.394,
        /* colorRGB */ black
      );
      B.ellipsoid(
        /* radiusX */ 0.082,
        /* radiusY */ 0.043,
        /* radiusZ */ 0.025,
        /* posX */ s * 0.17,
        /* posY */ 2.02,
        /* posZ */ 0.434,
        /* colorRGB */ jadeBright
      );
      B.ellipsoid(
        /* radiusX */ 0.024,
        /* radiusY */ 0.040,
        /* radiusZ */ 0.013,
        /* posX */ s * 0.17,
        /* posY */ 2.02,
        /* posZ */ 0.457,
        /* colorRGB */ black
      );
      B.curve(
        /* controlPointsXYZ */ [
          [s * 0.05, 2.09, 0.46],
          [s * 0.16, 2.10, 0.46],
          [s * 0.24, 2.17, 0.42],
          [s * 0.33, 2.12, 0.32]
        ],
        /* startRadius */ 0.043,
        /* colorRGB */ black,
        /* endRadius */ 0.014
      );
      B.ellipsoid(
        /* radiusX */ 0.28,
        /* radiusY */ 0.10,
        /* radiusZ */ 0.125,
        /* posX */ s * 0.45,
        /* posY */ 1.99,
        /* posZ */ 0.01,
        /* colorRGB */ skin,
        /* rotateXdeg */ 0,
        /* rotateYdeg */ 0,
        /* rotateZdeg */ s * 7
      );
      // Tanduk hijau besar melengkung mengikuti Bezier.
      const horn = [
        [s * 0.31, 2.26, 0.02],
        [s * 1.25, 2.45, -0.15],
        [s * 0.50, 3.59, -0.42],
        [s * 0.25, 4.25, -0.49]
      ];
      B.curvedHorn(
        /* controlPointsXYZ */ horn,
        /* baseRadius */ 0.23,
        /* colorRGB */ jade
      );
      for (let k = 0; k < 3; k++) {
        const p = cubicBezier(...horn, 0.23 + k * 0.19);
        B.curvedHorn(
          /* controlPointsXYZ */ [p, [p[0] + s * 0.14, p[1] + 0.04, p[2]],
            [p[0] + s * 0.18, p[1] + 0.19, p[2]],
            [p[0] + s * 0.13, p[1] + 0.26, p[2]]
          ],
          /* baseRadius */ 0.07,
          /* colorRGB */ jade
        );
      }
      B.curvedHorn(
        /* controlPointsXYZ */ [
          [s * 0.35, 1.99, 0.02],
          [s * 0.59, 1.91, 0.11],
          [s * 0.77, 1.96, 0.12],
          [s * 0.92, 2.11, 0.10]
        ],
        /* baseRadius */ 0.045,
        /* colorRGB */ jade
      );
      B.cone(
        /* radius */ 0.039,
        /* height */ 0.12,
        /* posX */ s * 0.20,
        /* posY */ 1.59,
        /* posZ */ 0.63,
        /* colorRGB */ ivory,
        /* rotateXdeg */ 0,
        /* rotateYdeg */ 0,
        /* rotateZdeg */ s * 8
      );
    }
    B.curve(
      /* controlPointsXYZ */ [
        [-0.24, 1.61, 0.565],
        [-0.1, 1.57, 0.62],
        [0.1, 1.57, 0.62],
        [0.24, 1.61, 0.565]
      ],
      /* startRadius */ 0.017,
      /* colorRGB */ black
    );
    for (let i = 0; i < 5; i++) B.ellipsoid(
      /* radiusX */ 0.023,
      /* radiusY */ 0.022,
      /* radiusZ */ 0.014,
      /* posX */ (i - 2) * 0.057,
      /* posY */ 1.588,
      /* posZ */ 0.623,
      /* colorRGB */ ivory
    );
    // Manik giok kecil pada rambut di dahi.
    for (let row = 0; row < 3; row++)
      for (let col = -1; col <= 1; col++) B.ellipsoid(
        /* radiusX */ 0.023,
        /* radiusY */ 0.022,
        /* radiusZ */ 0.017,
        /* posX */ col * 0.10,
        /* posY */ 2.16 + row * 0.085,
        /* posZ */ 0.34 - row * 0.025,
        /* colorRGB */ jadeBright
      );
    // RAMBUT: permukaan parametrik surai dan tabung Bezier untuk helai/janggut.
    B.joint = this.joints.mane;
    // Surai belakang panjang: permukaan parametrik dengan tepi bergerigi.
    for (const back of [0, 0.045]) B.surface(
      /* positionFunctionUV */ (u, v) => {
        const a = (u - 0.5) * Math.PI,
          wide = 0.42 + 1.00 * v;
        return [Math.sin(a) * wide, 1.96 - 3.72 * v - 0.13 * Math.cos(u * 17 * Math.PI) * Math
          .pow(v, 5), -0.19 - 0.83 * v - 0.57 * Math.cos(a) * Math.sin(Math.PI * v) + back
        ];
      },
      /* segmentsU */ 72,
      /* segmentsV */ 40,
      /* colorRGB */ hair,
      /* colorFunctionUV */ (u, v) => hair.map((c, k) => c * (0.72 + 0.36 * Math.pow(Math.cos(u * 11 + v * 3), 8)))
    );
    // Helai rambut bervolume, hitam dengan ujung hijau; tidak menyalin vertex GLB.
    const strand = (pts, r) => {
      const m = generateBezierTail(...pts, r, 0.002, 30, 9, hair);
      for (let i = 0; i < m.vertices.length; i += 6) {
        const t = Math.floor(i / 6 / 9) / 30,
          f = Math.pow(t, 2.3);
        for (let k = 0; k < 3; k++) m.vertices[i + 3 + k] = hair[k] * (1 - f) + jade[k] * f;
      }
      B.addMesh(
        /* mesh */ m,
        /* posX */ 0,
        /* posY */ 0,
        /* posZ */ 0
      );
    };
    for (const s of [-1, 1])
      for (let i = 0; i < 14; i++) {
        const t = i / 13,
          x = s * (0.48 + 0.45 * t),
          z = 0.02 - 0.08 * t;
        strand([
          [s * (0.37 + 0.16 * t), 2.14 - 0.08 * t, z],
          [x, 1.65, 0.49],
          [s * (0.45 + 0.63 * t), 1.00, 0.63],
          [s * (0.41 + 0.80 * t + 0.04 * Math.sin(i * 5)), 0.16 + 0.70 * t + 0.13 * Math.sin(i * 3),
            0.62
          ]
        ], 0.058 + 0.016 * t);
      }
    for (let i = 0; i < 13; i++) {
      const x = (i - 6) * 0.070;
      strand([
        [x, 2.15, -0.20],
        [x * 2.2, 1.46, -0.72],
        [x * 3.0, -0.25, -1.08],
        [x * 3.2, -1.70 - (i % 3) * 0.08, -1.1]
      ], 0.105);
    }
    strand([
      [0, 1.55, 0.47],
      [0.03, 1.00, 0.61],
      [-0.02, 0.44, 0.61],
      [0, -0.03, 0.57]
    ], 0.11);
    for (const s of [-1, 1]) strand([
      [s * 0.28, 1.77, 0.29],
      [s * 0.35, 1.16, 0.47],
      [s * 0.39, 0.71, 0.49],
      [s * 0.44, 0.47, 0.49]
    ], 0.066);
    B.joint = this.joints.pelvis;
    // Sabuk, kain pinggang, dan cincin logam.
    const belt = generateTruncatedCone(0.82, 0.84, 0.13, 48, [0.17, 0.25, 0.12]);
    for (let i = 2; i < belt.vertices.length; i += 6) belt.vertices[i] *= 0.74;
    B.addMesh(
      /* mesh */ belt,
      /* posX */ 0,
      /* posY */ -0.72,
      /* posZ */ 0
    );
    B.joint = this.joints.cloth;
    B.surface(
      /* positionFunctionUV */ (u, v) => [(u - 0.5) * 0.72 * (1 - 0.25 * v), -0.74 - v * 0.93 + 0.035 * Math.sin(u * 7 * Math
        .PI) * v, 0.54 + 0.035 * Math.sin(u * 6 * Math.PI) + 0.02 * v],
      /* segmentsU */ 24,
      /* segmentsV */ 20,
      /* colorRGB */ leather
    );
    B.joint = this.joints.pelvis;
    for (let i = 0; i < 5; i++) B.torus(
      /* majorRadius */ 0.062,
      /* tubeRadius */ 0.015,
      /* posX */ (i - 2) * 0.28,
      /* posY */ -0.85,
      /* posZ */ 0.55,
      /* colorRGB */ iron
    );
  }
  /**
   * Napas langsung pada dada utama; tidak membuat mesh atau buffer tambahan.
   * @param {number} seconds Waktu absolut animasi, dalam detik.
   * @param {number} effort Bobot napas kuat 0..1, misalnya sebelum mengancam.
   * @param {number} strength Intensitas 0..1; nol menghentikan napas saat kalah.
   */
  breathe(seconds, effort = 0, strength = 1) {
    const periodSeconds = 3; // Satu siklus menarik/mengembuskan napas selama 3 detik.
    const normalAmplitude = 0.085; // Kedalaman mengembang 8.5% pada napas normal.
    const effortAmplitude = 0.035; // Tambahan 3.5% saat menarik napas kuat.
    const cycle = 0.5 - 0.5 * Math.cos(seconds * Math.PI * 2 / periodSeconds);
    const expansion = (normalAmplitude * cycle + effortAmplitude * effort) * strength;

    // Lebar dan tinggi ikut berubah kecil agar napas terbaca dari kamera depan maupun samping.
    this.joints.chest.scale = [
      1 + expansion * 0.55, // X: maksimum 6.6% saat napas kuat.
      1 + expansion * 0.28, // Y: maksimum 3.36%; kepala dan bahu tetap tidak ikut scaling.
      1 + expansion        // Z: maksimum 12% saat napas kuat.
    ];
  }
  // Waktu absolut dalam detik membuat replay, pause, dan seek konsisten.
  update(seconds) {
    KaiAnimation.apply(this, seconds);
  }
  draw(v, p) {
    this.root.draw(v, p);
    for (const weapon of this.weapons) weapon.draw(v, p);
  }
}
