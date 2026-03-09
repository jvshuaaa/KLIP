import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

export default function Login() {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const identifier = nip.trim();
    const userPassword = password;
    try {
      // POST to login route (returns bearer token)
      // No CSRF token needed for Sanctum bearer token auth
      const response = await api.post('/api/login', { nip: identifier, password: userPassword });

      // Store the token
      const token = response.data.access_token;
      localStorage.setItem('auth_token', token);

      // Set the token in axios headers for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Re-fetch current user to avoid stale profile data from any cached response.
      const meResponse = await api.get('/api/user');
      const currentUser = meResponse?.data?.user || meResponse?.data;

      // On success redirect based on user role
      const role = currentUser?.status_pengguna || response?.data?.user?.status_pengguna;
      localStorage.setItem('auth_user_role', role || 'User');
      if (role === 'Admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const backendMessage =
        err?.response?.data?.errors?.nip?.[0] ||
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.message;
      setError(backendMessage || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
        {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div>
            <label htmlFor="login-identifier" className="block text-sm font-medium mb-1">NIP / Email</label>
            <input
              id="login-identifier"
              name="identifier"
              type="text"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Masukkan NIP atau email"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <div className="text-center">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Lupa password?
            </a>
          </div>
          <div className="text-center">
            <a href="/register" className="text-sm text-blue-600 hover:underline">
              Daftar akun
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
