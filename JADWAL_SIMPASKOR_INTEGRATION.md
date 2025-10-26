# Integrasi API Jadwal Simpaskor

## 📋 Overview
Fitur ini mengintegrasikan API dari `https://simpaskor.id/api/landing_page.php` untuk menampilkan jadwal dan event Simpaskor di aplikasi Vertinova Finance.

## 🎯 Fitur
- **Dashboard Hayabusa**: Tombol "Jadwal" di quick actions menu
- **Transaction Group Detail (Simpaskor)**: Tombol "Jadwal Simpaskor" di header (untuk semua user termasuk Finance Manager)
- **Modal Jadwal**: Menampilkan daftar event dengan detail lengkap

## 📁 File yang Dibuat/Diubah

### File Baru:
1. **`frontend/src/services/simpaskorApi.js`**
   - Service untuk fetch API dari Simpaskor
   - Fungsi `getSimpaskorSchedule()` dan `parseSimpaskorSchedule()`

2. **`frontend/src/components/JadwalSimpaskor.jsx`**
   - Komponen modal untuk menampilkan jadwal
   - Menampilkan: tanggal, waktu, lokasi, deskripsi, peserta, status
   - Auto-refresh data saat modal dibuka

### File yang Diubah:
1. **`frontend/src/pages/HayabusaDashboard.jsx`**
   - Import `JadwalSimpaskor` component
   - Tambah state `showJadwalModal`
   - Tambah tombol "Jadwal" di quick actions (icon biru)
   - Render `<JadwalSimpaskor>` component

2. **`frontend/src/pages/TransactionGroupDetail.jsx`**
   - Import `JadwalSimpaskor` component
   - Tambah state `showJadwalModal`
   - Tambah tombol "Jadwal Simpaskor" di header (hanya untuk grup Simpaskor)
   - Render `<JadwalSimpaskor>` component

## 🔧 Cara Kerja

### Flow:
1. User klik tombol "Jadwal" (Hayabusa) atau "Jadwal Simpaskor" (Finance Manager)
2. Modal `JadwalSimpaskor` terbuka
3. Component fetch data dari `https://simpaskor.id/api/landing_page.php`
4. Data di-parse dan ditampilkan dalam card format
5. User bisa scroll melihat semua event
6. Klik "Tutup" untuk menutup modal

### Data Parsing:
Component mendukung berbagai format field dari API:
- **Title**: `title`, `name`, `event_name`
- **Date**: `date`, `tanggal`, `start_date`
- **Time**: `time`, `waktu`, `start_time`
- **Location**: `location`, `lokasi`, `tempat`
- **Description**: `description`, `deskripsi`, `keterangan`
- **Participants**: `participants`, `peserta`, `quota`
- **Status**: `status` (Active, Upcoming, dll)

### UI/UX:
- **Header**: Navy slate gradient dengan icon kalender
- **Loading**: Spinner animasi saat fetch data
- **Error**: Pesan error dengan tombol "Coba Lagi"
- **Empty State**: Icon dan pesan "Belum ada jadwal tersedia"
- **Card Event**: 
  - Rounded border
  - Hover shadow effect
  - Badge status (hijau untuk active, biru untuk upcoming)
  - Icons untuk setiap detail (tanggal, waktu, lokasi, peserta)

## 🎨 Styling
- **Tombol Dashboard Hayabusa**: Gradient biru (from-blue-500 to-blue-600)
- **Tombol Transaction Group**: Gradient biru (from-blue-600 to-blue-500)
- **Modal Header**: Navy slate gradient matching dashboard
- **Event Cards**: White background dengan border gray-200

## 🚀 Testing

### Manual Testing:
1. **Hayabusa Dashboard**:
   - Login sebagai Hayabusa user
   - Klik tombol "Jadwal" (icon biru kalender)
   - Modal harus terbuka dan menampilkan jadwal

2. **Finance Manager (Simpaskor Group)**:
   - Login sebagai Finance Manager
   - Buka halaman Transaction Group Detail untuk grup "Simpaskor"
   - Klik tombol "Jadwal Simpaskor"
   - Modal harus terbuka dan menampilkan jadwal

### API Testing:
```javascript
// Test fetch API
import { getSimpaskorSchedule } from './services/simpaskorApi';

getSimpaskorSchedule()
  .then(data => console.log('API Response:', data))
  .catch(error => console.error('API Error:', error));
```

## 📝 Catatan

### Penyesuaian API:
Jika struktur data dari API berbeda, sesuaikan fungsi `parseSimpaskorSchedule()` di file `simpaskorApi.js`.

### CORS:
Jika terjadi CORS error, mungkin perlu:
1. API Simpaskor menambahkan CORS header
2. Atau buat proxy endpoint di backend Laravel untuk forward request

### Customization:
- Field yang ditampilkan bisa disesuaikan di `JadwalSimpaskor.jsx`
- Styling bisa diubah sesuai kebutuhan
- Icon bisa diganti dengan HeroIcons yang lain

## 🔒 Security
- API fetch menggunakan HTTPS
- Tidak ada authentication required (public API)
- Data hanya dibaca (read-only)

## 📱 Responsive
- Modal responsive untuk mobile dan desktop
- Max height 70vh dengan scroll untuk banyak event
- Card layout menyesuaikan ukuran layar
