/**
 * StarPage — STAR 구조화 결과
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - star_breakdowns 테이블 (experience_id 기준 1:1)
 *   - 4개 카드 + 자동 추출된 역량 점수 막대
 *   - 각 단계마다 "수정" 버튼 → 인라인 편집 가능
 *   - "AI 다시 분석" 버튼 → Edge Function 재호출
 *
 * 사용자 가치:
 *   - 자유 기술 텍스트를 정형 STAR 구조로 변환
 *   - 강조하고 싶은 역량 자동 추출 (자소서 작성 시 활용)
 */

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase, convertToStar } from '../supabase';
import { useAsync } from '../hooks';
import { Spinner, ErrorBox } from '../components/Common';
import type { StarBreakdown, Experience } from '../types';

const LETTERS = [
  { key: 'situation', letter: 'S', title: 'Situation — 상황', sub: '언제, 어디서, 어떤 환경이었나' },
  { key: 'task',      letter: 'T', title: 'Task — 과제',      sub: '내가 해결해야 했던 핵심 과제' },
  { key: 'action',    letter: 'A', title: 'Action — 행동',    sub: '구체적으로 무엇을 했나 (가장 중요!)' },
  { key: 'result',    letter: 'R', title: 'Result — 결과',    sub: '정량적 성과 + 정성적 인정' },
] as const;

export default function StarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  // ─── 경험 + STAR 분해 병렬 로드 ────────────────────
  const state = useAsync(async () => {
    if (!id) throw new Error('잘못된 접근');
    const [{ data: e, error: eErr }, { data: s }] = await Promise.all([
      supabase.from('experiences').select('*').eq('id', id).single(),
      supabase.from('star_breakdowns').select('*').eq('experience_id', id).single(),
    ]);
    if (eErr) throw eErr;
    return { exp: e as Experience, star: s as StarBreakdown | null };
  }, [id]);

  // ─── 단계 인라인 편집 저장 ────────────────────────
  async function saveEdit(key: string) {
    if (!id) return;
    await supabase.from('star_breakdowns')
      .update({ [key]: editValue })
      .eq('experience_id', id);
    setEditing(null);
    location.reload();   // 단순화
  }

  // ─── AI 재분석 ───────────────────────────────────
  async function regenerate() {
    if (!id || !confirm('기존 STAR 분해를 다시 만들어요? 편집한 내용은 사라집니다.')) return;
    setRegenerating(true);
    try {
      await convertToStar(id);
      location.reload();
    } finally {
      setRegenerating(false);
    }
  }

  if (state.status === 'loading') return <><Nav /><Stepper active={1} /><Spinner label="STAR 분해를 불러오는 중..." /></>;
  if (state.status === 'error')   return <><Nav /><Stepper active={1} /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;
  if (!state.data.star) return <><Nav /><Spinner label="🤖 AI 분석 중..." /></>;

  const { exp, star } = state.data;

  return (
    <>
      <Nav />
      <Stepper active={1} />

      <div className="page-head">
        <h1>⭐ STAR로 정리했어요</h1>
        <p>입력하신 경험을 면접·자소서에 바로 쓸 수 있는 4가지 구조로 분해했습니다.</p>
      </div>

      <main className="body">
        {/* 원문 */}
        <article className="original">
          <div className="original__head">
            <h3>📝 입력 원문</h3>
            <small>
              {new Date(exp.created_at).toLocaleDateString('ko-KR')} ·
              {' '}{exp.raw_text.length}자
              {exp.target_role && ` · 지원처: ${exp.target_role}`}
            </small>
          </div>
          <p className="original__text">{exp.raw_text}</p>
        </article>

        {/* STAR 4단 카드 */}
        <div className="stars">
          {LETTERS.map((L) => (
            <article key={L.key} className="card star">
              <div className="star__head">
                <div className="star__letter">{L.letter}</div>
                <div style={{ flex: 1 }}>
                  <h3 className="star__title">{L.title}</h3>
                  <span className="star__sub">{L.sub}</span>
                </div>
                {editing !== L.key && (
                  <button onClick={() => { setEditing(L.key); setEditValue(star[L.key]); }}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
                                  background: 'transparent', cursor: 'pointer', fontSize: '.78rem',
                                  color: 'var(--text-mute)' }}>
                    ✏️ 수정
                  </button>
                )}
              </div>

              {editing === L.key ? (
                <>
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{ width: '100%', minHeight: 120, padding: 12, border: '1px solid var(--accent)',
                            borderRadius: 8, fontFamily: 'inherit', fontSize: '.92rem', lineHeight: 1.7,
                            background: 'var(--bg)', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => saveEdit(L.key)}
                            className="btn btn--primary"
                            style={{ padding: '6px 14px' }}>저장</button>
                    <button onClick={() => setEditing(null)}
                            className="btn btn--ghost"
                            style={{ padding: '6px 14px' }}>취소</button>
                  </div>
                </>
              ) : (
                <p className="star__body">{star[L.key]}</p>
              )}
            </article>
          ))}
        </div>

        {/* 역량 점수 */}
        <article className="card competencies">
          <h3>🎯 자동 추출된 역량</h3>
          <p style={{ marginTop: -8, marginBottom: 14, color: 'var(--text-dim)', fontSize: '.85rem' }}>
            자소서 작성 시 강조할 키워드로 활용하세요.
          </p>
          <div className="comp-grid">
            {Object.entries(star.competencies)
              .sort(([, a], [, b]) => b - a)
              .map(([name, score]) => (
                <div key={name} className="comp">
                  <span className="comp__score">{score}</span>
                  <span className="comp__name">{name}</span>
                  <div className="comp__bar">
                    <div className="comp__fill" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </article>

        <div className="actions">
          <Link to="/" className="btn btn--ghost">← 경험 다시 입력</Link>
          <button onClick={regenerate} className="btn btn--ghost" disabled={regenerating}>
            {regenerating ? '🤖 분석 중...' : '🔄 AI 다시 분석'}
          </button>
          <Link to={`/write/${id}`} className="btn btn--primary">✍ 자소서 작성하기 →</Link>
        </div>
      </main>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📝 자소서 코치</div>
      <nav className="nav-links">
        <Link to="/">경험 입력</Link>
        <Link to="/star" className="on">STAR</Link>
        <Link to="/write">작성</Link>
        <Link to="/feedback">피드백</Link>
        <Link to="/interview">면접</Link>
        <Link to="/my">내 자소서</Link>
      </nav>
    </header>
  );
}

function Stepper({ active }: { active: number }) {
  return (
    <div className="stepper">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`step-dot ${i < active ? 'done' : i === active ? 'on' : ''}`}>{i + 1}</span>
      ))}
    </div>
  );
}
