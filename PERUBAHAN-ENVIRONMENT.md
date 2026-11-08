# Catatan perubahan environment

Paket dikirim ulang sebagai **Environment v4** dengan nama folder berbeda, label versi pada toolbar, dan penanda versi pada seluruh URL script. Perubahan ini memudahkan pengecekan versi yang sedang dibuka. Tampilan environment tetap mengikuti rincian revisi di bawah.

Revisi 8 November 2026 memperbesar halaman sesuai framing kamera dan memperkaya latar restoran.

| Komponen | Sebelum | Sesudah |
| --- | --- | --- |
| Fondasi | 26 × 0.62 × 21 | 36 × 0.62 × 30, pusat Z = 1.8 |
| Ubin | 13 × 9 = 117 | 19 × 15 = 285; ukuran dan jarak satu ubin tetap |
| Tepi halaman | Pagar pendek | Pagar lebih panjang, lis batu, inlay, tiga anak tangga |
| Tanaman/furnitur tepi | Belum ada taman | Enam pot bambu/semak, enam batu, dua bangku |
| Pegunungan | Sembilan cone | Tiga lapis mesh parametrik dengan palet berbeda |
| Langit | Warna clearColor polos | Gradasi, awan noise, cakram dan pendar matahari |
| Tanah luar | Tepi fondasi berakhir ke latar kosong | Bidang tanah dihitung per piksel dan memudar ke cakrawala |
| Ukuran bangunan/karakter | Ukuran proyek sebelumnya | Tetap, sehingga proporsi terhadap halaman terjaga |

## Berkas kode yang diubah

- `environment/NoodleRestaurant.js`: `layout`, halaman, taman, dan pegunungan berlapis.
- `environment/Environment.js`: menggambar Sky lebih dahulu dan mencatat statistik batch.
- `environment/Sky.js`: berkas baru, shader latar beserta parameter warna dan arah matahari.
- `index.html`: memuat Sky sebelum Environment.
- `main.js`: warna cadangan disesuaikan dengan cakrawala baru.
- README, panduan kode, dan hasil pemeriksaan: penjelasan environment terbaru.

Parameter ukuran terdapat di `layout` pada NoodleRestaurant; parameter warna langit terdapat di `settings` pada Sky. Model karakter, hierarki, napas Kai, senjata, koreografi 46 detik, kamera, fullscreen, dan hide UI tidak diubah.

## Bagian laporan yang diperbarui

| Bagian | Isi perubahan |
| --- | --- |
| Bab 1 dan Bab 2, gambar | Gambar 1–4 memakai latar baru; isi model serta pembagian tugas tetap |
| Bab 3 | Seluruh breakdown environment, ukuran, elemen, Sky, tanah luar, batch dan framing |
| Bab 4 | Pegunungan parametrik dan quad layar Sky pada tabel nonquadric |
| Bab 6, Aesthetic | Dukungan visual environment terbaru |
| Bab 7.1–7.3 | Shader langit, warna prosedural, dan hubungan terhadap matriks kamera |
| Bab 8 | Pengujian environment dan tiga rasio layar |
| Lampiran | Peta berkas dan catatan perubahan environment |

Laporan Word/PDF yang diberikan sudah memuat pembaruan ini. Tidak perlu menyalin ulang Bab 2 dan Bab 5. Lampiran catatan perubahan menunjukkan lokasi pembaruan agar revisi berikutnya mudah ditelusuri.

## Verifikasi

- Mesh statis environment: 931 bagian sumber, 76.378 vertex, 115.684 segitiga, dua batch.
- Langit: empat vertex / dua segitiga, satu draw call, tanpa gambar tekstur eksternal.
- Kamera: 279 sampel pada rasio 4:3, 16:9, dan 21:9; basis dan posisi mata konsisten.
- Render: sepuluh frame melalui OpenGL/EGL, shader mesh dan Sky dikompilasi tanpa error.
- Pemeriksaan karakter dan kontrol sebelumnya tetap lulus. Pengujian ini belum mengukur performa browser/FPS perangkat atau izin fullscreen native.
