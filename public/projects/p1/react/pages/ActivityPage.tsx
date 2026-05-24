/**
 * ActivityPage — 독후활동 4종
 * ────────────────────────────────────────────────────────────
 * 동화 1개당 4가지 활동을 보여줍니다:
 *   - question (생각 질문)
 *   - drawing  (그림 그리기)
 *   - craft    (만들기 활동)
 *   - roleplay (역할놀이)
 *
 * 각 활동의 content jsonb 구조는 types.ts 의 Activity 인터페이스 참고.
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Activity, Story } from '../types';

export default function ActivityPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory]           = useState<Story | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: s }, { data: a }] = await Promise.all([
        supabase.from('stories').select('*').eq('id', id).single(),
        supabase.from('activities').select('*').eq('story_id', id),
      ]);
      if (s) setStory(s as Story);
      if (a) setActivities(a as Activity[]);
    })();
  }, [id]);

  return (
    <>
      <Nav />
      <div className="page-head">
        <p className="page-head__crumb">
          <Link to={`/reader/${id}`}>{story?.title ?? '동화'}</Link> › 독후활동
        </p>
        <h1>📝 동화를 다 읽었어요! 무엇을 더 해볼까요?</h1>
        <p>오늘 읽은 동화로 아이와 함께 할 수 있는 활동을 추천해드려요.</p>
      </div>

      <div className="grid">
        {activities.map((act) => <ActivityCard key={act.id} act={act} />)}
        {activities.length === 0 && (
          <p style={{ color: 'var(--text-mute)', padding: 20 }}>
            아직 독후활동이 생성되지 않았어요. 잠시 후 다시 확인해 보세요.
          </p>
        )}
      </div>

      <div className="actions">
        <Link to="/library" className="btn btn--primary">✓ 활동 완료</Link>
        <Link to={`/reader/${id}`} className="btn btn--ghost">← 다시 읽기</Link>
      </div>
    </>
  );
}

// ─── 활동 카드 (type 별 다른 본문) ─────────────────────────

function ActivityCard({ act }: { act: Activity }) {
  return (
    <article className="act card">
      <span className="act__type">{TYPE_LABELS[act.type]}</span>
      <h3>{act.title}</h3>
      <p>{act.description}</p>
      {act.type === 'question' && <QuestionList content={act.content} />}
      {act.type === 'drawing'  && <DrawingArea content={act.content} />}
      {act.type === 'craft'    && <CraftSteps content={act.content} />}
      {act.type === 'roleplay' && <RolePlayList content={act.content} />}
    </article>
  );
}

const TYPE_LABELS = {
  question: '💭 생각 질문',
  drawing:  '🎨 그림 그리기',
  craft:    '🧶 만들기 활동',
  roleplay: '🎭 역할놀이',
} as const;

function QuestionList({ content }: { content: any }) {
  return (
    <ul className="qs">
      {(content.questions ?? []).map((q: string, i: number) => <li key={i}>{q}</li>)}
    </ul>
  );
}

function DrawingArea({ content }: { content: any }) {
  return (
    <div className="draw">
      <div className="draw__hint">
        ✏️ {content.instruction ?? '가장 인상 깊었던 장면을 그려보세요'}<br/>
        <small>(인쇄 후 사용해도 좋아요)</small>
      </div>
    </div>
  );
}

function CraftSteps({ content }: { content: any }) {
  return (
    <ul className="craft">
      {(content.materials ?? []).map((m: string, i: number) => <li key={`m-${i}`}>{m}</li>)}
      {(content.steps ?? []).map((s: string, i: number) => <li key={`s-${i}`}>{s}</li>)}
    </ul>
  );
}

function RolePlayList({ content }: { content: any }) {
  return (
    <>
      <div className="role">
        {(content.roles ?? []).map((r: string, i: number) => <span key={i}>{r}</span>)}
      </div>
      {content.guide && <p style={{ marginTop: 14, fontSize: '.85rem' }}>💡 {content.guide}</p>}
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
