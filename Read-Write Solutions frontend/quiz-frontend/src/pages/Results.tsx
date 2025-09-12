import { useLocation, Link } from 'react-router-dom';
import type { QuizResult } from '../types';


export default function Results() {
  const location = useLocation();
  const data = (location.state || {}) as QuizResult;

  // Fallback if user refreshes
  if (!data?.total) {
    return (
      <div className="p-6">
        <p>No result to show.</p>
        <Link className="underline" to="/quiz">Back to quiz</Link>
      </div>
    );
  }

  const mm = String(Math.floor(data.timeTakenMs / 60000)).padStart(2, '0');
  const ss = String(Math.floor((data.timeTakenMs % 60000) / 1000)).padStart(2, '0');

  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <div className="border rounded-xl p-6 w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Results</h1>
        <div className="space-y-1">
          <div>Total questions: {data.total}</div>
          <div>Correct answers: {data.correct}</div>
          <div>Time taken: {mm}:{ss}</div>
        </div>
        <div className="mt-4 flex gap-3">
          <Link className="px-3 py-2 border rounded" to="/quiz">Retake</Link>
          <Link className="px-3 py-2 border rounded" to="/questions">Manage Questions</Link>
        </div>
      </div>
    </div>
  );
}
