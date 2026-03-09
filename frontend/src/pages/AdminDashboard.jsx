import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import UserDropdownMenu from "../components/UserDropdownMenu";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const emptyUserForm = {
    name: "",
    nip: "",
    email: "",
    no_wa: "",
    daftar_sebagai: "",
    organization_detail: "",
    status_pengguna: "User",
    password: "",
    password_confirmation: "",
  };

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [view, setView] = useState("menu");
  const [consultations, setConsultations] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatStats, setChatStats] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userError, setUserError] = useState("");
  const [userForm, setUserForm] = useState(emptyUserForm);

  useEffect(() => {
    document.title = "Dashboard - KLIP";
    checkAdmin();
  }, []);

  const isAdminUser = (userData) => {
    const role = (userData?.status_pengguna || "").toLowerCase();
    const legacyRole = (userData?.daftar_sebagai || "").toLowerCase();
    return role === "admin" || legacyRole === "admin";
  };

  const fetchAdminData = async () => {
    try {
      setDataLoading(true);
      const [consultationsRes, usersRes, chatStatsRes] = await Promise.allSettled([
        api.get("/api/consultations"),
        api.get("/api/admin/users"),
        api.get("/api/chat/stats"),
      ]);
      setConsultations(
        consultationsRes.status === "fulfilled" ? consultationsRes.value.data : []
      );
      setUsers(
        usersRes.status === "fulfilled" ? usersRes.value.data : []
      );
      setChatStats(
        chatStatsRes.status === "fulfilled" ? chatStatsRes.value.data : null
      );
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/api/user");
      const userData = response?.data?.user || response?.data;

      if (!isAdminUser(userData)) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setUser(userData);
      await fetchAdminData();
    } catch (error) {
      console.error("Error checking admin:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/login");
      } else {
        navigate("/");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
      navigate("/login");
    }
  };

  const resetUserForm = () => {
    setUserForm(emptyUserForm);
    setEditingUserId(null);
    setUserError("");
  };

  const openCreateUserForm = () => {
    resetUserForm();
    setUserFormOpen(true);
  };

  const openEditUserForm = (selectedUser) => {
    setEditingUserId(selectedUser.id);
    setUserForm({
      name: selectedUser.name || "",
      nip: selectedUser.nip || "",
      email: selectedUser.email || "",
      no_wa: selectedUser.no_wa || "",
      daftar_sebagai: selectedUser.daftar_sebagai || "",
      organization_detail: selectedUser.organization_detail || "",
      status_pengguna: selectedUser.status_pengguna || "User",
      password: "",
      password_confirmation: "",
    });
    setUserError("");
    setUserFormOpen(true);
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserError("");

    if (!editingUserId && !userForm.password) {
      setUserError("Password wajib diisi saat menambah user.");
      return;
    }

    if (userForm.password && userForm.password !== userForm.password_confirmation) {
      setUserError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      setUserSubmitting(true);

      const payload = {
        name: userForm.name,
        nip: userForm.nip,
        email: userForm.email,
        no_wa: userForm.no_wa,
        daftar_sebagai: userForm.daftar_sebagai,
        organization_detail: userForm.organization_detail,
        status_pengguna: userForm.status_pengguna,
      };

      if (userForm.password) {
        payload.password = userForm.password;
        payload.password_confirmation = userForm.password_confirmation;
      }

      if (editingUserId) {
        await api.put(`/api/admin/users/${editingUserId}`, payload);
      } else {
        await api.post("/api/admin/users", payload);
      }

      setUserFormOpen(false);
      resetUserForm();
      await fetchAdminData();
      setView("users");
    } catch (error) {
      setUserError(
        error?.response?.data?.message ||
        error?.response?.data?.errors?.email?.[0] ||
        error?.response?.data?.errors?.nip?.[0] ||
        "Gagal menyimpan data user"
      );
    } finally {
      setUserSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;

    try {
      await api.delete(`/api/admin/users/${userId}`);
      await fetchAdminData();
    } catch (error) {
      alert(error?.response?.data?.message || "Gagal menghapus user");
    }
  };

  const consultationStats = useMemo(() => {
    return {
      pending: consultations.filter((item) => item.status === "pending").length,
      inProgress: consultations.filter((item) => item.status === "in_progress" || item.status === "reviewed").length,
      needsReferral: consultations.filter((item) => item.status === "needs_referral").length,
      completed: consultations.filter((item) => item.status === "completed").length,
    };
  }, [consultations]);


  const USERS_PER_PAGE = 10;

  const filteredUsers = useMemo(() => {
    const keyword = userSearchTerm.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((item) => {
      const combined = [
        item.name,
        item.nip,
        item.email,
        item.status_pengguna,
        item.daftar_sebagai,
        item.organization_detail,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return combined.includes(keyword);
    });
  }, [users, userSearchTerm]);

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));

  const paginatedUsers = useMemo(() => {
    const start = (usersCurrentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, usersCurrentPage]);

  useEffect(() => {
    setUsersCurrentPage(1);
  }, [userSearchTerm, users.length]);

  const registeredName = (user?.name || user?.nama || "").trim() || "Teman";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-600 max-w-xl w-full">
          Data admin tidak ditemukan atau akses tidak valid.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img
              src="/Logo.png"
              alt="Patnal Integrity Hub"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </a>
          <div className="flex items-center space-x-4">
            <UserDropdownMenu user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <nav className="py-2">
                <a href="/admin/dashboard" className="block px-4 py-3 text-blue-600 bg-blue-50 font-medium border-l-4 border-blue-600">
                  Dashboard
                </a>
                <a href="/admin/reports" className="block px-4 py-3 text-gray-700 hover:bg-gray-50">
                  Laporan
                </a>
              </nav>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                  <p className="text-sm text-gray-600 mt-1">Pusat data master dan monitoring operasional admin.</p>
                </div>
                <button
                  onClick={fetchAdminData}
                  disabled={dataLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {dataLoading ? "Memuat..." : "Refresh Data"}
                </button>
              </div>

              <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                  Halo, {registeredName}. Bagaimana harimu?
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Semoga sehat selalu yaa!
                </p>
              </div>

              {view === "menu" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setView("consultation")}
                    className="text-left border border-purple-200 bg-purple-50 rounded-lg p-5 hover:bg-purple-100 transition-colors"
                  >
                    <p className="text-lg font-semibold text-purple-700 mb-1">Monitoring Konsultasi</p>
                    <p className="text-sm text-gray-600">Pantau status konsultasi klien secara menyeluruh.</p>
                    <p className="mt-3 text-sm font-semibold text-purple-700">
                      Tunggu: {consultationStats.pending} | Diproses: {consultationStats.inProgress} | Perlu Rujukan: {consultationStats.needsReferral} | Selesai: {consultationStats.completed}
                    </p>
                  </button>

                  <button
                    onClick={() => setView("users")}
                    className="text-left border border-orange-200 bg-orange-50 rounded-lg p-5 hover:bg-orange-100 transition-colors"
                  >
                    <p className="text-lg font-semibold text-orange-700 mb-1">Management Users</p>
                    <p className="text-sm text-gray-600">Tambah, ubah, dan hapus data user dari dashboard admin.</p>
                    <p className="mt-3 text-sm font-semibold text-orange-700">Total User: {users.length}</p>
                  </button>

                  <button
                    onClick={() => setView("chat")}
                    className="text-left border border-indigo-200 bg-indigo-50 rounded-lg p-5 hover:bg-indigo-100 transition-colors"
                  >
                    <p className="text-lg font-semibold text-indigo-700 mb-1">Monitoring Chat</p>
                    <p className="text-sm text-gray-600">Pantau sesi chat aktif yang sedang dikerjakan psikolog.</p>
                    <p className="mt-3 text-sm font-semibold text-indigo-700">
                      Chat Aktif: {chatStats?.active_total ?? "…"} | Selesai: {chatStats?.completed_total ?? "…"}
                    </p>
                  </button>

                  <a
                    href="/admin/reports"
                    className="text-left border border-teal-200 bg-teal-50 rounded-lg p-5 hover:bg-teal-100 transition-colors"
                  >
                    <p className="text-lg font-semibold text-teal-700 mb-1">Laporan Harian/Bulanan/Tahunan</p>
                    <p className="text-sm text-gray-600">Buka halaman laporan terpisah untuk melihat tren konsultasi.</p>
                    <p className="mt-3 text-sm font-semibold text-teal-700">Total Laporan: {consultations.length}</p>
                  </a>

                  <a
                    href="/dashboard"
                    className="text-left border border-gray-200 bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-lg font-semibold text-gray-800 mb-1">Kembali ke Dashboard Pengguna</p>
                    <p className="text-sm text-gray-600">Buka tampilan dashboard standar pengguna.</p>
                  </a>
                </div>
              )}

              {view === "consultation" && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Monitoring Konsultasi</h2>
                    <button onClick={() => setView("menu")} className="text-sm text-gray-600 hover:underline">
                      Kembali
                    </button>
                  </div>

                  {consultations.length === 0 ? (
                    <p className="text-sm text-gray-600">Belum ada data konsultasi untuk ditampilkan.</p>
                  ) : (
                    <div className="space-y-3">
                      {consultations.slice(0, 20).map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-800">Konsultasi #{item.id}</p>
                              <p className="text-xs text-gray-500">Klien: {item.user?.name || "-"}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : item.status === "in_progress" || item.status === "reviewed"
                                  ? "bg-blue-100 text-blue-800"
                                  : item.status === "needs_referral"
                                    ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {item.status === "pending"
                                ? "Tunggu"
                                : item.status === "in_progress" || item.status === "reviewed"
                                  ? "Diproses"
                                  : item.status === "needs_referral"
                                    ? "Perlu Rujukan"
                                    : item.status === "completed"
                                      ? "Selesai"
                                      : item.status || "Tunggu"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.q3}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {view === "chat" && (
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Monitoring Chat</h2>
                    <button onClick={() => setView("menu")} className="text-sm text-gray-600 hover:underline">
                      Kembali
                    </button>
                  </div>

                  {/* Summary cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-indigo-700">{chatStats?.active_total ?? "…"}</p>
                      <p className="text-sm text-indigo-600 mt-1">Chat Aktif</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-green-700">{chatStats?.completed_total ?? "…"}</p>
                      <p className="text-sm text-green-600 mt-1">Chat Selesai</p>
                    </div>
                  </div>

                  {/* Per psikolog table */}
                  <h3 className="text-base font-semibold text-gray-700 mb-3">Chat Aktif per Psikolog</h3>
                  {!chatStats ? (
                    <p className="text-sm text-gray-500">Memuat data…</p>
                  ) : chatStats.per_psikolog.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500 text-sm">
                      Tidak ada sesi chat aktif saat ini.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chatStats.per_psikolog.map((item) => (
                        <div
                          key={item.psikolog_id}
                          className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                              {item.psikolog_name.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-medium text-gray-800">{item.psikolog_name}</p>
                          </div>
                          <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-0.5 rounded-full">
                            {item.active_chats} sesi aktif
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {view === "users" && (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-gray-800">Management Users</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={openCreateUserForm}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Tambah User
                      </button>
                      <button onClick={() => setView("menu")} className="text-sm text-gray-600 hover:underline">
                        Kembali
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      placeholder="Cari nama, NIP, email, role..."
                      className="w-full md:max-w-md border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <p className="text-sm text-gray-600">
                      Menampilkan {paginatedUsers.length} dari {filteredUsers.length} user
                    </p>
                  </div>

                  {filteredUsers.length === 0 ? (
                    <p className="text-sm text-gray-600">Belum ada user untuk ditampilkan.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-3 font-semibold text-gray-700">Nama</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-700">NIP</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-700">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedUsers.map((item) => (
                              <tr key={item.id} className="border-t border-gray-100">
                                <td className="px-4 py-3 text-gray-800">{item.name}</td>
                                <td className="px-4 py-3 text-gray-600">{item.nip || "-"}</td>
                                <td className="px-4 py-3 text-gray-600">{item.email}</td>
                                <td className="px-4 py-3 text-gray-600">{item.status_pengguna || "-"}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => openEditUserForm(item)}
                                      className="text-blue-600 hover:underline"
                                    >
                                      Ubah
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(item.id)}
                                      className="text-red-600 hover:underline"
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

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Halaman {usersCurrentPage} dari {totalUserPages}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setUsersCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={usersCurrentPage === 1}
                            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-50"
                          >
                            Sebelumnya
                          </button>
                          <button
                            type="button"
                            onClick={() => setUsersCurrentPage((prev) => Math.min(totalUserPages, prev + 1))}
                            disabled={usersCurrentPage === totalUserPages}
                            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-50"
                          >
                            Berikutnya
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {userFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingUserId ? "Ubah User" : "Tambah User"}
            </h3>

            {userError && (
              <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
                {userError}
              </div>
            )}

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input name="name" value={userForm.name} onChange={handleUserFormChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                  <input name="nip" value={userForm.nip} onChange={handleUserFormChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={userForm.email} onChange={handleUserFormChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No WhatsApp</label>
                  <input name="no_wa" value={userForm.no_wa} onChange={handleUserFormChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select name="status_pengguna" value={userForm.status_pengguna} onChange={handleUserFormChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="User">User</option>
                    <option value="Psikolog">Psikolog</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daftar Sebagai</label>
                  <input name="daftar_sebagai" value={userForm.daftar_sebagai} onChange={handleUserFormChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detail Organisasi</label>
                <input name="organization_detail" value={userForm.organization_detail} onChange={handleUserFormChange} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editingUserId ? "(opsional)" : ""}
                  </label>
                  <input type="password" name="password" value={userForm.password} onChange={handleUserFormChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                  <input type="password" name="password_confirmation" value={userForm.password_confirmation} onChange={handleUserFormChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUserFormOpen(false);
                    resetUserForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={userSubmitting}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {userSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
