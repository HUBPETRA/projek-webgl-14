/**
 * MR. PING: angsa dengan leher Bezier, paruh paraboloid, dan betis hyperboloid.
 * B = CharacterBuilder; c = palet RGB. Keenam build... menyusun bagian model.
 * Label tiap argumen = nama parameter; satuan builder dijelaskan di CharacterUtils.js.
 * Urutan mesh dipakai adapter animation/CharacterRigs.js; bila menambah mesh, perbarui adapter.
 */
class MrPing {
  constructor(GL, shaderProgram, originX = 0) {
    this.builder = new CharacterBuilder(GL, shaderProgram, originX);
    this.createModel();
  }

  createModel() {
    const B = this.builder;

    const c = {
      white: [0.88, 0.87, 0.85],
      neck: [0.90, 0.89, 0.89],
      cream: [0.91, 0.84, 0.68],
      robe: [0.48, 0.17, 0.24],
      robeLight: [0.59, 0.24, 0.32],
      hat: [0.61, 0.19, 0.25],
      bun: [0.91, 0.77, 0.64],
      skin: [0.91, 0.62, 0.43],
      bill: [0.95, 0.62, 0.38],
      billLow: [0.90, 0.52, 0.28],
      orange: [0.83, 0.49, 0.12],
      brown: [0.32, 0.18, 0.10],
      belly: [0.58, 0.30, 0.17],
      dark: [0.14, 0.13, 0.20],
      gray: [0.50, 0.51, 0.53],
      grayLight: [0.72, 0.74, 0.78],
      black: [0.035, 0.03, 0.03],
      gold: [0.78, 0.55, 0.20],
      sash: [0.80, 0.50, 0.20]
    };

    this.buildTorso(B, c);
    this.buildNeckAndHead(B, c);
    this.buildBill(B, c);
    this.buildHat(B, c);
    this.buildArms(B, c);
    this.buildTailAndLegs(B, c);
  }

  // Setengah lebar (x) dan setengah tebal (z) badan pada ketinggian y
  torsoHalf(y) {
    const es = [
      [0.67, 0.70, 0.48, -0.31],
      [0.75, 0.43, 0.51, -0.62]
    ];
    let a = 0,
      b = 0;
    for (const [rx, ry, rz, cy] of es) {
      const t = (y - cy) / ry;
      if (Math.abs(t) >= 1) continue;
      const f = Math.sqrt(1 - t * t);
      a = Math.max(a, rx * f);
      b = Math.max(b, rz * f);
    }
    return [a, b];
  }

