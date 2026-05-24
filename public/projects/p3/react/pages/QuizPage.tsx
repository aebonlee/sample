/**
 * QuizPage — 문제 풀기 (유형별)
 *
 * 4가지 유형: 객관식 / 사료 분석 / 지도 / 이미지
 * 즉시 채점 + 해설 + attempts 테이블에 자동 저장.
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, recordAttempt } from '../supabase';
import type { Question, QuestionType } from '../types';

const TYPES: { value: QuestionType; emoji: string; label: string; sub: string }[] = [
  { value: 'mc',     emoji: '📝', label: '객관식',    sub: '5지선다' },
  { value: 'source', emoji: '📜', label: '사료 분석', sub: '제시문 해석' },
  { value: 'map',    emoji: '🗺', label: '지도',     sub: '위치/영역' },
  { value: 'image',  emoji: '🖼', label: '이미지',    sub: '유물/문화재' },
];

export default function QuizPage() {
  const { eraId } = useParams<{ eraId: string }>();
  const [type, setType]             = useState<QuestionType>('source');
  const [questions, setQuestions]   = useState<Question[]>([]);
  const [idx, setIdx]               = useState(0);
  const [picked, setPicked]         = useState<number | null>(null);
  const [startTime]                 = useState(Date.now());

  // ─── 문제 로드 ───────────────────────────────────────
  useEffect(() => {
    let q = supabase.from('questions').select('*').eq('type', type).limit(6);
    if (eraId) q = q.eq('era_id', eraId);
    q.then(({ data }) => {
      setQuestions((data ?? []) as Question[]);
      setIdx(0); setPicked(null);
    });
  }, [type, eraId]);

  async function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const q = questions[idx];
    await recordAttempt({
      user_id: '',
      question_id: q.id,
      picked_index: i,
      is_correct: i === q.answer_index,
      spent_sec: Math.floor((Date.now() - startTime) / 1000),
    });
  }

  if (!questions.length) {
    return (
      <>
        <Nav />
        <p style={{ padding: 40 }}>📜 문제를 불러오는 중...</p>
      </>
    );
  }

  const q = questions[idx];

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>🎯 문제 풀기</h1>
        <p>유형을 골라 약점부터 채워보세요. 매 문제마다 즉시 채점됩니다.</p>
      </div>

      {/* 유형 선택 */}
      <div className="types">
        {TYPES.map((t) => (
          <button
            key={t.value}
            className={`type ${type === t.value ? 'on' : ''}`}
            onClick={() => setType(t.value)}
          >
            <span>{t.emoji}</span>
            <strong>{t.label}</strong>
            <small>{t.sub}</small>
          </button>
        ))}
      </div>

      <main className="quiz">
        <div className="meta">
          <span>난이도 {'★'.repeat(q.difficulty)}{'☆'.repeat(5 - q.difficulty)}</span>
          <div className="progress">
            <div className="bar">
              <div className="bar__fill" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
            </div>
          </div>
          <span>{idx + 1} / {questions.length}</span>
        </div>

        <article className="qcard card">
          <span className="qcard__era">{TYPES.find((t) => t.value === q.type)?.label}</span>
          <h2 className="qcard__q">{q.question}</h2>

          {q.source_text && (
            <div className="source">
              "{q.source_text}"
              {q.source_meta && <small>{q.source_meta}</small>}
            </div>
          )}

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
                <span className="opt__num">{'①②③④⑤'[i]}</span>
                <span className="opt__text">{opt}</span>
              </button>
            ))}
          </div>

          {picked !== null && (
            <div className={`explain ${picked === q.answer_index ? '' : 'wrong'}`}>
              {picked === q.answer_index ? '✅ ' : '❌ '}
              <strong>{picked === q.answer_index ? '정답!' : '오답'}</strong> — 정답은 ({'①②③④⑤'[q.answer_index]}) <strong>{q.options[q.answer_index]}</strong> 입니다.
              <br/>{q.explanation}
            </div>
          )}

          <div className="actions">
            <button className="btn btn--ghost"
              onClick={() => { setIdx(Math.max(0, idx - 1)); setPicked(null); }}
              disabled={idx === 0}
            >← 이전</button>
            <button className="btn btn--primary"
              onClick={() => { setIdx(Math.min(questions.length - 1, idx + 1)); setPicked(null); }}
              disabled={picked === null}
            >다음 →</button>
          </div>
        </article>
      </main>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📜 한국사 마스터</div>
      <nav className="nav-links">
        <Link to="/">타임라인</Link>
        <Link to="/quiz" className="on">문제 풀기</Link>
        <Link to="/note">오답 노트</Link>
        <Link to="/report">성적표</Link>
        <Link to="/mock">모의고사</Link>
      </nav>
    </header>
  );
}
