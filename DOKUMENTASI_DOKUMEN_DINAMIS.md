# 📚 Dokumentasi Sistem Manajemen Dokumen Dinamis

## 🎯 Ringkasan Perubahan

Sistem manajemen dokumen telah diubah dari **statis** (hardcoded) menjadi **dinamis** berbasis API database. Kini **User**, **Psikolog**, dan **Admin** bisa mengelola dokumen secara real-time.

---

## 🚀 Fitur Utama

### ✅ Untuk User & Psikolog
- ✓ Menambah dokumen baru (dengan waiting approval)
- ✓ Edit dokumen yang masih draft
- ✓ Hapus dokumen milik sendiri
- ✓ Upload file dari cloud storage (Google Drive, Dropbox, iCloud)
- ✓ Unggah video dari YouTube

### ✅ Untuk Admin
- ✓ Melihat semua dokumen pending (menunggu approval)
- ✓ Menyetujui dokumen (publish ke public)
- ✓ Menolak dokumen dengan alasan
- ✓ Kelola semua dokumen di sistem

### ✅ Untuk Publik
- ✓ Melihat dokumen yang sudah dipublikasi
- ✓ Mencari dokumen berdasarkan kategori
- ✓ Download/buka dokumen
- ✓ Menonton video edukasi

---

## 📁 File & Folder yang Ditambahkan

### Backend (Laravel)
```
database/migrations/
  └── 2026_03_03_133310_create_documents_table.php  (✨ BARU)

app/Models/
  └── Document.php  (✨ BARU)

app/Http/Controllers/Api/
  └── DocumentController.php  (✨ BARU)

routes/
  └── api.php  (DIUPDATE)
```

### Frontend (React)
```
src/components/
  ├── PustakaDokumenDynamic.jsx  (✨ BARU - mengganti PustakaDokumen)
  ├── DocumentForm.jsx  (✨ BARU - form untuk upload dokumen)
  └── AdminDocumentPanel.jsx  (✨ BARU - panel admin)

src/pages/
  ├── Home.jsx  (DIUPDATE - menggunakan PustakaDokumenDynamic)
  └── AdminDashboard.jsx  (✨ BARU - halaman admin)

src/
  └── App.jsx  (DIUPDATE - tambah route /admin/dashboard)
```

---

## 🔧 Backend API Endpoints

Semua endpoint memerlukan authentication kecuali yang ditandai "Public".

### Publik (Tidak Perlu Login)
```
GET /api/documents                    📖 Lihat dokumen terpublikasi
GET /api/documents?category=peraturan Filter by kategori
GET /api/documents/{id}               Lihat detail dokumen
```

### User & Psikolog (Wajib Login)
```
POST /api/documents                   ⬆️ Upload dokumen baru
PUT /api/documents/{id}               ✏️ Edit dokumen (draft saja)
DELETE /api/documents/{id}            🗑️ Hapus dokumen
```

### Admin Saja
```
GET /api/documents/admin/pending      📋 Lihat dokumen pending
POST /api/documents/{id}/approve      ✅ Setujui dokumen
POST /api/documents/{id}/reject       ❌ Tolak dokumen
```

---

## 📋 API Request/Response Examples

### Menambah Dokumen (User/Psikolog)
```bash
curl -X POST http://localhost:8000/api/documents \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "UU ASN Terbaru",
    "category": "peraturan",
    "sub_category": "uu-perppu",
    "type": "pdf",
    "file": "https://drive.google.com/file/d/...",
    "cover": "https://example.com/cover.jpg",
    "description": "Undang-undang tentang ASN terbaru tahun 2023"
  }'
```

**Response:**
```json
{
  "message": "Document uploaded successfully. Waiting for admin approval.",
  "data": {
    "id": 1,
    "user_id": 5,
    "title": "UU ASN Terbaru",
    "category": "peraturan",
    "status": "draft",
    "created_at": "2026-03-03T13:33:10.000000Z"
  }
}
```

### Menyetujui Dokumen (Admin)
```bash
curl -X POST http://localhost:8000/api/documents/1/approve \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Menolak Dokumen (Admin)
```bash
curl -X POST http://localhost:8000/api/documents/1/reject \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "File tidak lengkap, mohon upload ulang"
  }'
