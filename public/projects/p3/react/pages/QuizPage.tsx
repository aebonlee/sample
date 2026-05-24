/**
 * QuizPage — 문제 풀기 (유형별)
 * ────────────────────────────────────────────────────────────
 * 4유형: 객관식 / 사료 분석 / 지도 / 이미지
 *
 * 핵심:
 *   - 유형 선택 → 해당 유형 6문제 로드
 *   - 시대 ID 가 있으면 해당 시대만, 없으면 전체에서
 *   - 즉시 채점 + 해설 + attempts 자동 기록
 *   - 진행률 + 누적 정답수 표시
 *
 * 패턴:
 *   - useAsync 로 유형 변경 시 문제 재로드
 *   - useLocalStorage 로 마지막 유형 기억
 *   - useInterval 로 1문제당 풀이 시간 측정
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, recordAttempt } from '../supabase';
import { useAsync, useLocalStorage, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Question, QuestionType } from '../types';

const TYPES: { value: QuestionType; emoji: string; label: string; sub: string }[] = [
  { value: 'mc',     emoji: '📝', label: '객관식',    sub: '5지선다' },
  { value: 'source', emoji: '📜', label: '사료 분석', sub: '제시문 해석' },
  { value: 'map',    emoji: '🗺', label: '지도',     sub: '위치/영역' },
  { value: 'image',  emoji: '🖼', label: '이미지',    sub: '유물/문화재' },
];

export default function QuizPage() {
  const { eraId } = useParams<{ eraId: string }>();
  const user = useSession();
  const [type, setType]     = useLocalStorage<QuestionType>('p3:quiz:type', 'source');
  const [idx, setIdx]       = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);

  // ─── 문제 로드 (type 변경 시 재호출) ────────────────
  const state = useAsync(async () => {
    let q = supabase.from('questions').select('*').eq('type', type).limit(6);
    if (eraId) q = q.eq('era_id', eraId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Question[];
  }, [type, eraId]);

  // 타입 변경 시 인덱스 초기화
  useEffect(() => {
    setIdx(0); setPicked(null); setStartedAt(Date.now()); setCorrectCount(0);
  }, [type]);

  // ─── 답 선택 → 채점 + 기록 ──────────────────────────
  async function pick(i: number) {
    if (picked !== null || !user || state.status !== 'success') return;
    setPicked(i);
    const q = state.data[idx];
    const isCorrect = i === q.answer_index;
    if (isCorrect) setCorrectCount((c) => c + 1);

    await recordAttempt({
      user_id: user.id,
      question_id: q.id,
      picked_index: i,
      is_correct: isCorrect,
      spent_sec: Math.floor((Date.now() - startedAt) / 1000),
    });
  }

  function nextQuestion() {
    if (state.status !== 'success') return;
    if (idx < state.data.length - 1) {
      setIdx(idx + 1); setPicked(null); setStartedAt(Date.now());
    }
  }

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;

  // 빈 결과
  if (state.data.length === 0) {
    return (
      <>
        <Nav />
        <div className="page-head"><h1>🎯 문제 풀기</h1></div>
        <TypeSelector type={type} onChange={setType} />
        <main className="quiz">
          <EmptyState
            emoji="📚"
            title={`${TYPES.find((t) => t.value === type)?.label} 유형 문제가 없어요`}
            desc="다른 유형을 선택하거나 시대를 바꿔보세요."
          />
        </main>
      </>
    );
  }

  const q = state.data[idx];
  const isLast = idx === state.data.length - 1;

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>🎯 문제 풀기</h1>
        <p>유형을 골라 약점부터 채워보세요. 매 문제마다 즉시 채점됩니다.</p>
      </div>

      <TypeSelector type={type} onChange={setType} />

      <main className="quiz">
        <div className="meta">
          <span>난이도 {'★'.repeat(q.difficulty)}{'☆'.repeat(5 - q.difficulty)}</span>
          <div className="progress">
            <div className="bar">
              <div className="bar__fill" style={{ width: `${((idx + 1) / state.data.length) * 100}%` }} />
            </div>
          </div>
          <span>{idx + 1} / {state.data.length} · ✓ {correctCount}</span>
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
              <strong>{picked === q.answer_index ? '정답!' : '오답'}</strong>
              {picked !== q.answer_index && (
                <> — 정답은 ({'①②③④⑤'[q.answer_index]}) <strong>{q.options[q.answer_index]}</strong></>
              )}
              <br/>{q.explanation}
            </div>
          )}

          <div className="actions">
            <button className="btn btn--ghost"
              onClick={() => { setIdx(Math.max(0, idx - 1)); setPicked(null); }}
              disabled={idx === 0}>← 이전</button>
            <button className="btn btn--primary"
              onClick={nextQuestion}
              disabled={picked === null || isLast}>
              {isLast ? '✓ 완료' : '다음 →'}
            </button>
          </div>
        </article>
      </main>
    </>
  );
}

// ─── 보조 ─────────────────────────────────────────

function TypeSelector({ type, onChange }: { type: QuestionType; onChange: (t: QuestionType) => void }) {
  return (
    <div className="types">
      {TYPES.map((t) => (
        <button key={t.value}
          className={`type ${type === t.value ? 'on' : ''}`}
          onClick={() => onChange(t.value)}>
          <span>{t.emoji}</span>
          <strong>{t.label}</strong>
          <small>{t.sub}</small>
        </button>
      ))}
    </div>
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
