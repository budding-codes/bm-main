import { useState, type FormEvent } from 'react';
import { FileText } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminLogin() {
  const { login, loginError, isBootstrapping } = useAdminAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError('');
    setSubmitting(true);

    try {
      await login(credentials.email, credentials.password);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Unable to log in.');
    } finally {
      setSubmitting(false);
    }
  };

  const error = localError || loginError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xs flex-col items-center rounded-xl bg-white p-8 shadow-lg"
      >
        <FileText className="mb-2 h-8 w-8 text-yellow-400" />
        <h1 className="mb-4 text-xl font-bold text-black">Admin Login</h1>
        <input
          type="text"
          placeholder="Admin Email"
          value={credentials.email}
          onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
          className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-black"
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
          className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-black"
          required
          autoComplete="current-password"
        />
        {error ? <div className="mb-3 w-full text-center text-sm text-red-600">{error}</div> : null}
        <button
          type="submit"
          className="w-full rounded-lg bg-yellow-400 py-2 font-bold text-black transition hover:bg-yellow-500 disabled:opacity-60"
          disabled={submitting || isBootstrapping}
        >
          {submitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
