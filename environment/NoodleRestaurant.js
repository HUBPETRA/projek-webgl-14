// Halaman restoran diperluas hanya untuk framing kamera dan taman tepi.
// Koordinat bangunan serta area duel tetap memakai unit dunia yang sama.
class NoodleRestaurant extends Environment {
  create() {
    this.layout = {
      columns: 19, // Banyak ubin arah X; indeks -9 sampai 9.
      rows: 15, // Banyak ubin arah Z; indeks -6 sampai 8.
      firstRowZ: -6, // Baris pertama dalam satuan indeks, bukan unit dunia.
      tileSpacing: 1.8, // Jarak pusat ubin; ukuran ubin 1.77 menyisakan celah 0.03.
      tileSize: 1.77, // Lebar dan kedalaman satu ubin.
      foundationWidth: 36, // Lebar penuh fondasi pada X, sebelumnya 26.
      foundationDepth: 30, // Kedalaman penuh fondasi pada Z, sebelumnya 21.
      centerZ: 1.8, // Geser halaman ke depan untuk menutup bagian bawah shot lebar.
      fenceX: 16.1 // Jarak pagar samping dari pusat; area duel berada jauh di dalamnya.
    };
    this.createGround();
    this.createBuilding();
    this.createGarden();
    this.createMountains();
  }

  // Fondasi rendah, 285 ubin, lis batu, dan tiga anak tangga di jalur masuk.
  createGround() {
    const L = this.layout, stone = [0.54, 0.53, 0.42];
    this.box(0, -0.32, L.centerZ, L.foundationWidth, 0.62,
      L.foundationDepth, [0.39, 0.42, 0.31]);
    const halfColumns = (L.columns - 1) / 2;
    for (let ix = -halfColumns; ix <= halfColumns; ix++) {
      for (let iz = L.firstRowZ; iz < L.firstRowZ + L.rows; iz++) {
        const border = Math.abs(ix) >= halfColumns || iz === L.firstRowZ
          || iz === L.firstRowZ + L.rows - 1;
        const variation = 0.025 * Math.sin(ix * 7 + iz * 1.7);
        const color = border ? [0.43 + variation, 0.43, 0.34]
          : [0.55 + variation, 0.51 + variation * 0.5, 0.39];
        this.box(ix * L.tileSpacing, -0.05, iz * L.tileSpacing,
          L.tileSize, 0.12, L.tileSize, color);
      }
    }
    // Lis dan jalur batu memberi batas halaman tanpa membuat dinding depan.
    for (const side of [-1, 1]) {
      this.box(side * 17.45, -0.04, L.centerZ, 0.36, 0.18, 28.5, stone);
      this.box(side * 10.2, 0.018, 3.0, 0.10, 0.025, 18.0, [0.71, 0.64, 0.45]);
      this.box(side * 10.4, -0.04, 16.35, 13.7, 0.18, 0.45, stone);
    }
    for (let step = 0; step < 3; step++) {
      this.box(0, -0.13 - step * 0.20, 16.9 + step * 0.72,
        7.2 + step * 0.35, 0.22, 1.25, stone);
    }
  }

  // Bangunan inti tetap berukuran 20 x 6 agar proporsinya terhadap karakter terjaga.
  createBuilding() {
    const B = this.builder,
      wood = [0.34, 0.18, 0.10],
      red = [0.50, 0.16, 0.10],
      gold = [0.84, 0.60, 0.27],
      cream = [0.77, 0.66, 0.46],
      teal = [0.16, 0.34, 0.30];
    this.box(0, 3, -6.6, 20, 6, 0.25, cream);
    for (const x of [-9.5, -6.3, -3.1, 0.1, 3.3, 6.5, 9.5]) B.cylinder(0.14, 6.4, x, 3.1, -6.3,
      red);
    this.box(0, 0.65, -6.4, 20, 1.25, 0.18, wood);
    this.box(0, 5.78, -6.25, 20, 0.25, 0.35, red);
    for (const x of [-7.8, -4.6, 1.6, 7.9]) {
      this.box(x, 3.2, -6.36, 2.35, 2.65, 0.18, teal);
      for (let j = -2; j <= 2; j++) this.box(x + j * 0.4, 3.2, -6.23, 0.045, 2.6, 0.05, gold);
      for (let j = -2; j <= 2; j++) this.box(x, 3.2 + j * 0.43, -6.2, 2.3, 0.045, 0.05, gold);
    }
    this.roof(0, 6.05, -6.4, 21, 3, 1.0);
    this.box(-1.5, 5.03, -6.05, 5.0, 0.92, 0.17, wood);
    this.box(-1.5, 5.03, -5.93, 4.8, 0.74, 0.08, red);
    // Lambang mi merupakan ukiran papan, bukan objek yang dimainkan karakter.
    B.curve([
      [-2.15, 5.04, -5.85],
      [-2.05, 4.6, -5.85],
      [-0.95, 4.6, -5.85],
      [-0.85, 5.04, -5.85]
    ], 0.045, gold);
    for (let x = -1.85; x < -1.1; x += 0.3) B.curve([
      [x, 5.06, -5.84],
      [x - 0.12, 5.2, -5.84],
      [x + 0.1, 5.27, -5.84],
      [x, 5.37, -5.84]
    ], 0.024, gold);
    for (const x of [-8, -4, 0, 4, 8]) {
      B.cylinder(0.025, 0.45, x, 5.4, -4.7, wood);
      B.ellipsoid(0.34, 0.48, 0.34, x, 4.91, -4.7, [0.88, 0.31, 0.10]);
      B.cylinder(0.25, 0.08, x, 5.34, -4.7, gold);
      B.cylinder(0.25, 0.08, x, 4.48, -4.7, gold);
      for (const k of [-1, 0, 1]) B.cylinder(0.014, 0.28, x + k * 0.06, 4.3, -4.7, gold);
    }
    // Konter dan dua meja berada di belakang; tidak ada mangkuk, spatula, atau sayuran.
    this.box(5.9, 1, -4.65, 5.4, 2, 1.25, red);
    this.box(5.9, 2.08, -4.65, 5.6, 0.20, 1.5, wood);
    for (const x of [4.2, 5.9, 7.6]) this.box(x, 1, -3.99, 1.25, 1.35, 0.07, [0.38, 0.12, 0.075]);
    for (const [x, z] of [
        [-7.1, -4.0],
        [8.2, -1.8]
      ]) {
      this.box(x, 1.6, z, 2.1, 0.16, 1.4, wood);
      for (const dx of [-0.8, 0.8])
        for (const dz of [-0.45, 0.45]) this.box(x + dx, 0.79, z + dz, 0.12, 1.58, 0.12, wood);
    }
  }

