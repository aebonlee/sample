/**
 * JournalPage — 격려 & 성찰 저널
 * ────────────────────────────────────────────────────────────
 * 핵심 패턴:
 *   - useAsync 로 격려 / 성찰 질문 / 지난 기록 병렬 로드
 *   - 작성 후 optimistic update (즉시 목록에 추가, 실패 시 롤백)
 *   - "다른 격려" 버튼으로 메시지 재생성
 *   - 글자 수 카운터 + 자동 감정 추출 (Edge Function)
 *
 * 데이터:
 *   - journals 테이블 (body, prompt, mood_emoji, tags)
 *   - encouragements 테이블 (저장된 격려 메시지)
 *   - Edge Functions: encourage / reflect
 */

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync } from '../hooks';
import { Spinner, EmptyState } from '../components/Common';
import type { Journal } from '../types';

export default function JournalPage() {
  const [body, setBody]       = useState('');
  const [pastList, setPastList] = useState<Journal[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ─── AI 격려 + 성찰 질문 + 지난 기록 병렬 로드 ────────
  const initialState = useAsync(async () => {
    const [enc, refl, past] = await Promise.all([
      supabase.functions.invoke('encourage', { body: { context: 'today' } })
        .then(({ data }) => data?.message as string ?? '오늘도 잘하고 있어요.')
        .catch(() => '오늘도 잘하고 있어요.'),
      supabase.functions.invoke('reflect', { body: {} })
        .then(({ data }) => data?.question as string ?? '오늘 가장 고마웠던 순간은?')
        .catch(() => '오늘 가장 고마웠던 순간은?'),
      supabase.from('journals').select('*')
        .order('written_at', { ascending: false }).limit(5)
        .then(({ data }) => (data ?? []) as Journal[]),
    ]);
    return { encouragement: enc, prompt: refl, past };
  }, []);

  // 초기 로드된 past 를 state 에 동기화
  if (initialState.status === 'success' && pastList.length === 0 && initialState.data.past.length > 0) {
    setPastList(initialState.data.past);
  }

  // ─── 저장 (optimistic) ────────────────────────────
  async function saveJournal(e: FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;

    setSubmitting(true);
    const prompt = initialState.status === 'success' ? initialState.data.prompt : '';

    // 1) 낙관적 업데이트 (UI 먼저)
    const tempId = `temp-${Date.now()}`;
    const tempJournal: Journal = {
      id: tempId,
      user_id: '',
      prompt,
      body: body.trim(),
      written_at: new Date().toISOString(),
    };
    setPastList([tempJournal, ...pastList]);
    setBody('');

    // 2) 서버 INSERT
    try {
      const { data, error } = await supabase.from('journals').insert({
        prompt,
        body: tempJournal.body,
      }).select().single();
      if (error) throw error;

      // 3) 임시 항목 교체
      setPastList((prev) => prev.map((j) => j.id === tempId ? (data as Journal) : j));
    } catch (err) {
      // 롤백
      setPastList((prev) => prev.filter((j) => j.id !== tempId));
      setBody(tempJournal.body);
      alert(`저장 실패: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── 새 격려 메시지 ───────────────────────────────
  async function newEncouragement() {
    if (initialState.status !== 'success') return;
    const { data } = await supabase.functions.invoke('encourage', { body: { context: 'refresh' } });
    if (data?.message) {
      initialState.data.encouragement = data.message;
      // 강제 리렌더링 (실제로는 useState 사용 권장)
      setBody((b) => b);
    }
  }

  // ─── 격려 메시지 저장 ─────────────────────────────
  async function saveEncouragement() {
    if (initialState.status !== 'success') return;
    await supabase.from('encouragements').insert({
      message: initialState.data.encouragement,
      is_saved: true,
    });
    alert('저장했어요 ♥');
  }

  if (initialState.status === 'loading') return <div className="phone"><Spinner /></div>;

  const { encouragement, prompt } = initialState.status === 'success'
    ? initialState.data
    : { encouragement: '...', prompt: '...' };

  return (
    <div className="phone">
      <header className="greet">
        <p>{new Date().toLocaleDateString('ko-KR', { dateStyle: 'long' })}</p>
        <h1>📓 오늘 잠깐 멈춰서 적어볼까요?</h1>
      </header>

      {/* AI 격려 카드 */}
      <article className="quote-card">
        <p className="quote-card__text">{encouragement}</p>
        <p className="quote-card__author">— 오늘의 격려</p>
        <div className="quote-card__actions">
          <button className="quote-card__btn" onClick={saveEncouragement}>♥ 저장</button>
          <button className="quote-card__btn" onClick={newEncouragement}>↻ 다른 격려</button>
        </div>
      </article>

      {/* 오늘의 성찰 질문 */}
      <article className="prompt">
        <h4>💭 오늘의 성찰 질문</h4>
        <p>{prompt}</p>
      </article>

      {/* 작성 폼 */}
      <form className="entry-form" onSubmit={saveJournal}>
        <div className="entry-form__head">
          <h3>오늘의 한 줄</h3>
          <span>비공개 · 본인만 열람</span>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="자유롭게 적어보세요. 정해진 형식 없이, 떠오르는 대로 괜찮아요."
          maxLength={1000}
        />
        <div className="entry-form__foot">
          <span className="entry-form__count">
            {body.length} / 1000자
            {body.length > 0 && body.length < 20 && ' · 한 문장만 더!'}
          </span>
          <button type="submit" className="entry-form__save"
                  disabled={!body.trim() || submitting}>
            {submitting ? '저장 중...' : '📝 저장'}
          </button>
        </div>
      </form>

      {/* 지난 기록 */}
      <section className="past">
        <h3>📅 지난 기록</h3>
        {pastList.length === 0 ? (
          <EmptyState
            emoji="📓"
            title="아직 저널이 없어요"
            desc="첫 한 줄을 적어보세요."
          />
        ) : (
          pastList.map((j) => <PastEntry key={j.id} journal={j} />)
        )}
      </section>

      <TabBar active="journal" />
    </div>
  );
}

// ─── 보조 ─────────────────────────────────────────

function PastEntry({ journal }: { journal: Journal }) {
  return (
    <article className="entry">
      <div className="entry__head">
        <span className="entry__date">
          {new Date(journal.written_at).toLocaleDateString('ko-KR',
            { month: 'long', day: 'numeric', weekday: 'short' })}
        </span>
        <span className="entry__mood">{journal.mood_emoji ?? '📝'}</span>
      </div>
      {journal.prompt && (
        <p style={{ fontSize: '.78rem', color: 'var(--text-mute)',
                    marginBottom: 6, fontStyle: 'italic' }}>
          💭 {journal.prompt}
        </p>
      )}
      <p className="entry__text">{journal.body}</p>
      {journal.tags && journal.tags.length > 0 && (
        <div className="entry__tags">
          {journal.tags.map((t) => <span key={t} className="entry__tag">#{t}</span>)}
        </div>
      )}
    </article>
  );
}

function TabBar({ active }: { active: string }) {
  return (
    <nav className="tabbar">
      <Link to="/" className={`tab ${active === 'home' ? 'on' : ''}`}><span>🏠</span>홈</Link>
      <Link to="/routine" className={`tab ${active === 'routine' ? 'on' : ''}`}><span>🌿</span>루틴</Link>
      <Link to="/journal" className={`tab ${active === 'journal' ? 'on' : ''}`}><span>📓</span>저널</Link>
      <Link to="/chart" className={`tab ${active === 'chart' ? 'on' : ''}`}><span>📊</span>그래프</Link>
      <Link to="/setting" className={`tab ${active === 'setting' ? 'on' : ''}`}><span>⚙</span>설정</Link>
    </nav>
  );
}
