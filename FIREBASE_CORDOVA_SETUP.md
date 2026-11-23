# Firebase dan Cordova

## 1. Isi konfigurasi Firebase

1. Buat atau pilih proyek di Firebase Console.
2. Aktifkan **Authentication → Email/Password** dan buat **Cloud Firestore**.
3. Daftarkan aplikasi Web pada proyek Firebase.
4. Pastikan objek konfigurasi Web di `www/js/firebase-config.js` menunjuk ke proyek yang benar.
   Nilai konfigurasi Web Firebase digunakan oleh aplikasi klien. Jangan menaruh service-account JSON, private key, atau kata sandi admin di berkas web.
5. Siapkan pengguna Admin di **Authentication → Users**. Buat dokumen `users/{UID}` di Firestore dengan data seperti:

   ```json
   {
     "uid": "UID-dari-Firebase-Authentication",
     "name": "Admin Sarpras",
     "email": "admin@upitra.ac.id",
     "unit": "Sarana dan Prasarana",
     "role": "admin"
   }
   ```

   Peran Admin ditetapkan di Firestore, bukan dari pilihan pengguna pada aplikasi. Setelah login, Admin dapat membuat dan mengelola akun melalui aplikasi.

   Login memakai email dan kata sandi Firebase Authentication. Setelah berhasil, aplikasi wajib membaca `users/{UID}` dan menerima hanya role `admin` atau `user`. Role `admin` membuka fitur penuh; role `user` membuka antarmuka pemantauan, scan, dan pelaporan. Profil yang tidak ada atau role yang tidak valid tidak dapat masuk. Role tidak ditentukan dari alamat email atau kata sandi; profil harus disiapkan melalui Firebase Console atau alur Admin yang sudah tersedia.

## 2. Deploy rules, indexes, dan fungsi Admin

Pasang Firebase CLI jika belum tersedia, lalu tautkan direktori ini ke proyek Firebase Anda:

```powershell
npm install -g firebase-tools
firebase login
firebase use --add
npm --prefix functions install
firebase deploy --only firestore:rules,firestore:indexes,functions
```

Fungsi callable `adminUpsertUser` dan `adminDeleteUser` memakai Firebase Admin SDK di server sehingga kata sandi dan operasi Firebase Authentication tidak dilakukan oleh klien. Jangan memberi aplikasi hak menulis langsung ke dokumen peran pengguna.

Untuk deploy fungsi Admin dengan dukungan CORS bagi browser web dan Cordova:

```powershell
npm install -g firebase-tools
firebase login
firebase deploy --only functions --project sistem-inventaris-aset
```

Jika browser menolak endpoint Cloud Functions dengan pesan CORS, deployment fungsi terbaru wajib dijalankan terlebih dahulu. Pastikan project yang dipilih benar dan `adminUpsertUser` serta `adminDeleteUser` selesai di-deploy; kemudian muat ulang aplikasi. Browser tidak boleh dianggap menunda validasi Admin: kedua fungsi tetap memverifikasi role Admin dari Firestore.

Data master gedung disimpan di `buildings/{buildingId}` dengan field `name` dan `floors` (daftar nama lantai). Admin dapat menambah, mengubah, dan menghapus gedung/lantai; nama yang sudah dipakai aset atau ruangan ikut diperbarui saat diubah, sedangkan penghapusan lokasi yang masih dipakai ditolak. Deploy rules terbaru agar aplikasi dapat membaca dan mengelola koleksi tersebut:

```powershell
firebase deploy --only firestore:rules --project sistem-inventaris-aset
```

## 3. Pindahkan data prototipe lokal

Login sebagai Admin pada perangkat yang memiliki data prototipe. Jika koleksi cloud masih kosong, aplikasi menampilkan tombol **Pindahkan data lokal ke Firebase**. Tinjau konfirmasi sebelum memindahkan: data contoh prototipe yang tersimpan di browser juga ikut disalin. Pemindahan hanya diizinkan saat koleksi cloud kosong agar tidak menimpa data yang sudah ada.

## 4. Jalankan di web dan Cordova Android

```powershell
npm install
npm start
```

`npm start` membuka aplikasi di browser secara otomatis dan memakai server statis tanpa WebSocket live-reload. Jika port 8000 sedang digunakan, server mencoba port berikutnya; URL aplikasi dan halaman progress ditampilkan di terminal. Untuk live-reload saat pengembangan, jalankan `npm run start:watch`.

Server juga menyediakan endpoint pemantauan:

- `GET /api/health` — status dan uptime API web.
- `GET /api/progress` — kesiapan berkas aplikasi web, Firebase, Cloud Functions, dan Cordova.
- Buka `/progress.html` untuk melihat ringkasan status di browser.

API pemantauan ini tidak mengakses data inventaris atau menggantikan Firebase. Data aplikasi tetap dibaca dan ditulis oleh Firebase SDK dengan Firestore Security Rules; koneksi cloud baru dapat dipastikan dari dalam aplikasi setelah login berhasil.
Dashboard masih dapat dibuka dengan `npm run start:watch`, tetapi server statis tidak menyediakan endpoint API sehingga API dan Cordova ditandai belum terverifikasi. Gunakan `npm start` untuk pemeriksaan lengkap.

Untuk menyiapkan Android, pasang Android Studio/SDK dan Java yang disyaratkan Cordova, lalu jalankan:

```powershell
npm run cordova:android:add
npm run cordova:android:build
npm run cordova:android:run
```

Web dan Cordova memakai decoder Code 39 ZXing yang dibundel lokal. Plugin `cordova-plugin-camera` dipakai untuk mengambil foto aset di Android. Firebase membutuhkan koneksi internet. Firestore cache diaktifkan untuk membantu membaca data saat jaringan terputus; perubahan tersinkron kembali ketika perangkat online.

## Koleksi Firestore

- `users/{uid}` — profil dan peran akun.
- `assets/{assetId}` — data inventaris.
- `buildings/{buildingId}` — nama gedung dan daftar lantai.
- `rooms/{roomId}` — nama ruangan, gedung, dan lantai.
- `reports/{reportId}` — laporan privat dan balasan Admin.
- `scans/{scanId}` — histori pemindaian.
- `loginHistory/{entryId}` — histori masuk.

Dokumen laporan baru terikat ke `assetId` yang harus menunjuk ke dokumen aset. Pesan awal dan percakapan disimpan pada `messages` sebagai daftar objek `{ id, senderUid, senderName, senderRole, text, sentAt }`. `adminUnreadCount` dan `userUnreadCount` menghitung pesan yang belum dibaca untuk masing-masing pihak; membuka percakapan menandai pesan sebagai dibaca. Field lama `message` dan `feedback` tetap dibaca untuk menampilkan laporan lama. Setelah mengubah rules, deploy rules terbaru agar pengguna dapat membuat laporan dan kedua pihak dapat mengirim pesan:

```powershell
firebase deploy --only firestore:rules --project sistem-inventaris-aset
```
