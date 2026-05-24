/**
 * ReaderPage — 동화 뷰어
 * ────────────────────────────────────────────────────────────
 * 장면별 페이지 넘기기 UI.
 *
 * 기능:
 *   - scenes 테이블에서 scene_order 순으로 조회
 *   - 이전/다음 버튼 + 좌/우 방향키 단축키
 *   - 도트 인디케이터 클릭 점프
 *   - 마지막 장면 → "독후활동 →" 버튼
 *   - 페이지 진행 상태를 reading_history 테이블에 저장 (debounce)
 */

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Scene, Story } from '../types';

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory]   = useState<Story | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [idx, setIdx]       = useState(0);

  // ─── 동화 + 장면 로드 ───────────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: s }, { data: sc }] = await Promise.all([
        supabase.from('stories').select('*').eq('id', id).single(),
        supabase.from('scenes').select('*').eq('story_id', id).order('scene_order'),
      ]);
      if (s) setStory(s as Story);
      if (sc) setScenes(sc as Scene[]);
    })();
  }, [id]);

  // ─── 읽기 진행 저장 (장면 변경 시) ──────────────────────
  useEffect(() => {
    if (!id || scenes.length === 0) return;
    const t = setTimeout(() => {
      supabase.from('reading_history').upsert({
        story_id: id,
        last_scene: idx + 1,
        completed: idx === scenes.length - 1,
        completed_at: idx === scenes.length - 1 ? new Date().toISOString() : null,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [idx, id, scenes.length]);

  // ─── 키보드 단축키 (← →) ────────────────────────────────
  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => {
    setIdx((i) => {
      if (i < scenes.length - 1) return i + 1;
      navigate(`/activity/${id}`);   // 마지막 → 독후활동
      return i;
    });
  }, [scenes.length, navigate, id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  if (!story || scenes.length === 0) {
    return <div className="book-wrap"><p>📖 동화를 불러오는 중...</p></div>;
  }

  const scene = scenes[idx];
  const isLast = idx === scenes.length - 1;

  return (
    <>
      <Nav />
      <main className="book-wrap">
        <div className="book">
          {/* 장면 아트 (이모지 또는 art_url) */}
          <div className="scene" style={{ background: scene.bg_gradient }}>
            {scene.art_url
              ? <img src={scene.art_url} alt="" className="scene__img" />
              : <div className="scene__art">{scene.art_emoji}</div>
            }
          </div>

          {/* 본문 */}
          <div className="text">
            <h2>{scene.title}</h2>
            <p>{scene.body}</p>
          </div>

          {/* 페이저 */}
          <nav className="pager">
            <button className="pager__btn" onClick={prev} disabled={idx === 0}>← 이전</button>
            <div className="pager__dots">
              {scenes.map((_, i) => (
                <span
                  key={i}
                  className={`pager__dot ${i === idx ? 'is-on' : ''}`}
                  onClick={() => setIdx(i)}
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
        <button>🔊 읽어주기</button>
        <button>💾 저장</button>
        <button onClick={() => navigate(`/activity/${id}`)}>📝 독후활동</button>
        <button>↓ PDF 받기</button>
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
