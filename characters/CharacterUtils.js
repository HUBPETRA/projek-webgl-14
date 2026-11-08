/**
 * Pembuat mesh karakter. Setiap pemanggilan menambah satu bagian ke parts.
 * Satuan ukuran/posisi = unit dunia; X kanan-kiri, Y atas-bawah, Z depan-belakang.
 * Radius adalah SETENGAH ukuran; radiusX=0.5 berarti lebar total 1 unit.
 * Semua rotateX/Y/Z di builder memakai DERAJAT; SceneNode.rotation memakai RADIAN.
 * Warna [R,G,B] memakai angka 0..1. Contoh [1,0,0] = merah.
 */
class CharacterBuilder {
  /**
   * Menyiapkan builder dan offset seluruh karakter.
   * @param {WebGLRenderingContext} GL Konteks GPU dari canvas.
   * @param {WebGLProgram} shaderProgram Shader untuk mewarnai dan menerangi mesh.
   * @param {number} originX Offset seluruh karakter pada X, default 0.
   * @param {number} originY Offset seluruh karakter pada Y, default 0.
   * @param {number} originZ Offset seluruh karakter pada Z, default 0.
   */
  constructor(GL, shaderProgram, originX = 0, originY = 0, originZ = 0) {
    this.GL = GL;
    this.shaderProgram = shaderProgram;
    this.origin = [originX, originY, originZ];
    this.parts = [];
  }

  /**
   * Mengubah data vertex/segitiga menjadi objek yang dapat digambar.
   * @param {Object} mesh Data vertices (XYZ+RGB) dan faces (indeks segitiga).
   * @param {number} x Posisi pusat/pangkal pada X, ditambah originX.
   * @param {number} y Posisi pada Y, ditambah originY.
   * @param {number} z Posisi pada Z, ditambah originZ.
   * @param {number} rotationX Putaran X dalam derajat; default 0.
   * @param {number} rotationY Putaran Y dalam derajat; default 0.
   * @param {number} rotationZ Putaran Z dalam derajat; default 0.
   */
  addMesh(mesh, x, y, z, rotationX = 0, rotationY = 0, rotationZ = 0) {
    const object = new MyObject(
      this.GL,
      mesh.vertices,
      mesh.faces,
      this.shaderProgram
    );

    LIBS.translateX(object.MODEL_MATRIX, x + this.origin[0]);
    LIBS.translateY(object.MODEL_MATRIX, y + this.origin[1]);
    LIBS.translateZ(object.MODEL_MATRIX, z + this.origin[2]);

    if (rotationX) {
      LIBS.rotateX(object.MODEL_MATRIX, LIBS.degToRad(rotationX));
    }
    if (rotationY) {
      LIBS.rotateY(object.MODEL_MATRIX, LIBS.degToRad(rotationY));
    }
    if (rotationZ) {
      LIBS.rotateZ(object.MODEL_MATRIX, LIBS.degToRad(rotationZ));
    }

    this.parts.push(object);
    return object;
  }

  /**
   * Bola lonjong: x²/rx² + y²/ry² + z²/rz² = 1.
   * @param {number} rx Setengah lebar pada X.
   * @param {number} ry Setengah tinggi pada Y.
   * @param {number} rz Setengah tebal pada Z.
   * @param {number} x Posisi pada sumbu X.
   * @param {number} y Posisi pada sumbu Y.
   * @param {number} z Posisi pada sumbu Z.
   * @param {number[]} color Warna [R,G,B], masing-masing 0..1.
   * @param {number} rotationX Putaran X dalam derajat; default 0.
   * @param {number} rotationY Putaran Y dalam derajat; default 0.
   * @param {number} rotationZ Putaran Z dalam derajat; default 0.
   */
  ellipsoid(rx, ry, rz, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
    return this.addMesh(
      generateEllipsoid(rx, ry, rz, 48, 32, color),
      x, y, z, rotationX, rotationY, rotationZ
    );
  }

