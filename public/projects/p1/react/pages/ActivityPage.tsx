/**
 * ActivityPage — 독후활동 4종
 * ────────────────────────────────────────────────────────────
 * 동화 1개당 4가지 활동을 보여줍니다:
 *   - question (생각 질문)  · 동화 본문에서 추출한 핵심 질문
 *   - drawing  (그림 그리기) · 가장 인상 깊은 장면을 그리기
 *   - craft    (만들기 활동) · 동화 캐릭터 종이 인형 등
 *   - roleplay (역할놀이)    · 가족이 함께 연기
 *
 * 패턴:
 *   - useAsync 로 story + activities 병렬 로드
 *   - "완료" 클릭 시 reading_history 갱신
 *   - 활동별 다른 컴포넌트 렌더
 */

import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Activity, Story } from '../types';

const TYPE_META = {
  question: { label: '💭 생각 질문',   color: '#6366f1' },
  drawing:  { label: '🎨 그림 그리기', color: '#ec4899' },
  craft:    { label: '🧶 만들기 활동', color: '#f59e0b' },
  roleplay: { label: '🎭 역할놀이',    color: '#10b981' },
} as const;

export default function ActivityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const state = useAsync(async () => {
    if (!id) throw new Error('잘못된 접근');
    const [{ data: story, error: sErr }, { data: activities, error: aErr }] = await Promise.all([
      supabase.from('stories').select('*').eq('id', id).single(),
      supabase.from('activities').select('*').eq('story_id', id),
    ]);
    if (sErr) throw sErr;
    if (aErr) throw aErr;
    return {
      story: story as Story,
      activities: (activities ?? []) as Activity[],
    };
  }, [id]);

  async function markComplete() {
    if (!id) return;
    await supabase.from('reading_history').upsert({
      story_id: id, completed: true, completed_at: new Date().toISOString(),
    });
    navigate('/library');
  }

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;

  const { story, activities } = state.data;

  return (
    <>
      <Nav />
      <div className="page-head">
        <p className="page-head__crumb">
          <Link to={`/reader/${id}`}>{story.title}</Link> › 독후활동
        </p>
        <h1>📝 동화를 다 읽었어요! 무엇을 더 해볼까요?</h1>
        <p>오늘 읽은 동화로 아이와 함께 할 수 있는 활동을 추천해드려요.</p>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          emoji="🔄"
          title="독후활동을 생성 중이에요"
          desc="잠시 후 다시 확인해 주세요."
          action={<button className="btn btn--ghost" onClick={() => location.reload()}>🔄 새로고침</button>}
        />
      ) : (
        <>
          <div className="grid">
            {activities.map((act) => <ActivityCard key={act.id} act={act} />)}
          </div>

          <div className="actions">
            <button className="btn btn--primary" onClick={markComplete}>
              ✓ 활동 완료 → 라이브러리
            </button>
            <Link to={`/reader/${id}`} className="btn btn--ghost">← 다시 읽기</Link>
          </div>
        </>
      )}
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function ActivityCard({ act }: { act: Activity }) {
  const meta = TYPE_META[act.type];
  return (
    <article className="act card" style={{ borderTop: `4px solid ${meta.color}` }}>
      <span className="act__type">{meta.label}</span>
      <h3>{act.title}</h3>
      <p>{act.description}</p>
      {act.type === 'question' && <QuestionList content={act.content as any} />}
      {act.type === 'drawing'  && <DrawingArea content={act.content as any} />}
      {act.type === 'craft'    && <CraftSteps content={act.content as any} />}
      {act.type === 'roleplay' && <RolePlayList content={act.content as any} />}
    </article>
  );
}

function QuestionList({ content }: { content: { questions?: string[] } }) {
  return (
    <ul className="qs">
      {(content.questions ?? []).map((q, i) => <li key={i}>{q}</li>)}
    </ul>
  );
}

function DrawingArea({ content }: { content: { instruction?: string } }) {
  return (
    <div className="draw">
      <div className="draw__hint">
        ✏️ {content.instruction ?? '가장 인상 깊었던 장면을 그려보세요'}<br/>
        <small>(인쇄 후 사용해도 좋아요)</small>
      </div>
    </div>
  );
}

function CraftSteps({ content }: { content: { materials?: string[]; steps?: string[] } }) {
  return (
    <>
      {content.materials && content.materials.length > 0 && (
        <p style={{ fontSize: '.82rem', margin: '0 0 8px' }}>
          <strong>준비물</strong>: {content.materials.join(', ')}
        </p>
      )}
      <ul className="craft">
        {(content.steps ?? []).map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </>
  );
}

function RolePlayList({ content }: { content: { roles?: string[]; guide?: string } }) {
  return (
    <>
      <div className="role">
        {(content.roles ?? []).map((r, i) => <span key={i}>{r}</span>)}
      </div>
      {content.guide && (
        <p style={{ marginTop: 14, fontSize: '.85rem', color: 'var(--text-dim)' }}>
          💡 {content.guide}
        </p>
      )}
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