  // ==============================
  // 1. BADAN, JUBAH, SABUK
  // ==============================
  buildTorso(B, c) {
    B.ellipsoid(
      /* radiusX */ 0.67,
      /* radiusY */ 0.70,
      /* radiusZ */ 0.48,
      /* posX */ 0,
      /* posY */ -0.31,
      /* posZ */ 0,
      /* colorRGB */ c.robe
    );
    B.ellipsoid(
      /* radiusX */ 0.75,
      /* radiusY */ 0.43,
      /* radiusZ */ 0.51,
      /* posX */ 0,
      /* posY */ -0.62,
      /* posZ */ 0,
      /* colorRGB */ c.robe
    );

    // Kerah
    B.ellipsoid(
      /* radiusX */ 0.36,
      /* radiusY */ 0.15,
      /* radiusZ */ 0.43,
      /* posX */ 0,
      /* posY */ 0.37,
      /* posZ */ 0.04,
      /* colorRGB */ c.cream
    );

    // Lis bawah jubah
    B.ellipsoid(
      /* radiusX */ 0.75,
      /* radiusY */ 0.075,
      /* radiusZ */ 0.51,
      /* posX */ 0,
      /* posY */ -0.94,
      /* posZ */ 0,
      /* colorRGB */ c.cream
    );
    B.ellipsoid(
      /* radiusX */ 0.69,
      /* radiusY */ 0.065,
      /* radiusZ */ 0.46,
      /* posX */ 0,
      /* posY */ -0.91,
      /* posZ */ 0,
      /* colorRGB */ c.robeLight
    );

    // Titik pada permukaan badan: sudut th diukur dari depan
    const ring = (y, th, k) => {
      const [a, b] = this.torsoHalf(y);
      const p = Math.PI / 2 + th;
      return [a * k * Math.cos(p), y, b * k * Math.sin(p)];
    };

    // Lis krem tengah depan: strip rata yang menempel di badan
    const strip = (y0, y1, off) => B.surface(
      /* positionFunctionUV */ (u, v) => {
        const y = y0 + (y1 - y0) * u;
        const x = (v - 0.5) * 0.17;
        const [a, b] = this.torsoHalf(y);
        return [x, y, b * Math.sqrt(Math.max(0, 1 - (x / a) * (x / a))) + off];
      },
      /* segmentsU */ 16,
      /* segmentsV */ 2,
      /* colorRGB */ c.cream
    );
    strip(0.34, -0.31, 0.012);
    strip(-0.31, -0.55, 0.045); // melewati sabuk
    strip(-0.55, -0.92, 0.012);

    // Sabuk: pita yang membungkus badan
    B.surface(
      /* positionFunctionUV */ (u, v) =>
      ring(-0.43 + (v - 0.5) * 0.24, (u * 2 - 1) * Math.PI, 1.03),
      /* segmentsU */ 64,
      /* segmentsV */ 2,
      /* colorRGB */ c.sash
    );

    // Kancing kodok (cylinder + ellipsoid)
    for (const y of [0.16, -0.08, -0.43, -0.70]) {
      const z = this.torsoHalf(y)[1] + 0.035;
      B.cylinder(
        /* radius */ 0.016,
        /* height */ 0.30,
        /* posX */ 0,
        /* posY */ y,
        /* posZ */ z,
        /* colorRGB */ c.brown,
        /* rotateXdeg */ 0,
        /* rotateYdeg */ 0,
        /* rotateZdeg */ 90
      );

      for (const s of [-1, 1]) {
        B.ellipsoid(
          /* radiusX */ 0.03,
          /* radiusY */ 0.03,
          /* radiusZ */ 0.025,
          /* posX */ s * 0.15,
          /* posY */ y,
          /* posZ */ z - 0.01,
          /* colorRGB */ c.brown
        );
      }
    }
  }

