import { Navigate } from 'react-router-dom';

export default function GuestRoute({ children }) {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return children;
  }

  const role = localStorage.getItem('auth_user_role');
  const redirectPath = role === 'Admin' ? '/admin/dashboard' : '/dashboard';

  return <Navigate to={redirectPath} replace />;
}
