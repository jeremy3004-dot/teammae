import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setShowMenu(false);
  };

  if (!isSupabaseConfigured || !user) {
    return null;
  }

  const displayName = user.email?.split('@')[0] || 'User';

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1a1a24] transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-[#6366f1] to-[#7c3aed] rounded-full flex items-center justify-center text-white font-mono font-medium text-sm">
          {displayName[0].toUpperCase()}
        </div>
        <span className="text-sm font-medium text-[#a0a0b0] max-w-[120px] truncate">
          {displayName}
        </span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-[#12121a] rounded-lg shadow-xl border border-[#2a2a3e] py-2 z-20">
            <div className="px-4 py-2 border-b border-[#2a2a3e]">
              <p className="text-sm font-medium text-[#f0f0f5] truncate">{user.email}</p>
              <p className="text-xs text-[#666] mt-0.5">Signed in</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-[#a0a0b0] hover:bg-[#1a1a24] hover:text-[#f0f0f5] transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
