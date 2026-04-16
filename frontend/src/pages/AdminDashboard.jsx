import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileBarChart2,
  ClipboardList,
  Users,
  MessageSquare,
  BookOpen,
  Image,
  ImagePlay,
  ArrowLeft,
  LayoutGrid,
  Sparkles,
  RefreshCw,
  Star,
  TrendingUp,
} from "lucide-react";
import api from "../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const emptyUserForm = {
    name: "",
    nip: "",
    email: "",
    no_wa: "",
    pangkat_golongan: "",
    jabatan: "",
    unit_kerja: "",
    eselon: "",
    instansi: "",
    daftar_sebagai: "User",
    organization_detail: "",
    password: "",
    password_confirmation: "",
  };

  const [view, setView] = useState("menu");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [users, setUsers] = useState([]);
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userError, setUserError] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [docForm, setDocForm] = useState({ title: "", category: "", sub_category: "", type: "pdf", url: "" });
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [docError, setDocError] = useState("");
  const [docSearchTerm, setDocSearchTerm] = useState("");
  const [docUploadFile, setDocUploadFile] = useState(null);
  const [editingDocId, setEditingDocId] = useState(null);
  const [docFormOpen, setDocFormOpen] = useState(false);
  const [registeredName, setRegisteredName] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [bannerForm, setBannerForm] = useState({ title: "", subtitle: "", order: 0, is_active: true });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerSubmitting, setBannerSubmitting] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [siteImages, setSiteImages] = useState({ konsultasi_image: null, produk_image: null });
  const [siteImageUploading, setSiteImageUploading] = useState({});
  const [siteImageError, setSiteImageError] = useState("");
  const [produkImages, setProdukImages] = useState({ produk_image_1: null, produk_image_2: null, produk_image_3: null, produk_image_4: null });
  const [produkImageUploading, setProdukImageUploading] = useState({});
  const [produkImageError, setProdukImageError] = useState("");
  const [produkImageFiles, setProdukImageFiles] = useState({});

  useEffect(() => {
    document.title = "Dashboard - KLIP";
    window.history.pushState(null, document.title, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, document.title, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    checkAdmin();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleViewChange = (newView) => {
    if (isTransitioning || newView === view) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setView(newView);
      setIsTransitioning(false);
    }, 100);
  };

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/user");
      const userData = response?.data?.user || response?.data;
      
      if (!userData) {
        navigate("/login");
        return;
      }

      // Check admin role using consistent logic with login
      const role = userData?.status_pengguna || userData?.daftar_sebagai;
      const normalizedRole = role ? (role.toLowerCase() === 'admin' ? 'Admin' : 'User') : 'User';
      
      if (normalizedRole !== 'Admin') {
        navigate("/dashboard");
        return;
      }

      setRegisteredName(userData.name || "Admin");
      fetchAdminData();
    } catch (error) {
      console.error("Admin check error:", error);
      navigate("/login");
    }
  };

  const fetchAdminData = async () => {
    setDataLoading(true);
    try {
      const [usersRes, consultationsRes, documentsRes, bannersRes, siteImagesRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/consultations"),
        api.get("/admin/documents"),
        api.get("/admin/banners"),
        api.get("/site-settings")
      ]);

      setUsers(usersRes.data?.users || []);
      setConsultations(consultationsRes.data?.consultations || []);
      setDocuments(documentsRes.data?.documents || []);
      setBanners(bannersRes.data?.banners || []);
      
      const siteData = siteImagesRes.data || {};
      setSiteImages({
        konsultasi_image: siteData.konsultasi_image || null,
        produk_image: siteData.produk_image || null
      });
      
      setProdukImages({
        produk_image_1: siteData.produk_image_1 || null,
        produk_image_2: siteData.produk_image_2 || null,
        produk_image_3: siteData.produk_image_3 || null,
        produk_image_4: siteData.produk_image_4 || null
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserSubmitting(true);
    setUserError("");

    try {
      if (editingUserId) {
        await api.put(`/admin/users/${editingUserId}`, userForm);
      } else {
        await api.post("/admin/users", userForm);
      }
      
      await fetchAdminData();
      resetUserForm();
      setUserFormOpen(false);
      setEditingUserId(null);
    } catch (error) {
      setUserError(error.response?.data?.message || "Gagal menyimpan user");
    } finally {
      setUserSubmitting(false);
    }
  };

  const resetUserForm = () => {
    setUserForm(emptyUserForm);
    setUserError("");
  };

  const openEditUser = (user) => {
    setUserForm({
      name: user.name || "",
      nip: user.nip || "",
      email: user.email || "",
      no_wa: user.no_wa || "",
      pangkat_golongan: user.pangkat_golongan || "",
      jabatan: user.jabatan || "",
      unit_kerja: user.unit_kerja || "",
      eselon: user.eselon || "",
      instansi: user.instansi || "",
      daftar_sebagai: user.daftar_sebagai || "User",
      organization_detail: user.organization_detail || "",
      password: "",
      password_confirmation: "",
    });
    setEditingUserId(user.id);
    setUserFormOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchAdminData();
    } catch (error) {
      alert("Gagal menghapus user");
    }
  };

  const handleDocFormChange = (e) => {
    const { name, value } = e.target;
    setDocForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    setDocSubmitting(true);
    setDocError("");

    try {
      const formData = new FormData();
      if (docUploadFile) {
        formData.append("file", docUploadFile);
      } else {
        formData.append("url", docForm.url);
      }
      formData.append("title", docForm.title);
      formData.append("category", docForm.category);
      formData.append("sub_category", docForm.sub_category);
      formData.append("type", docForm.type);

      if (editingDocId) {
        await api.post(`/admin/documents/${editingDocId}`, formData);
      } else {
        await api.post("/admin/documents", formData);
      }
      
      await fetchAdminData();
      resetDocForm();
      setDocFormOpen(false);
      setEditingDocId(null);
    } catch (error) {
      setDocError(error.response?.data?.message || "Gagal menyimpan dokumen");
    } finally {
      setDocSubmitting(false);
    }
  };

  const resetDocForm = () => {
    setDocForm({ title: "", category: "", sub_category: "", type: "pdf", url: "" });
    setDocUploadFile(null);
    setDocError("");
  };

  const openEditDoc = (doc) => {
    setDocForm({
      title: doc.title || "",
      category: doc.category || "",
      sub_category: doc.sub_category || "",
      type: doc.type || "pdf",
      url: doc.url || ""
    });
    setEditingDocId(doc.id);
    setDocFormOpen(true);
  };

  const handleDeleteDoc = async (docId) => {
    if (!confirm("Yakin ingin menghapus dokumen ini?")) return;
    
    try {
      await api.delete(`/admin/documents/${docId}`);
      await fetchAdminData();
    } catch (error) {
      alert("Gagal menghapus dokumen");
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    setBannerSubmitting(true);
    setBannerError("");

    try {
      const formData = new FormData();
      formData.append("title", bannerForm.title);
      formData.append("subtitle", bannerForm.subtitle);
      formData.append("order", bannerForm.order);
      formData.append("is_active", bannerForm.is_active);
      if (bannerFile) {
        formData.append("image", bannerFile);
      }

      if (editingBannerId) {
        await api.post(`/admin/banners/${editingBannerId}`, formData);
      } else {
        await api.post("/admin/banners", formData);
      }
      
      await fetchAdminData();
      resetBannerForm();
      setBannerFormOpen(false);
      setEditingBannerId(null);
    } catch (error) {
      setBannerError(error.response?.data?.message || "Gagal menyimpan banner");
    } finally {
      setBannerSubmitting(false);
    }
  };

  const resetBannerForm = () => {
    setBannerForm({ title: "", subtitle: "", order: 0, is_active: true });
    setBannerFile(null);
    setBannerError("");
  };

  const openEditBanner = (banner) => {
    setBannerForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      order: banner.order || 0,
      is_active: banner.is_active !== undefined ? banner.is_active : true
    });
    setEditingBannerId(banner.id);
    setBannerFormOpen(true);
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!confirm("Yakin ingin menghapus banner ini?")) return;
    
    try {
      await api.delete(`/admin/banners/${bannerId}`);
      await fetchAdminData();
    } catch (error) {
      alert("Gagal menghapus banner");
    }
  };

  const handleSiteImageUpload = async (key, file) => {
    if (!file) return;
    setSiteImageUploading((prev) => ({ ...prev, [key]: true }));
    setSiteImageError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post(`/admin/site-settings/${key}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSiteImages((prev) => ({ ...prev, [key]: res.data?.data?.url }));
    } catch (err) {
      setSiteImageError(err.response?.data?.message || err.response?.data?.error || "Gagal mengupload gambar.");
    } finally {
      setSiteImageUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleProdukImageFileChange = (key, file) => {
    setProdukImageFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleProdukImageUpload = async () => {
    const fd = new FormData();
    
    console.log('Files to upload:', produkImageFiles);
    
    Object.entries(produkImageFiles).forEach(([key, file]) => {
      if (file) {
        fd.append(key, file);
        console.log(`Appending ${key}:`, file.name, file.size, file.type);
      }
    });

    // Check if any files were added
    const hasFiles = Object.values(produkImageFiles).some(file => file !== null);
    if (!hasFiles) {
      setProdukImageError("Pilih setidaknya satu gambar untuk diupload.");
      return;
    }

    setProdukImageUploading({ all: true });
    setProdukImageError("");
    
    try {
      console.log('Sending request to /admin/produk-images');
      
      const res = await api.post("/admin/produk-images", fd, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      
      console.log('Upload response:', res.data);
      
      setProdukImages(prev => ({ ...prev, ...res.data.updated_images }));
      setProdukImageFiles({});
      setProdukImageError("");
      alert("Gambar produk berhasil diperbarui!");
    } catch (err) {
      console.error('Upload error:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.response?.data?.errors?.file?.[0] ||
                        "Gagal mengupload gambar produk.";
      
      setProdukImageError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setProdukImageUploading({ all: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg h-screen sticky top-0 border-r border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">Admin Panel</h1>
                <p className="text-xs text-gray-500">Patnal Integrity Hub</p>
              </div>
            </div>
            <nav className="pb-2">
              <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-blue-700 bg-blue-50 font-semibold border-l-4 border-blue-600 text-sm">
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                Dashboard
              </a>
              <a href="/admin/reports" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent">
                <FileBarChart2 className="w-4 h-4 flex-shrink-0" />
                Laporan
              </a>
              <a href="/admin/survey" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent">
                <Star className="w-4 h-4 flex-shrink-0" />
                Survey Kepuasan
              </a>
              <div className="mx-4 my-2 border-t border-gray-100" />
              <a href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 transition text-sm border-l-4 border-transparent">
                <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                Dashboard Pengguna
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Welcome + Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-5 text-white shadow-lg flex-1">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 right-10 w-20 h-20 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs text-blue-100">
                    {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Halo, {registeredName}! </h2>
                <p className="text-blue-100 text-xs mt-1">Pusat data master dan monitoring operasional admin.</p>
              </div>
            </div>
            <button
              onClick={fetchAdminData}
              disabled={dataLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-sm text-sm font-medium transition"
            >
              <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`} />
              {dataLoading ? "Memuat..." : "Refresh"}
            </button>
          </div>

          {view === "menu" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Monitoring Konsultasi */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("consultation"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                  <ClipboardList className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Monitoring Konsultasi</p>
                <p className="text-xs text-gray-500 mb-3">Lihat semua sesi konsultasi yang aktif.</p>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">Total: {consultations.length} sesi</span>
              </button>

              {/* Manajemen User */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("users"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3 group-hover:bg-green-600 transition-colors">
                  <Users className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Manajemen User</p>
                <p className="text-xs text-gray-500 mb-3">Tambah, edit, dan hapus user.</p>
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">Total: {users.length} user</span>
              </button>

              {/* Manajemen Dokumen */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("documents"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3 group-hover:bg-orange-600 transition-colors">
                  <BookOpen className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Manajemen Dokumen</p>
                <p className="text-xs text-gray-500 mb-3">Upload dan kelola dokumen PDF.</p>
                <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium">Total: {documents.length} dokumen</span>
              </button>

              {/* Survey Kepuasan */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("survey"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                  <Star className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Survey Kepuasan</p>
                <p className="text-xs text-gray-500 mb-3">Lihat hasil dan analisis survey kepuasan pengguna.</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">Analytics</span>
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">Export</span>
                </div>
              </button>

              
              {/* Gambar Produk */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("produk_images"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-3 group-hover:bg-indigo-600 transition-colors">
                  <Image className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Kelola Gambar Produk</p>
                <p className="text-xs text-gray-500 mb-3">Upload dan atur 4 gambar produk Patnal.</p>
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">4 Images</span>
              </button>

              {/* Gambar Halaman */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("site_images"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-pink-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center mb-3 group-hover:bg-pink-600 transition-colors">
                  <Image className="w-5 h-5 text-pink-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Kelola Gambar Halaman</p>
                <p className="text-xs text-gray-500">Ganti gambar ilustrasi pada halaman Beranda.</p>
              </button>
            </div>
          )}

          {/* VIEWS */}
          {view === "consultation" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                  Monitoring Konsultasi
                </h2>
                <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              </div>

              {consultations.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600 text-sm">
                  Belum ada data konsultasi untuk ditampilkan.
                </div>
              ) : (
                <div className="space-y-3">
                  {consultations.slice(0, 20).map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.user?.name || "Anonymous"}</p>
                          <p className="text-sm text-gray-500">{item.created_at}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          item.status === "active"
                            ? "bg-green-100 text-green-700"
                            : item.status === "ended"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === "users" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Manajemen User
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { resetUserForm(); setUserFormOpen(true); }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    + Tambah User
                  </button>
                  <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>
                </div>
              </div>

              {users.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600 text-sm">
                  Belum ada user terdaftar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Nama</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Role</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                          <td className="px-4 py-3 text-gray-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              user.status_approval === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {user.status_approval || "pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditUser(user)}
                                className="px-3 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-3 py-1 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* User Form Modal */}
              {userFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800">
                        {editingUserId ? "Edit User" : "Tambah User Baru"}
                      </h3>
                    </div>

                    <form id="user-form" onSubmit={handleUserSubmit} className="px-6 py-4 space-y-4">
                      {/* Basic Info */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Informasi Dasar</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="name"
                              value={userForm.name}
                              onChange={handleUserFormChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">NIP <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="nip"
                              value={userForm.nip}
                              onChange={handleUserFormChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                          <input
                            type="email"
                            name="email"
                            value={userForm.email}
                            onChange={handleUserFormChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                          <input
                            type="text"
                            name="no_wa"
                            value={userForm.no_wa}
                            onChange={handleUserFormChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Organization */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Organisasi</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Daftar Sebagai <span className="text-red-500">*</span></label>
                            <select
                              name="daftar_sebagai"
                              value={userForm.daftar_sebagai}
                              onChange={handleUserFormChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="User">User</option>
                              <option value="Psikolog">Psikolog</option>
                              <option value="Admin">Admin</option>
                              <option value="Kanwil">Kanwil</option>
                              <option value="UPT">UPT</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                            <select
                              name="role"
                              value={userForm.role}
                              onChange={handleUserFormChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="user">User</option>
                              <option value="psikolog">Psikolog</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Password {editingUserId && <span className="text-gray-400 normal-case font-normal">(kosongkan jika tidak ingin mengubah)</span>}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Password {!editingUserId && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="password"
                              name="password"
                              value={userForm.password}
                              onChange={handleUserFormChange}
                              placeholder="Minimal 8 karakter"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                            <input
                              type="password"
                              name="password_confirmation"
                              value={userForm.password_confirmation}
                              onChange={handleUserFormChange}
                              placeholder="Ulangi password"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </form>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                      <button
                        type="button"
                        onClick={() => { setUserFormOpen(false); resetUserForm(); }}
                        className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white hover:shadow-sm transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        form="user-form"
                        disabled={userSubmitting}
                        className={`px-5 py-2 rounded-lg text-sm text-white font-medium transition-all disabled:opacity-50 ${
                          editingUserId ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-500 hover:bg-orange-600"
                        }`}
                      >
                        {userSubmitting ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Menyimpan...
                          </span>
                        ) : (
                          editingUserId ? "Simpan Perubahan" : "Buat Akun"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "documents" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                  Manajemen Dokumen
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { resetDocForm(); setDocFormOpen(true); }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                  >
                    + Tambah Dokumen
                  </button>
                  <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Cari dokumen..."
                  value={docSearchTerm}
                  onChange={(e) => setDocSearchTerm(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {documents.filter((d) =>
                d.title?.toLowerCase().includes(docSearchTerm.toLowerCase())
              ).length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600 text-sm">
                  Belum ada dokumen
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Judul</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Kategori</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Sub Kategori</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Tipe</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents
                        .filter((d) =>
                          d.title?.toLowerCase().includes(docSearchTerm.toLowerCase())
                        )
                        .map((doc) => (
                          <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{doc.title}</td>
                            <td className="px-4 py-3 text-gray-600 capitalize">{doc.category}</td>
                            <td className="px-4 py-3 text-gray-600">{doc.sub_category}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                doc.type === "video"
                                  ? "bg-blue-100 text-blue-700"
                                  : doc.type === "pdf"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                                {doc.type?.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditDoc(doc)}
                                  className="px-3 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteDoc(doc.id)}
                                  className="px-3 py-1 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Document Form Modal */}
              {docFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800">
                        {editingDocId ? "Edit Dokumen" : "Tambah Dokumen Baru"}
                      </h3>
                    </div>

                    <form id="doc-form" onSubmit={handleDocSubmit} className="px-6 py-4 space-y-4">
                      {/* Type Selection */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tipe Dokumen</p>
                        <div className="grid grid-cols-3 gap-3">
                          {["pdf", "video", "ebook", "other"].map((type) => (
                            <label key={type} className="flex items-center">
                              <input
                                type="radio"
                                name="type"
                                value={type}
                                checked={docForm.type === type}
                                onChange={handleDocFormChange}
                                className="mr-2"
                              />
                              <span className="text-sm capitalize">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-100" />

                      {/* Category Selection */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Kategori</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Utama <span className="text-red-500">*</span></label>
                            <select
                              name="category"
                              value={docForm.category}
                              onChange={handleDocFormChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="peraturan">Himpunan Peraturan</option>
                              <option value="ebook">Standar Operasional</option>
                              <option value="edukasi">Edukasi</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Kategori <span className="text-red-500">*</span></label>
                            <select
                              name="sub_category"
                              value={docForm.sub_category}
                              onChange={handleDocFormChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="">-- Pilih Sub Kategori --</option>
                              <option value="sub1">Sub Kategori 1</option>
                              <option value="sub2">Sub Kategori 2</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100" />

                      {/* Content */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Konten</p>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Dokumen <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="title"
                              value={docForm.title}
                              onChange={handleDocFormChange}
                              placeholder="Masukkan judul dokumen..."
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              required
                            />
                          </div>

                          {(docForm.type === "pdf" || docForm.type === "ebook" || docForm.type === "other") && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                File Dokumen <span className="text-red-500">*</span>
                              </label>
                              <div className="space-y-2">
                                <div
                                  className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-orange-400 transition-colors"
                                  onClick={() => document.getElementById("doc-file-input").click()}
                                >
                                  {docUploadFile ? (
                                    <div className="text-green-600 font-medium">{docUploadFile.name}</div>
                                  ) : (
                                    <div className="text-gray-500">
                                      <div className="text-2xl mb-1">+</div>
                                      <div className="text-sm">Klik untuk upload file</div>
                                    </div>
                                  )}
                                </div>
                                <input
                                  id="doc-file-input"
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => setDocUploadFile(e.target.files[0])}
                                  className="hidden"
                                />
                              </div>
                            </div>
                          )}

                          {docForm.type === "video" && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">URL Video <span className="text-red-500">*</span></label>
                              <input
                                type="url"
                                name="url"
                                value={docForm.url}
                                onChange={handleDocFormChange}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </form>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                      <button
                        type="button"
                        onClick={() => { setDocFormOpen(false); resetDocForm(); }}
                        className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white hover:shadow-sm transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        form="doc-form"
                        disabled={docSubmitting}
                        className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {docSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Menyimpan...
                          </>
                        ) : (
                          editingDocId ? "Simpan Perubahan" : "Tambah Dokumen"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "site_images" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Image className="w-5 h-5 text-pink-600" />
                  Kelola Gambar Halaman
                </h2>
                <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Konsultasi Image */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Gambar Halaman Konsultasi</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {siteImages.konsultasi_image ? (
                      <img
                        src={`http://localhost:8000/${siteImages.konsultasi_image}`}
                        alt="Konsultasi"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <Image className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSiteImageUpload("konsultasi_image", e.target.files[0])}
                      className="hidden"
                      id="konsultasi-image-input"
                    />
                    <button
                      onClick={() => document.getElementById("konsultasi-image-input").click()}
                      disabled={siteImageUploading.konsultasi_image}
                      className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {siteImageUploading.konsultasi_image ? "Mengupload..." : "Ganti Gambar"}
                    </button>
                  </div>
                </div>

                {/* Produk Image */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Gambar Halaman Produk</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {siteImages.produk_image ? (
                      <img
                        src={`http://localhost:8000/${siteImages.produk_image}`}
                        alt="Produk"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <Image className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSiteImageUpload("produk_image", e.target.files[0])}
                      className="hidden"
                      id="produk-image-input"
                    />
                    <button
                      onClick={() => document.getElementById("produk-image-input").click()}
                      disabled={siteImageUploading.produk_image}
                      className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {siteImageUploading.produk_image ? "Mengupload..." : "Ganti Gambar"}
                    </button>
                  </div>
                </div>
              </div>

              {siteImageError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{siteImageError}</p>
                </div>
              )}
            </div>
          )}

          {view === "produk_images" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Image className="w-5 h-5 text-indigo-600" />
                  Kelola Gambar Produk
                </h2>
                <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              </div>

              <div className="space-y-6">
                {/* Current Images Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Gambar Produk Saat Ini</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                          {produkImages[`produk_image_${num}`] ? (
                            <img
                              src={`http://localhost:8000/${produkImages[`produk_image_${num}`]}`}
                              alt={`Produk Image ${num}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Image className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <span className="text-sm font-medium text-gray-700">Produk {num}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Gambar Produk Baru</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Produk {num}
                        </label>
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                          onClick={() => document.getElementById(`produk-image-${num}`).click()}
                        >
                          {produkImageFiles[`produk_image_${num}`] ? (
                            <div className="space-y-2">
                              <div className="text-green-600 font-medium">
                                {produkImageFiles[`produk_image_${num}`].name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(produkImageFiles[`produk_image_${num}`].size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Image className="w-8 h-8 mx-auto text-gray-400" />
                              <div className="text-sm text-gray-600">Klik untuk upload</div>
                              <div className="text-xs text-gray-500">JPG, PNG, GIF (Max 2MB)</div>
                            </div>
                          )}
                        </div>
                        <input
                          id={`produk-image-${num}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleProdukImageFileChange(`produk_image_${num}`, e.target.files[0])}
                          className="hidden"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {produkImageError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{produkImageError}</p>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleProdukImageUpload}
                    disabled={produkImageUploading.all}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {produkImageUploading.all ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4" />
                        Upload Gambar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === "survey" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-600" />
                  Survey Kepuasan
                </h2>
                <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              </div>

              <div className="space-y-6">
                {/* Survey Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Total Survey</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">0</p>
                    <p className="text-sm text-blue-600">Respons</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">Kepuasan</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-900">0%</p>
                    <p className="text-sm text-green-600">Rata-rata</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <LayoutGrid className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Bulan Ini</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">0</p>
                    <p className="text-sm text-purple-600">Survey</p>
                  </div>
                </div>

                {/* Survey Actions */}
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    <FileBarChart2 className="w-4 h-4 inline mr-2" />
                    Lihat Laporan
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Refresh Data
                  </button>
                </div>

                {/* Placeholder untuk data survey */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600 text-sm">
                  <Star className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium text-gray-700 mb-1">Data Survey Kepuasan</p>
                  <p>Fitur analisis survey kepuasan akan segera tersedia.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
