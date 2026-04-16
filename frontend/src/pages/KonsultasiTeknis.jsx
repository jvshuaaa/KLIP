import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { ArrowLeft, Send, FileText } from 'lucide-react';

export default function KonsultasiTeknis() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    subdit: 'advokasi',
    category: 'patnal_integritas',
    urgency: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/consultations', {
        ...formData,
        type: 'teknis'
      });

      setSuccess('Konsultasi teknis berhasil dikirim!');
      setFormData({
        subject: '',
        description: '',
        subdit: 'advokasi',
        category: 'patnal_integritas',
        urgency: 'medium'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim konsultasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Dashboard
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">Konsultasi Teknis PATNAL</h1>
          <p className="text-gray-600 mt-2">
            Ajukan pertanyaan teknis seputar kepatuhan internal dan integritas
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subjek */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subjek Pertanyaan
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Pertanyaan mengenai kepatuhan internal"
              />
            </div>

            {/* Subdit PATNAL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subdit PATNAL
              </label>
              <select
                name="subdit"
                value={formData.subdit}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="advokasi">Fasilitasi Advokasi & Investigasi Internal</option>
                <option value="pencegahan">Pencegahan & Pengendalian</option>
              </select>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Konsultasi
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="patnal_integritas">PATNAL & Integritas</option>
                <option value="kepatuhan">Kepatuhan Internal</option>
                <option value="investigasi">Investigasi Internal</option>
                <option value="pelanggaran">Pelanggaran Disiplin</option>
              </select>
            </div>

            {/* Urgensi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tingkat Urgensi
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
              </select>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi Detail
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jelaskan pertanyaan Anda secara detail..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <span>Mengirim...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Konsultasi
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
