/**
 * HomePage — 동화공방 홈
 * ────────────────────────────────────────────────────────────
 * 첫 진입 화면. 다음을 보여줍니다:
 *   1) 히어로 (앱 소개 + 시작 CTA)
 *   2) 핵심 기능 3개
 *   3) 사용자가 최근에 만든 동화 4건 (Supabase, status='done' 만)
 *   4) 비로그인 시 데모 동화 안내
 *
 * 패턴:
 *   - useAsync 로 명시적 로딩/에러/성공 분기
 *   - 로딩 → <Spinner />, 에러 → <ErrorBox />, 빈 데이터 → <EmptyState />
 *   - useSession 으로 로그인 상태 확인
 */

import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Story } from '../types';

export default function HomePage() {
  const user = useSession();

  // ─── 최근 동화 4건 조회 ─────────────────────────────────
  const storiesState = useAsync(async () => {
    if (!user) return [] as Story[];
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'done')
      .order('created_at', { ascending: false })
      .limit(4)
      .returns<Story[]>();
    if (error) throw error;
    return data ?? [];
  }, [user?.id]);

  return (
    <>
      <Nav />

      <section className="hero">
        <span className="hero__eyebrow">한국적 소재 · AI 생성</span>
        <h1>
          우리 아이만을 위한<br/>
          <span className="accent">한국형 동화책</span>을 만들어요
        </h1>
        <p>
          전래동화·명절·지역 설화 같은 한국적 소재를 바탕으로 아이의 나이와
          관심사에 맞춘 동화를 5분 안에 완성합니다.
        </p>
        <div className="hero__cta">
          <Link to="/create" className="btn btn--primary">✨️ 동화 만들기 시작</Link>
          <Link to="/library" className="btn btn--ghost">예시 동화 보기 →</Link>
        </div>
      </section>

      <main className="container">
        <section className="features">
          <Feature ico="🎯" title="연령 맞춤 어휘"
            desc="5~7세, 8~10세, 11~12세 어휘 수준을 자동 조절합니다." />
          <Feature ico="🎨" title="장면별 삽화"
            desc="5~8개 장면마다 삽화 프롬프트가 함께 생성됩니다." />
          <Feature ico="📝" title="독후활동까지"
            desc="질문·만들기·역할극까지 활용 가이드를 자동 제공합니다." />
        </section>

        <section className="stories">
          <h2>오늘의 추천 동화</h2>
          <StoryGrid state={storiesState} hasUser={!!user} />
        </section>
      </main>
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function StoryGrid({ state, hasUser }: {
  state: ReturnType<typeof useAsync<Story[]>>;
  hasUser: boolean;
}) {
  if (state.status === 'loading') return <Spinner label="📖 동화를 불러오는 중..." />;
  if (state.status === 'error')   return <ErrorBox error={state.error} />;
  if (state.status !== 'success') return null;

  if (state.data.length === 0) {
    return (
      <EmptyState
        emoji="📖"
        title={hasUser ? '아직 만든 동화가 없어요' : '로그인하면 내 동화를 볼 수 있어요'}
        desc={hasUser ? '첫 동화를 만들어 보세요!' : ''}
        action={<Link to="/create" className="btn btn--primary">✨️ 첫 동화 만들기</Link>}
      />
    );
  }

  return (
    <div className="stories__grid">
      {state.data.map((s) => <StoryCard key={s.id} story={s} />)}
    </div>
  );
}

function Feature({ ico, title, desc }: { ico: string; title: string; desc: string }) {
  return (
    <article className="feature card">
      <div className="feature__ico">{ico}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  );
}

function StoryCard({ story }: { story: Story }) {
  return (
    <Link to={`/reader/${story.id}`} className="story-card">
      <div className="story-card__cover" style={{ background: story.cover_gradient }}>
        {story.cover_emoji}
      </div>
      <div className="story-card__body">
        <p className="story-card__title">{story.title}</p>
        <p className="story-card__meta">
          {story.age_range}세 · {story.reading_minutes ?? '-'}분
        </p>
      </div>
    </Link>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">📚</span>
          <span className="brand-text">동화공방</span>
        </Link>
        <nav className="nav__links">
          <Link to="/" className="is-on">홈</Link>
          <Link to="/create">동화 만들기</Link>
          <Link to="/library">내 동화</Link>
        </nav>
        <div className="nav__cta">
          <Link to="/create" className="btn btn--primary">+ 새 동화</Link>
        </div>
      </div>
    </header>
  );
}
