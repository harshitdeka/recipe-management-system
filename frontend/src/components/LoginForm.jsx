// components/LoginForm.jsx
import { useState } from 'react';
import { authAPI } from '../services/api';
import eyeToggleSprite from '../assets/eye-toggle-sprite.svg';

export default function LoginForm({ onLogin, onSwitchToSignup }) {
  const [form, setForm]     = useState({ usernameOrEmail: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.usernameOrEmail) errs.usernameOrEmail = 'Username or email is required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear field error on typing
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await authAPI.login(form);
      onLogin(res);
    } catch (error) {
      setApiError(error.message || 'Cannot connect to server. Make sure the backend is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="subtitle">Log in to access your saved recipes</p>

        {apiError && <div className="auth-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="usernameOrEmail">Username or Email</label>
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              placeholder="Enter username or email"
              value={form.usernameOrEmail}
              onChange={handleChange}
              className={errors.usernameOrEmail ? 'error-input' : ''}
              autoComplete="username"
            />
            {errors.usernameOrEmail && <span className="field-error">{errors.usernameOrEmail}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? 'error-input' : ''}
                autoComplete="current-password"
                style={{ paddingRight: '40px' }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  width: '20px',
                  height: '20px',
                  overflow: 'hidden',
                  display: 'inline-flex',
                  alignItems: 'flex-start'
                }}
              >
                <img
                  src={eyeToggleSprite}
                  alt={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    width: '20px',
                    height: '40px',
                    transform: showPassword ? 'translateY(0%)' : 'translateY(-50%)',
                    transition: 'transform 0.15s ease'
                  }}
                />
              </span>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup}>Sign up</button>
        </div>
      </div>
    </div>
  );
}
