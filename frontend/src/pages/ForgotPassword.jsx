import { useState } from 'react';
import api from '../lib/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/forgot-password', { email });
      setStatus(res.data.status);
    } catch (err) {
      console.error('forgot password error', err);
      setError(
        err?.response?.data?.email || err?.response?.data?.status || 'Gagal mengirim link reset'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Lupa Password</h2>
        {status && <div className="mb-3 text-sm text-green-600">{status}</div>}
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Alamat Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Kirim link
          </button>
        </form>
      </div>
    </div>
  );
}
