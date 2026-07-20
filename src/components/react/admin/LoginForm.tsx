/* ============================================================
   Form di login admin (email + password, auth Supabase).
   ============================================================ */
import { useState, type FormEvent } from 'react';
import { getBrowserSupabase } from '@/lib/supabase';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const db = getBrowserSupabase();
    if (!db) {
      setError('Supabase non configurato.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error: authError } = await db.auth.signInWithPassword({ email, password });
    if (authError) setError('Credenziali non valide o utente inesistente.');
    setBusy(false);
    // Al successo, onAuthStateChange in AdminApp aggiorna la vista.
  };

  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={handleSubmit}>
        <h1 className="adm-login-title">La Voglia · Admin</h1>
        <p className="adm-login-sub">Accedi per gestire menu, birre e panini.</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="adm-inline-error">{error}</p>}

        <button className="adm-btn adm-btn-primary adm-btn-block" type="submit" disabled={busy}>
          {busy ? 'Accesso…' : 'Accedi'}
        </button>
      </form>
    </div>
  );
}
