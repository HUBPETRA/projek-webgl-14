# Duel di Restoran Mi — panduan presentasi

Rubrik diterapkan kepada Kai, Oogway, dan Mr. Ping secara terpisah: 10 aspek × 10 poin untuk setiap karakter. Model Mr. Ping kini memakai characters/MrPing.js dan kelas MrPing. Dua lapisan dada Kai dihapus; napas memakai ellipsoid dada utama. Angka 10 poin adalah bobot rubrik, bukan nilai yang dijamin.

## Cara menunjukkan

1. Buka index.html dan putar alur lengkap 46 detik.
2. Klik Penilaian, pilih karakter, lalu klik contoh transformasi. Kamera dan fokus individu aktif otomatis.
3. Untuk cerita bersama, tutup panel Penilaian.
4. Buka presentasi.html untuk tabel lengkap dan tautan langsung ke waktu demonstrasi.

## Kai

| Aspek | Bukti pada karakter | Waktu mulai contoh |
| --- | --- | --- |
| 3D Curve · harus di karakter | Kurva Bézier 3D pada tanduk dan surai | Model asli |
| Object 1 · bebas | Ellipsoid: badan dan otot | Model asli |
| Object 2 · bebas | Cylinder: lengan dan betis | Model asli |
| Object 3 · quadric selain ellipsoid/cylinder | Hyperboloid satu lembar: pergelangan tangan | Model asli |
| Aesthetic | Restoran sesuai latar cerita; interpolasi smoothstep, kontak lantai, gerak sendi dan normal matrix saat scaling. Kualitas aesthetic dinilai dosen secara visual. | Lihat adegan lengkap |
| Translate | Berjalan memasuki restoran | 0.5 detik |
| Rotate | Kepala dan bahu berputar saat mengancam | 6 detik |
| Scaling | Ellipsoid dada utama mengembang halus sebelum mengancam | 6.1 detik |
| Arbitrary axis | Senjata berputar pada sumbu [0.32, 0.84, 0.44] | 0.7 detik |
| Hierarchy | Bilah mengikuti bahu, siku, dan tangan saat menyerang | 20 detik |

Hierarki: root → pelvis → torso → shoulder → elbow → wrist → senjata.

Source model: characters/Kai.js. Gerak: animation/DuelAnimation.js. Rig tambahan: animation/CharacterRigs.js.

## Oogway

| Aspek | Bukti pada karakter | Waktu mulai contoh |
| --- | --- | --- |
| 3D Curve · harus di karakter | Kurva Bézier 3D pada lipatan leher, tepian cangkang, dan tongkat asli | Model asli |
| Object 1 · bebas | Ellipsoid: badan dan kepala | Model asli |
| Object 2 · bebas | Cylinder: lengan dan batang tongkat | Model asli |
| Object 3 · quadric selain ellipsoid/cylinder | Elliptic paraboloid: cangkang | Model asli |
| Aesthetic | Restoran sesuai latar cerita; interpolasi smoothstep, kontak lantai, gerak sendi dan normal matrix saat scaling. Kualitas aesthetic dinilai dosen secara visual. | Lihat adegan lengkap |
| Translate | Melangkah maju melindungi Mr. Ping | 15 detik |
| Rotate | Merendah dan memutar badan/cangkang | 28 detik |
| Scaling | Badan mengembang saat menarik napas dan bersiap | 17.6 detik |
| Arbitrary axis | Tongkat berputar pada sumbu [0.35, 0.82, 0.44] | 33 detik |
| Hierarchy | Tongkat mengikuti tangan dan lengan ketika menangkis | 20 detik |

Hierarki: root → body → shoulder → elbow → wrist → tongkat.

Source model: characters/Oogway.js. Gerak: animation/DuelAnimation.js. Rig tambahan: animation/CharacterRigs.js.

## Mr. Ping

| Aspek | Bukti pada karakter | Waktu mulai contoh |
| --- | --- | --- |
| 3D Curve · harus di karakter | Kurva Bézier 3D membentuk leher dan alis | Model asli |
| Object 1 · bebas | Ellipsoid: badan, kepala, dan mata | Model asli |
| Object 2 · bebas | Cylinder: kancing jubah dan sumpit pada topi asli | Model asli |
| Object 3 · quadric selain ellipsoid/cylinder | Elliptic paraboloid: paruh dan bulu sayap; hyperboloid: betis | Model asli |
| Aesthetic | Restoran sesuai latar cerita; interpolasi smoothstep, kontak lantai, gerak sendi dan normal matrix saat scaling. Kualitas aesthetic dinilai dosen secara visual. | Lihat adegan lengkap |
| Translate | Berjalan dari konter untuk melerai | 8.5 detik |
| Rotate | Menggeleng dan membuka kedua sayap | 10 detik |
| Scaling | Badan mengembang sebelum mengomel | 38.4 detik |
| Arbitrary axis | Tubuh mengelak diagonal pada sumbu [0.42, 0.30, 0.86] | 12 detik |
| Hierarchy | Sayap dan bulu mengikuti bahu, siku, serta pergelangan | 39 detik |

