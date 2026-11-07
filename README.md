# Duel di Restoran Mi

Buka index.html di Chrome/Edge. Layar utama hanya menampilkan tombol **Play** dan **Penilaian**, dengan subtitle cerita.

- Play memulai animasi 46 detik; saat berjalan berubah menjadi Pause. Setelah selesai, Play memutar ulang dari awal.
- Penilaian membuka pilihan Kai, Oogway atau Mr. Ping serta lima contoh transformasi. Menutup panel mengembalikan kamera dan seluruh karakter.
- Peta 10 syarat untuk setiap karakter tersedia melalui tautan di panel dan presentasi.html.

Kai, Oogway dan Mr. Ping adalah model asli. Shifu.js tetap bernama Shifu dan dipakai sebagai Mr. Ping. Geometri karakter tidak diubah.

File yang dipertahankan adalah file adegan aktif, pustaka geometri yang diperlukan, dan panduan penilaian. Toothless, aset sayapnya, properti/animasi restoran versi lama, lingkungan lama yang tidak dimuat, dan gambar pratinjau lama sudah dibuang. Folder .git tidak disentuh.

Hierarki: animation/CharacterRigs.js. Koreografi: animation/DuelAnimation.js. Pengatur adegan: animation/SceneDirector.js. Peta rubrik: animation/Rubric.js. Lingkungan: environment/NoodleRestaurant.js dengan helper Environment.js.

KaiAnimation.js tetap diperlukan oleh konstruktor Kai asli. Timeline adegan aktif diatur oleh DuelAnimation.js. Semua transformasi dan kriteria geometri per karakter tetap dipertahankan. Gerak dan kontak merupakan koreografi prosedural; dialog berbentuk subtitle.

Kamera sinematik otomatis mengikuti Kai saat masuk, beralih ke Mr. Ping saat melerai, lalu mengikuti Oogway yang maju. Mulai pertarungan, kamera melebar agar ketiganya terlihat, lalu kembali ke Mr. Ping dan reaksi Kai. Peralihan menggunakan interpolasi waktu absolut. Drag, scroll, dan klik ganda tidak mengubah kamera. Panel Penilaian memakai framing otomatis untuk karakter yang dipilih.