  // ==============================
  // 2. LEHER PANJANG, KEPALA, MATA
  // ==============================
  buildNeckAndHead(B, c) {
    // Leher: melengkung sedikit ke depan, mengecil ke atas

    B.curve(
      /* controlPointsXYZ */ [
        [0, 0.30, 0.05],
        [0, 1.00, 0.22],
        [0, 1.80, 0.18],
        [0, 2.35, 0.02]
      ],
      /* startRadius */ 0.28,
      /* colorRGB */ c.neck,
      /* endRadius */ 0.15
    );

    // Kepala
    B.ellipsoid(
      /* radiusX */ 0.43,
      /* radiusY */ 0.39,
      /* radiusZ */ 0.34,
      /* posX */ 0,
      /* posY */ 2.58,
      /* posZ */ 0,
      /* colorRGB */ c.white
    );

    for (const s of [-1, 1]) {
      // Pipi kulit
      B.ellipsoid(
        /* radiusX */ 0.17,
        /* radiusY */ 0.15,
        /* radiusZ */ 0.15,
        /* posX */ s * 0.22,
        /* posY */ 2.48,
        /* posZ */ 0.19,
        /* colorRGB */ c.skin
      );

      // Kantung mata abu-abu
      B.ellipsoid(
        /* radiusX */ 0.19,
        /* radiusY */ 0.205,
        /* radiusZ */ 0.105,
        /* posX */ s * 0.17,
        /* posY */ 2.67,
        /* posZ */ 0.278,
        /* colorRGB */ c.gray
      );
      B.ellipsoid(
        /* radiusX */ 0.16,
        /* radiusY */ 0.06,
        /* radiusZ */ 0.07,
        /* posX */ s * 0.17,
        /* posY */ 2.53,
        /* posZ */ 0.36,
        /* colorRGB */ c.gray
      );

      // Bola mata, iris, pupil, kilau
      B.ellipsoid(
        /* radiusX */ 0.145,
        /* radiusY */ 0.16,
        /* radiusZ */ 0.085,
        /* posX */ s * 0.17,
        /* posY */ 2.67,
        /* posZ */ 0.345,
        /* colorRGB */ c.cream
      );
      B.ellipsoid(
        /* radiusX */ 0.079,
        /* radiusY */ 0.09,
        /* radiusZ */ 0.045,
        /* posX */ s * 0.16,
        /* posY */ 2.66,
        /* posZ */ 0.415,
        /* colorRGB */ c.orange
      );
      B.ellipsoid(
        /* radiusX */ 0.041,
        /* radiusY */ 0.056,
        /* radiusZ */ 0.025,
        /* posX */ s * 0.16,
        /* posY */ 2.66,
        /* posZ */ 0.452,
        /* colorRGB */ c.black
      );
      B.ellipsoid(
        /* radiusX */ 0.019,
        /* radiusY */ 0.023,
        /* radiusZ */ 0.012,
        /* posX */ s * 0.175,
        /* posY */ 2.69,
        /* posZ */ 0.474,
        /* colorRGB */ c.cream
      );

      // Alis abu-abu: ujung dalam tinggi, ujung luar turun
      B.curve(
        /* controlPointsXYZ */ [
          [s * 0.03, 2.88, 0.40],
          [s * 0.10, 2.90, 0.41],
          [s * 0.22, 2.86, 0.37],
          [s * 0.34, 2.76, 0.28]
        ],
        /* startRadius */ 0.035,
        /* colorRGB */ c.gray,
        /* endRadius */ 0.02
      );

      // Jumbai bulu abu-abu di pipi (paraboloid)
      for (let k = -1; k <= 1; k++) {
        B.paraboloid(
          /* radiusX */ 0.03,
          /* radiusZ */ 0.014,
          /* height */ 0.24,
          /* posX */ s * 0.36,
          /* posY */ 2.52 - k * 0.03,
          /* posZ */ 0.14,
          /* colorRGB */ c.grayLight,
          /* rotateXdeg */ 0,
          /* rotateYdeg */ 0,
          /* rotateZdeg */ s * -120 + k * 16
        );
      }
    }
  }

  // ==============================
  // 3. PARUH (elliptic paraboloid)
  // ==============================
  buildBill(B, c) {
    // Paraboloid bersumbu y diputar 100 derajat -> ujung menghadap depan dan sedikit turun
    B.paraboloid(
      /* radiusX */ 0.17,
      /* radiusZ */ 0.095,
      /* height */ 0.62,
      /* posX */ 0,
      /* posY */ 2.50,
      /* posZ */ 0.22,
      /* colorRGB */ c.bill,
      /* rotateXdeg */ 100
    );
    B.paraboloid(
      /* radiusX */ 0.13,
      /* radiusZ */ 0.045,
      /* height */ 0.50,
      /* posX */ 0,
      /* posY */ 2.43,
      /* posZ */ 0.24,
      /* colorRGB */ c.billLow,
      /* rotateXdeg */ 98
    );

    // Lubang hidung
    for (const s of [-1, 1]) {
      B.ellipsoid(
        /* radiusX */ 0.025,
        /* radiusY */ 0.012,
        /* radiusZ */ 0.04,
        /* posX */ s * 0.03,
        /* posY */ 2.498,
        /* posZ */ 0.555,
        /* colorRGB */ c.brown
      );
    }

    // Garis mulut
    B.curve(
      /* controlPointsXYZ */ [
        [-0.12, 2.43, 0.47],
        [-0.06, 2.41, 0.59],
        [0.06, 2.41, 0.59],
        [0.12, 2.43, 0.47]
      ],
      /* startRadius */ 0.012,
      /* colorRGB */ c.brown,
      /* endRadius */ 0.006
    );
  }

