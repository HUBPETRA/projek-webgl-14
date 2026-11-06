class Shifu {
  constructor(GL, shaderProgram, originX = 0) {
    this.builder = new CharacterBuilder(GL, shaderProgram, originX);
    this.createModel();
  }

  createModel() {
    const B = this.builder;

    const c = {
      white:     [0.88, 0.87, 0.85],
      neck:      [0.90, 0.89, 0.89],
      cream:     [0.91, 0.84, 0.68],
      robe:      [0.48, 0.17, 0.24],
      robeLight: [0.59, 0.24, 0.32],
      hat:       [0.61, 0.19, 0.25],
      bun:       [0.91, 0.77, 0.64],
      skin:      [0.91, 0.62, 0.43],
      bill:      [0.95, 0.62, 0.38],
      billLow:   [0.90, 0.52, 0.28],
      orange:    [0.83, 0.49, 0.12],
      brown:     [0.32, 0.18, 0.10],
      belly:     [0.58, 0.30, 0.17],
      dark:      [0.14, 0.13, 0.20],
      gray:      [0.50, 0.51, 0.53],
      grayLight: [0.72, 0.74, 0.78],
      black:     [0.035, 0.03, 0.03],
      gold:      [0.78, 0.55, 0.20],
      sash:      [0.80, 0.50, 0.20]
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
    const es = [[0.67, 0.70, 0.48, -0.31], [0.75, 0.43, 0.51, -0.62]];
    let a = 0, b = 0;
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
    B.ellipsoid(0.67, 0.70, 0.48, 0, -0.31, 0, c.robe);
    B.ellipsoid(0.75, 0.43, 0.51, 0, -0.62, 0, c.robe);

    // Kerah
    B.ellipsoid(0.36, 0.15, 0.43, 0, 0.37, 0.04, c.cream);

    // Lis bawah jubah
    B.ellipsoid(0.75, 0.075, 0.51, 0, -0.94, 0, c.cream);
    B.ellipsoid(0.69, 0.065, 0.46, 0, -0.91, 0, c.robeLight);

    // Titik pada permukaan badan: sudut th diukur dari depan
    const ring = (y, th, k) => {
      const [a, b] = this.torsoHalf(y);
      const p = Math.PI / 2 + th;
      return [a * k * Math.cos(p), y, b * k * Math.sin(p)];
    };

    // Lis krem tengah depan: strip rata yang menempel di badan
    const strip = (y0, y1, off) => B.surface((u, v) => {
      const y = y0 + (y1 - y0) * u;
      const x = (v - 0.5) * 0.17;
      const [a, b] = this.torsoHalf(y);
      return [x, y, b * Math.sqrt(Math.max(0, 1 - (x / a) * (x / a))) + off];
    }, 16, 2, c.cream);
    strip(0.34, -0.31, 0.012);
    strip(-0.31, -0.55, 0.045);   // melewati sabuk
    strip(-0.55, -0.92, 0.012);

    // Sabuk: pita yang membungkus badan
    B.surface((u, v) =>
      ring(-0.43 + (v - 0.5) * 0.24, (u * 2 - 1) * Math.PI, 1.03),
      64, 2, c.sash);

    // Kancing kodok (cylinder + ellipsoid)
    for (const y of [0.16, -0.08, -0.43, -0.70]) {
      const z = this.torsoHalf(y)[1] + 0.035;
      B.cylinder(0.016, 0.30, 0, y, z, c.brown, 0, 0, 90);

      for (const s of [-1, 1]) {
        B.ellipsoid(
          0.03, 0.03, 0.025,
          s * 0.15, y, z - 0.01,
          c.brown
        );
      }
    }
  }

  // ==============================
  // 2. LEHER PANJANG, KEPALA, MATA
  // ==============================
  buildNeckAndHead(B, c) {
    // Leher: melengkung sedikit ke depan, mengecil ke atas



  B.curve([
    [0, 0.30, 0.05],
    [0, 1.00, 0.22],
    [0, 1.80, 0.18],
    [0, 2.35, 0.02]
  ], 0.28, c.neck, 0.15);

    // Kepala
    B.ellipsoid(0.43, 0.39, 0.34, 0, 2.58, 0, c.white);

    for (const s of [-1, 1]) {
      // Pipi kulit
      B.ellipsoid(0.17, 0.15, 0.15, s * 0.22, 2.48, 0.19, c.skin);

      // Kantung mata abu-abu
      B.ellipsoid(0.19, 0.205, 0.105, s * 0.17, 2.67, 0.278, c.gray);
      B.ellipsoid(0.16, 0.06, 0.07, s * 0.17, 2.53, 0.36, c.gray);

      // Bola mata, iris, pupil, kilau
      B.ellipsoid(0.145, 0.16, 0.085, s * 0.17, 2.67, 0.345, c.cream);
      B.ellipsoid(0.079, 0.09, 0.045, s * 0.16, 2.66, 0.415, c.orange);
      B.ellipsoid(0.041, 0.056, 0.025, s * 0.16, 2.66, 0.452, c.black);
      B.ellipsoid(0.019, 0.023, 0.012, s * 0.175, 2.69, 0.474, c.cream);


      // Alis abu-abu: ujung dalam tinggi, ujung luar turun
      B.curve([
        [s * 0.03, 2.88, 0.40],
        [s * 0.10, 2.90, 0.41],
        [s * 0.22, 2.86, 0.37],
        [s * 0.34, 2.76, 0.28]
      ], 0.035, c.gray, 0.02);

      // Jumbai bulu abu-abu di pipi (paraboloid)
      for (let k = -1; k <= 1; k++) {
        B.paraboloid(
          0.03, 0.014, 0.24,
          s * 0.36, 2.52 - k * 0.03, 0.14,
          c.grayLight,
          0, 0, s * -120 + k * 16
        );
      }
    }
  }

  // ==============================
  // 3. PARUH (elliptic paraboloid)
  // ==============================
  buildBill(B, c) {
    // Paraboloid bersumbu y diputar 100 derajat -> ujung menghadap depan dan sedikit turun
    B.paraboloid(0.17, 0.095, 0.62, 0, 2.50, 0.22, c.bill, 100);
    B.paraboloid(0.13, 0.045, 0.50, 0, 2.43, 0.24, c.billLow, 98);

    // Lubang hidung
    for (const s of [-1, 1]) {
      B.ellipsoid(0.025, 0.012, 0.04, s * 0.03, 2.498, 0.555, c.brown);
    }

    // Garis mulut
    B.curve([
      [-0.12, 2.43, 0.47],
      [-0.06, 2.41, 0.59],
      [ 0.06, 2.41, 0.59],
      [ 0.12, 2.43, 0.47]
    ], 0.012, c.brown, 0.006);
  }

  // ==============================
  // 4. TOPI MI + SANGGUL + SUMPIT
  // ==============================
  buildHat(B, c) {
    // Pita topi: mangkuk merah (frustum), sedikit miring ke depan
    B.frustum(0.36, 0.46, 0.20, 0, 2.96, 0, c.hat, 6);

    // Kubah krem
    B.ellipsoid(0.36, 0.17, 0.30, 0, 3.06, -0.01, c.cream);

    // Sanggul bergerombol
    const buns = [
      [-0.22, 3.13, 0.00, 0.16],
      [-0.08, 3.21, 0.00, 0.17],
      [ 0.10, 3.20, 0.00, 0.17],
      [ 0.25, 3.12, 0.00, 0.15],
      [ 0.00, 3.12, 0.18, 0.16]
    ];
    for (const [x, y, z, r] of buns) {
      B.ellipsoid(r, r * 0.82, r, x, y, z, c.bun);
    }

    // Sumpit (cylinder) miring ke kiri
    B.cylinder(0.018, 0.55, -0.21, 3.43, -0.02, c.brown, 0, 0, 35);
    B.cylinder(0.018, 0.50, -0.07, 3.45, -0.02, c.brown, 0, 0, 22);
  }

  // ==============================
  // 5. LENGAN, MANSET, SAYAP
  // ==============================
  buildArms(B, c) {
    for (const s of [-1, 1]) {
      // Bahu (kecil agar tidak menonjol)
      B.ellipsoid(0.22, 0.21, 0.20, s * 0.55, 0.14, 0, c.robe);

      // Lengan baju (frustum sepanjang sumbu)
      B.segment([s * 0.50, 0.18, 0], [s * 1.00, -0.02, 0], 0.22, 0.21, c.robeLight);

      // Manset krem
      B.segment([s * 1.00, -0.02, 0], [s * 1.24, -0.08, 0], 0.235, 0.25, c.cream);

      // Pangkal sayap
      B.ellipsoid(0.12, 0.07, 0.06, s * 1.29, -0.09, 0, c.gray);

      // Bulu ujung sayap: paraboloid pipih menyebar
      for (let k = -2; k <= 2; k++) {
        B.paraboloid(
          0.045, 0.014, 0.38 - Math.abs(k) * 0.04,
          s * 1.27, -0.09, 0,
          Math.abs(k) % 2 ? c.grayLight : c.white,
          0, 0, s * -90 + k * 10
        );
      }
    }
  }

  // ==============================
  // 6. EKOR, PERUT, KAKI
  // ==============================
  buildTailAndLegs(B, c) {
    // Perut coklat: kecil dan digeser ke belakang supaya kaki tetap terlihat
    B.ellipsoid(0.50, 0.22, 0.38, 0, -1.00, 0.02, c.belly);

    // Ekor: bulu putih (paraboloid) mengipas ke bawah-belakang
    for (let i = 0; i < 5; i++) {
      const k = i - 2;
      B.paraboloid(
        0.13, 0.03, 0.50 - Math.abs(k) * 0.05,
        k * 0.15, -0.95, -0.30,
        Math.abs(k) === 1 ? c.grayLight : c.white,
        -20, 0, 180 + k * 10
      );
    }

    // Sepasang kaki
    for (const s of [-1, 1]) {
      const x = s * 0.31;

      // Bonggol paha
      B.ellipsoid(0.085, 0.11, 0.085, x, -1.12, 0.10, c.dark);

      // Betis berbentuk hyperboloid (ramping di tengah)
      B.hyperboloid(0.07, 0.07, 0.22, x, -1.25, 0.10, c.dark);

      // Gelang emas
      B.torus(0.066, 0.016, x, -1.31, 0.10, c.gold);
      B.torus(0.066, 0.016, x, -1.34, 0.10, c.gold);

      // Telapak berselaput
      B.ellipsoid(0.07, 0.02, 0.07, x, -1.395, 0.10, c.dark);
      B.ellipsoid(0.17, 0.012, 0.12, x, -1.398, 0.24, c.dark);
      for (let k = -1; k <= 1; k++) {
        B.paraboloid(
          0.055, 0.018, 0.30,
          x, -1.395, 0.12,
          c.dark,
          90, k * 24 + s * 8, 0
        );
      }
    }
  }

  update() {}

  draw(VIEW_MATRIX, PROJECTION_MATRIX) {
    this.builder.draw(VIEW_MATRIX, PROJECTION_MATRIX);
  }
}

// Jika main.js masih memanggil `new Shifu(...)`, ganti ke MrPing atau tambahkan:
// class Shifu extends MrPing {}