import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Terminal, EnvelopeSimple, Lock, Eye, EyeSlash, ArrowRight } from '@phosphor-icons/react';

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  
  if (localStorage.getItem('token')) {
    return <Navigate to="/discover" replace />;
  }
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = isLogin 
        ? await authApi.login({ email: formData.email, password: formData.password })
        : await authApi.register(formData);
      
      localStorage.setItem('token', data.token);
      navigate('/discover');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-10 py-3 bg-surface border border-border-subtle rounded-md body-md text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-dim selection:bg-primary selection:text-surface">
      
      {/* Main Content Container */}
      <main className="relative z-10 w-full max-w-[420px] animate-fade-in">
        
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-10 text-center">
          <h1 className="headline-xl text-primary tracking-tight">CoBuild</h1>
          <p className="body-md text-text-muted mt-2">Precision-built for developers.</p>
        </div>

        {/* Auth Card */}
        <div className="surface-1 rounded-lg p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="headline-lg text-primary">{isLogin ? 'Welcome back' : 'Create account'}</h2>
            <p className="body-sm text-text-muted mt-1">
              {isLogin ? 'Build your next team today.' : 'Start discovering and building together.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="block label-mono text-text-muted uppercase">Name</label>
                <div className="relative">
                  <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type="text" 
                    required
                    className={inputClass}
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block label-mono text-text-muted uppercase">Email Address</label>
              <div className="relative">
                <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="email" 
                  required
                  className={inputClass}
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  placeholder="name@company.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block label-mono text-text-muted uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  className={inputClass}
                  value={formData.password} 
                  onChange={e => setFormData({ ...formData, password: e.target.value })} 
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-error-container border border-error/20 p-3 rounded-md">
                <p className="body-sm font-bold text-error">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center group disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight size={18} weight="bold" className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>

        {/* Secondary Action */}
        <p className="text-center mt-8 body-sm text-text-muted">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link 
            to={isLogin ? '/register' : '/login'}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Register' : 'Sign In'}
          </Link>
        </p>
      </main>
    </div>
  );
}
