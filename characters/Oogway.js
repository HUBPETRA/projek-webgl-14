/**
 * OOGWAY: ellipsoid untuk badan, paraboloid untuk tempurung, hyperboloid untuk leher.
 * Kurva 3D membentuk pola tempurung, wajah, dan lengkungan tongkat.
 * Urutan mesh dipakai adapter animation/CharacterRigs.js; pertahankan urutan saat merapikan kode.
 */
class Oogway {
  constructor(GL, shaderProgram, originX = 0) {
    this.builder = new CharacterBuilder(GL, shaderProgram, originX);
    this.createModel();
  }
  createModel() {
    const B = this.builder,
      skin = [0.53, 0.56, 0.28],
      skinLight = [0.65, 0.66, 0.39],
      shell = [0.43, 0.44, 0.19],
      rim = [0.44, 0.44, 0.26],
      belly = [0.72, 0.71, 0.60],
      seam = [0.48, 0.49, 0.38],
      olive = [0.40, 0.40, 0.095],
      dark = [0.105, 0.12, 0.075],
      white = [0.92, 0.92, 0.81];
    // Badan oval dan tempurung berbentuk elliptic paraboloid tinggi.
    B.ellipsoid(
      /* radiusX */ 0.89,
      /* radiusY */ 1.11,
      /* radiusZ */ 0.53,
      /* posX */ 0,
      /* posY */ -0.02,
      /* posZ */ 0.04,
      /* colorRGB */ skin
    );
    B.paraboloid(
      /* radiusX */ 1.03,
      /* radiusZ */ 1.52,
      /* height */ 0.68,
      /* posX */ 0,
      /* posY */ 0.18,
      /* posZ */ -0.28,
      /* colorRGB */ shell,
      /* rotateXdeg */ -90
    );
    const shellPoint = (r, a) => [1.03 * r * Math.cos(a), 0.18 + 1.52 * r * Math.sin(a), -0.28 -
      0.68 * (1 - r * r)
    ];
    // Bingkai tebal mengelilingi tempurung; segmen Bezier mengikuti elips.
    for (let k = 0; k < 16; k++) {
      const a = k * 2 * Math.PI / 16,
        b = (k + 1) * 2 * Math.PI / 16;
      B.curve(
        /* controlPointsXYZ */ [shellPoint(1, a), shellPoint(1, a + (b - a) / 3), shellPoint(1, a + 2 * (b - a) / 3),
          shellPoint(1, b)
        ],
        /* startRadius */ 0.060,
        /* colorRGB */ rim
      );
    }
    // Pola scute di belakang mengikuti permukaan, bukan garis datar yang tertutup badan.
    for (const radius of [0.45, 0.80])
      for (let k = 0; k < 6; k++) {
        const a = k * Math.PI / 3,
          b = (k + 1) * Math.PI / 3;
        B.curve(
          /* controlPointsXYZ */ [shellPoint(radius, a), shellPoint(radius, a + (b - a) / 3), shellPoint(radius, a +
            2 * (b - a) / 3), shellPoint(radius, b)].map(p => [p[0], p[1], p[2] - 0.013]),
          /* startRadius */ 0.025,
          /* colorRGB */ rim
        );
      }
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3;
      B.curve(
        /* controlPointsXYZ */ [shellPoint(0.45, a), shellPoint(0.61, a), shellPoint(0.79, a), shellPoint(1, a)].map(
          p => [p[0], p[1], p[2] - 0.015]),
        /* startRadius */ 0.022,
        /* colorRGB */ rim
      );
    }
    // Pelat plastron menyatu mengikuti satu ellipsoid, celah tipis antarbaris.
    const plate = (u, v) => {
      const th = -Math.PI * 0.46 + u * Math.PI * 0.92,
        lat = -1.1 + v * 2.22;
      return [0.86 * Math.sin(th) * Math.cos(lat), -0.04 + 1.10 * Math.sin(lat), 0.10 + 0.55 * Math
        .cos(th) * Math.cos(lat)
      ];
    };
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 2; col++) {
        B.surface(
          /* positionFunctionUV */ (u, v) => plate(col * 0.5 + 0.005 + u * 0.49, row * 0.2 + 0.006 + v * 0.189),
          /* segmentsU */ 24,
          /* segmentsV */ 10,
          /* colorRGB */ belly,
          /* colorFunctionUV */ (u, v) => belly.map(c => c * (0.94 + 0.06 * Math.sin(Math.PI * v)))
        );
      }
    // Pangkal leher ellipsoid, leher miring memakai hyperboloid.
    B.ellipsoid(
      /* radiusX */ 0.60,
      /* radiusY */ 0.49,
      /* radiusZ */ 0.42,
      /* posX */ 0,
      /* posY */ 0.78,
      /* posZ */ 0.06,
      /* colorRGB */ skin
    );
    const neckA = [0, 0.96, 0.18],
      neckB = [0, 2.18, 0.81];
    B.along(
      /* mesh */ generateHyperboloidOneSheet(0.245, 0.235, Math.hypot(1.22, 0.63), 44, 28, 0.80, skin),
      /* startXYZ */ neckA,
      /* endXYZ */ neckB
    );
    B.ellipsoid(
      /* radiusX */ 0.29,
      /* radiusY */ 0.29,
      /* radiusZ */ 0.28,
      /* posX */ 0,
      /* posY */ 2.18,
      /* posZ */ 0.81,
      /* colorRGB */ skin
    );
    B.ellipsoid(
      /* radiusX */ 0.36,
      /* radiusY */ 0.34,
      /* radiusZ */ 0.35,
      /* posX */ 0,
      /* posY */ 2.40,
      /* posZ */ 0.94,
      /* colorRGB */ skinLight
    );
    B.paraboloidSection(
      /* radiusX */ 0.34,
      /* radiusZ */ 0.15,
      /* height */ 0.26,
      /* posX */ 0,
      /* posY */ 2.26,
      /* posZ */ 1.15,
      /* colorRGB */ belly,
      /* rotateXdeg */ 90,
      /* rotateYdeg */ 0,
      /* rotateZdeg */ 0,
      /* startV */ 0,
      /* endV */ 0.83
    );
    B.ellipsoid(
      /* radiusX */ 0.275,
      /* radiusY */ 0.14,
      /* radiusZ */ 0.20,
      /* posX */ 0,
      /* posY */ 2.15,
      /* posZ */ 1.23,
      /* colorRGB */ belly
    );
    // Mata setengah terpejam dengan kelopak atas dan lipatan di dahi.
    for (const s of [-1, 1]) {
      B.ellipsoid(
        /* radiusX */ 0.165,
        /* radiusY */ 0.125,
        /* radiusZ */ 0.12,
        /* posX */ s * 0.18,
        /* posY */ 2.51,
        /* posZ */ 1.19,
        /* colorRGB */ white
      );
      B.ellipsoid(
        /* radiusX */ 0.073,
        /* radiusY */ 0.058,
        /* radiusZ */ 0.038,
        /* posX */ s * 0.18,
        /* posY */ 2.51,
        /* posZ */ 1.30,
        /* colorRGB */ [0.36, 0.37, 0.20]
      );
      B.ellipsoid(
        /* radiusX */ 0.042,
        /* radiusY */ 0.044,
        /* radiusZ */ 0.023,
        /* posX */ s * 0.18,
        /* posY */ 2.51,
        /* posZ */ 1.333,
        /* colorRGB */ dark
      );
      B.ellipsoid(
        /* radiusX */ 0.016,
        /* radiusY */ 0.019,
        /* radiusZ */ 0.012,
        /* posX */ s * 0.163,
        /* posY */ 2.54,
        /* posZ */ 1.350,
        /* colorRGB */ white
      );
      // Half-ellipsoid lid follows the same eyeball, covering upper third.
      B.surface(
        /* positionFunctionUV */ (u, v) => {
          const a = u * Math.PI * 2,
            t = 0.13 + v * (Math.PI / 2 - 0.13);
          return [s * 0.18 + 0.171 * Math.cos(t) * Math.cos(a), 2.51 + 0.135 * Math.sin(t), 1.19 +
            0.127 * Math.cos(t) * Math.sin(a)
          ];
        },
        /* segmentsU */ 36,
        /* segmentsV */ 10,
        /* colorRGB */ skin
      );
      B.curve(
        /* controlPointsXYZ */ [
          [s * 0.05, 2.62, 1.24],
          [s * 0.12, 2.72, 1.25],
          [s * 0.27, 2.70, 1.22],
          [s * 0.33, 2.57, 1.16]
        ],
        /* startRadius */ 0.040,
        /* colorRGB */ skin,
        /* endRadius */ 0.025
      );
      B.curve(
        /* controlPointsXYZ */ [
          [s * 0.07, 2.66, 1.18],
          [s * 0.10, 2.77, 1.09],
          [s * 0.22, 2.77, 1.03],
          [s * 0.30, 2.66, 0.97]
        ],
        /* startRadius */ 0.018,
        /* colorRGB */ rim,
        /* endRadius */ 0.009
      );
      B.ellipsoid(
        /* radiusX */ 0.033,
        /* radiusY */ 0.020,
        /* radiusZ */ 0.010,
        /* posX */ s * 0.118,
        /* posY */ 2.35,
        /* posZ */ 1.395,
        /* colorRGB */ dark
      );
      for (let k = 0; k < 3; k++) B.curve(
        /* controlPointsXYZ */ [
          [s * 0.25, 2.43 - k * 0.043, 1.23],
          [s * 0.32, 2.41 - k * 0.041, 1.19],
          [s * 0.36, 2.39 - k * 0.04, 1.11],
          [s * 0.35, 2.38 - k * 0.04, 1.04]
        ],
        /* startRadius */ 0.010,
        /* colorRGB */ rim,
        /* endRadius */ 0.004
      );
    }
    B.curve(
      /* controlPointsXYZ */ [
        [-0.29, 2.245, 1.30],
        [-0.19, 2.16, 1.423],
        [0.19, 2.16, 1.423],
        [0.29, 2.245, 1.30]
      ],
      /* startRadius */ 0.018,
      /* colorRGB */ [0.27, 0.29, 0.16]
    );
    // Lipatan leher memanjang tipis; warna saja tidak mengganti bentuk hyperboloid.
    for (const s of [-1, 1]) B.curve(
      /* controlPointsXYZ */ [
        [s * 0.09, 2.16, 1.02],
        [s * 0.14, 1.79, 0.86],
        [s * 0.10, 1.38, 0.63],
        [s * 0.25, 1.08, 0.51]
      ],
      /* startRadius */ 0.012,
      /* colorRGB */ rim,
      /* endRadius */ 0.007
    );
    for (const s of [-1, 1]) {
      B.cylinder(
        /* radius */ 0.16,
        /* height */ 0.87,
        /* posX */ s * 1.01,
        /* posY */ 0.53,
        /* posZ */ 0.03,
        /* colorRGB */ skin,
        /* rotateXdeg */ 0,
        /* rotateYdeg */ 0,
        /* rotateZdeg */ 90
      );
      B.ellipsoid(
        /* radiusX */ 0.43,
        /* radiusY */ 0.235,
        /* radiusZ */ 0.255,
        /* posX */ s * 1.05,
        /* posY */ 0.55,
        /* posZ */ 0.06,
        /* colorRGB */ skinLight
      );
      B.ellipsoid(
        /* radiusX */ 0.32,
        /* radiusY */ 0.15,
        /* radiusZ */ 0.24,
        /* posX */ s * 1.57,
        /* posY */ 0.52,
        /* posZ */ 0.08,
        /* colorRGB */ skin
      );
      for (let i = 0; i < 3; i++) {
        const z = -0.10 + i * 0.16;
        B.ellipsoid(
          /* radiusX */ 0.22,
          /* radiusY */ 0.075,
          /* radiusZ */ 0.068,
          /* posX */ s * 1.76,
          /* posY */ 0.51,
          /* posZ */ z,
          /* colorRGB */ skinLight
        );
        B.cone(
          /* radius */ 0.057,
          /* height */ 0.26,
          /* posX */ s * 1.98,
          /* posY */ 0.49,
          /* posZ */ z,
          /* colorRGB */ [0.26, 0.28, 0.20],
          /* rotateXdeg */ 0,
          /* rotateYdeg */ 0,
          /* rotateZdeg */ -s * 96
        );
      }
      B.cylinder(
        /* radius */ 0.235,
        /* height */ 0.68,
        /* posX */ s * 0.45,
        /* posY */ -1.19,
        /* posZ */ -0.02,
        /* colorRGB */ skin
      );
      B.paraboloidSection(
        /* radiusX */ 0.30,
        /* radiusZ */ 0.19,
        /* height */ 0.43,
        /* posX */ s * 0.45,
        /* posY */ -1.60,
        /* posZ */ 0.04,
        /* colorRGB */ skinLight,
        /* rotateXdeg */ 90,
        /* rotateYdeg */ 0,
        /* rotateZdeg */ 0,
        /* startV */ 0,
        /* endV */ 0.85
      );
      for (let i = 0; i < 4; i++) B.ellipsoid(
        /* radiusX */ 0.055,
        /* radiusY */ 0.047,
        /* radiusZ */ 0.10,
        /* posX */ s * 0.45 + (i - 1.5) * 0.13,
        /* posY */ -1.70,
        /* posZ */ 0.32,
        /* colorRGB */ [0.46, 0.47, 0.37]
      );
    }
    // Selendang zaitun dan manik hijau kebiruan sesuai referensi.
    B.surface(
      /* positionFunctionUV */ (u, v) => {
        const a = -Math.PI * 0.48 + u * Math.PI * 1.7;
        return [(0.90 + 0.025 * v) * Math.sin(a), 0.66 + 0.20 * Math.sin(a) - v * 0.19, (0.53 + 0.025 *
          v) * Math.cos(a) + 0.02];
      },
      /* segmentsU */ 64,
      /* segmentsV */ 8,
      /* colorRGB */ olive
    );
    B.curve(
      /* controlPointsXYZ */ [
        [-0.79, 0.59, 0.34],
        [-0.42, 0.29, 0.66],
        [0.37, 0.53, 0.69],
        [0.81, 0.86, 0.22]
      ],
      /* startRadius */ 0.075,
      /* colorRGB */ olive,
      /* endRadius */ 0.068
    );
    const beads = [
      [-0.70, 0.92, 0.35],
      [-0.60, 0.59, 0.65],
      [-0.41, 0.61, 0.68],
      [-0.27, 0.57, 0.67]
    ];
    for (let i = 0; i < 14; i++) {
      const p = cubicBezier(...beads, i / 13);
      B.ellipsoid(
        /* radiusX */ 0.038,
        /* radiusY */ 0.045,
        /* radiusZ */ 0.035,
        /* positionXYZ */ ...p,
        /* colorRGB */ [0.13, 0.43, 0.36]
      );
    }
    // Staff remains cylinder + Bezier 3D + cone tips as listed in the DOCX.
    B.cylinder(
      /* radius */ 0.042,
      /* height */ 3.47,
      /* posX */ -2.20,
      /* posY */ 0.04,
      /* posZ */ 0.04,
      /* colorRGB */ [0.32, 0.35, 0.18]
    );
    B.curve(
      /* controlPointsXYZ */ [
        [-2.20, 1.75, 0.04],
        [-2.13, 2.02, 0.04],
        [-2.58, 2.04, 0.04],
        [-2.46, 2.40, 0.04]
      ],
      /* startRadius */ 0.053,
      /* colorRGB */ olive,
      /* endRadius */ 0.036
    );
    B.curve(
      /* controlPointsXYZ */ [
        [-2.46, 2.40, 0.04],
        [-2.32, 2.73, 0.04],
        [-1.90, 2.65, 0.04],
        [-1.92, 2.38, 0.04]
      ],
      /* startRadius */ 0.038,
      /* colorRGB */ olive,
      /* endRadius */ 0.003
    );
    B.curve(
      /* controlPointsXYZ */ [
        [-2.20, 1.75, 0.04],
        [-1.90, 1.78, 0.04],
        [-1.96, 2.15, 0.04],
        [-2.19, 2.09, 0.04]
      ],
      /* startRadius */ 0.066,
      /* colorRGB */ olive,
      /* endRadius */ 0.035
    );
    B.curve(
      /* controlPointsXYZ */ [
        [-2.19, 2.09, 0.04],
        [-2.38, 2.01, 0.04],
        [-2.17, 1.83, 0.04],
        [-2.11, 1.97, 0.04]
      ],
      /* startRadius */ 0.036,
      /* colorRGB */ olive,
      /* endRadius */ 0.004
    );
    B.cone(
      /* radius */ 0.045,
      /* height */ 0.11,
      /* posX */ -1.92,
      /* posY */ 2.38,
      /* posZ */ 0.04,
      /* colorRGB */ olive,
      /* rotateXdeg */ 0,
      /* rotateYdeg */ 0,
      /* rotateZdeg */ 160
    );
    B.cone(
      /* radius */ 0.033,
      /* height */ 0.12,
      /* posX */ -2.11,
      /* posY */ 1.97,
      /* posZ */ 0.04,
      /* colorRGB */ olive,
      /* rotateXdeg */ 0,
      /* rotateYdeg */ 0,
      /* rotateZdeg */ 30
    );
    // Ekor kura-kura memanjang di belakang, di luar daftar utama DOCX.
    B.curve(
      /* controlPointsXYZ */ [
        [0, -0.83, -0.53],
        [0, -1.55, -0.76],
        [0, -2.14, -0.82],
        [0, -2.48, -0.89]
      ],
      /* startRadius */ 0.17,
      /* colorRGB */ skin,
      /* endRadius */ 0.002
    );
    B.tintPalette([skin, skinLight, shell], (p, c) => {
      const n = Math.sin(p[0] * 16 + 2 * Math.sin(p[2] * 11)) * Math.sin(p[1] * 13 + Math.sin(
        p[0] * 9));
      return c.map(v => v * (0.93 + 0.16 * n));
    });
  }
  update() {}
  draw(v, p) {
    this.builder.draw(v, p);
  }
}
