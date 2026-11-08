# Hasil pemeriksaan rubrik — revisi 8 November 2026

Rubrik acuan adalah gambar yang dikirim pengguna: sepuluh aspek, masing-masing berbobot 10. Tabel ini memetakan bukti implementasi; tidak mengubah bobot menjadi prediksi nilai dosen.

**Kesimpulan:** sembilan aspek teknis tersedia pada masing-masing karakter. Untuk aesthetic, environment restoran dan mekanisme transformasi halus tersedia serta beberapa pose telah ditinjau lewat render. Kualitas estetika dan skor akhir tetap memerlukan penilaian visual dosen, termasuk pemutaran di perangkat yang dipakai saat pengumpulan.

## Pemetaan per karakter

| Aspek | Kai | Oogway | Mr. Ping | Status |
| --- | --- | --- | --- | --- |
| 3D Curve pada karakter | Bezier pada tanduk, rambut, dan alis | Bezier pada lipatan leher serta pola tempurung; juga pada tongkat | Bezier pada leher dan alis | Terpenuhi teknis |
| Object 1, bebas | Ellipsoid badan/kepala | Ellipsoid badan/kepala | Ellipsoid jubah/kepala | Terpenuhi teknis |
| Object 2, bebas | Cylinder lengan/betis | Cylinder lengan/tongkat | Cylinder sumpit/kancing | Terpenuhi teknis |
| Object 3, quadric selain ellipsoid/cylinder | Hyperboloid satu selimut pada pergelangan; tambahan paraboloid pada moncong/hoof | Elliptic paraboloid tempurung; tambahan hyperboloid leher | Elliptic paraboloid paruh/bulu; tambahan hyperboloid betis | Terpenuhi teknis |
| Aesthetic: environment + smooth saat transformasi | Restoran, normal matrix saat scaling, interpolasi pose dan kamera | Environment sama; transisi guard/parry/putaran | Environment sama; leher/sayap ikut rig dan kamera mengikuti cerita | Dukungan tersedia; penilaian visual diperlukan |
| Translate | Root bergerak memasuki restoran dan melakukan lunge | Root maju, menghindar, dan melakukan sapuan | Root berjalan dari/ke konter | Terpenuhi teknis |
| Rotate | Kepala, badan, bahu, siku, pinggul, lutut | Badan, kepala, lengan, pergelangan | Kepala, paruh bawah, leher, sayap, kaki | Terpenuhi teknis |
| Scaling | Tubuh utama dan torso atas asli mengembang bersama melalui Kai.breathe | Cabang breath mengubah volume badan | Cabang breath mengubah volume jubah/badan | Terpenuhi teknis |
| Rotate Arbitrary Axis | Bilah/orbit pada sumbu [0.32,0.84,0.44] relatif tangan | Tongkat pada sumbu [0.35,0.82,0.44] | Badan mengelak pada sumbu [0.42,0.30,0.86] | Terpenuhi teknis |
| Hierarchical Transformation | Root → pelvis → torso → shoulder → elbow → wrist; senjata memakai world wrist | Root → body → shoulder → elbow → wrist → staff | Root → body → neck → head → jaw; cabang bahu/siku/pergelangan membawa sayap | Terpenuhi teknis |

Torus atau bilah ekstrusi tidak dipakai sebagai bukti Object 3 karena keduanya bukan quadric. Cone dan cone frustum juga tidak dihitung sebagai dua jenis permukaan berbeda. Berdasarkan rubrik gambar ini, syaratnya satu Object 3 berupa quadric selain ellipsoid/cylinder, bukan tiga jenis quadric tambahan.

## Bukti di kode

- Bentuk dan label parameter: `characters/Kai.js`, `characters/Oogway.js`, `characters/MrPing.js`.
- Persamaan hyperboloid: `objects/HyperboloidOneSheet.js`.
- Persamaan paraboloid dan potongannya: `objects/EllipticParaboloid.js`, `objects/EllipticParaboloidSection.js`.
- Kurva: `objects/Bezier.js`, pemanggilan `curve`, `curvedHorn`, dan generator rambut pada model.
- Matriks world anak dan Rodrigues: `core/SceneNode.js`.
- Hierarki Oogway/Mr. Ping: `animation/CharacterRigs.js`; hierarki Kai dibangun dalam konstruktornya.
- Gerak aktif: `animation/DuelAnimation.js`; perhitungan senjata pada `animation/KaiWeapon.js`.
- Environment: `environment/NoodleRestaurant.js` dan `environment/Environment.js`.
- Tampilan bukti langsung: `animation/Rubric.js`, panel Penilaian di index.html, dan `presentasi.html`.

