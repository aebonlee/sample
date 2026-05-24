/**
 * FeedbackPage — AI 피드백 & 수정 제안
 * ────────────────────────────────────────────────────────────
 * 데이터:
 *   - 자소서의 모든 문항 → 셀렉터로 선택
 *   - feedback 테이블 (overall_score, scores 4영역, highlights, suggestions)
 *
 * 핵심:
 *   - 종합 점수 + 4영역 점수 (구체성·STAR·차별성·지원처)
 *   - 본문에 하이라이트 (good/bad 색상)
 *   - "수정 제안 적용" → resume_questions 업데이트
 *
 * 패턴:
 *   - useAsync 로 questions 로드 → 첫 문항 자동 선택
 *   - useAsync 로 선택 문항이 바뀔 때마다 feedback 재요청
 *   - useState 로 문항 선택 상태
 */

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, requestFeedback } from '../supabase';
import { useAsync } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Feedback, ResumeQuestion } from '../types';

export default function FeedbackPage() {
  const { id: resumeId } = useParams<{ id: string }>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ─── 문항 목록 로드 ───────────────────────────────
  const qState = useAsync(async () => {
    if (!resumeId) throw new Error('자소서 ID 가 없어요');
    const { data, error } = await supabase
      .from('resume_questions').select('*')
      .eq('resume_id', resumeId).order('ord');
    if (error) throw error;
    return (data ?? []) as ResumeQuestion[];
  }, [resumeId]);

  // 첫 문항 자동 선택
  useEffect(() => {
    if (qState.status === 'success' && !selectedId && qState.data[0]) {
      setSelectedId(qState.data[0].id);
    }
  }, [qState.status]);

  // ─── 선택 문항 피드백 로드 ─────────────────────────
  const fbState = useAsync(async () => {
    if (!selectedId) return null;
    return await requestFeedback(selectedId);
  }, [selectedId]);

  if (qState.status === 'loading') return <><Nav /><Spinner /></>;
  if (qState.status === 'error')   return <><Nav /><ErrorBox error={qState.error} /></>;
  if (qState.status !== 'success') return null;
  if (qState.data.length === 0) {
    return (
      <>
        <Nav />
        <EmptyState
          emoji="📝"
          title="피드백 받을 답변이 없어요"
          desc="먼저 자소서 문항에 답변을 작성해주세요."
        />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to={`/write/${resumeId}`} className="btn btn--primary">자소서 작성으로</Link>
        </div>
      </>
    );
  }

  const question = qState.data.find((q) => q.id === selectedId);

  return (
    <>
      <Nav />
      <Stepper active={3} />

      {/* 문항 선택 탭 */}
      <div className="qtabs" style={{ display: 'flex', gap: 8, padding: '12px 24px', overflowX: 'auto' }}>
        {qState.data.map((q, i) => (
          <button key={q.id}
            className={`chip ${selectedId === q.id ? 'on' : ''}`}
            onClick={() => setSelectedId(q.id)}>
            문항 {i + 1}
          </button>
        ))}
      </div>

      {/* 피드백 로딩 */}
      {fbState.status === 'loading' && (
        <main className="layout"><Spinner label="🤖 AI 피드백 생성 중..." /></main>
      )}
      {fbState.status === 'error' && <ErrorBox error={fbState.error} />}

      {fbState.status === 'success' && fbState.data && question && (
        <>
          {/* 종합 점수 */}
          <ScoresBar feedback={fbState.data} />

          <main className="layout">
            {/* 본문 + 하이라이트 */}
            <section className="card doc">
              <div className="doc__q">
                <strong>문항</strong>: {question.question_text}
              </div>
              <p>{renderHighlighted(question.answer_text ?? '', fbState.data.highlights)}</p>

              <div className="actions">
                <Link to={`/write/${resumeId}`} className="btn btn--ghost">✏ 수정하기</Link>
                <Link to={`/interview/${resumeId}`} className="btn btn--primary">🎤 면접 준비 →</Link>
              </div>
            </section>

            {/* 피드백 카드 */}
            <aside className="fbs">
              {fbState.data.highlights.map((h, i) => (
                <article key={i} className={`card fb fb--${h.type}`}>
                  <span className="fb__type">{h.type === 'good' ? '잘한 점' : '개선 권장'}</span>
                  <p className="fb__msg">{h.message}</p>
                </article>
              ))}

              {fbState.data.suggestions.map((s, i) => (
                <SuggestionCard key={`s-${i}`} suggestion={s} questionId={question.id} />
              ))}
            </aside>
          </main>
        </>
      )}
    </>
  );
}

// ─── 보조 ──────────────────────────────────────────

function ScoresBar({ feedback }: { feedback: Feedback }) {
  const grade = feedback.overall_score >= 90 ? '상위 5%'
              : feedback.overall_score >= 80 ? '상위 15%'
              : feedback.overall_score >= 70 ? '평균권'
              : '추가 보완 필요';
  return (
    <div className="scores-bar">
      <div className="overall">
        <div className="overall__num">{feedback.overall_score}</div>
        <div className="overall__lab">종합 점수</div>
        <div className="overall__grade">{grade}</div>
      </div>
      <div className="scores">
        <ScoreCard label="구체성"      score={feedback.scores.specificity} />
        <ScoreCard label="STAR 구조"   score={feedback.scores.star} />
        <ScoreCard label="차별성"      score={feedback.scores.differentiation} />
        <ScoreCard label="지원처 연결" score={feedback.scores.target_fit} />
      </div>
    </div>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <div className="score">
      <div className="score__head"><h3>{label}</h3><strong>{score}</strong></div>
      <div className="score__bar">
        <div className="score__fill" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion, questionId }: {
  suggestion: { old: string; new: string; reason: string };
  questionId: string;
}) {
  const [applied, setApplied] = useState(false);
  async function apply() {
    // 옵티미스틱: 먼저 표시
    setApplied(true);
    try {
      const { data } = await supabase.from('resume_questions')
        .select('answer_text').eq('id', questionId).single();
      const newText = (data?.answer_text ?? '').replace(suggestion.old, suggestion.new);
      await supabase.from('resume_questions').update({ answer_text: newText })
        .eq('id', questionId);
    } catch {
      setApplied(false);
    }
  }
  return (
    <article className="card fb">
      <span className="fb__type">수정 제안</span>
      <div className="fb__quote">{suggestion.old}</div>
      <p className="fb__msg">→ <strong>{suggestion.new}</strong></p>
      <p className="fb__msg" style={{ fontSize: '.82rem', opacity: .8 }}>{suggestion.reason}</p>
      <button className="mini" onClick={apply} disabled={applied}>
        {applied ? '✓ 적용됨' : '수정 적용'}
      </button>
    </article>
  );
}

/** 하이라이트 범위에 따라 텍스트를 스팬으로 분리 */
function renderHighlighted(text: string, highlights: Feedback['highlights']) {
  if (!highlights.length || !text) return text;
  const sorted = [...highlights].sort((a, b) => a.range[0] - b.range[0]);
  const out: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((h, i) => {
    const [s, e] = h.range;
    if (s > cursor) out.push(text.slice(cursor, s));
    out.push(
      <span key={i} className={`hl ${h.type === 'good' ? 'hl--good' : 'hl--bad'}`}
            title={h.message}>{text.slice(s, e)}</span>,
    );
    cursor = e;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📝 자소서 코치</div>
      <nav className="nav-links">
        <Link to="/">경험</Link>
        <Link to="/star">STAR</Link>
        <Link to="/write">작성</Link>
        <Link to="/feedback" className="on">피드백</Link>
        <Link to="/interview">면접</Link>
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
