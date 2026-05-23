import { useAuth } from '../contexts/AuthContext';

export default function Community() {
  const { user } = useAuth();

  return (
    <section className="container community">
      <header className="community__head">
        <h1>커뮤니티</h1>
        <p>샘플 기반으로 만든 결과물을 공유하고, 질문을 주고받는 공간입니다.</p>
      </header>

      <div className="community__placeholder">
        <div className="community__icon">💬</div>
        <h2>곧 오픈됩니다</h2>
        <p>
          글 작성 · 댓글 · 좋아요 등 커뮤니티 기능을 준비 중입니다.
          {user ? (
            <>
              <br />
              <strong>{user.user_metadata?.full_name || user.email || '사용자'}</strong>님,
              먼저 로그인을 끝내 주셨네요. 오픈 시 알림으로 알려 드리겠습니다.
            </>
          ) : (
            <>
              <br />
              오픈 알림을 받으시려면 우측 상단에서 로그인해 주세요.
            </>
          )}
        </p>
        <div className="community__links">
          <a href="https://github.com/aebonlee/sample/issues" target="_blank" rel="noreferrer" className="btn btn--primary">
            GitHub Issues로 의견 보내기
          </a>
          <a href="https://github.com/aebonlee/sample" target="_blank" rel="noreferrer" className="btn btn--ghost">
            GitHub 저장소
          </a>
        </div>
      </div>
    </section>
  );
}
