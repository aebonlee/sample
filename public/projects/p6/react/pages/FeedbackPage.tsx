/**
 * FeedbackPage — AI 피드백 & 수정 제안
 *
 * 데이터: feedback 테이블 (question_id 기준)
 * - overall_score (0~100)
 * - 4영역 점수: 구체성·STAR·차별성·지원처 연결
 * - highlights (잘한 점/개선 권장/필수 수정)
 * - suggestions (수정 제안)
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, requestFeedback } from '../supabase';
import type { Feedback, ResumeQuestion } from '../types';

export default function FeedbackPage() {
  const { id: resumeId } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<ResumeQuestion | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!resumeId) return;
    (async () => {
      // 첫 번째 문항의 피드백
      const { data: qs } = await supabase
        .from('resume_questions').select('*')
        .eq('resume_id', resumeId).order('ord').limit(1);
      const q = (qs ?? [])[0] as ResumeQuestion | undefined;
      if (!q) { setLoading(false); return; }
      setQuestion(q);

      const fb = await requestFeedback(q.id);
      setFeedback(fb);
      setLoading(false);
    })();
  }, [resumeId]);

  if (loading) return <p style={{ padding: 40 }}>🤖 AI 피드백 생성 중...</p>;
  if (!question || !feedback) return <p>피드백을 가져올 수 없어요.</p>;

  const grade = feedback.overall_score >= 90 ? '상위 5%'
              : feedback.overall_score >= 80 ? '상위 15%'
              : feedback.overall_score >= 70 ? '평균권'
              : '추가 보완 필요';

  return (
    <>
      <Nav />
      <Stepper active={3} />

      {/* 종합 점수 */}
      <div className="scores-bar">
        <div className="overall">
          <div className="overall__num">{feedback.overall_score}</div>
          <div className="overall__lab">종합 점수</div>
          <div className="overall__grade">{grade}</div>
        </div>
        <div className="scores">
          <ScoreCard label="구체성"        score={feedback.scores.specificity} />
          <ScoreCard label="STAR 구조"     score={feedback.scores.star} />
          <ScoreCard label="차별성"        score={feedback.scores.differentiation} />
          <ScoreCard label="지원처 연결"   score={feedback.scores.target_fit} />
        </div>
      </div>

      <main className="layout">
        {/* 본문 + 하이라이트 */}
        <section className="card doc">
          <div className="doc__q">
            <strong>문항</strong>: {question.question_text}
          </div>
          <p>{renderHighlighted(question.answer_text, feedback.highlights)}</p>

          <div className="actions">
            <Link to={`/write/${resumeId}`} className="btn btn--ghost">✏ 수정하기</Link>
            <Link to={`/interview/${resumeId}`} className="btn btn--primary">🎤 면접 준비 →</Link>
          </div>
        </section>

        {/* 피드백 카드 */}
        <aside className="fbs">
          {feedback.highlights.map((h, i) => (
            <article key={i} className={`card fb fb--${h.type}`}>
              <span className="fb__type">{h.type === 'good' ? '잘한 점' : '개선 권장'}</span>
              <p className="fb__msg">{h.message}</p>
            </article>
          ))}

          {feedback.suggestions.map((s, i) => (
            <article key={`s-${i}`} className="card fb">
              <span className="fb__type">수정 제안</span>
              <div className="fb__quote">{s.old}</div>
              <p className="fb__msg">→ <strong>{s.new}</strong></p>
              <p className="fb__msg" style={{ fontSize: '.82rem', opacity: .8 }}>{s.reason}</p>
            </article>
          ))}
        </aside>
      </main>
    </>
  );
}

// ─── 보조 ──────────────────────────────────────────

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

/** 하이라이트 범위에 따라 텍스트를 스팬으로 분리 */
function renderHighlighted(text: string, highlights: Feedback['highlights']) {
  if (!highlights.length) return text;
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
