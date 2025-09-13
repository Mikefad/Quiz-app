// App.tsx
import { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import QuestionsList from './pages/QuestionsList';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuthStore } from './store/auth';

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    // if hydrate() is async, you can await it; otherwise just call then mark ready
    const run = async () => {
      await hydrate(); // ok if non-async, await is harmless
      setReady(true);
    };
    run();
  }, [hydrate]);

  if (!ready) {
    return <div className="p-6 text-sm text-gray-600">Loading…</div>;
  }

  return (
    <div className="min-h-dvh">
      <nav className="border-b px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold">Quiz App</Link>
        <div className="flex items-center gap-3">
          <Link to="/quiz" className="underline">Quiz</Link>
          <Link to="/questions" className="underline">Questions</Link>
          {user ? (
            <button className="px-3 py-1 border rounded" onClick={logout}>Logout</button>
          ) : (
            <Link to="/auth" className="px-3 py-1 border rounded">Login</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/quiz" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/questions"
          element={
            <ProtectedRoute>
              <QuestionsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/results"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />
        {/* catch-all to keep SPA tidy */}
        <Route path="*" element={<Navigate to="/quiz" replace />} />
      </Routes>
    </div>
  );
}
