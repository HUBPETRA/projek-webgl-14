# Kai — The Golden Palace

Proyek WebGL murni untuk Hubertus / Kelompok 14. Buka `index.html` setelah mengekstrak seluruh ZIP. Tidak memerlukan npm, koneksi internet, atau impor GLB. Jika kebijakan browser lokal membatasi file, jalankan melalui VS Code Live Server atau `python -m http.server 8000`, lalu buka `http://localhost:8000`.

## Yang sudah dikerjakan

- Kai memiliki hierarki sendi dan pivot untuk badan, kepala, bahu, siku, pergelangan, pinggul, lutut, serta pergelangan kaki.
- Animasi otomatis 32 detik: berjalan sambil memutar dua senjata, berhenti, serangan dekat, dua lemparan rantai bergantian, terkena balasan, berlutut, dan tumbang.
- Golden Palace: dua tingkat atap emas dengan ujung melengkung, pilar, pintu berkisi, tangga, paviliun, pelataran batu, pagar, lentera, pohon, dan pegunungan.
- Kontrol jeda/putar, ulangi, pilihan adegan, penggeser waktu, kecepatan, tiga posisi kamera, dan visibilitas environment/Oogway.
- Frame terakhir ditahan; tidak otomatis mengulang setelah Kai kalah.

## Lima aspek penilaian

| Aspek | Implementasi | Letak kode |
| --- | --- | --- |
| Translate | Root Kai maju, mendekati lawan, dan mundur; ujung senjata bergerak ketika dilempar | `animation/KaiAnimation.js` dan `animation/KaiWeapon.js` |
| Rotate | Bahu, siku, pinggul, lutut, kepala, dan tubuh berputar pada pivot masing-masing | `animation/KaiAnimation.js` |
| Scaling | Dada mengembang saat bernapas; surai dan kain menyesuaikan saat berlutut | `animation/KaiAnimation.js` |
| Rotate Arbitrary Axis | Rotasi Rodrigues pada sumbu `[0.32, 0.84, 0.44]`, dinormalisasi, dalam ruang tangan | `core/SceneNode.js`: `Mat4.axisRotation()`; `animation/KaiWeapon.js` |
| Hierarchical Transformation | Matriks dunia dihitung sebagai `parentWorld * local`, diteruskan ke anak secara rekursif | `core/SceneNode.js`: `SceneNode.updateWorld()` |

Rotasi sumbu sembarang pada senjata dilakukan relatif terhadap tangan, sehingga pusat putar ikut bergerak ketika bahu/siku digerakkan. Normal permukaan memakai inverse transpose melalui `Nmatrix` agar pencahayaan tetap benar saat scaling tidak seragam.

## Hierarki Kai

`kaiRoot` memiliki anak `pelvis`. Pelvis memiliki `torso`, `cloth`, dan dua `hip`. Torso memiliki `chest`, `head`, `mane`, serta dua `shoulder`.

- Setiap shoulder → elbow → wrist.
- Setiap hip → knee → ankle.
- Kepala membawa mata, tanduk, moncong, dan detail wajah.
- Dada merupakan cabang tersendiri: scaling napas tidak memperbesar lengan atau kepala.
- `KaiWeapon.hand` merujuk ke wrist yang sesuai. Rantai dan senjata dihitung dari matriks dunia tangan, bukan dipasang pada koordinat dunia yang tetap.

Mesh lama dikelompokkan ke sendi tanpa membuang detail Kai. `RigBuilder.bind()` menyimpan transformasi awal mesh relatif terhadap pivot. Tidak ada penjumlahan rotasi per frame yang menyebabkan pose bergeser setelah replay.

## Jadwal adegan dan integrasi tim

| Waktu | Adegan |
| --- | --- |
| 0–8 detik | Kai masuk dari sisi kiri arena sambil berjalan dan memutar senjata |
| 8–10 detik | Kai berhenti di hadapan Oogway |
| 10–15 detik | Kai maju, mengayunkan senjata jarak dekat, lalu mundur |
| 15–21 detik | Lemparan senjata kanan dan kiri dengan rantai, kemudian ditarik kembali |
| 21–24 detik | Balasan chi sementara dari Oogway, Kai tersentak dan mundur |
| 24–27.3 detik | Kai berlutut |
| 27.3–30 detik | Kai tumbang ke samping; senjata turun ke lantai |
| 30–32 detik | Pose kekalahan ditahan |

