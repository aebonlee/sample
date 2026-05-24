/**
 * NotePage — 오답 노트
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - wrong_notes 뷰 (정답률 80% 미만인 문제 자동 추출)
 *   - 시대/유형 다중 필터 + 오답 빈도순 정렬
 *   - "다시 풀기" → attempts 에 새 시도 추가 → 정답 시 노트에서 자동 제거
 *   - "관련 학습" → 해당 시대의 학습 페이지로 이동
 *
 * 패턴:
 *   - useAsync 로 노트 + 시대 마스터 병렬 로드
 *   - useLocalStorage 로 필터 상태 영속화
 *   - useMemo 로 그룹화·필터링 캐싱
 */

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useLocalStorage, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Question, QuestionType, Era } from '../types';

interface WrongNote {
  question_id: string;
  wrong_count: number;
  last_wrong_at: string;
  last_picked: number;
  question: Question & { era?: Era };
}

type SortKey = 'recent' | 'frequency' | 'era';

const TYPE_LABELS: Record<QuestionType, string> = {
  mc:     '객관식',
  source: '사료 분석',
  map:    '지도',
  image:  '이미지',
};

export default function NotePage() {
  const user = useSession();
  const [filterTypes, setFilterTypes] = useLocalStorage<QuestionType[]>('p3:note:types', []);
  const [filterEras, setFilterEras]   = useLocalStorage<string[]>('p3:note:eras', []);
  const [onlyRepeat, setOnlyRepeat]   = useLocalStorage<boolean>('p3:note:repeat', false);
  const [sort, setSort]               = useLocalStorage<SortKey>('p3:note:sort', 'recent');

  // ─── 오답 노트 + 시대 마스터 병렬 로드 ──────────────────
  const dataState = useAsync(async () => {
    if (!user) return { notes: [] as WrongNote[], eras: [] as Era[] };
    const [{ data: noteData, error: noteErr }, { data: eraData }] = await Promise.all([
      supabase.from('wrong_notes')
        .select('*, question:questions(*, era:eras(*))')
        .order('last_wrong_at', { ascending: false }),
      supabase.from('eras').select('*').order('ord'),
    ]);
    if (noteErr) throw noteErr;
    return {
      notes: (noteData ?? []) as WrongNote[],
      eras:  (eraData ?? []) as Era[],
    };
  }, [user?.id]);

  // ─── 필터 + 정렬 ──────────────────────────────────────
  const visibleNotes = useMemo(() => {
    if (dataState.status !== 'success') return [];
    let notes = [...dataState.data.notes];

    if (filterTypes.length > 0) {
      notes = notes.filter((n) => filterTypes.includes(n.question.type));
    }
    if (filterEras.length > 0) {
      notes = notes.filter((n) => n.question.era_id && filterEras.includes(n.question.era_id));
    }
    if (onlyRepeat) {
      notes = notes.filter((n) => n.wrong_count >= 2);
    }

    switch (sort) {
      case 'frequency':
        notes.sort((a, b) => b.wrong_count - a.wrong_count);
        break;
      case 'era':
        notes.sort((a, b) => (a.question.era?.ord ?? 0) - (b.question.era?.ord ?? 0));
        break;
      case 'recent':
      default:
        notes.sort((a, b) => b.last_wrong_at.localeCompare(a.last_wrong_at));
    }
    return notes;
  }, [dataState, filterTypes, filterEras, onlyRepeat, sort]);

  // ─── 요약 통계 ────────────────────────────────────────
  const summary = useMemo(() => {
    const all = dataState.status === 'success' ? dataState.data.notes : [];
    const thisWeek = all.filter((n) =>
      (Date.now() - new Date(n.last_wrong_at).getTime()) / 86400000 <= 7,
    ).length;
    const weakestEra = (() => {
      if (all.length === 0) return '—';
      const eraCount: Record<string, number> = {};
      all.forEach((n) => {
        const name = n.question.era?.name ?? '기타';
        eraCount[name] = (eraCount[name] ?? 0) + n.wrong_count;
      });
      return Object.entries(eraCount).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '—';
    })();
    return { total: all.length, thisWeek, weakestEra };
  }, [dataState]);

  if (dataState.status === 'loading') return <><Nav /><Spinner /></>;
  if (dataState.status === 'error')   return <><Nav /><ErrorBox error={dataState.error} /></>;
  if (dataState.status !== 'success') return null;

  function toggleType(t: QuestionType) {
    setFilterTypes(filterTypes.includes(t) ? filterTypes.filter((x) => x !== t) : [...filterTypes, t]);
  }
  function toggleEra(id: string) {
    setFilterEras(filterEras.includes(id) ? filterEras.filter((x) => x !== id) : [...filterEras, id]);
  }
  function resetFilters() {
    setFilterTypes([]); setFilterEras([]); setOnlyRepeat(false);
  }

  const hasFilter = filterTypes.length > 0 || filterEras.length > 0 || onlyRepeat;

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📕 오답 노트</h1>
        <p>틀린 문제는 정답률 80%가 될 때까지 자동으로 복습 큐에 들어갑니다.</p>
      </div>

      <div className="summary">
        <Sum label="전체 오답" value={`${summary.total}문제`} />
        <Sum label="가장 약한 시대" value={summary.weakestEra} />
        <Sum label="이번 주 새 오답" value={`${summary.thisWeek}회`} />
      </div>

      {/* ─── 필터 영역 ─── */}
      <div className="filters" style={{ display: 'block' }}>
        <div style={{ marginBottom: 10 }}>
          <strong style={{ fontSize: '.8rem', color: 'var(--text-mute)', marginRight: 8 }}>유형</strong>
          {(['mc', 'source', 'map', 'image'] as QuestionType[]).map((t) => (
            <span key={t}
              className={`chip ${filterTypes.includes(t) ? 'on' : ''}`}
              onClick={() => toggleType(t)}>{TYPE_LABELS[t]}</span>
          ))}
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong style={{ fontSize: '.8rem', color: 'var(--text-mute)', marginRight: 8 }}>시대</strong>
          {dataState.data.eras.map((e) => (
            <span key={e.id}
              className={`chip ${filterEras.includes(e.id) ? 'on' : ''}`}
              onClick={() => toggleEra(e.id)}>{e.name}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`chip ${onlyRepeat ? 'on' : ''}`}
            onClick={() => setOnlyRepeat(!onlyRepeat)}>🔴 2회+ 오답만</span>
          <select className="sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="recent">최근 순</option>
            <option value="frequency">오답 빈도순</option>
            <option value="era">시대 순</option>
          </select>
          {hasFilter && (
            <button onClick={resetFilters}
                    style={{ padding: '7px 14px', borderRadius: 999, border: '1px solid var(--border)',
                             background: 'transparent', cursor: 'pointer', fontSize: '.82rem' }}>
              필터 초기화 ✕️
            </button>
          )}
        </div>
      </div>

      <main className="list">
        {visibleNotes.length === 0 ? (
          summary.total === 0 ? (
            <EmptyState
              emoji="🎉"
              title="오답이 없거나, 모두 복습 완료했어요!"
              desc="문제를 더 풀어보시면 약점을 자동으로 관리해드릴게요."
              action={<Link to="/quiz" className="btn btn--primary">문제 풀기 →</Link>}
            />
          ) : (
            <EmptyState
              emoji="🔍"
              title="필터 조건에 맞는 오답이 없어요"
              action={<button onClick={resetFilters} className="btn btn--ghost">필터 초기화</button>}
            />
          )
        ) : (
          visibleNotes.map((n) => <NoteCard key={n.question_id} note={n} />)
        )}
      </main>
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function NoteCard({ note }: { note: WrongNote }) {
  const navigate = useNavigate();
  const q = note.question;

  return (
    <article className="note card">
      <div className="note__head">
        <div className="note__tags">
          {q.era && <span className="note__tag note__tag--era">{q.era.name}</span>}
          <span className="note__tag note__tag--type">{TYPE_LABELS[q.type]}</span>
          {note.wrong_count >= 2 && (
            <span className="note__tag note__tag--cnt">{note.wrong_count}회 오답</span>
          )}
        </div>
        <span className="note__date">
          {new Date(note.last_wrong_at).toLocaleDateString('ko-KR')}
        </span>
      </div>

      <p className="note__q">{q.question}</p>

      {q.source_text && (
        <div style={{ padding: '12px 14px', background: 'var(--bg)', borderLeft: '3px solid var(--accent)',
                     borderRadius: '0 8px 8px 0', fontSize: '.88rem', marginBottom: 10, fontStyle: 'italic' }}>
          "{q.source_text}"
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,.06)',
                     border: '1px solid rgba(220,38,38,.2)', borderRadius: 10 }}>
          <strong style={{ fontSize: '.72rem', color: 'var(--danger)', display: 'block', marginBottom: 4 }}>
            내 답
          </strong>
          {['①','②','③','④','⑤'][note.last_picked]} {q.options[note.last_picked]}
        </div>
        <div style={{ padding: '10px 14px', background: 'rgba(22,163,74,.06)',
                     border: '1px solid rgba(22,163,74,.2)', borderRadius: 10 }}>
          <strong style={{ fontSize: '.72rem', color: 'var(--ok)', display: 'block', marginBottom: 4 }}>
            정답
          </strong>
          {['①','②','③','④','⑤'][q.answer_index]} {q.options[q.answer_index]}
        </div>
      </div>

      <div className="note__exp">
        💡 <strong>해설</strong>: {q.explanation}
      </div>

      <div className="note__actions">
        <button className="mini-btn" onClick={() => navigate(`/quiz?retry=${q.id}`)}>
          🔁 다시 풀기
        </button>
        {q.era && (
          <button className="mini-btn" onClick={() => navigate(`/study/${q.era_id}`)}>
            📚 이 시대 학습
          </button>
        )}
        <button className="mini-btn">📌 즐겨찾기</button>
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
