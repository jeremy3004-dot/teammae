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
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

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

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email) return;

    setSendingLink(true);
    setLinkSent(false);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/builder',
        },
      });

      if (error) throw error;

      setLinkSent(true);
    } catch (error) {
      console.error('Error sending magic link:', error);
      alert('Failed to send magic link. Please try again.');
    } finally {
      setSendingLink(false);
    }
  };

  // Not configured - show children without auth
  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in - show auth UI
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TeamMAE.ai</h1>
            <p className="text-gray-600">AI-Powered App Builder</p>
          </div>

          {linkSent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600 mb-4">
                We sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">Click the link in the email to sign in</p>
              <button
                onClick={() => setLinkSent(false)}
                className="mt-6 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={sendingLink || !email}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {sendingLink ? 'Sending...' : 'Send magic link'}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                We'll email you a magic link for a password-free sign in
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Signed in - show children
  return <>{children}</>;
}