`Kai.update(seconds)` menerima waktu absolut sejak adegan dimulai. Untuk penggabungan nanti, panggil fungsi tersebut dengan waktu yang sama dengan karakter rekan. `KaiAnimation.cues` berisi penanda waktunya. `SceneDirector.update(seconds)` adalah pengatur contoh adegan gabungan saat ini.

Contoh integrasi pada render loop kelompok:

```js
const kai = new Kai(gl, program, 0); // argumen ketiga adalah offset X lintasan
// setiap frame:
kai.update(sceneTimeSeconds);
kai.draw(viewMatrix, projectionMatrix);
```

Gunakan urutan script di `index.html`. `CharacterUtils.js` harus dimuat sebelum `core/SceneNode.js`, lalu KaiWeapon, KaiAnimation, dan Kai. `MyObject.js` perlu versi dalam ZIP ini karena ada uniform normal baru pada shader.

## Status Oogway dan karakter ketiga

File model `Oogway.js` dan `Shifu.js` dari unggahan tetap disertakan. Oogway menggunakan adapter di `SceneDirector.updateOogway()` untuk gerak menghindar, maju, dan efek balasan chi sebagai penghubung sementara. Oogway belum mendapat rig anggota tubuh lengkap; ganti adapter ini dengan animasi final rekan. Shifu tidak ditampilkan dalam adegan karena karakter ketiga belum diputuskan. Source karakter ketiga dapat dimasukkan melalui SceneDirector nanti.

## File yang diubah / ditambahkan

| File | Fungsi |
| --- | --- |
| `characters/Kai.js` | Pengelompokan model ke sendi dan penyesuaian sambungan kaki/lengan |
| `core/SceneNode.js` (baru) | Matriks, Rodrigues, node parent–child, builder rig |
| `animation/KaiAnimation.js` (baru) | Seluruh pose dan urutan otomatis Kai |
| `animation/KaiWeapon.js` (baru) | Putaran senjata, lemparan, dan mata rantai |
| `animation/SceneDirector.js` (baru) | Waktu adegan dan adapter sementara Oogway |
| `environment/Environment.js` | Geometri Golden Palace dan penggabungan mesh statis |
| `core/MyObject.js`, `shader.js` | Normal matrix untuk scaling |
| `main.js`, `index.html` | Render loop, UI, kamera, dan kontrol waktu |
| `README.md` | Panduan penggunaan dan integrasi |

Folder `preview` memuat gambar lama dari proyek awal; gambar bernama `kai-palace-*` adalah hasil render revisi ini.

## Validasi dan batas implementasi

- Sintaks JavaScript, jalur script, indeks segitiga, dan angka pada vertex/matriks diperiksa.
- Seek ke waktu yang sama menghasilkan pose yang sama setelah berpindah ke waktu lain.
- Pewarisan transformasi dan rotasi Rodrigues diuji secara numerik.
- Kontrol autoplay, jeda, seek, lompat adegan, restart, pilihan kamera, visibilitas, dan penghentian akhir diuji melalui simulasi DOM/WebGL di Node.js.
- Beberapa tahap animasi dirender melalui OpenGL/EGL untuk pemeriksaan visual; shader setara dipakai pada renderer tersebut.
- Browser WebGL sesungguhnya belum dapat diuji di lingkungan pengerjaan. Silakan buka index.html di browser untuk mengecek kompatibilitas dan performa perangkatmu.
- Rantai menggunakan animasi prosedural dengan jumlah mata rantai yang terlihat berubah mengikuti panjang terulur. Ini bukan simulasi fisika rantai atau collision detection. Rantai yang belum terulur direpresentasikan oleh lilitan di lengan.
- Kontak lantai menjaga mesh tubuh tidak menembus pelataran, tetapi belum berupa inverse kinematics penuh. Rambut/kain menyesuaikan lewat transformasi sederhana.
- Bayangan oval merupakan ilustrasi kontak tanah, bukan shadow mapping. Efek balasan Oogway bersifat sementara untuk menghubungkan adegan kalah Kai.
- Environment merupakan interpretasi prosedural Golden Palace, bukan rekonstruksi arsitektur film 1:1.
