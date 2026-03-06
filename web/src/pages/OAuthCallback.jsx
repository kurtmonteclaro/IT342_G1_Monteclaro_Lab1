import { useContext, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';

export function OAuthCallback() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const payload = useMemo(
    () => ({
      token: searchParams.get('token') || '',
      username: searchParams.get('username') || '',
      email: searchParams.get('email') || '',
      firstName: searchParams.get('firstName') || '',
      lastName: searchParams.get('lastName') || '',
      role: searchParams.get('role') || 'CLIENT',
    }),
    [searchParams],
  );

  useEffect(() => {
    if (!payload.token) {
      navigate('/login?error=google_login_failed', { replace: true });
      return;
    }

    auth.login(payload);
    navigate('/dashboard', { replace: true });
  }, [auth, navigate, payload]);

  return (
    <div className="page-loader">
      <div className="page-loader__orb" />
      <p>Signing you in with Google...</p>
    </div>
  );
}
