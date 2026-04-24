import { ArrowLeft, ClipboardList } from "lucide-react";

export default function AdminConsultationSection({
  consultations,
  onBack,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-purple-600" />
          Monitoring Konsultasi
        </h2>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      {consultations.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600 text-sm">
          Belum ada data konsultasi untuk ditampilkan.
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.slice(0, 20).map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {item.user?.name || "Anonymous"}
                  </p>
                  <p className="text-sm text-gray-500">{item.created_at}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    item.status === "active"
                      ? "bg-green-100 text-green-700"
                      : item.status === "ended"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
