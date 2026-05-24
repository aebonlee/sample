/**
 * MockPage — 한능검 모의고사
 *
 * 50문항 / 70분 / OMR 카드 / 카운트다운 타이머.
 * mock_exams 테이블에 세션 저장 + 답안지 jsonb 보관.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Question, MockExam } from '../types';

const DURATION_MIN = 70;

export default function MockPage() {
  const [exam, setExam]         = useState<MockExam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers]   = useState<Record<number, number>>({});
  const [currentNum, setCurrentNum] = useState(1);
  const [secLeft, setSecLeft]   = useState(DURATION_MIN * 60);

  // ─── 시험 세션 시작 ──────────────────────────────────
  useEffect(() => {
    (async () => {
      // 1) mock_exams 세션 INSERT
      const { data: newExam } = await supabase
        .from('mock_exams')
        .insert({ grade: '기본', total_q: 50, duration_min: DURATION_MIN })
        .select()
        .single();
      if (newExam) setExam(newExam as MockExam);

      // 2) 문제 50개 (실제로는 출제 알고리즘 사용)
      const { data: qs } = await supabase
        .from('questions')
        .select('*')
        .limit(50);
      setQuestions((qs ?? []) as Question[]);
    })();
  }, []);

  // ─── 카운트다운 ─────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setSecLeft((s) => {
        if (s <= 1) { submit(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  function pickAnswer(qNum: number, optIndex: number) {
    setAnswers((prev) => ({ ...prev, [qNum]: optIndex }));
  }

  async function submit() {
    if (!exam) return;
    const correct = questions.filter((q, i) => answers[i + 1] === q.answer_index).length;
    const score = Math.round((correct / questions.length) * 100);
    await supabase.from('mock_exams').update({
      submitted_at: new Date().toISOString(),
      score,
      answer_sheet: answers,
    }).eq('id', exam.id);
    alert(`제출 완료! 점수: ${score}점 (${correct}/${questions.length})`);
  }

  const min = Math.floor(secLeft / 60);
  const sec = secLeft % 60;
  const answered = Object.keys(answers).length;

  if (!questions.length) return <p style={{ padding: 40 }}>📝 시험을 준비하는 중...</p>;

  const q = questions[currentNum - 1];

  return (
    <>
      <header className="exam-bar">
        <span className="exam-bar__title">📝 한능검 기본 모의고사</span>
        <div className={`exam-bar__timer ${secLeft < 600 ? 'warn' : ''}`}>
          ⏱ {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
        </div>
        <div className="exam-bar__btns">
          <button className="exam-bar__btn">⏸ 일시정지</button>
          <button className="exam-bar__btn exam-bar__btn--primary" onClick={submit}>제출</button>
        </div>
      </header>

      <main className="layout">
        <div className="paper">
          <div className="paper__header">
            <h1>한 국 사 능 력 검 정 시 험</h1>
            <p>기본 (4·5·6급) · 50문항 · {DURATION_MIN}분 · 100점 만점</p>
          </div>

          <article className="q">
            <span className="q__num">{currentNum}</span>
            <p className="q__title">{q.question}</p>
            {q.source_text && (
              <div className="q__src">
                "{q.source_text}"
                {q.source_meta && <small>{q.source_meta}</small>}
              </div>
            )}
            <ul className="q__opts">
              {q.options.map((opt, i) => (
                <li
                  key={i}
                  className={answers[currentNum] === i ? 'on' : ''}
                  onClick={() => pickAnswer(currentNum, i)}
                >
                  <span className="num">{'①②③④⑤'[i]}</span>{opt}
                </li>
              ))}
            </ul>
          </article>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <button onClick={() => setCurrentNum(Math.max(1, currentNum - 1))}>← 이전</button>
            <button onClick={() => setCurrentNum(Math.min(50, currentNum + 1))}>다음 →</button>
          </div>
        </div>

        {/* OMR 카드 */}
        <aside className="omr">
          <h3>📋 OMR 답안 카드</h3>
          <p className="omr__sub">클릭으로 문항 이동</p>
          <div className="omr__grid">
            {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                className={`omr__cell ${answers[n] !== undefined ? 'done' : ''} ${n === currentNum ? 'now' : ''}`}
                onClick={() => setCurrentNum(n)}
              >{n}</div>
            ))}
          </div>
          <div className="omr__progress">
            풀이 진행률<br/>
            <strong>{answered}</strong> / 50 ({Math.round(answered / 50 * 100)}%)
          </div>
          <button className="omr__submit" onClick={submit}>제출하기</button>
        </aside>
      </main>
    </>
  );
}
