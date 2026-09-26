import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { cmsApi } from '../../services/cmsApi';
import { AdminUser } from '../../types/cms';

interface AdminLoginProps {
  onSuccess: (user: AdminUser) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('admin@uskbarandgrill.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await cmsApi.login(email.trim(), password);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (role: 'admin' | 'editor') => {
    if (role === 'admin') {
      setEmail('admin@uskbarandgrill.com');
      setPassword('AdminPassword123!');
    } else {
      setEmail('editor@uskbarandgrill.com');
      setPassword('EditorPassword123!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Scrim Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white font-display">Usk CMS Portal</h2>
          <p className="text-xs text-stone-400 mt-1">
            Authenticate to access live content, menu controls & website settings.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@uskbarandgrill.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Demo Credentials Assistant */}
        <div className="mt-6 pt-5 border-t border-stone-800/80">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 text-center">
            Demo Credentials (1-Click Fill)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin')}
              className="p-2 bg-stone-950/70 border border-stone-800 hover:border-amber-500/50 rounded-lg text-left transition"
            >
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Role</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5 truncate">Full System Access</p>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('editor')}
              className="p-2 bg-stone-950/70 border border-stone-800 hover:border-amber-500/50 rounded-lg text-left transition"
            >
              <div className="flex items-center gap-1 text-stone-300 font-bold">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                <span>Editor Role</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5 truncate">Content Only</p>
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-stone-500 hover:text-stone-300 transition"
          >
            ← Back to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
