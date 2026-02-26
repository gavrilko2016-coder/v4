import { useState } from 'react';
import { playClick } from '../utils/sounds';

interface LinkAccountModalProps {
  onClose: () => void;
  onLinked?: (email: string) => void;
}

export function LinkAccountModal({ onClose, onLinked }: LinkAccountModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    localStorage.setItem('linkedEmail', email);
    if (onLinked) onLinked(email);
    onClose();
  };

  async function ensureGoogleScript(): Promise<void> {
    if ((window as any).google?.accounts?.oauth2) return;
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(s);
    });
  }

  const handleGoogle = async () => {
    playClick();
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      alert('Не задано VITE_GOOGLE_CLIENT_ID. Додайте Client ID для Google.');
      return;
    }
    try {
      await ensureGoogleScript();
      const oauth2 = (window as any).google.accounts.oauth2;
      const tokenClient = oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (resp: { access_token?: string; error?: string }) => {
          if (!resp || !resp.access_token) {
            alert('Помилка авторизації Google');
            return;
          }
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${resp.access_token}` },
            });
            const data = await res.json();
            const userEmail = data?.email as string | undefined;
            if (userEmail) {
              localStorage.setItem('linkedEmail', userEmail);
              if (onLinked) onLinked(userEmail);
              onClose();
            } else {
              alert('Не вдалося отримати email з Google');
            }
          } catch {
            alert('Не вдалося отримати дані профілю Google');
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch {
      alert('Не вдалося ініціалізувати Google Sign-In');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-scale-up relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold text-white font-heading">
            {isLogin ? 'Log in' : 'Create Account'}
          </h2>
          <button 
            onClick={() => { playClick(); onClose(); }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
              placeholder="••••••••••••"
              required
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <button type="button" className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors font-medium">
                Forgot password?
              </button>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #F59E0B 100%)',
                color: '#1a1a1a',
              }}
            >
              {isLogin ? 'Log In Now' : 'Sign Up'}
            </button>

            <button
              type="button"
              onClick={handleGoogle}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => { playClick(); setIsLogin(!isLogin); }}
              className="text-yellow-500 font-bold hover:text-yellow-400 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
