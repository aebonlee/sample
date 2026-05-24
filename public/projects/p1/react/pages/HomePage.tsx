/**
 * HomePage — 동화공방 홈
 * ────────────────────────────────────────────────────────────
 * 첫 진입 화면. 다음을 보여줍니다:
 *   1) 히어로 (앱 소개 + 시작 CTA)
 *   2) 3가지 핵심 기능
 *   3) 사용자가 최근에 만든 동화 (Supabase에서 4건)
 *
 * 데이터 흐름:
 *   - mount 시 supabase.from('stories') 으로 본인 동화 4건 조회
 *   - 로딩 중 / 비어있음 / 정상 3가지 상태 처리
 *   - 카드 클릭 시 /reader/:id 로 이동
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Story } from '../types';

export default function HomePage() {
  const [stories, setStories] = useState<Story[] | null>(null);

  // ─── 최근 동화 4건 조회 ─────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('status', 'done')
        .order('created_at', { ascending: false })
        .limit(4)
        .returns<Story[]>();

      if (cancelled) return;
      if (error) {
        console.error('[HomePage] stories 조회 실패:', error);
        setStories([]);
        return;
      }
      setStories(data ?? []);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {/* ─── 상단 네비 ─── */}
      <header className="nav">
        <div className="nav__inner">
          <Link to="/" className="brand">
            <span className="brand__mark">📚</span> 동화공방
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

      {/* ─── 히어로 섹션 ─── */}
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
          <Link to="/create" className="btn btn--primary">✨ 동화 만들기 시작</Link>
          <Link to="/library" className="btn btn--ghost">예시 동화 보기 →</Link>
        </div>
      </section>

      <main className="container">
        {/* ─── 핵심 기능 3개 (정적) ─── */}
        <section className="features">
          <Feature ico="🎯" title="연령 맞춤 어휘"
            desc="5~7세, 8~10세, 11~12세 어휘 수준을 자동 조절합니다." />
          <Feature ico="🎨" title="장면별 삽화"
            desc="5~8개 장면마다 삽화 프롬프트가 함께 생성됩니다." />
          <Feature ico="📝" title="독후활동까지"
            desc="질문·만들기·역할극까지 활용 가이드를 자동 제공합니다." />
        </section>

        {/* ─── 추천 동화 (DB 연동) ─── */}
        <section className="stories">
          <h2>오늘의 추천 동화</h2>
          {stories === null ? (
            <p style={{ color: 'var(--text-mute)' }}>📖 동화를 불러오는 중...</p>
          ) : stories.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="stories__grid">
              {stories.map((s) => <StoryCard key={s.id} story={s} />)}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

/** 핵심 기능 카드 1개 */
function Feature({ ico, title, desc }: { ico: string; title: string; desc: string }) {
  return (
    <article className="feature card">
      <div className="feature__ico">{ico}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  );
}

/** 동화 카드 1장 (목록용) */
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

/** 동화가 없을 때 안내 */
function EmptyState() {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
      <p>아직 만든 동화가 없어요.</p>
      <Link to="/create" className="btn btn--primary">✨ 첫 동화 만들기</Link>
    </div>
  );
}
