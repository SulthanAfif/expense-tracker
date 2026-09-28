# Belajar Frontend Development.

## Live Demo

https://expense-tracker-chi-gules-41.vercel.app/

# Expense Tracker Pro

Aplikasi pencatat pemasukan dan pengeluaran yang lengkap dan modern. Dibuat menggunakan **HTML, CSS, dan JavaScript** murni + Chart.js.

Project ini cocok untuk portfolio karena sudah mencakup banyak fitur advanced seperti grafik, budget, export data, dan filter waktu.

---

## Fitur Lengkap

### Transaksi
- Tambah pemasukan & pengeluaran
- Edit transaksi
- Hapus transaksi dengan konfirmasi
- Pilih tanggal transaksi
- Kategori lengkap (Gaji, Freelance, Makanan, Transport, dll)

### Ringkasan & Analisis
- Hitung otomatis Saldo, Total Pemasukan, dan Total Pengeluaran
- **Grafik pengeluaran per kategori** (menggunakan Chart.js)
- **Budget bulanan** per kategori + progress bar (hijau / kuning / merah)

### Filter & Pencarian
- Filter: Semua / Pemasukan / Pengeluaran
- Filter berdasarkan **Bulan** dan **Tahun**
- Pencarian transaksi (berdasarkan keterangan atau kategori)

### Lainnya
- **Export data ke CSV**
- **Multiple mata uang** (Rp, $, €, ¥, S$)
- Dark Mode
- Data tersimpan di localStorage
- Tampilan responsif

---

## Tech Stack

- HTML5
- CSS3 (CSS Variables + Dark Mode)
- JavaScript (Vanilla)
- Chart.js (untuk grafik)
- localStorage
- Intl.NumberFormat

---

## Cara Menjalankan

1. Clone repository ini:
   ```bash
   git clone https://github.com/SulthanAfif/expense-tracker.git
   ```
2. Masuk ke folder project:
   ```bash
   cd expense-tracker
   ```

## Cara Menggunakan

1. Tambah Transaksi
    Isi keterangan, jumlah, tipe, kategori, dan tanggal → klik + Tambah
2. Edit Transaksi
    Klik ikon ✎ pada transaksi yang ingin diubah
3. Atur Budget
    Klik tombol + Atur Budget, pilih kategori dan masukkan jumlah budget
4. Lihat Grafik
    Grafik doughnut akan otomatis menampilkan pengeluaran per kategori
5. Filter & Cari
    Gunakan tombol filter, pilihan bulan/tahun, atau kolom pencarian
6. Export Data
    Klik tombol 📥 Export ke CSV untuk mengunduh data
7. Ganti Mata Uang
    Pilih simbol mata uang di pojok kanan atas

## Struktur File

```
expense-tracker/
├── index.html      # Struktur halaman
├── style.css       # Tampilan & dark mode
├── script.js       # Logika aplikasi + Chart.js
└── README.md       # Dokumentasi
```

## Pengembangan Selanjutnya (Ide)

- Grafik perbandingan pemasukan vs pengeluaran
- Notifikasi saat budget hampir habis
- Import data dari CSV
- Multiple akun / wallet
- PWA (bisa diinstall di HP)