## Perbaikan napas Kai

Dua ellipsoid tipis di depan dada tetap dihapus. Node chest sekarang membawa **dua mesh torso asli**, disimpan sebagai `chestMesh` (tubuh utama yang terlihat) dan `upperChestMesh` (torso atas). Keduanya memakai skala yang sama agar gerakan tidak tertutup tubuh yang statis. Perut bawah tetap pada cabang torso. Jumlah bagian Kai tetap 228; tidak ada objek baru untuk animasi napas.

`Kai.breathe(seconds, effort, strength)` memakai siklus 3 detik. Pengembangan maksimum normal pada kedalaman 8.5%, ditambah usaha 3.5% sehingga maksimum kuat 12%. Skala lebar maksimum 6.6% dan tinggi maksimum 3.36%. Kepala, bahu, tangan, dan senjata tidak ikut scaling.

## Pemeriksaan yang dilakukan

1. Semua script yang direferensikan index.html tersedia, dan file JavaScript diperiksa sintaksnya.
2. Adegan, kamera, dan ketiga rig dapat dibangun tanpa kesalahan jumlah/urutan mesh.
3. Vertex, normal hasil setup, matriks, dan indeks segitiga diperiksa pada beberapa waktu sepanjang 0–46 detik. Tidak ditemukan angka tidak valid atau indeks melampaui jumlah vertex.
4. Seek ke waktu yang sama setelah berpindah pose menghasilkan matriks Kai yang sama; tidak ada akumulasi rotasi akibat replay.
5. Rotasi Rodrigues diuji numerik. Perpindahan sendi induk diwariskan ke sendi anak.
6. Napas mengubah dua mesh torso yang sudah ada, tanpa mengubah matriks cabang kepala/pergelangan dan tanpa menambah bagian model.
7. Translasi, rotasi, scaling, dan penggunaan sumbu sembarang diperiksa untuk setiap karakter pada waktu demonstrasinya.
8. Logika F/H/R/Space, hide/show UI, opsi subtitle, fullscreen masuk/keluar dan callback keluar native, pesan kegagalan fullscreen, restart, serta lima tombol demonstrasi per karakter diuji melalui simulasi DOM/WebGL di Node.js.
9. Shader dikompilasi dan delapan pose dirender lewat OpenGL/EGL dengan data mesh, matriks kamera, serta shader proyek yang disesuaikan sintaksnya ke GLSL desktop. Renderer melaporkan GL_NO_ERROR. Pratinjau hasil render disertakan dalam folder preview.

## Batas pemeriksaan

- Chromium lokal tidak dapat dijalankan dalam lingkungan pengerjaan. Karena itu, izin fullscreen native, tampilan HTML/CSS, dan performa WebGL pada browser pengguna belum diuji langsung. Uji DOM memeriksa alur program dan callback API, bukan menggantikan pemeriksaan visual browser.
- Fullscreen mengikuti kebijakan browser: perlu klik/F dari pengguna, dan dapat ditolak ketika aplikasi dibuka dalam iframe atau lingkungan yang tidak memberi izin. Pesan kegagalan ditampilkan oleh aplikasi.
- Rantai, kontak, dan gerak lantai adalah koreografi prosedural; tidak menggunakan simulasi fisika atau deteksi tabrakan umum. Beberapa benda tetap bisa beririsan pada sudut tertentu.
- Kurva dan quadric direpresentasikan oleh mesh segitiga. Banyak segmen dan normals mendukung kelancaran visual, tetapi frame rate akhir tergantung perangkat.
- Bayangan kontak berupa ellipsoid pipih, bukan shadow mapping.
- Tidak diberikan jaminan 100/100; terutama aesthetic memerlukan penilaian dosen.

## Verifikasi napas yang diperjelas

Napas normal dirender pada pose dan kamera yang sama untuk beberapa fase selama satu siklus. Hanya skala napas yang berubah. GIF `preview/napas-kai.gif` memperlihatkan pengembangan torso tanpa perpindahan kepala atau lengan. Pemeriksaan regresi tetap lolos untuk geometri, hierarki, replay, dan kontrol rekaman.