```

---

## 🗄️ Database Schema

### Table: documents
```sql
CREATE TABLE documents (
  id BIGINT PRIMARY KEY,
  user_id BIGINT (foreign key ke users),
  title VARCHAR(255),
  category ENUM('peraturan', 'ebook', 'edukasi'),
  sub_category VARCHAR(255),
  cover VARCHAR(255) -- URL
  file VARCHAR(255) -- URL
  description TEXT,
  type ENUM('pdf', 'video', 'ebook', 'other'),
  video_url VARCHAR(255) -- URL YouTube embed
  status ENUM('draft', 'published', 'rejected'),
  rejection_reason TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

## 🎨 Frontend Usage

### 1. Menampilkan Dokumen
```jsx
import PustakaDokumenDynamic from "./components/PustakaDokumenDynamic";

<PustakaDokumenDynamic />
```

### 2. Admin Dashboard
```jsx
// Ke halaman: /admin/dashboard
// Hanya admin yang bisa akses
```

---

## ⚙️ Konfigurasi

### Pastikan .env Frontend Sudah Benar
```
VITE_API_URL=http://localhost:8000/api
```

### Backend .env
```
DB_DATABASE=klip
DB_USERNAME=root
DB_PASSWORD=
```

---

## 🚀 Cara Menggunakan

### 1️⃣ Setup Backend
```bash
cd backend
php artisan migrate
php artisan serve
```

### 2️⃣ Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3️⃣ User/Psikolog Upload Dokumen
1. Login sebagai user/psikolog
2. Ke halaman Home (Pustaka Dokumen)
3. Klik tombol "Tambah Dokumen"
4. Isi form dengan data dokumen
5. Klik "Unggah Dokumen"
6. Dokumen akan masuk status "draft" menunggu admin

### 4️⃣ Admin Approve/Reject
1. Login sebagai admin
2. Akses `/admin/dashboard`
3. Lihat daftar dokumen pending
4. Klik "Setujui" untuk publish
5. Atau klik "Tolak" untuk reject dengan alasan

---

## 📊 Status Dokumen

| Status    | Dilihat Oleh      | Keterangan |
|-----------|-------------------|------------------------------------------|
| draft     | Creator & Admin   | Baru upload, menunggu persetujuan |
| published | Semua orang      | Sudah disetujui, tampil di public |
| rejected  | Creator & Admin   | Ditolak, diberikan alasan penolakan |

---

## 🔐 Keamanan

- ✅ Nur user yang login bisa upload dokumen
- ✅ User hanya bisa edit/hapus dokumen miliknya
- ✅ Admin dapat approve/reject semua dokumen
- ✅ Validation di backend dan frontend
- ✅ Authorization checks pada setiap endpoint

---

## ⚠️ Catatan Penting

1. **File Storage**: Gunakan cloud storage (Google Drive, Dropbox) karena tidak ada file upload langsung ke server
2. **YouTube Embed**: Gunakan URL YouTube embed format: `https://www.youtube.com/embed/{video_id}`
3. **Refresh**: Dokumen yang baru disetujui mungkin perlu refresh halaman untuk muncul
4. **Draft**: Hanya dokumen dengan status "draft" yang bisa diedit

---

## 🐛 Troubleshooting

### Tombol Tambah Dokumen Tidak Muncul
- ✓ Pastikan sudah login
- ✓ Cek role user (user atau psikolog)
- ✓ Refresh halaman

### Dokumen Tidak Muncul di Public
- ✓ Admin belum approve dokumen
- ✓ Refresh halaman
- ✓ Cek status dokumen di admin panel

### Gagal Upload
- ✓ Pastikan token/login valid
- ✓ Cek URL file/video valid
- ✓ Lihat error message di console

---

## 📝 TODO Next (Opsional)

- [ ] Direct file upload ke server (bukan URL)
- [ ] Pagination untuk dokumen
- [ ] Search dokumen
- [ ] Rating/review dokumen
- [ ] Email notifikasi saat dokumen disetujui
- [ ] Bulk operations admin
- [ ] Document versioning
- [ ] Access analytics

---

## 📞 Support

Untuk pertanyaan atau issue, hubungi team development.

---

**Last Updated:** 3 Maret 2026
**Version:** 1.0.0 (Dynamic)
