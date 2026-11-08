# Duel di Restoran Mi

**Paket Environment v4.** Ekstrak seluruh ZIP, lalu buka `projek-webgl-environment-v4/index.html` dari folder hasil ekstraksi. Toolbar menampilkan label **Environment v4**; label ikut hilang ketika menekan H untuk merekam. Setiap script memiliki penanda versi pada URL untuk menghindari penggunaan cache script lama.

Proyek WebGL murni dengan Kai, Oogway, dan Mr. Ping. Ekstrak seluruh ZIP ke folder baru, lalu buka `index.html` di Chrome/Edge. Tidak memerlukan npm atau aset dari internet. Jika file lokal dibatasi browser, gunakan VS Code Live Server atau `python -m http.server 8000`.

## Perubahan revisi ini

- Environment diperluas dari fondasi 26 × 21 menjadi 36 × 30 unit, dengan 285 ubin berukuran tetap. Taman bambu, bangku, batu hias, pagar, tangga, dan pegunungan tiga lapis melengkapi sisi halaman.
- `environment/Sky.js` menggambar langit bergradasi, awan, matahari, dan tanah luar sesuai arah pandang kamera. Tanah luar dihitung pada piksel yang terlihat agar tidak memerlukan peta besar. Ringkasan kode dan bagian laporan yang diperbarui ada di `PERUBAHAN-ENVIRONMENT.md`.
- Model angsa memakai file `characters/MrPing.js` dan kelas `MrPing`. Referensi script, adapter rig, panel, dan panduan sudah memakai nama tersebut.
- Dua ellipsoid tipis di depan dada Kai dihapus. Napas mengubah skala dua mesh torso asli (tubuh utama dan dada atas) bersama-sama melalui `Kai.breathe()`, sehingga tidak tertutup tubuh yang statis.
- Napas memakai siklus 3 detik, kedalaman normal hingga 8.5% dan napas kuat hingga 12%. Dada mendapat cabang hierarki tersendiri; napas tidak memperbesar kepala, bahu, tangan, rantai, atau senjata.
- File JavaScript dirapikan. Pemanggilan geometri pada ketiga model diberi label argumen. `CharacterUtils.js` menjelaskan arti, satuan, dan default setiap parameter builder.
- Ditambahkan fullscreen, hide/show UI, pengulangan dari awal, dan pilihan mempertahankan subtitle saat merekam.

Cerita, restoran, koreografi 46 detik, kamera sinematik, serta model Oogway/Mr. Ping dari progres terbaru tetap menjadi acuan.

## Kontrol untuk merekam

| Kontrol | Tombol keyboard | Fungsi |
| --- | --- | --- |
| Play/Pause | Space | Memulai atau menjeda adegan |
| Ulangi | R | Memutar cerita lengkap dari nol, termasuk ketika UI tersembunyi |
| Fullscreen | F | Masuk/keluar fullscreen |
| Keluar fullscreen | Esc | Keluar melalui kontrol native browser |
| Sembunyikan/tampilkan UI | H | Menyembunyikan toolbar, panel rubrik, subtitle, dan kursor pada canvas; H lagi mengembalikan |
| Tetap tampilkan subtitle saat UI disembunyikan | Checkbox | Opsional: mempertahankan dialog dalam rekaman bersih |

Cara praktis: siapkan perekam layar → tekan F → pilih apakah subtitle dipertahankan → tekan H → mulai merekam → tekan R. Setelah selesai, H mengembalikan kontrol dan Esc keluar fullscreen.

Tautan `index.html?clean=1` membuka tampilan tanpa UI. Tambahkan `&subtitles=1` jika dialog perlu terlihat. Tampilan awal tetap dijeda sampai Space/R ditekan. Fullscreen memerlukan F/klik karena browser meminta aksi pengguna.

Aplikasi ini menyiapkan tampilan untuk perekam layar; tidak membuat file video atau mengunggah YouTube. Dialog berupa subtitle dan tidak berisi rekaman suara.

## Pemeriksaan rubrik

Buka `HASIL-CEK-KRITERIA.md` untuk bukti tiap aspek dan batas pemeriksaan. Peta interaktif tersedia melalui tombol **Penilaian**, atau `presentasi.html`. Bobot 10 poin pada peta adalah rubrik maksimum, bukan nilai yang dijamin. Aesthetic memerlukan penilaian visual dosen.

## Membaca kode

Mulai dari `PANDUAN-KODE.md`. Bagian penting:

- `characters/Kai.js`, `characters/Oogway.js`, `characters/MrPing.js`: bentuk tubuh dan parameter geometri.
- `characters/CharacterUtils.js`: fungsi pembuat bentuk; JSDoc menjelaskan setiap parameter.
- `core/SceneNode.js`: pivot, parent-child, matriks dan rotasi Rodrigues.
- `animation/CharacterRigs.js`: memasang mesh Oogway/Mr. Ping ke sendi berdasarkan urutan model.
- `animation/DuelAnimation.js`: koreografi aktif, termasuk napas Kai.
- `animation/KaiAnimation.js`: contoh animasi mandiri Kai; bukan timeline adegan restoran. Napasnya juga memakai `Kai.breathe()`.
- `animation/KaiWeapon.js`: putaran bilah, lintasan rantai, dan transformasi relatif tangan.
- `animation/CinematicCamera.js`: kamera otomatis dan fokus penilaian.
- `core/RecordingControls.js`: fullscreen, hide UI, dan pintasan rekaman.
- `main.js`: menghubungkan render loop, waktu, UI, dan kamera.

Jangan mengambil `Kai.js` saja dari ZIP; revisi memerlukan seluruh script pendukung dan urutan pemuatan di index.html.

Pratinjau napas normal pada pose tetap tersedia di `preview/napas-kai.gif`. Di aplikasi, pilih Penilaian → Kai → Scaling untuk melihat napas saat adegan berjalan.

Pratinjau environment terbaru: `preview/environment-revisi.png`. Seluruh folder ZIP harus diekstrak agar `Sky.js` ikut dimuat oleh `index.html`.