  /**
   * Tabung dengan sumbu awal Y dan pusat di tengah tinggi.
   * @param {number} radius Radius lingkaran penampang XZ.
   * @param {number} height Panjang total pada sumbu Y sebelum diputar.
   * @param {number} x Posisi pada sumbu X.
   * @param {number} y Posisi pada sumbu Y.
   * @param {number} z Posisi pada sumbu Z.
   * @param {number[]} color Warna [R,G,B], masing-masing 0..1.
   * @param {number} rotationX Putaran X dalam derajat; default 0.
   * @param {number} rotationY Putaran Y dalam derajat; default 0.
   * @param {number} rotationZ Putaran Z dalam derajat; default 0.
   */
  cylinder(radius, height, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
    return this.addMesh(
      generateCylinder(radius, height, 24, color),
      x, y, z, rotationX, rotationY, rotationZ
    );
  }

  /**
   * Kerucut: pangkal di Y=0, puncak di Y=height.
   * @param {number} radius Radius lingkaran pangkal.
   * @param {number} height Jarak pangkal ke puncak; bukan setengah tinggi.
   * @param {number} x Posisi pada sumbu X.
   * @param {number} y Posisi pada sumbu Y.
   * @param {number} z Posisi pada sumbu Z.
   * @param {number[]} color Warna [R,G,B], masing-masing 0..1.
   * @param {number} rotationX Putaran X dalam derajat; default 0.
   * @param {number} rotationY Putaran Y dalam derajat; default 0.
   * @param {number} rotationZ Putaran Z dalam derajat; default 0.
   */
  cone(radius, height, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
    return this.addMesh(
      generateCone(radius, height, 24, color),
      x, y, z, rotationX, rotationY, rotationZ
    );
  }

  /**
   * Kerucut terpotong; kedua radius sama menghasilkan cylinder.
   * @param {number} bottomRadius Radius penampang bawah.
   * @param {number} topRadius Radius penampang atas; 0 menghasilkan cone.
   * @param {number} height Tinggi total, sumbu awal Y.
   * @param {number} x Posisi pada sumbu X.
   * @param {number} y Posisi pada sumbu Y.
   * @param {number} z Posisi pada sumbu Z.
   * @param {number[]} color Warna [R,G,B], masing-masing 0..1.
   * @param {number} rotationX Putaran X dalam derajat; default 0.
   * @param {number} rotationY Putaran Y dalam derajat; default 0.
   * @param {number} rotationZ Putaran Z dalam derajat; default 0.
   */
  frustum(bottomRadius, topRadius, height, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ =
    0) {
    return this.addMesh(
      generateTruncatedCone(bottomRadius, topRadius, height, 28, color),
      x, y, z, rotationX, rotationY, rotationZ
    );
  }

  /**
   * Elliptic paraboloid: x²/rx² + z²/rz² = 1-y/height.
   * @param {number} rx Radius pangkal pada X.
   * @param {number} rz Radius pangkal pada Z.
   * @param {number} height Tinggi dari pangkal Y=0 hingga puncak.
   * @param {number} x Posisi pada sumbu X.
   * @param {number} y Posisi pada sumbu Y.
   * @param {number} z Posisi pada sumbu Z.
   * @param {number[]} color Warna [R,G,B], masing-masing 0..1.
   * @param {number} rotationX Putaran X dalam derajat; default 0.
   * @param {number} rotationY Putaran Y dalam derajat; default 0.
   * @param {number} rotationZ Putaran Z dalam derajat; default 0.
   */
  paraboloid(rx, rz, height, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
    return this.addMesh(
      generateEllipticParaboloid(rx, rz, height, 48, 24, color),
      x, y, z, rotationX, rotationY, rotationZ
    );
  }

