/**
 * QuizPage — 문화재 퀴즈 (5문제)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - 문화재 ID 로 quizzes 5문제 로드 → useAsync 로 명시적 로딩 처리
 *   - 한 문제씩 풀이 → 즉시 채점 → 해설 표시
 *   - 마지막 문제 후 결과 화면 (정답수/정답률/시간)
 *   - quiz_attempts 테이블에 결과 저장 + activity_log 기록
 *
 * 패턴:
 *   - phase: 'taking' | 'done' 으로 화면 분기
 *   - useInterval 로 1초 경과 시간 추적
 *   - 답안은 ref-like state (answers 배열)
 *   - "한 번 더" 시 페이지 새로 마운트 → state 초기화
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useInterval, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Quiz } from '../types';

type Phase = 'taking' | 'done';

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const user = useSession();
  const [phase, setPhase]   = useState<Phase>('taking');
  const [idx, setIdx]       = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);

  // ─── 퀴즈 5문제 로드 ──────────────────────────────────
  const quizState = useAsync(async () => {
    if (!id) throw new Error('잘못된 접근');
    const { data, error } = await supabase
      .from('quizzes').select('*').eq('heritage_id', id).limit(5);
    if (error) throw error;
    return (data ?? []) as Quiz[];
  }, [id]);

  // 1초마다 경과 시간 카운트
  useInterval(() => setElapsed((s) => s + 1), phase === 'taking' ? 1000 : null);

  function pick(optIdx: number) {
    if (picked !== null) return;
    setPicked(optIdx);
  }

  async function next() {
    if (picked === null) return;
    const newAnswers = [...answers, picked];
    setAnswers(newAnswers);

    if (quizState.status === 'success' && idx === quizState.data.length - 1) {
      // 마지막 문제 → 결과 저장
      await finish(newAnswers);
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  }

  async function finish(finalAnswers: number[]) {
    if (!user || quizState.status !== 'success') return;
    const correct = finalAnswers.filter((a, i) => a === quizState.data[i].answer_index).length;

    // 1) quiz_attempts 저장
    await supabase.from('quiz_attempts').insert({
      heritage_id: id, total: quizState.data.length, correct, duration_sec: elapsed,
      details: finalAnswers.map((a, i) => ({
        quiz_id: quizState.data[i].id, picked: a, correct: a === quizState.data[i].answer_index,
      })),
    });

    // 2) activity_log
    await supabase.from('activity_log').insert({ heritage_id: id, action: 'quiz' });

    setPhase('done');
  }

  // 결과 계산 (메모)
  const result = useMemo(() => {
    if (quizState.status !== 'success') return null;
    const correct = answers.filter((a, i) => a === quizState.data[i].answer_index).length;
    return {
      correct,
      total: quizState.data.length,
      rate: quizState.data.length ? Math.round((correct / quizState.data.length) * 100) : 0,
      time: `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`,
    };
  }, [answers, quizState, elapsed]);

  if (quizState.status === 'loading') return <><Nav /><Spinner /></>;
  if (quizState.status === 'error')   return <><Nav /><ErrorBox error={quizState.error} /></>;
  if (quizState.status !== 'success') return null;

  // ─── 문제 없음 ───────────────────────────────────────
  if (quizState.data.length === 0) {
    return (
      <>
        <Nav />
        <EmptyState
          emoji="📝"
          title="이 문화재의 퀴즈가 아직 없어요"
          desc="다른 문화재를 둘러보세요."
          action={<Link to={`/heritage/${id}`} className="btn btn--primary">← 상세 보기</Link>}
        />
      </>
    );
  }

  // ─── 결과 화면 ───────────────────────────────────────
  if (phase === 'done' && result) {
    const passing = result.rate >= 60;
    return (
      <>
        <Nav />
        <main className="quiz-wrap">
          <div className="card result">
            <div className="result__icon">{passing ? '🎉' : '💪'}</div>
            <h2>{passing ? '퀴즈 완료!' : '한 번 더 도전!'}</h2>
            <p style={{ color: 'var(--text-dim)', margin: '6px 0 0' }}>
              {passing ? '이 문화재에 대한 이해도가 높아요.' : '해설을 보고 다시 시도해 보세요.'}
            </p>
            <div className="result__score">
              <Stat label="정답"     value={`${result.correct}/${result.total}`} />
              <Stat label="정답률"   value={`${result.rate}%`} />
              <Stat label="소요시간" value={result.time} />
            </div>
            <div className="result__actions">
              <button onClick={() => location.reload()} className="btn btn--primary">한 번 더</button>
              <Link to={`/heritage/${id}`} className="btn btn--ghost">상세 보기</Link>
              <Link to="/" className="btn btn--ghost">다른 문화재</Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // ─── 문제 풀이 화면 ───────────────────────────────────
  const q = quizState.data[idx];
  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;

  return (
    <>
      <Nav />
      <div className="progress">
        <div className="progress__bar">
          <div className="progress__fill" style={{ width: `${((idx + 1) / quizState.data.length) * 100}%` }} />
        </div>
        <div className="progress__meta">
          <span>{idx + 1} / {quizState.data.length} 문제</span>
          <span>⏱️ {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}</span>
        </div>
      </div>

      <main className="quiz-wrap">
        <article className="qcard card">
          <span className="qcard__cat">{q.category}</span>
          <div className="qcard__img">{q.emoji}</div>
          <h2 className="qcard__q">{q.question}</h2>

          <div className="opts">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={
                  picked === null ? 'opt'
                  : i === q.answer_index ? 'opt correct'
                  : i === picked ? 'opt wrong'
                  : 'opt'
                }
                onClick={() => pick(i)}
                disabled={picked !== null}
              >
                <span className="opt__num">{'ABCD'[i]}</span>
                <span className="opt__text">{opt}</span>
              </button>
            ))}
          </div>

          {picked !== null && (
            <div className={`explain ${picked === q.answer_index ? '' : 'wrong-explain'}`}>
              {picked === q.answer_index ? '✅️ ' : '❌ '}
              <strong>{picked === q.answer_index ? '정답!' : '오답'}</strong> — {q.explanation}
            </div>
          )}

          <div className="actions">
            <Link to={`/heritage/${id}`} className="btn btn--ghost">← 그만두기</Link>
            <button className="btn btn--primary" onClick={next} disabled={picked === null}>
              {idx === quizState.data.length - 1 ? '결과 보기 →' : '다음 →'}
            </button>
          </div>
        </article>
      </main>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🏛 우리<span>문화재</span></div>
      <nav className="nav-links">
        <Link to="/">검색</Link>
        <Link to="/mission">탐방 미션</Link>
        <Link to="/history">학습 기록</Link>
        <Link to="/fav">즐겨찾기</Link>
      </nav>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="result__stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
