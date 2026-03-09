# 🚀 Quick Start Guide - Sistem Dokumen Dinamis

## 📋 Checklist Setup

- [x] Database migration created dan dijalankan
- [x] Document model dibuat dengan relationships
- [x] DocumentController API dibuat lengkap
- [x] API routes ditambahkan ke api.php
- [x] Frontend components (PustakaDokumenDynamic, DocumentForm)
- [x] AdminDocumentPanel dibuat
- [x] AdminDashboard page dibuat
- [x] Routes ditambahkan ke App.jsx

---

## 🔴 PENTING: Langkah-Langkah Pertama

### 1. Backend sudah siap digunakan
✅ Database table `documents` sudah dibuat
✅ API endpoints sudah aktif
✅ Validasi sudah implemented

**Test API** (tanpa token terlebih dahulu):
```bash
# Test GET published documents
curl http://localhost:8000/api/documents
```

### 2. Frontend sudah siap digunakan
✅ Component PustakaDokumenDynamic sudah menggantikan PustakaDokumen di Home
✅ DocumentForm sudah integrated
✅ AdminDashboard sudah siap diakses

**URLs yang tersedia:**
- `/` = Home (dengan Pustaka Dokumen Dinamis)
- `/admin/dashboard` = Admin Panel (hanya untuk admin)

---

## 🎭 Testing Workflow

### Scenario 1: User Upload Dokumen
```
1. Login sebagai user (bukan admin)
   - Email: user@example.com
   - Password: password

2. Ke halaman Home (/)
   - Scroll ke "Pustaka Dokumen"
   - Klik tombol "Tambah Dokumen"

3. Isi form:
   - Judul: "Test Document"
   - Tipe: PDF
   - Kategori: Peraturan
   - Sub Kategori: Permen
   - File URL: https://drive.google.com/file/d/.../view?usp=sharing
   - Klik "Unggah Dokumen"

4. Dokumen masuk status "Draft"
   (Hanya owner & admin bisa melihat)
```

### Scenario 2: Admin Approve Dokumen
```
1. Login sebagai admin

2. Ke /admin/dashboard
   - Lihat daftar dokumen pending

3. Klik "Setujui" 
   - Dokumen berubah status menjadi "published"
   - Dokumen muncul di public pada kategorinya

Atau klik "Tolak" jika ada kesalahan
```

### Scenario 3: Public Lihat Dokumen
```
1. Tidak perlu login
2. Ke halaman Home (/)
3. Scroll ke "Pustaka Dokumen"
4. Buka kategori, klik dokumen untuk download/buka
```

---

## 📝 Catatan Implementasi

### Fitur yang Implemented ✅
- [x] Dynamic fetch dokumen dari database
- [x] User bisa upload dokumen (tunggu approval)
- [x] Admin bisa approve/reject
- [x] Role-based access control
- [x] Form validation
- [x] Error handling
- [x] Loading states
- [x] Success messages

### Fitur yang TIDAK Diimplementasi (Opsional)
- [ ] Direct file upload ke server (masih URL-based)
- [ ] Document revision history
- [ ] Bulk operations
- [ ] Advanced search/filter
- [ ] Email notifications

---

## 🔑 User Roles & Permissions

| Fitur | Public | User | Psikolog | Admin |
|-------|--------|------|----------|-------|
| Lihat dokumen published | ✅ | ✅ | ✅ | ✅ |
| Upload dokumen | ❌ | ✅ | ✅ | ✅ |
| Edit dokumen milik sendiri | ❌ | ✅ | ✅ | ✅ |
| Hapus dokumen milik sendiri | ❌ | ✅ | ✅ | ✅ |
| Lihat dokumen draft milik sendiri | ❌ | ✅ | ✅ | ✅ |
| Approve dokumen | ❌ | ❌ | ❌ | ✅ |
| Reject dokumen | ❌ | ❌ | ❌ | ✅ |
| Lihat panel admin | ❌ | ❌ | ❌ | ✅ |

---

## 📊 Database Fields

### Documents Table
```
id                (int) - Primary key
user_id           (int) - Foreign key ke users
title             (string) - Judul dokumen
category          (enum) - peraturan/ebook/edukasi
sub_category      (string) - Kategori detail
cover             (string) - URL gambar cover
file              (string) - URL file (pdf/ebook)
description       (text) - Deskripsi dokumen
type              (enum) - pdf/video/ebook/other
video_url         (string) - URL embed YouTube
status            (enum) - draft/published/rejected
rejection_reason  (text) - Alasan jika di-reject
created_at        (timestamp)
updated_at        (timestamp)
```

---

## 🐞 Debugging

### Cek Console Browser (F12)
- Buka Network tab untuk lihat request/response
- Lihat Console tab untuk error JavaScript

### Cek Terminal Backend
- Lihat Laravel error log di `storage/logs/laravel.log`

### Test API dengan Postman/Insomnia
```
GET http://localhost:8000/api/documents
Authorization: Bearer {token}
```

---

## 📞 Environment Variables

**Frontend** (`.env` atau di `vite.config.js`):
```
VITE_API_URL=http://localhost:8000/api
```

**Backend** (`.env`):
```
DB_CONNECTION=mysql
DB_DATABASE=klip
DB_USERNAME=root
DB_PASSWORD=
```

---

## ✅ Verifikasi Instalasi

Run these commands untuk memastikan semuanya bekerja:

### Backend
```bash
cd backend

# Check routes
php artisan route:list | grep documents

# Check migrations
php artisan migrate:status

# Test model
php artisan tinker
> App\Models\Document::first();
> exit
```

### Frontend
```bash
cd frontend

# Check imports
grep -r "PustakaDokumenDynamic" src

# Start dev server
npm run dev
```

---

## 🎯 Next Steps

1. **Test workflow di atas**
2. **Buat test data** melalui API
3. **Adjust styling** sesuai design
4. **Add more features** dari TODO list
5. **Deploy ke production**

---

## 💡 Tips

- Gunakan Google Drive link shareable untuk test
- Format URL YouTube: `https://www.youtube.com/embed/{VIDEO_ID}`
- Token disimpan di localStorage sebagai `auth_token`
- Dokumentasi API ada di `DOKUMENTASI_DOKUMEN_DINAMIS.md`

---

**Status:** ✅ Ready for Testing
**Last Updated:** 3 Maret 2026