  /**
   * Potongan elliptic paraboloid; kedua bidang potong ditutup generator.
   * @param {number} rx Radius X paraboloid penuh.
   * @param {number} rz Radius Z paraboloid penuh.
   * @param {number} height Tinggi paraboloid penuh, bukan hanya potongan.
   * @param {number} x Posisi pada sumbu X.
   * @param {number} y Posisi pada sumbu Y.
   * @param {number} z Posisi pada sumbu Z.
   * @param {number[]} color Warna [R,G,B], masing-masing 0..1.
   * @param {number} rotationX Putaran X dalam derajat; default 0.
   * @param {number} rotationY Putaran Y dalam derajat; default 0.
   * @param {number} rotationZ Putaran Z dalam derajat; default 0.
   * @param {number} startV Awal potongan relatif terhadap tinggi, 0..1; default 0.
   * @param {number} endV Akhir potongan relatif terhadap tinggi, 0..1; default 0.68.
   */
  paraboloidSection(
    rx, rz, height,
    x, y, z,
    color,
    rotationX = 0,
    rotationY = 0,
    rotationZ = 0,
    startV = 0,
    endV = 0.68
  ) {
    return this.addMesh(
      generateEllipticParaboloidSection(
        rx, rz, height,
        48, 24,
        startV, endV,
        color
      ),
      x, y, z, rotationX, rotationY, rotationZ
    );
  }

  /**
   * Hyperboloid satu selimut: ramping di tengah, melebar di kedua ujung.
   * @param {number} rx Skala radius dasar X sebelum profil pinggang.
   * @param {number} rz Skala radius dasar Z sebelum profil pinggang.
   * @param {number} height Panjang total pada Y; profil pinggang bawaan 0.78.
   * @param {number} x Posisi pada sumbu X.
   * @param {number} y Posisi pada sumbu Y.
   * @param {number} z Posisi pada sumbu Z.
   * @param {number[]} color Warna [R,G,B], masing-masing 0..1.
   * @param {number} rotationX Putaran X dalam derajat; default 0.
   * @param {number} rotationY Putaran Y dalam derajat; default 0.
   * @param {number} rotationZ Putaran Z dalam derajat; default 0.
   */
  hyperboloid(rx, rz, height, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
    return this.addMesh(
      generateHyperboloidOneSheet(rx, rz, height, 28, 18, 0.78, color),
      x, y, z, rotationX, rotationY, rotationZ
    );
  }

  /**
   * Tabung sepanjang kurva Bezier kubik 3D; empat titik kontrol XYZ.
   * @param {number[]} P0 Pangkal kurva [x,y,z].
   * @param {number[]} P1 Kontrol arah/kelengkungan pertama.
   * @param {number[]} P2 Kontrol arah/kelengkungan kedua.
   * @param {number[]} P3 Ujung kurva [x,y,z].
   * @param {number} startRadius Ketebalan tabung di pangkal.
   * @param {number} endRadius Ketebalan di ujung; mendekati 0 berarti meruncing.
   * @param {number[]} color Warna [R,G,B], masing-masing 0..1.
   * @param {number} pathSegments Banyak ruas sepanjang kurva; default 24.
   * @param {number} radialSegments Banyak sisi penampang tabung; default 8.
   */
  bezierTube(P0, P1, P2, P3, startRadius, endRadius, color, pathSegments = 24, radialSegments = 8) {
    const shifted = [P0, P1, P2, P3].map((p) => [
      p[0] + this.origin[0],
      p[1] + this.origin[1],
      p[2] + this.origin[2]
    ]);

    const mesh = generateBezierTail(
      shifted[0], shifted[1], shifted[2], shifted[3],
      startRadius, endRadius,
      pathSegments, radialSegments,
      color
    );

    const object = new MyObject(
      this.GL,
      mesh.vertices,
      mesh.faces,
      this.shaderProgram
    );
    this.parts.push(object);
    return object;
  }

