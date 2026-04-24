export default function AdminUserFormModal({
  editingUserId,
  userForm,
  userSubmitting,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            {editingUserId ? "Edit User" : "Tambah User Baru"}
          </h3>
        </div>

        <form id="user-form" onSubmit={onSubmit} className="px-6 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Informasi Dasar
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={userForm.name}
                  onChange={onChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nip"
                  value={userForm.nip}
                  onChange={onChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={userForm.email}
                onChange={onChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. WhatsApp
              </label>
              <input
                type="text"
                name="no_wa"
                value={userForm.no_wa}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instansi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="instansi"
                value={userForm.instansi || ""}
                onChange={onChange}
                required
                placeholder="Masukkan instansi"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Organisasi
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daftar Sebagai <span className="text-red-500">*</span>
                </label>
                <select
                  name="daftar_sebagai"
                  value={userForm.daftar_sebagai}
                  onChange={onChange}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={onChange}
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

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Password{" "}
              {editingUserId && (
                <span className="text-gray-400 normal-case font-normal">
                  (kosongkan jika tidak ingin mengubah)
                </span>
              )}
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
                  onChange={onChange}
                  placeholder="Minimal 8 karakter"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={userForm.password_confirmation}
                  onChange={onChange}
                  placeholder="Ulangi password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
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
            form="user-form"
            disabled={userSubmitting}
            className={`px-5 py-2 rounded-lg text-sm text-white font-medium transition-all disabled:opacity-50 ${
              editingUserId ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {userSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Menyimpan...
              </span>
            ) : editingUserId ? (
              "Simpan Perubahan"
            ) : (
              "Buat Akun"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
