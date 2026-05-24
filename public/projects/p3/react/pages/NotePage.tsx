/**
 * NotePage — 오답 노트
 *
 * 데이터:
 *   - wrong_notes 뷰 (정답률 80% 미만인 문제 자동 추출)
 *   - 시대/유형 필터 + 오답 빈도 정렬
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Question } from '../types';

interface WrongNote {
  question_id: string;
  wrong_count: number;
  last_wrong_at: string;
  question: Question;
  last_picked?: number;
}

export default function NotePage() {
  const [notes, setNotes] = useState<WrongNote[]>([]);
  const [filter, setFilter] = useState<string>('전체');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('wrong_notes')
        .select('*, question:questions(*)')
        .order('last_wrong_at', { ascending: false });
      setNotes((data ?? []) as WrongNote[]);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filter === '전체') return notes;
    if (filter === '🔴 2회+') return notes.filter((n) => n.wrong_count >= 2);
    return notes;
  }, [notes, filter]);

  // 요약 통계
  const summary = useMemo(() => {
    const total = notes.length;
    const thisWeek = notes.filter((n) => {
      const days = (Date.now() - new Date(n.last_wrong_at).getTime()) / 86400000;
      return days <= 7;
    }).length;
    return { total, thisWeek };
  }, [notes]);

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📕 오답 노트</h1>
        <p>틀린 문제는 정답률 80%가 될 때까지 자동으로 복습 큐에 들어갑니다.</p>
      </div>

      <div className="summary">
        <Sum label="전체 오답"     value={`${summary.total}문제`} />
        <Sum label="가장 약한 시대" value="고려 후기" />
        <Sum label="이번 주 복습"   value={`${summary.thisWeek}회`} />
      </div>

      <div className="filters">
        {['전체', '고조선·삼국', '고려', '조선', '근현대', '🔴 2회+'].map((f) => (
          <span
            key={f}
            className={`chip ${filter === f ? 'on' : ''}`}
            onClick={() => setFilter(f)}
          >{f}</span>
        ))}
      </div>

      <main className="list">
        {filtered.length === 0
          ? <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-mute)' }}>
              🎉 오답이 없거나, 모두 복습 완료했어요!
            </p>
          : filtered.map((n) => <NoteCard key={n.question_id} note={n} />)
        }
      </main>
    </>
  );
}

function NoteCard({ note }: { note: WrongNote }) {
  const q = note.question;
  return (
    <article className="note card">
      <div className="note__head">
        <div className="note__tags">
          <span className="note__tag note__tag--era">시대</span>
          <span className="note__tag note__tag--type">{q.type}</span>
          {note.wrong_count >= 2 && (
            <span className="note__tag note__tag--cnt">{note.wrong_count}회 오답</span>
          )}
        </div>
        <span className="note__date">{new Date(note.last_wrong_at).toLocaleDateString('ko-KR')}</span>
      </div>
      <p className="note__q">{q.question}</p>
      <div className="note__exp">
        💡 정답: <strong>{q.options[q.answer_index]}</strong> — {q.explanation}
      </div>
      <div className="note__actions">
        <button className="mini-btn">🔁 다시 풀기</button>
        <button className="mini-btn">📌 즐겨찾기</button>
        <button className="mini-btn">📚 관련 학습</button>
      </div>
    </article>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📜 한국사 마스터</div>
      <nav className="nav-links">
        <Link to="/">타임라인</Link>
        <Link to="/quiz">문제 풀기</Link>
        <Link to="/note" className="on">오답 노트</Link>
        <Link to="/report">성적표</Link>
        <Link to="/mock">모의고사</Link>
      </nav>
    </header>
  );
}

function Sum({ label, value }: { label: string; value: string }) {
  return <div className="sum"><span>{label}</span><strong>{value}</strong></div>;
}
