# Cara membaca dan mengubah kode

## 1. Koordinat, ukuran, warna, dan satuan

- X: kanan-kiri; Y: atas-bawah; Z: depan-belakang pada pose awal model.
- Ukuran/posisi memakai unit dunia; tidak otomatis berarti sentimeter atau meter.
- Radius = setengah ukuran. Ellipsoid radiusX 0.5 memiliki lebar total 1 unit.
- Warna `[R, G, B]` memakai rentang 0..1; `[1,0,0]` merah, `[0,1,0]` hijau.
- Builder seperti `B.ellipsoid()` menerima rotasi dalam **derajat**.
- `SceneNode.rotation` dan `Mat4.axisRotation()` menerima sudut dalam **radian**. `Math.PI/2` = 90°.
- Loop `s` pada `[-1,1]` menyusun sisi X negatif dan positif. Sisi kiri-kanan ini mengikuti koordinat model, bukan kamera.

## 2. Label parameter di file model

Contoh ini sama dengan ellipsoid dada utama Kai:

```js
this.upperChestMesh = B.ellipsoid(
  /* radiusX */ 0.99,       // setengah lebar dada
  /* radiusY */ 0.64,       // setengah tinggi dada
  /* radiusZ */ 0.52,       // setengah tebal dada
  /* posX */ 0,
  /* posY */ 0.95,
  /* posZ */ -0.035,
  /* colorRGB */ dark
);
```

Radius mengatur bentuk dan proporsi. Posisi menentukan letak bagian pada pose awal. Argumen rotasi opsional di akhir menentukan orientasi awal; jika tidak diisi nilainya 0. Label di setiap pemanggilan menunjukkan nama parameter yang sedang diatur, sementara penjelasan lengkapnya ada sebelum definisi fungsi di `CharacterUtils.js`.

## 3. Fungsi bentuk

| Fungsi | Parameter ukuran | Kegunaan |
| --- | --- | --- |
| `ellipsoid` | `radiusX, radiusY, radiusZ` | Badan, kepala, otot, mata |
| `cylinder` | `radius, height` | Tabung lengan, tungkai, tongkat, sumpit |
| `cone` | `radius, height` | Taring, kuku, duri runcing |
| `frustum` | `bottomRadius, topRadius, height` | Armor, lengan baju, topi |
| `paraboloid` | `radiusX, radiusZ, height` | Tempurung, paruh, bulu |
| `paraboloidSection` | Ukuran paraboloid penuh + `startV, endV` | Moncong dan hoof terpotong |
| `hyperboloid` | `radiusX, radiusZ, height` | Pergelangan Kai, betis Mr. Ping, leher Oogway |
| `torus` | `majorRadius, tubeRadius` | Mata rantai, gelang, cincin |
| `curve` | Empat titik XYZ + radius pangkal/ujung | Alis, rambut, leher, lengkungan tongkat |
| `curvedHorn` | Empat titik XYZ + radius pangkal | Tanduk: segmen frustum mengikuti Bezier |
| `surface` | Fungsi posisi UV + banyak pembagian U/V | Kain, sabuk, pelat, dan surai |
| `jadeBlade` | Posisi XYZ, warna, rotasi Y | Bilah bulan sabit berketebalan |

`majorRadius` torus adalah jarak pusat cincin ke pusat tabung; `tubeRadius` ketebalan tabungnya. Torus, mesh kain, dan bilah ekstrusi tidak dihitung sebagai quadric tambahan. Cone dan cone frustum merupakan jenis permukaan yang sama; frustum dengan kedua radius sama menjadi cylinder.

`startV/endV` membatasi bagian tinggi paraboloid pada 0..1. Misalnya `0,0.8` mengambil bagian dari pangkal hingga 80% tinggi, sehingga ujung puncaknya tidak ikut.

Untuk `segment(startXYZ,endXYZ,startRadius,endRadius,color)`, dua posisi menentukan arah dan panjang. `endRadius=0` menghasilkan ujung runcing. `along(mesh,startXYZ,endXYZ)` mengarahkan mesh sumbu Y; panjang mesh harus sudah sesuai jarak dua titik.

