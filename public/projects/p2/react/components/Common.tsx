/**
 * 공통 UI 컴포넌트 — 로딩/에러/빈 상태
 * ────────────────────────────────────────────────────────────
 * 모든 페이지에서 자주 쓰는 placeholder 컴포넌트.
 */

import type { ReactNode } from 'react';

// ─── 로딩 스켈레톤 ─────────────────────────────────────────

export function Spinner({ label = '불러오는 중...' }: { label?: string }) {
  return (
    <div style={{
      padding: '40px 20px', textAlign: 'center',
      color: 'var(--text-mute, #888)', fontSize: '.9rem',
    }}>
      <div style={{
        display: 'inline-block', width: 32, height: 32, marginBottom: 10,
        border: '3px solid rgba(0,0,0,.1)',
        borderTopColor: 'var(--accent, #6366f1)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <div>{label}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── 에러 박스 ─────────────────────────────────────────────

export function ErrorBox({ error, onRetry }: { error: Error | string; onRetry?: () => void }) {
  const msg = typeof error === 'string' ? error : error.message;
  return (
    <div style={{
      padding: 20, background: 'rgba(220,38,38,.06)',
      border: '1px solid rgba(220,38,38,.2)', borderRadius: 12,
      color: '#b91c1c', textAlign: 'center',
    }}>
      <strong style={{ display: 'block', marginBottom: 8 }}>⚠️ 오류가 발생했어요</strong>
      <p style={{ margin: '0 0 12px', fontSize: '.88rem', wordBreak: 'break-all' }}>{msg}</p>
      {onRetry && (
        <button onClick={onRetry} style={{
          padding: '8px 18px', borderRadius: 8, border: '1px solid #b91c1c',
          background: 'transparent', color: '#b91c1c', cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          🔄 다시 시도
        </button>
      )}
    </div>
  );
}

// ─── 빈 상태 ──────────────────────────────────────────────

export function EmptyState({
  emoji = '📭',
  title = '아직 데이터가 없어요',
  desc,
  action,
}: {
  emoji?: string; title?: string; desc?: string; action?: ReactNode;
}) {
  return (
    <div style={{
      padding: '60px 20px', textAlign: 'center',
      color: 'var(--text-dim, #888)',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>{emoji}</div>
      <h3 style={{ margin: '0 0 6px', color: 'var(--text, #333)' }}>{title}</h3>
      {desc && <p style={{ margin: '0 0 16px', fontSize: '.9rem' }}>{desc}</p>}
      {action}
    </div>
  );
}
