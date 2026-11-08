// Bukti per karakter, bukan agregat satu adegan. Dipakai UI dan panduan presentasi.
const CharacterRubric = {
  kai: {
    name: 'Kai',
    curve: 'Kurva Bézier 3D pada tanduk, alis, dan surai',
    object1: 'Ellipsoid: badan dan otot',
    object2: 'Cylinder: lengan dan betis',
    object3: 'Hyperboloid satu lembar: pergelangan tangan',
    aesthetic: 'Environment restoran dan interpolasi smoothstep tersedia; kualitas estetika dinilai secara visual.',
    source: 'characters/Kai.js',
    hierarchy: 'root → pelvis → torso → shoulder → elbow → wrist → senjata',
    examples: [
      ['Translate', 0.5, 'Berjalan memasuki restoran'],
      ['Rotate', 6, 'Kepala dan bahu berputar saat mengancam'],
      ['Scaling', 6.1, 'Tubuh utama dan dada atas mengembang bersama saat bernapas'],
      ['Arbitrary axis', 0.7, 'Senjata berputar pada sumbu [0.32, 0.84, 0.44]'],
      ['Hierarchy', 20, 'Bilah mengikuti bahu, siku, dan tangan saat menyerang']
    ]
  },
  oogway: {
    name: 'Oogway',
    curve: 'Kurva Bézier 3D pada lipatan leher, tepian cangkang, dan tongkat asli',
    object1: 'Ellipsoid: badan dan kepala',
    object2: 'Cylinder: lengan dan batang tongkat',
    object3: 'Elliptic paraboloid: cangkang',
    aesthetic: 'Environment restoran dan interpolasi smoothstep tersedia; kualitas estetika dinilai secara visual.',
    source: 'characters/Oogway.js',
    hierarchy: 'root → body → shoulder → elbow → wrist → tongkat',
    examples: [
      ['Translate', 15, 'Melangkah maju melindungi Mr. Ping'],
      ['Rotate', 28, 'Merendah dan memutar badan/cangkang'],
      ['Scaling', 17.6, 'Badan mengembang saat menarik napas dan bersiap'],
      ['Arbitrary axis', 33, 'Tongkat berputar pada sumbu [0.35, 0.82, 0.44]'],
      ['Hierarchy', 20, 'Tongkat mengikuti tangan dan lengan ketika menangkis']
    ]
  },
  ping: {
    name: 'Mr. Ping',
    curve: 'Kurva Bézier 3D membentuk leher dan alis',
    object1: 'Ellipsoid: badan, kepala, dan mata',
    object2: 'Cylinder: kancing jubah dan sumpit pada topi asli',
    object3: 'Elliptic paraboloid: paruh dan bulu sayap; hyperboloid: betis',
    aesthetic: 'Environment restoran dan interpolasi smoothstep tersedia; kualitas estetika dinilai secara visual.',
    source: 'characters/MrPing.js',
    hierarchy: 'root → body → shoulder → elbow → wrist → bulu sayap; body → neck → head → jaw',
    examples: [
      ['Translate', 8.5, 'Berjalan dari konter untuk melerai'],
      ['Rotate', 10, 'Menggeleng dan membuka kedua sayap'],
      ['Scaling', 38.4, 'Badan mengembang sebelum mengomel'],
      ['Arbitrary axis', 12, 'Tubuh mengelak diagonal pada sumbu [0.42, 0.30, 0.86]'],
      ['Hierarchy', 39, 'Sayap dan bulu mengikuti bahu, siku, serta pergelangan']
    ]
  }
};
