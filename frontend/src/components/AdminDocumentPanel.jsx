import React, { useState, useEffect } from "react";
import api from "../lib/axios";

export default function AdminDocumentPanel() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPendingDocuments();
  }, []);

  const fetchPendingDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/documents/admin/pending");
      const payload = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      setDocuments(payload);
      setError(null);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Gagal memuat dokumen pending");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (docId) => {
    try {
      await api.post(`/documents/${docId}/approve`, {});

      // Hapus dari list
      setDocuments(documents.filter((doc) => doc.id !== docId));
      alert("Dokumen berhasil disetujui!");
    } catch (error) {
      console.error("Error approving document:", error);
      alert("Gagal menyetujui dokumen");
    }
  };

  const handleReject = async (docId) => {
    if (!rejectReason.trim()) {
      alert("Alasan penolakan harus diisi");
      return;
    }

    try {
      await api.post(`/documents/${docId}/reject`, { reason: rejectReason });

      // Hapus dari list
      setDocuments(documents.filter((doc) => doc.id !== docId));
      setShowRejectModal(false);
      setRejectReason("");
      alert("Dokumen berhasil ditolak!");
    } catch (error) {
      console.error("Error rejecting document:", error);
      alert("Gagal menolak dokumen");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Memuat dokumen pending...</div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Tidak ada dokumen yang menunggu persetujuan
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {doc.cover && (
                      <img
                        src={doc.cover}
                        alt={doc.title}
                        className="w-12 h-16 rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Oleh: {doc.user?.name} ({doc.user?.daftar_sebagai})
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Kategori:</span>
                        <p className="font-medium text-gray-800">{doc.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Sub Kategori:</span>
                        <p className="font-medium text-gray-800">
                          {doc.sub_category}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tipe:</span>
                        <p className="font-medium text-gray-800">{doc.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tanggal Upload:</span>
                        <p className="font-medium text-gray-800">
                          {new Date(doc.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {doc.description && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <strong>Deskripsi:</strong>
                      </p>
                      <p className="text-gray-700 text-sm">{doc.description}</p>
                    </div>
                  )}

                  {doc.file && (
                    <div className="mb-3">
                      <a
                        href={doc.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Buka File
                      </a>
                    </div>
                  )}

                  {doc.video_url && (
                    <div className="mb-3">
                      <a
                        href={doc.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Lihat Video
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(doc.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Setujui
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDoc(doc.id);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Alasan Penolakan */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Alasan Penolakan
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedDoc(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleReject(selectedDoc)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Tolak Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
