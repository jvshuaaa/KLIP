import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import UserDropdownMenu from '../components/UserDropdownMenu';

export default function Consultation() {
  const navigate = useNavigate();
  const [view, setView] = useState('menu'); // menu | history | choose_psikolog | create
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false);
  const [followUpForm, setFollowUpForm] = useState({
    status: 'in_progress',
    notes: '',
  });
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const isPsikolog = user?.status_pengguna === 'Psikolog';
  const isAdmin = user?.status_pengguna === 'Admin';
  const canExport = isPsikolog || isAdmin;
  const [locationTypeFilter, setLocationTypeFilter] = useState('all');
  const [locationDetailFilter, setLocationDetailFilter] = useState('all');
  const [psychologists, setPsychologists] = useState([]);
  const [psychologistsLoading, setPsychologistsLoading] = useState(false);
  const [selectedPsychologistId, setSelectedPsychologistId] = useState(null);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [markingCompleted, setMarkingCompleted] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);

  const [form, setForm] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: '',
  });

  const selectedPsychologist = useMemo(
    () => psychologists.find((item) => item.id === selectedPsychologistId) || null,
    [psychologists, selectedPsychologistId]
  );

  const normalizeCaseStatus = (status) => {
    if (status === 'reviewed') return 'in_progress';
    return status || 'pending';
  };

  const getStatusLabel = (status) => {
    const normalizedStatus = normalizeCaseStatus(status);
    if (normalizedStatus === 'completed') return 'Selesai';
    if (normalizedStatus === 'in_progress') return 'Diproses';
    if (normalizedStatus === 'needs_referral') return 'Perlu Rujukan';
    return 'Tunggu';
  };

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = normalizeCaseStatus(status);
    if (normalizedStatus === 'completed') return 'bg-green-100 text-green-800';
    if (normalizedStatus === 'in_progress') return 'bg-blue-100 text-blue-800';
    if (normalizedStatus === 'needs_referral') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const normalizeLocationType = (value) => {
    const normalized = (value || '').toLowerCase();
    if (!normalized) return 'unknown';
    if (normalized === 'upt' || normalized === 'kanwil' || normalized === 'ditjenpas') {
      return normalized;
    }
    return 'other';
  };

  const getLocationLabel = (consultation) => {
    const locationType = normalizeLocationType(consultation?.user?.daftar_sebagai);
    const detail = (consultation?.user?.organization_detail || '').trim();
    if (!detail) return '-';

    if (locationType === 'upt') {
      const [wilayah, uptName] = detail.split(' - ').map((item) => item?.trim());
      if (wilayah && uptName) return `${wilayah} - ${uptName}`;
    }

    return detail;
  };

  const availableLocationDetails = useMemo(() => {
    const options = new Set();

    consultations.forEach((consultation) => {
      const type = normalizeLocationType(consultation?.user?.daftar_sebagai);
      const detail = getLocationLabel(consultation);
      if (!detail || detail === '-') return;
      if (locationTypeFilter !== 'all' && type !== locationTypeFilter) return;
      options.add(detail);
    });

    return Array.from(options).sort((a, b) => a.localeCompare(b, 'id'));
  }, [consultations, locationTypeFilter]);

  const filteredConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      const type = normalizeLocationType(consultation?.user?.daftar_sebagai);
      const detail = getLocationLabel(consultation);

      if (locationTypeFilter !== 'all' && type !== locationTypeFilter) {
        return false;
      }

      if (locationDetailFilter !== 'all' && detail !== locationDetailFilter) {
        return false;
      }

      return true;
    });
  }, [consultations, locationTypeFilter, locationDetailFilter]);

  useEffect(() => {
    setLocationDetailFilter('all');
  }, [locationTypeFilter]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUser();
  }, [navigate]);

  // Fetch user data
  async function fetchUser() {
    try {
      const response = await api.get('/api/user');
      const userData = response?.data?.user || response?.data;

      if ((userData?.status_pengguna || '').toLowerCase() === 'admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      navigate('/login');
    } finally {
      setAuthChecking(false);
    }
  }

  // Fetch consultations when history view is selected
  useEffect(() => {
    if (view === 'history') {
      fetchConsultations();
    }
  }, [view]);

  useEffect(() => {
    if (view === 'choose_psikolog' && !isPsikolog) {
      fetchPsychologists();
    }
  }, [view, isPsikolog]);

  async function fetchPsychologists() {
    setPsychologistsLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/consultations/psychologists');
      const list = Array.isArray(response?.data) ? response.data : [];
      setPsychologists(list);
      if (list.length > 0 && !selectedPsychologistId) {
        const available = list.find((item) => item.is_available);
        setSelectedPsychologistId(available?.id ?? list[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch psychologists:', err);
      setError('Gagal memuat daftar psikolog.');
    } finally {
      setPsychologistsLoading(false);
    }
  }

  async function fetchConsultations() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/consultations');
      setConsultations(response.data);
    } catch (err) {
      console.error('Failed to fetch consultations:', err);
      setError('Gagal memuat riwayat konsultasi');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAvailability() {
    if (!isPsikolog || availabilitySaving) return;

    const nextValue = !(user?.is_available ?? true);
    setError(null);
    setSuccess(null);

    try {
      setAvailabilitySaving(true);
      const response = await api.put('/api/consultations/psychologists/availability', {
        is_available: nextValue,
      });

      const updatedAvailability = Boolean(response?.data?.is_available ?? nextValue);
      setUser((prev) => ({
        ...prev,
        is_available: updatedAvailability,
      }));
      setSuccess(`Status psikolog berhasil diperbarui menjadi ${updatedAvailability ? 'Tersedia' : 'Tidak Tersedia'}.`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal memperbarui status psikolog.');
    } finally {
      setAvailabilitySaving(false);
    }
  }

  function openConsultationDetail(consultation) {
    setSelectedConsultation(consultation);
    setFollowUpForm({
      status: normalizeCaseStatus(consultation?.status),
      notes: consultation?.notes || '',
    });
  }

  async function handleSubmitFollowUp() {
    if (!selectedConsultation) return;

    setError(null);

    try {
      setFollowUpSubmitting(true);
      const response = await api.put(`/api/consultations/${selectedConsultation.id}`, {
        status: followUpForm.status,
        notes: followUpForm.notes,
      });

      const updatedConsultation = response?.data?.consultation;
      if (updatedConsultation) {
        setSelectedConsultation(updatedConsultation);
        setConsultations((prev) =>
          prev.map((item) => (item.id === updatedConsultation.id ? updatedConsultation : item))
        );
      }

      setSuccess('Tindak lanjut psikolog berhasil disimpan.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menyimpan tindak lanjut psikolog.');
    } finally {
      setFollowUpSubmitting(false);
    }
  }

  async function handleMarkCompleted() {
    if (!selectedConsultation) return;
    setError(null);
    try {
      setMarkingCompleted(true);
      const response = await api.post(`/api/consultations/${selectedConsultation.id}/complete`);
      const updatedConsultation = response?.data?.consultation;
      if (updatedConsultation) {
        setSelectedConsultation(updatedConsultation);
        setConsultations((prev) =>
          prev.map((item) => (item.id === updatedConsultation.id ? updatedConsultation : item))
        );
      }
      setSuccess('Konsultasi berhasil ditandai selesai.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menandai konsultasi sebagai selesai.');
    } finally {
      setMarkingCompleted(false);
    }
  }

  async function handleExportConsultations(format) {
    setExportingFormat(format);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.get(`/api/consultations/export/${format}`, {
        responseType: 'blob',
      });

      // Check if the response is actually an error (JSON blob)
      const contentType = response.headers?.['content-type'] || '';
      if (contentType.includes('application/json')) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        throw new Error(json?.message || 'Gagal export laporan');
      }

      const mimeType = format === 'pdf' ? 'application/pdf' : 'text/csv';
      const disposition = response.headers?.['content-disposition'] || '';
      const filenameMatch = disposition.match(/filename="?([^"\s]+)"?/i);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const filename = filenameMatch?.[1] || `laporan-konsultasi-${timestamp}.${format === 'pdf' ? 'pdf' : 'csv'}`;

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 200);

      setSuccess(`File ${format.toUpperCase()} berhasil diunduh.`);
    } catch (err) {
      setError(err?.message || 'Gagal export laporan konsultasi.');
    } finally {
      setExportingFormat(null);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function resolvePhotoUrl(photoUrl) {
    if (!photoUrl) return '';
    if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
    const apiBaseUrl = (api?.defaults?.baseURL || '').replace(/\/$/, '');
    return `${apiBaseUrl}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedPsychologistId) {
      setError('Silakan pilih psikolog terlebih dahulu.');
      setView('choose_psikolog');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/api/consultations', {
        ...form,
        psikolog_id: selectedPsychologistId,
      });
      setSuccess('Konsultasi berhasil dikirim.');
      setForm({ q1:'',q2:'',q3:'',q4:'',q5:'',q6:'',q7:'' });
      localStorage.setItem('profilingCompleted', 'true');
      setView('history');
    } catch (err) {
      console.error('Submit consultation failed:', err);
      if (err.response?.status === 401) {
        setError('Sesi Anda telah berakhir. Silakan login kembali.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.message || 'Gagal mengirim konsultasi. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/api/logout');
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      navigate('/login');
    }
  };

  // Show loading while checking authentication
  if (authChecking) {
    return (
      <div className="w-full p-6 md:p-10 bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
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
                <a
                  href="/dashboard"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  Dashboard
                </a>
                <a
                  href="/consultation"
                  className="block px-4 py-3 text-blue-600 bg-blue-50 font-medium border-l-4 border-blue-600"
                >
                  Konsultasi
                </a>
                {isPsikolog && (
                  <a
                    href="/reports"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                  >
                    Laporan
                  </a>
                )}
              </nav>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold mb-6">Konsultasi</h1>

              {view === 'menu' && (
                <div className="space-y-4">
                  {isPsikolog && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Status Ketersediaan Anda</p>
                        <p className={`text-sm font-semibold ${user?.is_available ? 'text-green-700' : 'text-red-700'}`}>
                          {user?.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleAvailability}
                        disabled={availabilitySaving}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                          user?.is_available ? 'bg-green-500' : 'bg-red-500'
                        } ${availabilitySaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                        aria-label="Toggle ketersediaan psikolog"
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            user?.is_available ? 'translate-x-8' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isPsikolog ? (
                    <>
                      <button
                        onClick={() => setView('history')}
                        className="text-left border border-blue-200 bg-blue-50 rounded-lg p-5 hover:bg-blue-100 transition-colors"
                      >
                        <p className="text-lg font-semibold text-blue-700 mb-1">Hasil Assesment</p>
                        <p className="text-sm text-gray-600">Lihat hasil assesment klien.</p>
                      </button>

                      <button
                        onClick={() => setView('history')}
                        className="text-left border border-gray-200 bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition-colors"
                      >
                        <p className="text-lg font-semibold text-gray-800 mb-1">Riwayat Konsultasi</p>
                        <p className="text-sm text-gray-600">Lihat status dan detail konsultasi sebelumnya.</p>
                      </button>

                      <a
                        href="/chat"
                        className="text-left border border-purple-200 bg-purple-50 rounded-lg p-5 hover:bg-purple-100 transition-colors"
                      >
                        <p className="text-lg font-semibold text-purple-700 mb-1">Chat Klien</p>
                        <p className="text-sm text-gray-600">Akses percakapan langsung dengan klien.</p>
                      </a>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setView('choose_psikolog')}
                        className="text-left border border-blue-200 bg-blue-50 rounded-lg p-5 hover:bg-blue-100 transition-colors"
                      >
                        <p className="text-lg font-semibold text-blue-700 mb-1">Buat Konsultasi</p>
                        <p className="text-sm text-gray-600">Isi form profiling untuk memulai sesi konseling.</p>
                      </button>

                      <button
                        onClick={() => setView('history')}
                        className="text-left border border-gray-200 bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition-colors"
                      >
                        <p className="text-lg font-semibold text-gray-800 mb-1">Riwayat Konsultasi</p>
                        <p className="text-sm text-gray-600">Lihat status dan detail konsultasi sebelumnya.</p>
                      </button>

                      <a
                        href="/chat"
                        className="text-left border border-purple-200 bg-purple-50 rounded-lg p-5 hover:bg-purple-100 transition-colors"
                      >
                        <p className="text-lg font-semibold text-purple-700 mb-1">Chat Psikolog</p>
                        <p className="text-sm text-gray-600">Akses percakapan langsung setelah profiling selesai.</p>
                      </a>

                      <a
                        href="/dashboard"
                        className="text-left border border-green-200 bg-green-50 rounded-lg p-5 hover:bg-green-100 transition-colors"
                      >
                        <p className="text-lg font-semibold text-green-700 mb-1">Kembali ke Dashboard</p>
                        <p className="text-sm text-gray-600">Kembali ke ringkasan fitur dan progres Anda.</p>
                      </a>
                    </>
                  )}
                </div>
                </div>
              )}

              {view === 'history' && (
                <div className="mt-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold">Riwayat Konsultasi</h2>
            {canExport && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleExportConsultations('pdf')}
                  disabled={exportingFormat !== null}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {exportingFormat === 'pdf' ? 'Mengunduh...' : 'Export PDF'}
                </button>
                <button
                  type="button"
                  onClick={() => handleExportConsultations('excel')}
                  disabled={exportingFormat !== null}
                  className="px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                >
                  {exportingFormat === 'excel' ? 'Mengunduh...' : 'Export Excel'}
                </button>
              </div>
            )}
          </div>
          
          {loading && <p className="text-sm text-gray-600">Memuat riwayat...</p>}
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}

          {isPsikolog && consultations.length > 0 && (
            <div className="mb-4 p-4 border border-blue-100 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-800 mb-3">Filter Wilayah / UPT</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-blue-700 mb-1">Tipe Lokasi</label>
                  <select
                    value={locationTypeFilter}
                    onChange={(e) => setLocationTypeFilter(e.target.value)}
                    className="w-full border border-blue-200 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="upt">UPT</option>
                    <option value="kanwil">Kanwil</option>
                    <option value="ditjenpas">Direktorat (Ditjenpas)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-blue-700 mb-1">Lokasi / Unit</label>
                  <select
                    value={locationDetailFilter}
                    onChange={(e) => setLocationDetailFilter(e.target.value)}
                    className="w-full border border-blue-200 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">Semua Lokasi</option>
                    {availableLocationDetails.map((detail) => (
                      <option key={detail} value={detail}>{detail}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-3">
                Menampilkan {filteredConsultations.length} dari {consultations.length} data assesment.
              </p>
            </div>
          )}
          
          {!loading && consultations.length === 0 && (
            <p className="text-sm text-gray-600">Belum ada riwayat konsultasi.</p>
          )}

          {!loading && consultations.length > 0 && filteredConsultations.length === 0 && (
            <p className="text-sm text-gray-600">Tidak ada data assesment pada filter lokasi yang dipilih.</p>
          )}

          {!loading && filteredConsultations.length > 0 && (
            <div className="space-y-4">
              {filteredConsultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openConsultationDetail(consultation)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">Konsultasi #{consultation.id}</h3>
                      <p className="text-sm text-gray-700">
                        Nama Konsultan: <span className="font-medium">{consultation.user?.name || '-'}</span>
                      </p>
                      <p className="text-xs text-gray-600">
                        Lokasi: <span className="font-medium">{getLocationLabel(consultation)}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(consultation.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(consultation.status)}`}
                    >
                      {getStatusLabel(consultation.status)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <p className="line-clamp-2">
                      <strong>Keluhan:</strong> {consultation.q3}
                    </p>
                  </div>

                  {consultation.psikolog && (
                    <p className="text-xs text-gray-500">
                      Ditangani oleh: {consultation.psikolog.name}
                    </p>
                  )}

                  {consultation.notes && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                      <strong>Catatan Psikolog:</strong> {consultation.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

                  <div className="mt-4">
                    {!isPsikolog && (
                      <button onClick={() => setView('choose_psikolog')} className="text-blue-600 hover:underline">
                        Buat Konsultasi Baru
                      </button>
                    )}
                    <button onClick={() => setView('menu')} className="ml-4 text-gray-600 hover:underline">
                      Kembali
                    </button>
                  </div>
                </div>
              )}

      {/* Modal for consultation detail */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedConsultation(null)}>
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">Konsultasi #{selectedConsultation.id}</h2>
                <p className="text-sm text-gray-700 mt-1">
                  Nama Konsultan: <span className="font-medium">{selectedConsultation.user?.name || '-'}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(selectedConsultation.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">1. Apa yang membuat Anda memutuskan untuk mengikuti konseling?</h3>
                <p className="text-gray-700">{selectedConsultation.q1}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">2. Rangkaian aktivitas dalam dua minggu terakhir</h3>
                <p className="text-gray-700">{selectedConsultation.q2}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">3. Keluhan/permasalahan yang ingin dikonsultasikan</h3>
                <p className="text-gray-700">{selectedConsultation.q3}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">4. Apa yang akan terjadi jika tidak segera ditangani?</h3>
                <p className="text-gray-700">{selectedConsultation.q4}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">5. Bentuk dukungan dari lingkungan sekitar</h3>
                <p className="text-gray-700">{selectedConsultation.q5}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">6. Tantangan yang membuat melanggar prinsip kepatuhan</h3>
                <p className="text-gray-700">{selectedConsultation.q6}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">7. Harapan setelah melakukan sesi konseling</h3>
                <p className="text-gray-700">{selectedConsultation.q7}</p>
              </div>

              {selectedConsultation.psikolog && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-1">Ditangani oleh</h3>
                  <p className="text-gray-700">{selectedConsultation.psikolog.name}</p>
                </div>
              )}

              {selectedConsultation.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-1">Catatan Psikolog</h3>
                  <p className="text-gray-700">{selectedConsultation.notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-1">Status</h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(selectedConsultation.status)}`}
                >
                  {getStatusLabel(selectedConsultation.status)}
                </span>
              </div>

              {!isPsikolog && !isAdmin && normalizeCaseStatus(selectedConsultation.status) === 'needs_referral' && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Anda dirujuk ke psikiater. Setelah selesai mengunjungi psikiater, tandai konsultasi ini sebagai selesai.
                  </p>
                  <button
                    type="button"
                    onClick={handleMarkCompleted}
                    disabled={markingCompleted}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {markingCompleted ? 'Memproses...' : 'Tandai Selesai'}
                  </button>
                </div>
              )}

              {isPsikolog && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-semibold">Tindak Lanjut Psikolog</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={followUpForm.status}
                      onChange={(e) => setFollowUpForm((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="pending">Tunggu</option>
                      <option value="in_progress">Diproses</option>
                      <option value="needs_referral">Perlu Rujukan</option>
                      <option value="completed">Selesai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Psikolog</label>
                    <textarea
                      value={followUpForm.notes}
                      onChange={(e) => setFollowUpForm((prev) => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      placeholder="Tulis catatan tindak lanjut untuk klien"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitFollowUp}
                    disabled={followUpSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {followUpSubmitting ? 'Menyimpan...' : 'Simpan Tindak Lanjut'}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedConsultation(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

              {view === 'choose_psikolog' && !isPsikolog && (
                <div className="mt-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Pilih Psikolog Sebelum Assesment</h2>
                    <button onClick={() => setView('menu')} className="text-gray-600 hover:underline">
                      Kembali
                    </button>
                  </div>

                  <p className="text-sm text-gray-600">
                    Pilih psikolog yang akan menangani assesment Anda. Hasil assesment akan langsung masuk ke akun psikolog yang Anda pilih.
                  </p>

                  {psychologistsLoading && (
                    <p className="text-sm text-gray-600">Memuat daftar psikolog...</p>
                  )}

                  {!psychologistsLoading && psychologists.length === 0 && (
                    <p className="text-sm text-gray-600">Belum ada psikolog terdaftar.</p>
                  )}

                  {!psychologistsLoading && psychologists.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {psychologists.map((psikolog) => {
                        const isSelected = selectedPsychologistId === psikolog.id;

                        return (
                          <button
                            type="button"
                            key={psikolog.id}
                            onClick={() => setSelectedPsychologistId(psikolog.id)}
                            className={`flex flex-col items-center text-center rounded-xl border p-4 transition ${
                              isSelected
                                ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-md'
                            }`}
                          >
                            {psikolog.foto ? (
                              <img
                                src={resolvePhotoUrl(psikolog.foto)}
                                alt={`Foto ${psikolog.name}`}
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 mb-3"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold border-2 border-blue-200 mb-3">
                                {(psikolog.name || 'P').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <p className="font-semibold text-gray-900 text-sm leading-tight">{psikolog.name}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{psikolog.organization_detail || '-'}</p>
                            <span
                              className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                psikolog.is_available
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {psikolog.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setView('create')}
                      disabled={!selectedPsychologistId || psychologistsLoading || (selectedPsychologist && !selectedPsychologist.is_available)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Lanjut ke Assesment
                    </button>
                    {selectedPsychologist && !selectedPsychologist.is_available && (
                      <p className="text-sm text-red-600">Psikolog terpilih sedang tidak tersedia, pilih yang berstatus tersedia.</p>
                    )}
                  </div>
                </div>
              )}

              {view === 'create' && (
                <div className="mt-2 bg-gray-50 p-6 rounded border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Profiling (Jawab pertanyaan di bawah ini)</h2>
          {selectedPsychologist && (
            <div className="mb-4 p-3 border border-blue-200 rounded bg-blue-50 flex items-center gap-3">
              {selectedPsychologist.foto ? (
                <img
                  src={resolvePhotoUrl(selectedPsychologist.foto)}
                  alt={`Foto ${selectedPsychologist.name}`}
                  className="w-12 h-12 rounded-full object-cover border border-blue-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold border border-blue-200">
                  {(selectedPsychologist.name || 'P').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm text-blue-800">
                  Psikolog yang menangani: <span className="font-semibold">{selectedPsychologist.name}</span>
                </p>
                <p className="text-xs text-blue-700">
                  Status: {selectedPsychologist.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                </p>
              </div>
            </div>
          )}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">{success}</div>}
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">1. Apa yang membuat Anda memutuskan untuk mengikuti konseling?</label>
              <textarea name="q1" value={form.q1} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block font-medium mb-1">2. Silahkan ceritakan rangkaian aktivitas yang Anda lakukan dalam dua minggu terakhir!</label>
              <textarea name="q2" value={form.q2} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block font-medium mb-1">3. Silahkan tulis keluhan/permasalahan yang ingin Anda konsultasikan! (Semakin detail akan semakin baik)</label>
              <textarea name="q3" value={form.q3} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block font-medium mb-1">4. Menurut anda apa yang akan terjadi jika permasalahan ini tidak segera ditangani?</label>
              <textarea name="q4" value={form.q4} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block font-medium mb-1">5. Ceritakan bentuk dukungan dari lingkungan sekitar Anda!</label>
              <textarea name="q5" value={form.q5} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block font-medium mb-1">6. Apa tantangan yang membuat Anda melanggar prinsip kepatuhan?</label>
              <textarea name="q6" value={form.q6} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block font-medium mb-1">7. Apa harapan Anda setelah melakukan sesi konseling nanti?</label>
              <textarea name="q7" value={form.q7} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>

            <div className="flex items-center space-x-3">
              <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">{submitting ? 'Menyimpan...' : 'Kirim'}</button>
              <button type="button" onClick={() => setView('choose_psikolog')} className="text-gray-600">Ganti Psikolog</button>
              <button type="button" onClick={() => setView('menu')} className="text-gray-600">Batal</button>
            </div>
          </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
