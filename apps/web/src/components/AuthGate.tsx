import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Ensure user profile exists
    const ensureUserProfile = async (user: User) => {
      if (!supabase) return;

      try {
        await supabase.from('users').upsert(
          {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
          },
          { onConflict: 'id' }
        );
      } catch (error) {
        console.error('Error upserting user profile:', error);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        ensureUserProfile(session.user);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        ensureUserProfile(session.user);
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email || !password) return;

    setIsSigningIn(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Not configured - show children without auth
  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]"></div>
          <p className="mt-4 text-[#a0a0b0]">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in - show auth UI
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(42, 42, 62, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(42, 42, 62, 0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
        {/* Radial gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(99, 102, 241, 0.15) 0%, transparent 60%)'
          }}
        />

        <div className="relative bg-[#12121a] border border-[#2a2a3e] rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-mono text-2xl font-bold text-[#f0f0f5] tracking-wider uppercase mb-2">MAE</h1>
            <p className="text-[#a0a0b0] text-sm">Master AI Engineer</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-mono font-medium text-[#a0a0b0] mb-2 uppercase tracking-wider">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a3e] rounded-lg text-[#f0f0f5] placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-mono font-medium text-[#a0a0b0] mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a3e] rounded-lg text-[#f0f0f5] placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSigningIn || !email || !password}
              className="w-full px-6 py-3 bg-white text-[#0a0a0f] rounded-lg font-mono font-medium uppercase tracking-wider text-sm hover:bg-[#f0f0f5] hover:-translate-y-0.5 disabled:bg-[#2a2a3e] disabled:text-[#555] disabled:cursor-not-allowed disabled:transform-none transition-all"
            >
              {isSigningIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#555]">
            Powered by AI
          </p>
        </div>
      </div>
    );
  }

  // Signed in - show children
  return <>{children}</>;
}