## 4. Bagian karakter dan bentuknya

| Karakter | Bagian | Bentuk/operasi |
| --- | --- | --- |
| Kai | Torso bawah/perut | Ellipsoid saling bertumpuk |
| Kai | Dada utama | Dua mesh torso asli pada node chest; scaling napas |
| Kai | Bahu dan otot | Ellipsoid, diarahkan mengikuti sendi |
| Kai | Lengan/betis | Cylinder |
| Kai | Pelindung lengan | Frustum, ditambah torus rantai dan cone duri |
| Kai | Pergelangan | Hyperboloid satu selimut, diputar horizontal |
| Kai | Kepala/rahang/mata | Ellipsoid |
| Kai | Moncong/hoof | Potongan elliptic paraboloid, diputar ke depan |
| Kai | Tanduk | Rangkaian frustum pada lintasan Bezier 3D |
| Kai | Rambut/janggut/alis | Tabung Bezier; surai utama berupa mesh parametrik |
| Kai | Kain/sabuk | Mesh parametrik dan frustum pipih |
| Kai | Senjata | Cylinder gagang, bilah ekstrusi, torus rantai |
| Oogway | Badan/kepala/mata | Ellipsoid |
| Oogway | Tempurung | Elliptic paraboloid diputar ke belakang |
| Oogway | Leher | Hyperboloid diarahkan dari pangkal ke kepala |
| Oogway | Pola tempurung/kerut | Tabung Bezier mengikuti permukaan |
| Oogway | Lengan/tongkat | Cylinder, ellipsoid tangan, dan Bezier lengkungan tongkat |
| Oogway | Kaki | Cylinder tungkai dan paraboloid terpotong telapak |
| Mr. Ping | Badan/jubah/kepala | Ellipsoid |
| Mr. Ping | Leher/alis | Tabung Bezier |
| Mr. Ping | Paruh/bulu sayap/ekor | Elliptic paraboloid, dipipihkan lewat parameter radius dan diputar |
| Mr. Ping | Lengan baju/topi | Frustum |
| Mr. Ping | Sumpit/kancing | Cylinder |
| Mr. Ping | Betis | Hyperboloid satu selimut |
| Mr. Ping | Gelang kaki | Torus |

## 5. Napas Kai sekarang

`chestMesh` menyimpan ellipsoid tubuh utama yang terlihat. `upperChestMesh` menyimpan ellipsoid torso atas. Keduanya sudah ada pada model awal dan kini dipasang pada cabang chest yang sama. Jika tubuh utama dibiarkan statis, permukaannya menutupi gerakan dada di belakangnya. Perut bawah tetap pada torso. Dua lapisan bantalan dada tetap dihapus.

`Kai.breathe(seconds, effort, strength)` mengubah skala XYZ pada cabang ini:

- `seconds`: waktu absolut animasi dalam detik.
- `effort`: bobot napas kuat 0..1, dipicu sebelum Kai mengancam.
- `strength`: intensitas 0..1. Nol menghentikan gerakan napas.
- `periodSeconds = 3`: satu siklus napas selama 3 detik.
- `normalAmplitude = 0.085`: kedalaman mengembang hingga 8.5% pada napas biasa.
- `effortAmplitude = 0.035`: tambahan hingga 3.5% saat menarik napas kuat, total maksimum 12% pada kedalaman.
- Pengembangan lebar = 55% dari expansion (maksimum 6.6%); tinggi = 28% (maksimum 3.36%).
- Kurva cosinus menghasilkan awal/akhir siklus yang halus, tanpa lompatan atau penumpukan skala.

Pivot chest berada dekat bagian bawah dada. Bahu dan kepala merupakan cabang lain pada torso, sehingga tidak ikut membesar. `DuelAnimation.kai()` dan contoh `KaiAnimation.apply()` memakai fungsi yang sama; jumlah mesh tetap 228.

