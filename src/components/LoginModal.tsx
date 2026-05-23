import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: Props) {
  const { configured, signInWith } = useAuth();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handle(provider: 'google' | 'kakao') {
    try {
      await signInWith(provider);
    } catch (err) {
      alert(`로그인 실패: ${(err as Error).message}`);
    }
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel">
        <button className="modal__close" onClick={onClose} aria-label="닫기">
          ×
        </button>
        <h2 id="login-title" className="modal__title">로그인</h2>
        <p className="modal__lead">
          소셜 계정으로 간편하게 시작하세요. 커뮤니티 글 작성, 즐겨찾기 등의 기능을 사용할 수
          있습니다.
        </p>

        {!configured && (
          <div className="modal__warn">
            관리자가 Supabase 자격증명을 아직 설정하지 않았습니다.
            <br />
            <code>.env.local</code>에 <code>VITE_SUPABASE_URL</code>과{' '}
            <code>VITE_SUPABASE_ANON_KEY</code>를 설정해 주세요.
          </div>
        )}

        <div className="modal__actions">
          <button
            type="button"
            className="oauth-btn oauth-btn--google"
            disabled={!configured}
            onClick={() => handle('google')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61Z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.94v2.33A9 9 0 0 0 9 18Z"/>
              <path fill="#FBBC05" d="M3.97 10.71a5.4 5.4 0 0 1 0-3.43V4.95H.94a9 9 0 0 0 0 8.1l3.03-2.34Z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.43 1.34l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .94 4.95l3.03 2.33C4.68 5.16 6.66 3.58 9 3.58Z"/>
            </svg>
            Google로 계속하기
          </button>

          <button
            type="button"
            className="oauth-btn oauth-btn--kakao"
            disabled={!configured}
            onClick={() => handle('kakao')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#000" d="M9 1.6C4.86 1.6 1.5 4.31 1.5 7.65c0 2.16 1.45 4.06 3.62 5.12l-.74 2.72c-.07.25.21.45.43.31l3.26-2.15c.31.04.62.05.93.05 4.14 0 7.5-2.7 7.5-6.05S13.14 1.6 9 1.6Z"/>
            </svg>
            카카오로 계속하기
          </button>
        </div>

        <p className="modal__hint">
          로그인하면 <a href="#/about">서비스 약관</a>에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
