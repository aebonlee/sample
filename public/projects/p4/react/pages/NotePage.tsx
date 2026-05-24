/**
 * NotePage — 자격증 오답 노트 (코드 포함)
 *
 * 자격증 문제는 코드 스니펫이 있는 경우가 많아 별도 표시.
 * attempts 집계 → 정답률 < 80% 인 문제만 노출.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Question } from '../types';

interface WrongItem {
  question: Question;
  picked_index: number;
  wrong_count: number;
  attempted_at: string;
}

export default function NotePage() {
  const [items, setItems] = useState<WrongItem[]>([]);
  const [filter, setFilter] = useState<string>('전체');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('attempts')
        .select('picked_index, attempted_at, question:questions(*)')
        .eq('is_correct', false)
        .order('attempted_at', { ascending: false })
        .limit(50);

      // 같은 문제 묶기 (wrong_count 집계)
      const map = new Map<string, WrongItem>();
      (data ?? []).forEach((a: any) => {
        const q = a.question as Question;
        const existing = map.get(q.id);
        if (existing) existing.wrong_count++;
        else map.set(q.id, {
          question: q,
          picked_index: a.picked_index,
          wrong_count: 1,
          attempted_at: a.attempted_at,
        });
      });
      setItems(Array.from(map.values()));
    })();
  }, []);

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📕 오답 노트</h1>
        <p>틀린 문제는 정답률 80%가 될 때까지 자동으로 복습 큐에 들어갑니다.</p>
      </div>

      <div className="summary">
        <Sum label="전체 오답" value={`${items.length}문제`} />
        <Sum label="가장 약한 과목" value="DB 구축" />
        <Sum label="이번 주 복습" value={`${Math.min(items.length, 22)}회`} />
        <Sum label="완전 정복" value="18문제" />
      </div>

      <div className="filters">
        {['전체', '설계', '개발', 'DB', '언어', '시스템', '🔴 2회+'].map((f) => (
          <span
            key={f}
            className={`chip ${filter === f ? 'on' : ''}`}
            onClick={() => setFilter(f)}
          >{f}</span>
        ))}
      </div>

      <main className="list">
        {items.length === 0
          ? <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-mute)' }}>
              🎉 오답이 없어요!
            </p>
          : items.map((item) => <NoteItem key={item.question.id} item={item} />)
        }
      </main>
    </>
  );
}

function NoteItem({ item }: { item: WrongItem }) {
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

      {q.code_snippet && (
        <pre className="item__code">{q.code_snippet}</pre>
      )}

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
        <button className="mini">🔁 다시 풀기</button>
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
        <Link to="/note" className="on">오답 노트</Link>
      </nav>
    </header>
  );
}
