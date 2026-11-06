import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex h-full min-h-[70vh] flex-col items-center justify-center gap-6 p-6">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
      >
        <TrendingUp className="h-8 w-8" style={{ color: '#06B6D4' }} />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold font-mono" style={{ color: '#1E293B' }}>404</h1>
        <p className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>Page not found</p>
        <p className="text-sm" style={{ color: '#475569' }}>
          This page doesn't exist in ARCVault.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => navigate('/')} className="btn-primary">
          AR Dashboard
        </button>
        <button onClick={() => navigate(-1)} className="btn-ghost">
          Go back
        </button>
      </div>
    </div>
  );
}