  // ==============================
  // 4. TOPI MI + SANGGUL + SUMPIT
  // ==============================
  buildHat(B, c) {
    // Pita topi: mangkuk merah (frustum), sedikit miring ke depan
    B.frustum(
      /* bottomRadius */ 0.36,
      /* topRadius */ 0.46,
      /* height */ 0.20,
      /* posX */ 0,
      /* posY */ 2.96,
      /* posZ */ 0,
      /* colorRGB */ c.hat,
      /* rotateXdeg */ 6
    );

    // Kubah krem
    B.ellipsoid(
      /* radiusX */ 0.36,
      /* radiusY */ 0.17,
      /* radiusZ */ 0.30,
      /* posX */ 0,
      /* posY */ 3.06,
      /* posZ */ -0.01,
      /* colorRGB */ c.cream
    );

    // Sanggul bergerombol
    const buns = [
      [-0.22, 3.13, 0.00, 0.16],
      [-0.08, 3.21, 0.00, 0.17],
      [0.10, 3.20, 0.00, 0.17],
      [0.25, 3.12, 0.00, 0.15],
      [0.00, 3.12, 0.18, 0.16]
    ];
    for (const [x, y, z, r] of buns) {
      B.ellipsoid(
        /* radiusX */ r,
        /* radiusY */ r * 0.82,
        /* radiusZ */ r,
        /* posX */ x,
        /* posY */ y,
        /* posZ */ z,
        /* colorRGB */ c.bun
      );
    }

    // Sumpit (cylinder) miring ke kiri
    B.cylinder(
      /* radius */ 0.018,
      /* height */ 0.55,
      /* posX */ -0.21,
      /* posY */ 3.43,
      /* posZ */ -0.02,
      /* colorRGB */ c.brown,
      /* rotateXdeg */ 0,
      /* rotateYdeg */ 0,
      /* rotateZdeg */ 35
    );
    B.cylinder(
      /* radius */ 0.018,
      /* height */ 0.50,
      /* posX */ -0.07,
      /* posY */ 3.45,
      /* posZ */ -0.02,
      /* colorRGB */ c.brown,
      /* rotateXdeg */ 0,
      /* rotateYdeg */ 0,
      /* rotateZdeg */ 22
    );
  }

  // ==============================
  // 5. LENGAN, MANSET, SAYAP
  // ==============================
  buildArms(B, c) {
    for (const s of [-1, 1]) {
      // Bahu (kecil agar tidak menonjol)
      B.ellipsoid(
        /* radiusX */ 0.22,
        /* radiusY */ 0.21,
        /* radiusZ */ 0.20,
        /* posX */ s * 0.55,
        /* posY */ 0.14,
        /* posZ */ 0,
        /* colorRGB */ c.robe
      );

      // Lengan baju (frustum sepanjang sumbu)
      B.segment(
        /* startXYZ */ [s * 0.50, 0.18, 0],
        /* endXYZ */ [s * 1.00, -0.02, 0],
        /* startRadius */ 0.22,
        /* endRadius */ 0.21,
        /* colorRGB */ c.robeLight
      );

      // Manset krem
      B.segment(
        /* startXYZ */ [s * 1.00, -0.02, 0],
        /* endXYZ */ [s * 1.24, -0.08, 0],
        /* startRadius */ 0.235,
        /* endRadius */ 0.25,
        /* colorRGB */ c.cream
      );

      // Pangkal sayap
      B.ellipsoid(
        /* radiusX */ 0.12,
        /* radiusY */ 0.07,
        /* radiusZ */ 0.06,
        /* posX */ s * 1.29,
        /* posY */ -0.09,
        /* posZ */ 0,
        /* colorRGB */ c.gray
      );

      // Bulu ujung sayap: paraboloid pipih menyebar
      for (let k = -2; k <= 2; k++) {
        B.paraboloid(
          /* radiusX */ 0.045,
          /* radiusZ */ 0.014,
          /* height */ 0.38 - Math.abs(k) * 0.04,
          /* posX */ s * 1.27,
          /* posY */ -0.09,
          /* posZ */ 0,
          /* colorRGB */ Math.abs(k) % 2 ? c.grayLight : c.white,
          /* rotateXdeg */ 0,
          /* rotateYdeg */ 0,
          /* rotateZdeg */ s * -90 + k * 10
        );
      }
    }
  }

