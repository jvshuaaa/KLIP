export default function AdminDocumentFormModal({
  editingDocId,
  docForm,
  docSubmitting,
  docUploadFile,
  categoryOptions,
  onChange,
  onClose,
  onSubmit,
  onFileSelected,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            {editingDocId ? "Edit Dokumen" : "Tambah Dokumen Baru"}
          </h3>
        </div>

        <form id="doc-form" onSubmit={onSubmit} className="px-6 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Tipe Dokumen
            </p>
            <div className="grid grid-cols-3 gap-3">
              {["pdf", "video", "ebook", "other"].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={docForm.type === type}
                    onChange={onChange}
                    className="mr-2"
                  />
                  <span className="text-sm capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Kategori
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Utama <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={docForm.category}
                  onChange={onChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="peraturan">Himpunan Peraturan</option>
                  <option value="ebook">Standar Operasional</option>
                  <option value="edukasi">Edukasi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="sub_category"
                  value={docForm.sub_category}
                  onChange={onChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">-- Pilih Sub Kategori --</option>
                  {(categoryOptions[docForm.category] || []).map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Konten
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Dokumen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={docForm.title}
                  onChange={onChange}
                  placeholder="Masukkan judul dokumen..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {(docForm.type === "pdf" ||
                docForm.type === "ebook" ||
                docForm.type === "other") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Dokumen <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-orange-400 transition-colors"
                      onClick={() =>
                        document.getElementById("doc-file-input")?.click()
                      }
                    >
                      {docUploadFile ? (
                        <div className="text-green-600 font-medium">
                          {docUploadFile.name}
                        </div>
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
                      onChange={(e) => onFileSelected?.(e.target.files?.[0])}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {docForm.type === "video" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Video <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="url"
                      value={docForm.url}
                      onChange={onChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {(() => {
                    const url = docForm.url || "";
                    let ytId = null;
                    const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
                    if (embedMatch) ytId = embedMatch[1];
                    else {
                      try {
                        const u = new URL(url);
                        ytId =
                          u.searchParams.get("v") ||
                          (url.includes("youtu.be")
                            ? u.pathname.split("/").pop()
                            : null);
                      } catch {
                        // ignore invalid url
                      }
                    }
                    if (!ytId) return null;

                    return (
                      <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <div
                          className="relative w-full"
                          style={{ paddingBottom: "56.25%" }}
                        >
                          <img
                            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25">
                            <div className="bg-red-600 rounded-full p-3 shadow-lg">
                              <svg
                                className="w-7 h-7 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-2">
                          <p className="text-xs text-gray-500 truncate">
                            youtube.com/watch?v={ytId}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
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
            ) : editingDocId ? (
              "Simpan Perubahan"
            ) : (
              "Tambah Dokumen"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

