'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User } from 'lucide-react';
import { signUp, signIn } from './actions';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = isSignUp ? await signUp(formData) : await signIn(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f1f3d] to-[#1a2f52] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#0f1f3d] mb-2">
              RME Voyage
            </h1>
            <p className="text-[#64748b] text-sm">
              {isSignUp ? 'Créer un compte' : 'Se connecter'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-[#0f1f3d] mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-[#c9903a]" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Votre nom"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-[#e2d5c0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9903a]"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#0f1f3d] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-[#c9903a]" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="vous@exemple.com"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-[#e2d5c0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9903a]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#0f1f3d] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-[#c9903a]" size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2 border border-[#e2d5c0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9903a]"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c9903a] hover:bg-[#a8741e] text-white font-bold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading
                ? 'Chargement...'
                : isSignUp
                  ? 'Créer un compte'
                  : 'Se connecter'}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-sm text-[#64748b]">
            {isSignUp
              ? 'Vous avez déjà un compte ? '
              : 'Pas de compte ? '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#c9903a] font-semibold hover:underline"
            >
              {isSignUp ? 'Se connecter' : 'S\'enregistrer'}
            </button>
          </div>

          {/* Links */}
          <div className="mt-6 flex justify-between text-xs text-[#64748b]">
            <Link href="/" className="hover:text-[#c9903a] transition">
              Accueil
            </Link>
            <Link href="/privacy" className="hover:text-[#c9903a] transition">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
