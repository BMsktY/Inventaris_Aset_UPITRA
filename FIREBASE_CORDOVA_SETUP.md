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

## 3. Pindahkan data prototipe lokal

Login sebagai Admin pada perangkat yang memiliki data prototipe. Jika koleksi cloud masih kosong, aplikasi menampilkan tombol **Pindahkan data lokal ke Firebase**. Tinjau konfirmasi sebelum memindahkan: data contoh prototipe yang tersimpan di browser juga ikut disalin. Pemindahan hanya diizinkan saat koleksi cloud kosong agar tidak menimpa data yang sudah ada.

## 4. Jalankan di web dan Cordova Android

```powershell
npm install
npm start
```

`npm start` memakai server statis tanpa WebSocket live-reload. Untuk live-reload saat pengembangan, jalankan `npm run start:watch`.

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
- `reports/{reportId}` — laporan privat dan balasan Admin.
- `scans/{scanId}` — histori pemindaian.
- `loginHistory/{entryId}` — histori masuk.