  /**
   * Cincin atau donat; bentuk ini bukan quadric.
   * @param {number} majorRadius Jarak pusat cincin ke pusat tabung.
   * @param {number} minorRadius Ketebalan tabung cincin, bukan diameter.
   * @param {number} x Posisi pada sumbu X.
   * @param {number} y Posisi pada sumbu Y.
   * @param {number} z Posisi pada sumbu Z.
   * @param {number[]} color Warna [R,G,B], masing-masing 0..1.
   * @param {number} rotationX Putaran X dalam derajat; default 0.
   * @param {number} rotationY Putaran Y dalam derajat; default 0.
   * @param {number} rotationZ Putaran Z dalam derajat; default 0.
   */
  torus(majorRadius, minorRadius, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
    return this.addMesh(
      generateTorus(majorRadius, minorRadius, 20, 8, color),
      x, y, z, rotationX, rotationY, rotationZ
    );
  }

  /**
   * Profil poligon 2D yang diberi ketebalan.
   * @param {number[][]} points2D Urutan titik profil [x,y].
   * @param {number} depth Ketebalan ekstrusi sepanjang Z.
   * @param {number} x Posisi pada sumbu X.
   * @param {number} y Posisi pada sumbu Y.
   * @param {number} z Posisi pada sumbu Z.
   * @param {number[]} color Warna [R,G,B], masing-masing 0..1.
   * @param {number} rotationX Putaran X dalam derajat; default 0.
   * @param {number} rotationY Putaran Y dalam derajat; default 0.
   * @param {number} rotationZ Putaran Z dalam derajat; default 0.
   */
  extrudedPolygon(points2D, depth, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
    return this.addMesh(
      generateExtrudedPolygon(points2D, depth, color),
      x, y, z, rotationX, rotationY, rotationZ
    );
  }

  // Frustum dengan sumbu dari titik a ke b; rotasi rigid mempertahankan quadric.
  /**
   * Frustum di antara dua titik. Digunakan untuk lengan, duri, dan sambungan.
   * @param {number[]} a Koordinat pangkal XYZ.
   * @param {number[]} b Koordinat ujung XYZ; jangan sama dengan a.
   * @param {number} r0 Radius pada a.
   * @param {number} r1 Radius pada b; 0 memberi ujung runcing.
   * @param {number[]} color Warna RGB 0..1.
   */
  segment(a, b, r0, r1, color) {
    const d = b.map((v, i) => v - a[i]);
    const length = Math.hypot(...d);
    const y = d.map(v => v / length);
    const helper = Math.abs(y[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] -
      u[1] * v[0]
    ];
    let x = cross(y, helper);
    const n = Math.hypot(...x);
    x = x.map(v => v / n);
    const z = cross(x, y);
    const object = this.frustum(r0, r1, length, 0, 0, 0, color);
    object.MODEL_MATRIX.set([
      ...x, 0, ...y, 0, ...z, 0,
      ...a.map((v, i) => (v + b[i]) / 2 + this.origin[i]), 1
    ]);
    return object;
  }

