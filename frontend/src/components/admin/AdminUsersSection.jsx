import { ArrowLeft, Users } from "lucide-react";
import AdminUserFormModal from "./AdminUserFormModal";

export default function AdminUsersSection({
  users,
  userFormOpen,
  editingUserId,
  userForm,
  userSubmitting,
  onOpenAddUser,
  onOpenPendingUsers,
  onBack,
  onApproveUser,
  onRejectUser,
  onEditUser,
  onDeleteUser,
  onCloseForm,
  onUserFormChange,
  onUserSubmit,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          Manajemen User
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddUser}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            + Tambah User
          </button>
          <button
            onClick={onOpenPendingUsers}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
          >
            Pending Users
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
          >
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
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        user.status_approval === "approved"
                          ? "bg-green-100 text-green-700"
                          : user.status_approval === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.status_approval || "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {user.status_approval === "pending" && (
                        <>
                          <button
                            onClick={() => onApproveUser(user.id)}
                            className="px-3 py-1 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onRejectUser(user.id)}
                            className="px-3 py-1 text-xs rounded bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onEditUser(user)}
                        className="px-3 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteUser(user.id)}
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

      {userFormOpen && (
        <AdminUserFormModal
          editingUserId={editingUserId}
          userForm={userForm}
          userSubmitting={userSubmitting}
          onChange={onUserFormChange}
          onClose={onCloseForm}
          onSubmit={onUserSubmit}
        />
      )}
    </div>
  );
}
