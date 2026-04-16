import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, MessageSquare, TrendingUp, Star, Download, Calendar, Filter } from 'lucide-react';

const AdminSurvey = () => {
  const [surveys, setSurveys] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSurveyData();
  }, []);

  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const [surveysResponse, statsResponse] = await Promise.all([
        fetch('http://localhost:8000/api/admin/surveys', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8000/api/admin/surveys/statistics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!surveysResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch survey data');
      }

      const surveysData = await surveysResponse.json();
      const statsData = await statsResponse.json();

      setSurveys(surveysData.surveys || []);
      setStatistics(statsData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching survey data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSurveys = () => {
    if (filter === 'all') return surveys;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (filter) {
      case '7days':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        filterDate.setDate(now.getDate() - 90);
        break;
      default:
        return surveys;
    }
    
    return surveys.filter(survey => new Date(survey.created_at) >= filterDate);
  };

  const getQuestionLabel = (key) => {
    const labels = {
      kemudahan_penggunaan: 'Kemudahan Penggunaan',
      kemudahan_informasi: 'Kemudahan Informasi',
      tampilan_website: 'Tampilan Website',
      kenyamanan_penggunaan: 'Kenyamanan Penggunaan',
      pemahaman_informasi: 'Pemahaman Informasi',
      kesesuaian_kebutuhan: 'Kesesuaian Kebutuhan',
      kepuasan_informasi: 'Kepuasan Informasi',
      tingkat_kepuasan: 'Tingkat Kepuasan',
      keinginan_menggunakan: 'Keinginan Menggunakan',
      kemungkinan_rekomendasi: 'Kemungkinan Rekomendasi'
    };
    return labels[key] || key;
  };

  const getAverageData = () => {
    if (!statistics?.average_scores) return [];
    
    return Object.entries(statistics.average_scores).map(([key, value]) => ({
      name: getQuestionLabel(key),
      value: parseFloat(value.toFixed(2))
    })).sort((a, b) => b.value - a.value);
  };

  const getRatingDistribution = () => {
    if (!statistics?.distribution) return [];
    
    const totalDistribution = {};
    for (let i = 1; i <= 5; i++) {
      totalDistribution[i] = 0;
      Object.values(statistics.distribution[i]).forEach(count => {
        totalDistribution[i] += count;
      });
    }
    
    return Object.entries(totalDistribution).map(([rating, count]) => ({
      name: `${rating} Bintang`,
      value: count
    }));
  };

  const exportToCSV = () => {
    const filteredSurveys = getFilteredSurveys();
    const headers = [
      'ID', 'Nama', 'NIP', 'Kemudahan Penggunaan', 'Kemudahan Informasi',
      'Tampilan Website', 'Kenyamanan Penggunaan', 'Pemahaman Informasi',
      'Kesesuaian Kebutuhan', 'Kepuasan Informasi', 'Tingkat Kepuasan',
      'Keinginan Menggunakan', 'Kemungkinan Rekomendasi', 'Saran/Harapan', 'Tanggal'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredSurveys.map(survey => [
        survey.id,
        survey.nama || 'Anonim',
        survey.nip || '-',
        survey.kemudahan_penggunaan,
        survey.kemudahan_informasi,
        survey.tampilan_website,
        survey.kenyamanan_penggunaan,
        survey.pemahaman_informasi,
        survey.kesesuaian_kebutuhan,
        survey.kepuasan_informasi,
        survey.tingkat_kepuasan,
        survey.keinginan_menggunakan,
        survey.kemungkinan_rekomendasi,
        `"${survey.saran_harapan || '-'}"`,
        new Date(survey.created_at).toLocaleString('id-ID')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `survey_kepuasan_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSurveyData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const filteredSurveys = getFilteredSurveys();
  const averageData = getAverageData();
  const ratingDistribution = getRatingDistribution();
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Survey Kepuasan</h1>
              <p className="text-gray-600 mt-1">Analisis hasil survey kepuasan pengguna</p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Responden</p>
                <p className="text-2xl font-bold text-gray-900">{statistics?.total_surveys || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Rata-rata Kepuasan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.average_scores?.tingkat_kepuasan ? 
                    parseFloat(statistics.average_scores.tingkat_kepuasan).toFixed(1) : '0'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Rekomendasi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.average_scores?.kemungkinan_rekomendasi ? 
                    parseFloat(statistics.average_scores.kemungkinan_rekomendasi).toFixed(1) : '0'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Saran Masuk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredSurveys.filter(s => s.saran_harapan).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Waktu</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="90days">90 Hari Terakhir</option>
            </select>
            <span className="text-sm text-gray-500">
              Menampilkan {filteredSurveys.length} dari {surveys.length} survey
            </span>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rata-rata Skor per Pertanyaan</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={averageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Rating</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Survey List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Detail Survey</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kepuasan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rekomendasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSurveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{survey.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {survey.nama || 'Anonim'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {survey.nip || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= survey.tingkat_kepuasan
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">({survey.tingkat_kepuasan})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= survey.kemungkinan_rekomendasi
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">({survey.kemungkinan_rekomendasi})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {survey.saran_harapan ? (
                        <div className="max-w-xs truncate" title={survey.saran_harapan}>
                          {survey.saran_harapan}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(survey.created_at).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSurvey;