  // Tiap segmen tetap cone frustum; kurva hanya menentukan arah sumbunya.
  /**
   * Rangkaian frustum yang mengikuti lintasan Bezier dan mengecil ke ujung.
   * @param {number[][]} points Empat titik kontrol XYZ.
   * @param {number} radius Radius pangkal tanduk.
   * @param {number[]} color Warna RGB 0..1.
   */
  curvedHorn(points, radius, color) {
    // Gabung frustum tanpa cap internal: tidak ada gelang gelap palsu pada tanduk.
    const count = 40,
      segments = 28,
      vertices = [],
      faces = [];
    for (let i = 0; i < count; i++) {
      const a = cubicBezier(...points, i / count),
        b = cubicBezier(...points, (i + 1) / count);
      const d = b.map((v, k) => v - a[k]),
        len = Math.hypot(...d),
        y = d.map(v => v / len);
      const x = normalizeVector(crossVector(y, Math.abs(y[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])),
        z = crossVector(x, y);
      const mesh = generateTruncatedCone(radius * Math.pow(1 - i / count, 0.8), radius * Math.pow(
        1 - (i + 1) / count, 0.8), len + radius * 0.045, segments, color);
      const offset = vertices.length / 6;
      for (let k = 0; k < mesh.vertices.length; k += 6) {
        const q = mesh.vertices.slice(k, k + 3);
        vertices.push(...a.map((v, j) => (v + b[j]) / 2 + x[j] * q[0] + y[j] * q[1] + z[j] * q[
          2]), ...color);
      }
      faces.push(...mesh.faces.slice(0, segments * 6).map(v => v + offset));
      if (i === 0)
        for (let k = 0; k < segments; k++) faces.push(offset + 2 * (segments + 1), offset + 2 * (
          k + 1), offset + 2 * k);
    }
    return this.addMesh({
      vertices,
      faces
    }, 0, 0, 0);
  }

  // Bilah giok C-shaped berketebalan tetap, cap dan dinding punya vertex terpisah.
  /**
   * Bilah bulan sabit: mesh profil berketebalan tetap; bukan quadric.
   * @param {number} x Posisi pusat pada X.
   * @param {number} y Posisi pusat pada Y.
   * @param {number} z Posisi pusat pada Z.
   * @param {number[]} color Warna RGB 0..1.
   * @param {number} rotationY Putaran Y dalam derajat; default 90.
   */
  jadeBlade(x, y, z, color, rotationY = 90) {
    const n = 64,
      vertices = [],
      faces = [],
      d = 0.055;
    const radii = (i) => {
      const t = i / n;
      return [0.25 + 0.005 * Math.sin(t * 9), 0.25 + 0.29 * Math.pow(Math.sin(Math.PI * t), 0.48) +
        0.06 * Math.pow(Math.max(0, Math.cos(t * 8 * Math.PI)), 14)
      ];
    };
    for (const zz of [-d, d])
      for (let i = 0; i <= n; i++) {
        const a = (-125 + 310 * i / n) * Math.PI / 180;
        for (const r of radii(i)) vertices.push(r * Math.cos(a), r * Math.sin(a), zz, ...color);
      }
    const layer = 2 * (n + 1);
    for (let i = 0; i < n; i++) {
      const a = i * 2,
        b = a + 2;
      faces.push(a, b, a + 1, a + 1, b, b + 1, layer + a, layer + a + 1, layer + b, layer + a + 1,
        layer + b + 1, layer + b);
    }
    for (const edge of [0, 1]) {
      const off = vertices.length / 6;
      for (let i = 0; i <= n; i++) {
        const a = (-125 + 310 * i / n) * Math.PI / 180,
          r = radii(i)[edge];
        for (const zz of [-d, d]) vertices.push(r * Math.cos(a), r * Math.sin(a), zz, ...color
          .map(c => c * 0.80));
      }
      for (let i = 0; i < n; i++) {
        const a = off + i * 2;
        faces.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    // Ujung lancip memiliki ketebalan nol pada profil; cap kecil menutup ekstrusi.
    for (const i of [0, n]) {
      const a = i * 2;
      faces.push(a, a + 1, a + layer, a + 1, a + layer + 1, a + layer);
    }
    return this.addMesh({
      vertices,
      faces
    }, x, y, z, 0, rotationY, 0);
  }

  // Permukaan parametrik untuk kain/detail. Tidak dihitung sebagai quadric.
  /**
   * Mesh dari persamaan parametrik; tidak otomatis merupakan quadric.
   * @param {Function} fn Fungsi (u,v) menjadi [x,y,z], dengan u/v dalam 0..1.
   * @param {number} nu Banyak pembagian permukaan pada arah u.
   * @param {number} nv Banyak pembagian permukaan pada arah v.
   * @param {number[]} color Warna RGB dasar.
   * @param {Function|null} shade Opsional: fungsi (u,v,p) menjadi warna RGB setiap vertex.
   */
  surface(fn, nu, nv, color, shade = null) {
    const vertices = [],
      faces = [];
    for (let i = 0; i <= nu; i++)
      for (let j = 0; j <= nv; j++) {
        const u = i / nu,
          v = j / nv,
          p = fn(u, v);
        const c = shade ? shade(u, v, p) : color;
        vertices.push(...p, ...c);
      }
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const a = i * (nv + 1) + j,
          b = a + nv + 1;
        faces.push(a, b, a + 1, a + 1, b, b + 1);
      }
    return this.addMesh({
      vertices,
      faces
    }, 0, 0, 0);
  }

  // Garis detail dengan kurva halus; dipakai untuk tepian kain dan kelopak.
  /**
   * Versi ringkas tabung Bezier; otomatis memakai 32 ruas dan 10 sisi.
   * @param {number[][]} points Empat titik kontrol [P0,P1,P2,P3], masing-masing XYZ.
   * @param {number} radius Radius pangkal.
   * @param {number[]} color Warna RGB 0..1.
   * @param {number} endRadius Radius ujung, default sama dengan radius pangkal.
   */
  curve(points, radius, color, endRadius = radius) {
    return this.bezierTube(...points, radius, endRadius, color, 32, 10);
  }

  // Pasang generator bersumbu Y pada dua titik tanpa mendeformasi persamaannya.
  /**
   * Mengarahkan mesh bersumbu Y agar membentang dari a ke b.
   * @param {Object} mesh Geometri dengan tinggi yang sudah sesuai jarak a-b.
   * @param {number[]} a Pangkal XYZ.
   * @param {number[]} b Ujung XYZ; jangan sama dengan a.
   */
  along(mesh, a, b) {
    const d = b.map((v, i) => v - a[i]),
      len = Math.hypot(...d),
      y = d.map(v => v / len);
    const helper = Math.abs(y[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const x = normalizeVector(crossVector(y, helper)),
      z = crossVector(x, y);
    const obj = this.addMesh(mesh, 0, 0, 0);
    obj.MODEL_MATRIX.set([...x, 0, ...y, 0, ...z, 0, ...a.map((v, i) => (v + b[i]) / 2 + this
      .origin[i]), 1]);
    return obj;
  }

  // Variasi warna organik prosedural; geometri quadric tidak diubah.
  /**
   * Mengganti warna vertex yang cocok dengan palet, tanpa mengubah bentuk.
   * @param {number[][]} palette Daftar warna RGB yang akan diberi variasi.
   * @param {Function} variation Fungsi (position,color) mengembalikan warna baru.
   */
  tintPalette(palette, variation) {
    for (const part of this.parts) {
      let changed = false;
      for (let i = 0; i < part.vertices.length; i += 6) {
        const color = part.vertices.slice(i + 3, i + 6);
        if (!palette.some(c => c.every((v, k) => Math.abs(v - color[k]) < 1e-6))) continue;
        const p = part.vertices.slice(i, i + 3),
          m = part.MODEL_MATRIX;
        const world = [0, 1, 2].map(k => m[k] * p[0] + m[4 + k] * p[1] + m[8 + k] * p[2] + m[12 +
          k] - this.origin[k]);
        const next = variation(world, color);
        for (let k = 0; k < 3; k++) part.vertices[i + 3 + k] = Math.max(0, Math.min(1, next[k]));
        changed = true;
      }
      if (changed && typeof part.setup === 'function') part.setup();
    }
  }

  /**
   * Menggambar seluruh bagian yang sudah dibuat.
   * @param {Float32Array} VIEW_MATRIX Matriks pandangan kamera.
   * @param {Float32Array} PROJECTION_MATRIX Matriks proyeksi perspektif.
   */
  draw(VIEW_MATRIX, PROJECTION_MATRIX) {
    for (const object of this.parts) {
      object.render(VIEW_MATRIX, PROJECTION_MATRIX);
    }
  }
}