  // Pagar rendah dan tanaman hanya berada di sisi; tengah halaman untuk koreografi.
  createGarden() {
    const B = this.builder, L = this.layout;
    const wood = [0.34, 0.18, 0.10], red = [0.50, 0.16, 0.10];
    for (const side of [-1, 1]) {
      const x = side * L.fenceX;
      this.box(x, 0.48, 2.8, 0.20, 0.90, 21.6, wood);
      this.box(x, 1.0, 2.8, 0.28, 0.12, 21.8, red);
      for (let z = -7.4; z <= 13.0; z += 1.7) B.cylinder(0.045, 1.2, x, 0.65, z, wood);
      // Dua tiang hias tetap di belakang area aksi, bukan di depan kamera.
      B.cylinder(0.16, 5.8, side * 12.0, 2.9, -4.0, red);
      this.box(side * 12.0, 5.8, -6.0, 0.24, 0.22, 4.4, red);
      for (const [z, height] of [[-8.2, 3.3], [1.0, 2.6], [8.5, 2.8]]) {
        this.planter(side * 14.0, z, height);
      }
      // Dua bangku di tepi membuat halaman terasa sebagai ruang restoran.
      this.box(side * 11.8, 0.65, 5.5, 1.1, 0.16, 2.6, wood);
      for (const dz of [-0.95, 0.95]) this.box(side * 11.8, 0.32, 5.5 + dz,
        0.75, 0.64, 0.16, wood);
      for (const z of [-1.4, 3.4, 10.8]) {
        B.addMesh(generateEllipsoid(0.45, 0.23, 0.32, 12, 8, [0.47, 0.49, 0.40]),
          side * 14.15, 0.21, z);
      }
    }
  }

  /**
   * Pot batu berisi rumpun bambu dan semak rendah.
   * @param {number} x Pusat pot pada X; diletakkan di luar jalur karakter.
   * @param {number} z Pusat pot pada Z, unit dunia.
   * @param {number} height Tinggi batang bambu di atas permukaan tanah pot.
   */
  planter(x, z, height) {
    const B = this.builder, stone = [0.55, 0.49, 0.35];
    this.box(x, 0.20, z, 1.8, 0.40, 2.4, stone);
    this.box(x, 0.42, z, 1.65, 0.08, 2.24, [0.28, 0.28, 0.16]);
    for (let i = 0; i < 4; i++) {
      const bx = x + (i % 2 - 0.5) * 0.55;
      const bz = z + (Math.floor(i / 2) - 0.5) * 0.85;
      const h = height * (0.84 + 0.07 * i), ground = 0.46;
      B.cylinder(0.065, h, bx, ground + h / 2, bz, [0.38, 0.52, 0.22]);
      for (let node = 1; node <= 3; node++) {
        const y = ground + h * node / 4;
        B.cylinder(0.077, 0.045, bx, y, bz, [0.53, 0.60, 0.30]);
        for (const side of [-1, 1]) {
          const tip = [bx + side * 0.38, y + 0.20, bz + 0.08];
          B.segment([bx, y, bz], tip, 0.022, 0.009, [0.32, 0.46, 0.20]);
          B.addMesh(generateEllipsoid(0.37, 0.045, 0.105, 12, 6,
            [0.28 + i * 0.015, 0.45, 0.20]), tip[0], tip[1], tip[2], 0,
            side * 18, side * 24);
        }
      }
    }
    for (const side of [-1, 1]) B.addMesh(generateEllipsoid(0.60, 0.38, 0.65,
      16, 10, [0.28, 0.40, 0.19]), x + side * 0.48, 0.65, z + side * 0.65);
  }

  // Tiga lapis pegunungan memberi kedalaman; kisi rendah cukup untuk latar jauh.
  createMountains() {
    const layers = [
      {z:-40, depth:14, height:12, color:[0.67, 0.78, 0.77], phase:1.2},
      {z:-29, depth:12, height:9.5, color:[0.53, 0.66, 0.60], phase:2.5},
      {z:-20, depth:10, height:6.5, color:[0.40, 0.55, 0.43], phase:0.1}
    ];
    for (const layer of layers) {
      this.builder.surface((u, v) => {
        const x = -46 + u * 88;
        const peaks = 0.35 + 0.65 * Math.pow(Math.sin(u * Math.PI * 5 + layer.phase), 2);
        const edge = Math.pow(Math.sin(Math.PI * u), 0.35);
        return [x, -0.65 + layer.height * peaks * edge * Math.sin(Math.PI * v),
          layer.z + (v - 0.5) * layer.depth];
      }, 64, 10, layer.color, (u, v) => layer.color.map(c => c
        * (0.91 + 0.09 * Math.sin(Math.PI * v))));
    }
  }
}
