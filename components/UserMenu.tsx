'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, User, Settings } from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import { signOut } from '@/app/auth/actions';

export function UserMenu() {
  const { user, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/auth"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9903a] text-white rounded-lg font-semibold hover:bg-[#a8741e] transition-colors"
      >
        <User size={16} />
        <span className="hidden sm:inline">Connexion</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#f0f1f3] text-[#0f1f3d] rounded-lg font-semibold hover:bg-[#e2e4e9] transition-colors"
        aria-label="Menu utilisateur"
      >
        <div className="w-6 h-6 bg-[#c9903a] rounded-full flex items-center justify-center text-white text-xs font-bold">
          {user.email?.[0].toUpperCase()}
        </div>
        <span className="hidden sm:inline text-sm">{user.email?.split('@')[0]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#e2d5c0] z-50">
          <div className="p-4 border-b border-[#e2d5c0]">
            <p className="text-xs text-[#64748b]">Connecté en tant que</p>
            <p className="text-sm font-semibold text-[#0f1f3d]">{user.email}</p>
          </div>

          <div className="p-2 space-y-1">
            <Link
              href="/account"
              className="flex items-center gap-3 px-4 py-2 text-sm text-[#0f1f3d] hover:bg-[#fdf8f2] rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={16} />
              Mon compte
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <LogOut size={16} />
                Se déconnecter
              </button>
            </form>
          </div>

          <div className="p-3 border-t border-[#e2d5c0] text-xs text-[#64748b] space-y-1">
            <Link href="/api/legal/privacy" className="block hover:text-[#c9903a] transition">
              Confidentialité
            </Link>
            <Link href="/api/legal/terms" className="block hover:text-[#c9903a] transition">
              Conditions
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
