import { ArrowLeft, Users } from "lucide-react";

export default function AdminPendingUsersSection({
  users,
  onBack,
  onApproveUser,
  onRejectUser,
}) {
  const pendingUsers = users.filter((user) => user.status_approval === "pending");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-yellow-500" />
          User Pending Approval
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Semua User
          </button>
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600 text-sm">
          Tidak ada user yang menunggu approval.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">NIP</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Daftar Sebagai
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Tanggal Daftar
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600">{user.nip}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700">
                      {user.daftar_sebagai}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(user.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
