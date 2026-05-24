/**
 * ReaderPage — 동화 뷰어
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - scenes 1:N 로드, 페이지 넘기기 (이전/다음 + 좌/우 방향키)
 *   - 도트 인디케이터 클릭으로 점프
 *   - 마지막 장면 후 "독후활동 →" 자동 이동
 *   - reading_history 자동 저장 (debounce 500ms)
 *
 * 패턴:
 *   - useAsync 로 scenes 로드
 *   - useCallback 으로 prev/next 메모이제이션
 *   - useEffect 로 키보드 단축키 + 진행 저장
 *   - 스와이프(터치) 지원
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Scene, Story } from '../types';

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // ─── story + scenes 병렬 로드 ──────────────────────────
  const state = useAsync(async () => {
    if (!id) throw new Error('잘못된 접근');
    const [{ data: story, error: sErr }, { data: scenes, error: scErr }] = await Promise.all([
      supabase.from('stories').select('*').eq('id', id).single(),
      supabase.from('scenes').select('*').eq('story_id', id).order('scene_order'),
    ]);
    if (sErr) throw sErr;
    if (scErr) throw scErr;
    return {
      story:  story as Story,
      scenes: (scenes ?? []) as Scene[],
    };
  }, [id]);

  // ─── 읽기 진행 저장 (debounce) ─────────────────────────
  useEffect(() => {
    if (!id || state.status !== 'success' || state.data.scenes.length === 0) return;
    const t = setTimeout(() => {
      const isLast = idx === state.data.scenes.length - 1;
      supabase.from('reading_history').upsert({
        story_id: id,
        last_scene: idx + 1,
        completed: isLast,
        completed_at: isLast ? new Date().toISOString() : null,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [idx, id, state]);

  // ─── 네비게이션 ────────────────────────────────────────
  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => {
    if (state.status !== 'success') return;
    setIdx((i) => {
      if (i < state.data.scenes.length - 1) return i + 1;
      navigate(`/activity/${id}`);
      return i;
    });
  }, [state, navigate, id]);

  // ─── 키보드 단축키 ─────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  // ─── 스와이프 ──────────────────────────────────────────
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx > 0) prev();
      else next();
    }
    touchStartX.current = null;
  }

  if (state.status === 'loading') return <><Nav /><Spinner label="📖 동화를 불러오는 중..." /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;

  if (state.data.scenes.length === 0) {
    return (
      <>
        <Nav />
        <EmptyState
          emoji="📖"
          title="아직 장면이 없어요"
          desc="동화가 생성 중일 수 있어요."
          action={<button onClick={() => location.reload()} className="btn btn--ghost">🔄 새로고침</button>}
        />
      </>
    );
  }

  const { story, scenes } = state.data;
  const scene = scenes[idx];
  const isLast = idx === scenes.length - 1;

  return (
    <>
      <Nav />
      <main className="book-wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="book">
          <div className="scene" style={{ background: scene.bg_gradient }}>
            {scene.art_url
              ? <img src={scene.art_url} alt="" className="scene__img" />
              : <div className="scene__art">{scene.art_emoji}</div>
            }
          </div>

          <div className="text">
            <h2>{scene.title}</h2>
            <p>{scene.body}</p>
          </div>

          <nav className="pager">
            <button className="pager__btn" onClick={prev} disabled={idx === 0}>← 이전</button>
            <div className="pager__dots">
              {scenes.map((_, i) => (
                <span
                  key={i}
                  className={`pager__dot ${i === idx ? 'is-on' : ''}`}
                  onClick={() => setIdx(i)}
                  title={`장면 ${i + 1}`}
                />
              ))}
            </div>
            <button className="pager__btn" onClick={next}>
              {isLast ? '독후활동 →' : '다음 →'}
            </button>
          </nav>
        </div>
      </main>

      <div className="ctrl">
        <button title="음성으로 읽어주기">🔊 읽어주기</button>
        <button title="이 동화 저장">💾 저장</button>
        <button onClick={() => navigate(`/activity/${id}`)}>📝 독후활동</button>
        <button title="PDF 다운로드">↓ PDF</button>
        <span style={{ color: 'var(--text-mute)', fontSize: '.78rem', marginLeft: 'auto' }}>
          💡 ← → 또는 좌우 스와이프
        </span>
      </div>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="brand"><span className="brand__mark">📚</span> 동화공방</Link>
        <nav className="nav__links">
          <Link to="/">홈</Link>
          <Link to="/create">동화 만들기</Link>
          <Link to="/library">내 동화</Link>
        </nav>
      </div>
    </header>
  );
}
