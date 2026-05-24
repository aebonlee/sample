/**
 * QuizPage — 문화재 퀴즈 (5문제)
 * ────────────────────────────────────────────────────────────
 * 흐름:
 *   1) 문화재 ID 로 quizzes 테이블에서 5문제 가져오기
 *   2) 한 문제씩 풀이 → 즉시 채점 → 해설 표시
 *   3) 마지막 문제 후 결과 화면 (정답수/정답률/시간)
 *   4) quiz_attempts 테이블에 결과 저장
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Quiz } from '../types';

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const [quizzes, setQuizzes]   = useState<Quiz[]>([]);
  const [idx, setIdx]           = useState(0);
  const [picked, setPicked]     = useState<number | null>(null);
  const [answers, setAnswers]   = useState<number[]>([]);
  const [done, setDone]         = useState(false);
  const [elapsed, setElapsed]   = useState(0);

  // ─── 퀴즈 로드 ───────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    supabase.from('quizzes').select('*').eq('heritage_id', id).limit(5)
      .then(({ data }) => setQuizzes((data ?? []) as Quiz[]));
  }, [id]);

  // ─── 경과 시간 카운트 ────────────────────────────────
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  function handlePick(i: number) {
    if (picked !== null) return;
    setPicked(i);
  }

  function next() {
    if (picked === null) return;
    const newAnswers = [...answers, picked];
    setAnswers(newAnswers);

    if (idx === quizzes.length - 1) {
      finish(newAnswers);
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  }

  async function finish(finalAnswers: number[]) {
    setDone(true);
    const correct = finalAnswers.filter((a, i) => a === quizzes[i].answer_index).length;
    // 결과 저장
    await supabase.from('quiz_attempts').insert({
      heritage_id: id,
      total: quizzes.length,
      correct,
      duration_sec: elapsed,
      details: finalAnswers.map((a, i) => ({
        quiz_id: quizzes[i].id, picked: a, correct: a === quizzes[i].answer_index,
      })),
    });
  }

  const result = useMemo(() => {
    const correct = answers.filter((a, i) => a === quizzes[i].answer_index).length;
    return {
      correct,
      rate: quizzes.length ? Math.round((correct / quizzes.length) * 100) : 0,
      time: `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`,
    };
  }, [answers, quizzes, elapsed]);

  if (!quizzes.length) return <p style={{ padding: 40 }}>📖 퀴즈를 불러오는 중...</p>;

  if (done) {
    return (
      <>
        <Nav />
        <main className="quiz-wrap">
          <div className="card result">
            <div className="result__icon">🎉</div>
            <h2>퀴즈 완료!</h2>
            <div className="result__score">
              <Stat label="정답"     value={`${result.correct}/${quizzes.length}`} />
              <Stat label="정답률"   value={`${result.rate}%`} />
              <Stat label="소요시간" value={result.time} />
            </div>
            <div className="result__actions">
              <Link to={`/quiz/${id}`} className="btn btn--primary">한 번 더</Link>
              <Link to={`/heritage/${id}`} className="btn btn--ghost">상세 보기</Link>
              <Link to="/" className="btn btn--ghost">다른 문화재</Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const q = quizzes[idx];

  return (
    <>
      <Nav />
      <div className="progress">
        <div className="progress__bar">
          <div className="progress__fill" style={{ width: `${((idx + 1) / quizzes.length) * 100}%` }} />
        </div>
        <div className="progress__meta">
          <span>{idx + 1} / {quizzes.length} 문제</span>
          <span>⏱ {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
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
                onClick={() => handlePick(i)}
                disabled={picked !== null}
              >
                <span className="opt__num">{'ABCD'[i]}</span>
                <span className="opt__text">{opt}</span>
              </button>
            ))}
          </div>

          {picked !== null && (
            <div className={`explain ${picked === q.answer_index ? '' : 'wrong-explain'}`}>
              {picked === q.answer_index ? '✅ ' : '❌ '}
              <strong>{picked === q.answer_index ? '정답!' : '오답'}</strong> — {q.explanation}
            </div>
          )}

          <div className="actions">
            <Link to={`/heritage/${id}`} className="btn btn--ghost">← 그만두기</Link>
            <button className="btn btn--primary" onClick={next} disabled={picked === null}>
              {idx === quizzes.length - 1 ? '결과 보기 →' : '다음 →'}
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