Hierarki: root → body → shoulder → elbow → wrist → bulu sayap; body → neck → head → jaw.

Source model: characters/MrPing.js. Gerak: animation/DuelAnimation.js. Rig tambahan: animation/CharacterRigs.js.

## Penjelasan teknik singkat

- Translate: perpindahan root dan anggota tubuh pada lintasan cerita.
- Rotate: rotasi Euler pada pivot kepala, badan, bahu, siku, pinggul, lutut dan pergelangan.
- Scaling: perubahan skala lokal saat menarik napas, menjaga karakter dapat dikenali.
- Rotate arbitrary axis: Mat4.axisRotation memakai rumus Rodrigues; sumbu dinormalisasi, sudut radian. Kai memakai sumbu [0.32, 0.84, 0.44]; Oogway [0.35, 0.82, 0.44]; Mr. Ping [0.42, 0.30, 0.86].
- Hierarchical transformation: matriks dunia anak = parentWorld × local. Gerakan badan diwarisi leher/kepala; gerak bahu diwarisi siku/tangan, tongkat atau senjata.
- 3D Curve: cubicBezier mengevaluasi empat titik kontrol xyz; generateBezierTail membentuk tabung sepanjang kurva. Bukti berada pada model karakter, bukan hanya dekorasi lingkungan.
- Quadric: hyperboloid satu lembar dan elliptic paraboloid dibuat dengan persamaan parametrik pada objects/HyperboloidOneSheet.js, objects/EllipticParaboloid.js dan objects/EllipticParaboloidSection.js.

## Alur dan batas teknis

0–6 Kai masuk mencari Po; 6–9 mengenali Oogway; 9–15 Mr. Ping melerai dan mengelak; 15–20 Oogway maju; 20–24 tangkisan; 24–28 langkah menghindar; 28–33 putaran cangkang; 33–38 putaran tongkat dan sapuan; 38–46 Kai jatuh terduduk dan Mr. Ping mengusir mereka.

Adegan merupakan skenario buatan di dunia Kung Fu Panda, bukan cuplikan film. Gerak, rantai, dan kontak pertarungan dikoreografikan dari waktu absolut; tidak memakai simulasi fisika atau collision detection umum. Dialog berupa subtitle. Properti versi komedi lama tidak dimuat: mangkuk terbang, mi, spatula, tagihan, dan sayuran. Furnitur merupakan bagian lingkungan statis; tongkat serta senjata berasal dari karakter asli.

## Kamera sinematik

Kamera mengikuti alur: Kai (0–8,3 dtk), transisi ke Mr. Ping (8,3–9,3), Mr. Ping (9,3–14,5), transisi ke Oogway (14,5–15,7), Oogway (15,7–18,5), zoom keluar (18,5–20), tiga karakter selama duel (20–38,5), transisi dan fokus Mr. Ping (38,5–41,6), kemudian reaksi Kai (41,6–46). Framing memperhitungkan seluruh pose dan rasio layar. Kamera manual dinonaktifkan; Play/Pause dan Penilaian tetap tersedia.

## Mode rekaman

- F atau tombol Fullscreen: masuk/keluar fullscreen. Esc keluar fullscreen native browser.
- H atau Sembunyikan UI: sembunyikan toolbar, panel penilaian, subtitle, dan kursor canvas. Tekan H lagi untuk mengembalikan.
- Centang "Tetap tampilkan subtitle saat UI disembunyikan" sebelum H jika dialog ingin masuk video.
- R atau Ulangi: putar ulang cerita lengkap dari nol, termasuk saat UI tersembunyi.
- Space: play/pause. Kamera sinematik tetap aktif.
- Buka index.html?clean=1 untuk tampilan bersih sejak awal; tambahkan &subtitles=1 untuk mempertahankan subtitle. Fullscreen tetap perlu F karena memerlukan aksi pengguna.

Aplikasi menyediakan tampilan bersih untuk perekam layar, bukan perekam atau pengunggah YouTube.