## 6. Hierarki dan animasi

`SceneNode(name,pivot,parent)` menerima nama, koordinat sendi pada pose awal, dan induk. `parentWorld * local` menghasilkan matriks dunia anak.

- Kai: root → pelvis → torso → shoulder → elbow → wrist. Senjata menggunakan matriks dunia wrist. Chest dan head adalah cabang terpisah dari torso.
- Oogway: root → body → shoulder → elbow → wrist → staff.
- Mr. Ping: root → body → neck → head → jaw; cabang shoulder → elbow → wrist membawa sayap.

`position=[x,y,z]` menggeser node; `rotation=[rx,ry,rz]` memutarnya; `scale=[sx,sy,sz]` mengubah ukuran. Angka 1 pada skala berarti ukuran awal. `axis=[x,y,z]` dan `angle` memakai Rodrigues untuk sumbu sembarang; fungsi menormalisasi sumbu secara otomatis.

Dalam `DuelAnimation.js`, `S(a,b)` adalah perubahan halus 0→1 antara detik a dan b. `P(a,b,c,d)` naik pada a→b, bertahan hingga c, lalu turun pada c→d. Nilai dihitung ulang dari waktu absolut agar replay tidak menumpuk rotasi.

## 7. Catatan jika mengedit model

Adapter Oogway/Mr. Ping memakai indeks mesh sesuai urutan builder. Angka indeks bukan koordinat. Saat menambah/menghapus bagian tubuh, perbarui jumlah yang diperiksa serta rentang di `CharacterRigs.js`; jika tidak, file sengaja menampilkan error agar sendi tidak salah dipasangkan. Kai memasang mesh lewat `B.joint`, sehingga tidak memakai indeks untuk pembagian anggota tubuh.

Lingkungan statis digabung menjadi batch agar draw call lebih sedikit. Mesh pada satu batch dibatasi di bawah 65.536 vertex, sesuai indeks `UNSIGNED_SHORT` yang digunakan renderer.

## 8. Environment setelah perluasan

`environment/NoodleRestaurant.js` membagi lingkungan menjadi empat fungsi agar mudah dicari:

| Fungsi | Bagian yang dibentuk |
| --- | --- |
| `createGround()` | Fondasi, 285 ubin, lis, garis inlay, tiga anak tangga |
| `createBuilding()` | Dinding, pilar, jendela, atap, papan mi, lentera, konter, meja |
| `createGarden()` dan `planter(x,z,height)` | Pagar, bangku, bambu, daun, semak, batu hias |
| `createMountains()` | Tiga lapis bukit dari mesh parametrik dengan profil sinus |

Objek `layout` di awal file mengatur ukuran halaman. `foundationWidth` dan `foundationDepth` adalah ukuran penuh fondasi; `columns`/`rows` mengatur jumlah ubin; `tileSpacing` adalah jarak antarpusat ubin, sedangkan `tileSize` adalah ukuran satu ubin. `centerZ` menggeser fondasi ke depan/belakang dan `fenceX` mengatur jarak pagar dari pusat. Semua memakai unit dunia yang sama dengan karakter.

`environment/Sky.js` mengatur langit melalui `settings`: `horizonColor`, `zenithColor`, dan `groundColor` adalah RGB 0..1; `sunDirection` adalah arah matahari; `groundHeight` adalah ketinggian bidang tanah luar. Quad layar menggambar gradasi, noise awan, matahari, dan tanah luar. Basis kamera serta proyeksi menentukan arah tiap piksel sehingga latar tidak menempel pada layar dan tetap menutup frame setelah resize/fullscreen.

Langit digambar lebih dulu tanpa penulisan depth, lalu depth diaktifkan kembali untuk mesh. Matahari adalah efek visual, bukan point light; shader lighting karakter tetap berada di `shader.js`. Properti `environment.stats` menyimpan jumlah sumber, vertex, segitiga, dan batch untuk pemeriksaan.