  // ==============================
  // 6. EKOR, PERUT, KAKI
  // ==============================
  buildTailAndLegs(B, c) {
    // Perut coklat: kecil dan digeser ke belakang supaya kaki tetap terlihat
    B.ellipsoid(
      /* radiusX */ 0.50,
      /* radiusY */ 0.22,
      /* radiusZ */ 0.38,
      /* posX */ 0,
      /* posY */ -1.00,
      /* posZ */ 0.02,
      /* colorRGB */ c.belly
    );

    // Ekor: bulu putih (paraboloid) mengipas ke bawah-belakang
    for (let i = 0; i < 5; i++) {
      const k = i - 2;
      B.paraboloid(
        /* radiusX */ 0.13,
        /* radiusZ */ 0.03,
        /* height */ 0.50 - Math.abs(k) * 0.05,
        /* posX */ k * 0.15,
        /* posY */ -0.95,
        /* posZ */ -0.30,
        /* colorRGB */ Math.abs(k) === 1 ? c.grayLight : c.white,
        /* rotateXdeg */ -20,
        /* rotateYdeg */ 0,
        /* rotateZdeg */ 180 + k * 10
      );
    }

    // Sepasang kaki
    for (const s of [-1, 1]) {
      const x = s * 0.31;

      // Bonggol paha
      B.ellipsoid(
        /* radiusX */ 0.085,
        /* radiusY */ 0.11,
        /* radiusZ */ 0.085,
        /* posX */ x,
        /* posY */ -1.12,
        /* posZ */ 0.10,
        /* colorRGB */ c.dark
      );

      // Betis berbentuk hyperboloid (ramping di tengah)
      B.hyperboloid(
        /* radiusX */ 0.07,
        /* radiusZ */ 0.07,
        /* height */ 0.22,
        /* posX */ x,
        /* posY */ -1.25,
        /* posZ */ 0.10,
        /* colorRGB */ c.dark
      );

      // Gelang emas
      B.torus(
        /* majorRadius */ 0.066,
        /* tubeRadius */ 0.016,
        /* posX */ x,
        /* posY */ -1.31,
        /* posZ */ 0.10,
        /* colorRGB */ c.gold
      );
      B.torus(
        /* majorRadius */ 0.066,
        /* tubeRadius */ 0.016,
        /* posX */ x,
        /* posY */ -1.34,
        /* posZ */ 0.10,
        /* colorRGB */ c.gold
      );

      // Telapak berselaput
      B.ellipsoid(
        /* radiusX */ 0.07,
        /* radiusY */ 0.02,
        /* radiusZ */ 0.07,
        /* posX */ x,
        /* posY */ -1.395,
        /* posZ */ 0.10,
        /* colorRGB */ c.dark
      );
      B.ellipsoid(
        /* radiusX */ 0.17,
        /* radiusY */ 0.012,
        /* radiusZ */ 0.12,
        /* posX */ x,
        /* posY */ -1.398,
        /* posZ */ 0.24,
        /* colorRGB */ c.dark
      );
      for (let k = -1; k <= 1; k++) {
        B.paraboloid(
          /* radiusX */ 0.055,
          /* radiusZ */ 0.018,
          /* height */ 0.30,
          /* posX */ x,
          /* posY */ -1.395,
          /* posZ */ 0.12,
          /* colorRGB */ c.dark,
          /* rotateXdeg */ 90,
          /* rotateYdeg */ k * 24 + s * 8,
          /* rotateZdeg */ 0
        );
      }
    }
  }

  update() {}

  draw(VIEW_MATRIX, PROJECTION_MATRIX) {
    this.builder.draw(VIEW_MATRIX, PROJECTION_MATRIX);
  }
}
