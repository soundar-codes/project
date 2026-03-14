import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { Layers, Eye, EyeOff, Loader } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode]       = useState('login');   // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fn = mode === 'login' ? authAPI.login : authAPI.register;
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await fn(payload);
      localStorage.setItem('ucp_token', data.token);
      localStorage.setItem('ucp_user',  JSON.stringify(data.user));
      toast.success(mode === 'login' ? 'Welcome back! 👋' : 'Account created! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="logo-icon"><Layers size={28} color="#fff" /></div>
          <h1>Unified-Class Platform</h1>
          <p>{mode === 'login' ? 'Sign in to your workspace' : 'Create your account'}</p>
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>FULL NAME</label>
              <input className="input" type="text" placeholder="John Doe" value={form.name} onChange={set('name')} required />
            </div>
          )}
          <div className="form-group">
            <label>EMAIL</label>
            <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} required style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', display: 'flex' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ padding: '13px', fontSize: 14, marginTop: 8 }} disabled={loading}>
            {loading ? <><Loader size={16} className="spinning" /> {mode === 'login' ? 'Signing in...' : 'Creating...'}</> : mode === 'login' ? '→ Sign In' : '→ Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: '#8888aa' }}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
            style={{ background: 'none', border: 'none', color: '#00e5ff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
