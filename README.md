# IBM_FinalProject
# DompetKu: Asisten Pencatat Keuangan Pintar

DompetKu adalah aplikasi web untuk mencatat pemasukan dan pengeluaran, menghitung saldo otomatis, mengatur budget per kategori, dan melihat grafik keuangan pribadi. Aplikasi dilengkapi **Smart Assistant** yang menyarankan kategori transaksi dan memberi insight singkat dengan bahasa yang ramah.

Project ini dikembangkan menggunakan **IBM Bob** (mode Agent) dengan pendekatan prompt 3 layer dan targeted refinement.

> **Tema:** Personal Finance Assistant (AI-assisted Expense Tracker)

---

## Daftar Isi

- [Latar Belakang](#latar-belakang)
- [Target Pengguna](#target-pengguna)
- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Folder](#struktur-folder)
- [Cara Menjalankan](#cara-menjalankan)
- [Aturan Perhitungan](#aturan-perhitungan)
- [Arsitektur Prompt](#arsitektur-prompt)
- [Iterasi Prompt](#iterasi-prompt)
- [Pengembangan Lanjutan](#pengembangan-lanjutan)

---

## Latar Belakang

Banyak anak muda tidak tahu ke mana uangnya pergi. Pengeluaran kecil seperti makan, transportasi, dan langganan jarang dicatat, sedangkan aplikasi keuangan yang ada sering terlalu rumit. Akibatnya pencatatan berhenti setelah beberapa hari dan tabungan jarang direncanakan.

DompetKu dibuat agar pencatatan keuangan terasa ringan: cepat dicatat, langsung terlihat saldonya, dan ada asisten yang membantu membaca kondisi keuangan.

## Target Pengguna

- **Utama:** mahasiswa dan fresh graduate dengan pemasukan terbatas.
- **Sekunder:** pekerja muda dan pemilik usaha kecil yang ingin memantau arus kas harian tanpa software akuntansi.

## Fitur

### Menu Aplikasi

| Menu | Isi |
|---|---|
| **Beranda** | Ringkasan Saldo, Total Pemasukan, Total Pengeluaran, Total Tabungan, panel Smart Assistant, dan form tambah transaksi |
| **Transaksi** | Daftar transaksi, filter All / Pemasukan / Pengeluaran (dengan jumlah), filter kategori, serta edit dan hapus |
| **Budget** | Batas anggaran bulanan per kategori dengan progress bar dan peringatan |
| **Statistik** | Donut chart, bar chart bulanan, dan kartu persentase |

### Fitur Utama

- **CRUD transaksi:** tambah, lihat, edit (modal), dan hapus dengan konfirmasi.
- **Filter dinamis** tanpa refresh halaman, contoh: `All (10)`, `Pemasukan (4)`, `Pengeluaran (6)`.
- **Format Rupiah** otomatis, contoh: `Rp 150.000`.
- **Validasi form:** nominal harus lebih dari 0 dan deskripsi tidak boleh kosong.
- **Kategori Nabung** yang dihitung terpisah dari pengeluaran.
- **Budget per kategori** dengan warna progress bar: biru (di bawah 70%), oranye (70-99%), merah (100% atau lebih).
- **Grafik tanpa library eksternal** (SVG, CSS, dan Tailwind), dilengkapi legenda dan teks alternatif.
- **Penyimpanan localStorage** sehingga data tidak hilang saat halaman di-refresh.
- **Responsif (mobile-first):** tab navigasi di layar besar, bottom navigation di mobile.
- **Aksesibilitas:** kontras warna WCAG AA, `aria-label`, `aria-current`, dan navigasi keyboard.

### Smart Assistant (berbasis aturan)

- **Auto-kategori:** menyarankan kategori dari kata kunci pada deskripsi, misalnya "grab" atau "gojek" ke Transportasi, "kopi" atau "warteg" ke Makanan, "listrik" atau "wifi" ke Tagihan. Pengguna tetap bisa mengubahnya.
- **Insight otomatis:** kategori pengeluaran terbesar, peringatan jika pengeluaran melebihi pemasukan, peringatan budget hampir habis, dan apresiasi saat pengguna menabung.

## Teknologi

- HTML5 (semantik)
- Tailwind CSS (via CDN) untuk styling utama
- CSS (`style.css`) untuk styling tambahan
- Vanilla JavaScript (`script.js`), tanpa framework dan tanpa library lain
- localStorage untuk penyimpanan data
- IBM Bob sebagai AI coding agent

## Struktur Folder

```
dompetku/
├── index.html    # Struktur halaman dan menu
├── style.css     # Styling tambahan (animasi, override)
├── script.js     # Logika aplikasi (CRUD, filter, budget, statistik, Smart Assistant)
└── README.md
```

## Cara Menjalankan

1. Clone atau unduh repository ini.
2. Buka folder project di VS Code (atau IDE IBM Bob).
3. Pasang ekstensi **Live Server**.
4. Klik kanan `index.html`, lalu pilih **Open with Live Server**.
5. Aplikasi terbuka di browser.

Alternatif: buka `index.html` langsung di browser. Koneksi internet dibutuhkan karena Tailwind CSS dimuat lewat CDN.

## Aturan Perhitungan

- **Saldo** = Total Pemasukan - Total Pengeluaran - Total Tabungan
- **Total Pengeluaran** tidak termasuk transaksi kategori Nabung.
- **Total Tabungan** = jumlah seluruh transaksi kategori Nabung.
- **Persentase tabungan** = Total Tabungan / Total Pemasukan (bulan berjalan).
- **Rasio pengeluaran** = Total Pengeluaran / Total Pemasukan (bulan berjalan).
- **Budget terpakai** dihitung dari transaksi pengeluaran pada bulan berjalan.
- Transaksi Nabung otomatis bertipe Pengeluaran dan tetap muncul di tab All dan Pengeluaran.

## Arsitektur Prompt

Prompt disusun dalam tiga layer, lalu disempurnakan lewat revisi terarah per layer.

**Layer 1 (Role & Context)** menetapkan peran Bob sebagai Senior Frontend Engineer yang membangun DompetKu, beserta batasan teknologi: HTML5, Tailwind CSS (CDN), dan Vanilla JavaScript tanpa framework, dengan kode dipisah ke tiga file. Tujuannya agar hasil konsisten dan tidak keluar dari teknologi yang diwajibkan.

**Layer 2 (Task & Requirements)** menjelaskan fitur yang harus dibangun: CRUD transaksi, ringkasan saldo, filter tab dengan jumlah, filter kategori, format Rupiah, validasi, localStorage, dan Smart Assistant. Tujuannya menjadi "otak" project agar revisi seminimal mungkin.

**Layer 3 (Constraints & Output)** mengatur tampilan dan kualitas: palet biru (#2563EB), putih, dan oranye (#F97316), mobile-first, card, rounded corner, soft shadow, WCAG AA, akses keyboard, serta kode berkomentar dan bebas error.

## Iterasi Prompt

Setiap masalah pada hasil diperbaiki dengan merevisi satu layer saja (targeted refinement), bukan menulis ulang seluruh prompt.

| # | Layer | Masalah | Perbaikan | Dampak |
|---|---|---|---|---|
| 1 | Layer 3 | Komponen menumpuk di satu halaman | Memisahkan menjadi Beranda, Transaksi, Budget, Statistik; form tambah di Beranda, menu Transaksi hanya daftar | Alur lebih jelas dan rapi di mobile |
| 2 | Layer 2 | Aplikasi baru mencatat, belum membantu mengendalikan pengeluaran | Menambah budget per kategori dengan progress bar dan peringatan | Smart Assistant bisa memberi peringatan relevan |
| 3 | Layer 2 | Data sulit dipahami secara visual | Menambah donut chart, bar chart, dan kartu persentase tanpa library | Pola pengeluaran terlihat sekali lihat |
| 4 | Layer 2 | Nabung terhitung sebagai pengeluaran biasa | Nabung dihitung terpisah dengan kartu Total Tabungan | Rasio dan persentase lebih akurat |

## Pengembangan Lanjutan

- Mengganti Smart Assistant berbasis aturan dengan LLM API agar klasifikasi dan saran lebih fleksibel.
- Scan struk atau input suara untuk mencatat transaksi otomatis.
- Ekspor laporan ke CSV atau PDF.
- Target tabungan dengan tujuan spesifik beserta estimasi tanggal tercapai.
- Notifikasi pengingat pencatatan harian.
- Sinkronisasi ke backend agar data bisa diakses dari banyak perangkat.

## Screenshot

<img width="446" height="459" alt="image" src="https://github.com/user-attachments/assets/cca0e51e-8e3c-4919-b229-a98a3c86cfe6" />

<img width="440" height="343" alt="image" src="https://github.com/user-attachments/assets/d865f676-831b-4128-8104-5330444e5ea4" />

<img width="442" height="265" alt="image" src="https://github.com/user-attachments/assets/ac1b39ba-85aa-4026-837f-2bf2c291fca1" />

<img width="440" height="443" alt="image" src="https://github.com/user-attachments/assets/3111dd7c-b5f1-4548-9475-2e15ceeca456" />


## Lisensi

Dibuat untuk keperluan pembelajaran dan capstone project.
