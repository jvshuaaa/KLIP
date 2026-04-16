export default function TestPage() {
  console.log('TestPage loaded');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>✅ Test Page Berhasil!</h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Jika Anda melihat halaman ini, berarti routing React bekerja dengan baik!</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', textDecoration: 'none' }}>
            🏠 Home
          </a>
          <a href="/login" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', textDecoration: 'none' }}>
            🔐 Login
          </a>
          <a href="/register" style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', textDecoration: 'none' }}>
            📝 Register
          </a>
        </div>
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
            <strong>Server Status:</strong><br/>
            Frontend: http://localhost:5173<br/>
            Backend: http://localhost:8000
          </p>
        </div>
      </div>
    </div>
  );
}