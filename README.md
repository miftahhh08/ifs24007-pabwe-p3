# miftahuljannah-pabwe-p3

**Nama:** Miftahul Jannah Siregar  
**Mata Kuliah:** Pemrograman Aplikasi Berbasis Web (PABWE)  
**Praktikum:** 3  
**Topik:** Single Page JavaScript Application

## Deskripsi
Project ini dibuat berdasarkan studi kasus Praktikum 3. Aplikasi menggunakan satu halaman dengan tiga tab fitur dan seluruh logika interaksi berada pada `assets/script.js`.

## Checklist Studi Kasus

### 1. Struktur dan teknologi
- [x] `index.html` sebagai satu halaman utama.
- [x] `assets/script.js` sebagai JavaScript eksternal.
- [x] HTML5 semantic: `header`, `nav`, `main`, `section`, `footer`.
- [x] Tailwind CSS melalui CDN.
- [x] Tabler Icons dan Google Fonts.
- [x] Responsive desktop dan mobile.
- [x] Tidak menggunakan backend/API.
- [x] Tidak menggunakan inline `onclick`.

### 2. Expense Tracker
- [x] Tambah transaksi dengan judul/deskripsi, kategori, jumlah, tipe, dan tanggal.
- [x] Tipe Pemasukan dan Pengeluaran.
- [x] Ringkasan pemasukan, pengeluaran, dan saldo.
- [x] CRUD lengkap.
- [x] Edit dan hapus menggunakan modal.
- [x] Validasi field wajib dan jumlah harus > 0 dengan pesan error inline.
- [x] Empty state.
- [x] Search berdasarkan judul.
- [x] Filter berdasarkan tipe dan kategori.
- [x] Sorting terbaru, terlama, jumlah terbesar/terkecil, dan judul A-Z.
- [x] Render daftar secara dinamis menggunakan DOM.
- [x] Data tersimpan pada LocalStorage.

### 3. Bookmark / Link Manager
- [x] Tambah bookmark dengan judul, URL, kategori/tag, dan catatan opsional.
- [x] Validasi URL wajib diawali `http://` atau `https://` dengan pesan error inline.
- [x] Link menggunakan `target="_blank"` dan `rel="noopener noreferrer"`.
- [x] CRUD lengkap.
- [x] Edit dan hapus menggunakan modal.
- [x] Empty state.
- [x] Search berdasarkan nama, URL, atau kategori.
- [x] Sorting terbaru, A-Z, dan Z-A.
- [x] Render daftar secara dinamis menggunakan DOM.
- [x] Data tersimpan pada LocalStorage dengan key berbeda dari Expense Tracker.

### 4. Quiz App
- [x] Soal disimpan sebagai array of objects di JavaScript.
- [x] 5 soal.
- [x] Setiap soal memiliki 4 pilihan dan jawaban benar.
- [x] Soal dan pilihan dirender menggunakan JavaScript.
- [x] Perhitungan skor.
- [x] Feedback benar/salah.
- [x] Hasil akhir.
- [x] Bisa mengulang quiz.
- [x] High score tersimpan pada LocalStorage.

### 5. Integrasi dan persistence
- [x] Tiga fitur dipisahkan menggunakan tab.
- [x] Hanya satu panel tab aktif.
- [x] Tab aktif disimpan dan dipulihkan melalui query URL `?tab=expense|bookmark|quiz`.
- [x] Perubahan tab menggunakan `URLSearchParams` dan `history.replaceState`, tanpa menyimpan state tab pada LocalStorage.
- [x] Key LocalStorage dipisahkan untuk expense, bookmark, dan quiz high score.
- [x] JavaScript dikelompokkan dengan komentar per fitur.

## Struktur
```text
miftahuljannah-pabwe-p3/
├── index.html
├── assets/
│   └── script.js
└── README.md
```

## Cara menjalankan
Buka `index.html` pada browser modern atau jalankan menggunakan Live Server di Visual Studio Code. Karena Tailwind CSS, Google Fonts, dan Tabler Icons dimuat melalui CDN, koneksi internet diperlukan untuk tampilan lengkap.

## Teknologi
HTML5 • Tailwind CSS • JavaScript • DOM Manipulation • Event Listener • Array Methods • JSON • LocalStorage
