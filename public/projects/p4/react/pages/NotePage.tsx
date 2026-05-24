/**
 * NotePage — 자격증 오답 노트 (코드 포함)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - attempts 중 is_correct=false 50건 → 같은 문제 묶기
 *   - 과목별 필터 + "2회 이상 오답" 필터
 *   - 코드 스니펫 있는 경우 별도 렌더
 *
 * 패턴:
 *   - useAsync 로 attempts 로드
 *   - useMemo 로 필터 적용
 *   - useLocalStorage 로 필터 상태 영속화
 *   - "다시 풀기" → /quiz?id=<question.id>
 */

import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useLocalStorage } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Question } from '../types';

interface WrongItem {
  question: Question;
  picked_index: number;
  wrong_count: number;
  attempted_at: string;
}

const FILTERS = ['전체', '설계', '개발', 'DB', '언어', '시스템', '🔴 2회+'];

export default function NotePage() {
  const nav = useNavigate();
  const [filter, setFilter] = useLocalStorage<string>('p4:note:filter', '전체');

  // ─── 오답 로드 + 묶기 ────────────────────────────
  const state = useAsync(async () => {
    const { data, error } = await supabase
      .from('attempts')
      .select('picked_index, attempted_at, question:questions(*)')
      .eq('is_correct', false)
      .order('attempted_at', { ascending: false })
      .limit(50);
    if (error) throw error;

    const map = new Map<string, WrongItem>();
    (data ?? []).forEach((a: any) => {
      const q = a.question as Question;
      if (!q) return;
      const existing = map.get(q.id);
      if (existing) existing.wrong_count++;
      else map.set(q.id, {
        question: q,
        picked_index: a.picked_index,
        wrong_count: 1,
        attempted_at: a.attempted_at,
      });
    });
    return Array.from(map.values());
  }, []);

  // ─── 필터 적용 ───────────────────────────────────
  const filtered = useMemo(() => {
    if (state.status !== 'success') return [];
    const items = state.data;
    if (filter === '전체') return items;
    if (filter === '🔴 2회+') return items.filter((i) => i.wrong_count >= 2);
    return items.filter((i) => (i.question as any).subject_name?.includes(filter));
  }, [state, filter]);

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;

  const items = state.data;
  const repeatCount = items.filter((i) => i.wrong_count >= 2).length;

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📕 오답 노트</h1>
        <p>틀린 문제는 정답률 80%가 될 때까지 자동으로 복습 큐에 들어갑니다.</p>
      </div>

      <div className="summary">
        <Sum label="전체 오답"      value={`${items.length}문제`} />
        <Sum label="2회 이상 오답"  value={`${repeatCount}문제`} />
        <Sum label="이번 주 복습"   value={`${Math.min(items.length, 22)}회`} />
        <Sum label="필터 결과"      value={`${filtered.length}문제`} />
      </div>

      <div className="filters">
        {FILTERS.map((f) => (
          <span
            key={f}
            className={`chip ${filter === f ? 'on' : ''}`}
            onClick={() => setFilter(f)}
          >{f}</span>
        ))}
      </div>

      <main className="list">
        {items.length === 0 ? (
          <EmptyState
            emoji="🎉"
            title="오답이 없어요!"
            desc="문제를 풀어보면 틀린 문제가 자동으로 모입니다."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title={`"${filter}" 에 해당하는 오답이 없어요`}
            desc="다른 필터를 선택해보세요."
          />
        ) : (
          filtered.map((item) => (
            <NoteItem
              key={item.question.id}
              item={item}
              onRetry={() => nav(`/quiz?id=${item.question.id}`)}
            />
          ))
        )}
      </main>
    </>
  );
}

function NoteItem({ item, onRetry }: { item: WrongItem; onRetry: () => void }) {
  const q = item.question;
  return (
    <article className="card item">
      <div className="item__top">
        <div className="item__tags">
          <span className="item__tag item__tag--sub">{q.type === 'code' ? '코드' : '객관식'}</span>
          {item.wrong_count >= 2 && (
            <span className="item__tag item__tag--cnt">{item.wrong_count}회 오답</span>
          )}
        </div>
        <span className="item__date">{new Date(item.attempted_at).toLocaleDateString('ko-KR')}</span>
      </div>

      <p className="item__q">{q.question}</p>

      {q.code_snippet && <pre className="item__code">{q.code_snippet}</pre>}

      <div className="answers">
        <div className="ans ans--my">
          <label>내 답</label>
          {q.options ? `${['①','②','③','④','⑤'][item.picked_index]} ${q.options[item.picked_index]}` : item.picked_index}
        </div>
        <div className="ans ans--ok">
          <label>정답</label>
          {q.options && q.answer_index !== undefined
            ? `${['①','②','③','④','⑤'][q.answer_index]} ${q.options[q.answer_index]}`
            : q.answer_text}
        </div>
      </div>

      <div className="item__exp">💡 {q.explanation}</div>

      <div className="item__actions">
        <button className="mini" onClick={onRetry}>🔁 다시 풀기</button>
        <button className="mini">📌 즐겨찾기</button>
        <button className="mini">📚 관련 학습</button>
      </div>
    </article>
  );
}

function Sum({ label, value }: { label: string; value: string }) {
  return <div className="sum"><span>{label}</span><strong>{value}</strong></div>;
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🎓 자격증 코치</div>
      <nav className="nav-links">
        <Link to="/">자격증 선택</Link>
        <Link to="/weakness">취약점</Link>
        <Link to="/plan">학습 계획</Link>
        <Link to="/note" className="on">오답 노트</Link>
      </nav>
    </header>
  );
}
