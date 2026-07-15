import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const { login, API_URL } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      setTimeout(async () => {
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await res.json();
          if (data.success) {
            navigate(`/dashboard/${data.data.user.role}`);
          } else {
            navigate('/');
          }
        } catch (e) {
          navigate('/');
        }
      }, 500);
    } else {
      setError(result.error || 'Login failed. Please check credentials.');
      setSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    setForgotSuccess('');

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();
      if (data.success) {
        setForgotSuccess(data.message || 'Password reset instructions have been sent.');
        setForgotEmail('');
      } else {
        setError(data.error || 'Failed to send reset link.');
      }
    } catch (e) {
      setError('Connection failure. Ensure backend server is online.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      minHeight: 'calc(100vh - 73px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.1) 0%, transparent 40%)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
        {!isForgotPassword ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Welcome Back</h2>
              <p style={{ color: 'var(--text-muted)' }}>Sign in to manage appointments & consultations</p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--error-color)',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '14px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    className="form-input"
                    style={{ paddingLeft: '48px' }}
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    className="form-input"
                    style={{ paddingLeft: '48px' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                      setForgotSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-color)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                disabled={submitting}
              >
                {submitting ? 'Signing In...' : 'Sign In'}
                <ArrowRight size={18} />
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>
                Create one
              </Link>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Reset Password</h2>
              <p style={{ color: 'var(--text-muted)' }}>Enter email to receive password reset link</p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--error-color)',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '14px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                {error}
              </div>
            )}

            {forgotSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--accent-color)',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '14px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                textAlign: 'center'
              }}>
                {forgotSuccess}
              </div>
            )}

            {!forgotSuccess ? (
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      className="form-input"
                      style={{ paddingLeft: '48px' }}
                      placeholder="patient@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                  <ArrowRight size={18} />
                </button>
              </form>
            ) : null}

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setForgotSuccess('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-color)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
