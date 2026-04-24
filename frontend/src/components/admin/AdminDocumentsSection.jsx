import { ArrowLeft, BookOpen } from "lucide-react";
import AdminDocumentFormModal from "./AdminDocumentFormModal";

function getYoutubeId(url) {
  if (!url) return null;
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  try {
    const u = new URL(url);
    return u.searchParams.get("v") || u.pathname.split("/").pop();
  } catch {
    return null;
  }
}

export default function AdminDocumentsSection({
  documents,
  docSearchTerm,
  onSearchTermChange,
  onOpenAdd,
  onBack,
  onEditDoc,
  onDeleteDoc,
  docFormOpen,
  editingDocId,
  docForm,
  docSubmitting,
  docUploadFile,
  categoryOptions,
  onDocFormChange,
  onDocSubmit,
  onCloseForm,
  onFileSelected,
}) {
  const normalizedSearch = (docSearchTerm || "").toLowerCase();
  const filtered = documents.filter((d) =>
    d.title?.toLowerCase().includes(normalizedSearch)
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-600" />
          Manajemen Dokumen
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAdd}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
          >
            + Tambah Dokumen
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari dokumen..."
          value={docSearchTerm}
          onChange={onSearchTermChange}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
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
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Sub Kategori
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Tipe</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const ytId =
                  doc.type === "video"
                    ? getYoutubeId(doc.video_url || doc.url)
                    : null;

                return (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {ytId ? (
                          <div className="relative flex-shrink-0 w-20 h-12 rounded overflow-hidden bg-gray-100 group">
                            <img
                              src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                              alt={doc.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition">
                              <svg
                                className="w-5 h-5 text-white drop-shadow"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        ) : null}
                        <span className="font-medium text-gray-800 max-w-xs truncate">
                          {doc.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{doc.category}</td>
                    <td className="px-4 py-3 text-gray-600">{doc.sub_category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          doc.type === "video"
                            ? "bg-blue-100 text-blue-700"
                            : doc.type === "pdf"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {doc.type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditDoc(doc)}
                          className="px-3 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteDoc(doc.id)}
                          className="px-3 py-1 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {docFormOpen && (
        <AdminDocumentFormModal
          editingDocId={editingDocId}
          docForm={docForm}
          docSubmitting={docSubmitting}
          docUploadFile={docUploadFile}
          categoryOptions={categoryOptions}
          onChange={onDocFormChange}
          onClose={onCloseForm}
          onSubmit={onDocSubmit}
          onFileSelected={onFileSelected}
        />
      )}
    </div>
  );
}

