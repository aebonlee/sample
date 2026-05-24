/**
 * JournalPage — 격려 & 성찰 저널
 *
 * 데이터: journals 테이블
 * AI 격려 메시지 (Edge Function) + 성찰 질문 + 작성 + 지난 기록
 */

import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Journal } from '../types';

export default function JournalPage() {
  const [encouragement, setEncouragement] = useState<string>('');
  const [prompt, setPrompt]   = useState<string>('');
  const [body, setBody]       = useState('');
  const [past, setPast]       = useState<Journal[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 1) AI 격려 메시지
    supabase.functions.invoke('encourage', { body: { context: 'today' } })
      .then(({ data }) => setEncouragement(data?.message ?? '오늘도 잘하고 있어요.'));

    // 2) 성찰 질문
    supabase.functions.invoke('reflect', { body: {} })
      .then(({ data }) => setPrompt(data?.question ?? '오늘 가장 고마웠던 순간은?'));

    // 3) 지난 저널
    supabase.from('journals').select('*')
      .order('written_at', { ascending: false }).limit(5)
      .then(({ data }) => setPast((data ?? []) as Journal[]));
  }, []);

  async function saveJournal(e: FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    const { data, error } = await supabase.from('journals').insert({
      prompt, body: body.trim(),
    }).select().single();
    if (data) setPast([data as Journal, ...past]);
    setBody('');
    setSubmitting(false);
    if (error) alert(error.message);
  }

  return (
    <div className="phone">
      <header className="greet">
        <p>{new Date().toLocaleDateString('ko-KR', { dateStyle: 'long' })}</p>
        <h1>📓 오늘 잠깐 멈춰서 적어볼까요?</h1>
      </header>

      {/* AI 격려 */}
      <article className="quote-card">
        <p className="quote-card__text">{encouragement}</p>
        <p className="quote-card__author">— 오늘의 격려</p>
        <div className="quote-card__actions">
          <button className="quote-card__btn">♥ 저장</button>
          <button className="quote-card__btn">↻ 다른 격려</button>
        </div>
      </article>

      {/* 성찰 질문 */}
      <article className="prompt">
        <h4>💭 오늘의 성찰 질문</h4>
        <p>{prompt}</p>
      </article>

      {/* 작성 폼 */}
      <form className="entry-form" onSubmit={saveJournal}>
        <div className="entry-form__head">
          <h3>오늘의 한 줄</h3>
          <span>비공개</span>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="자유롭게 적어보세요."
          maxLength={1000}
        />
        <div className="entry-form__foot">
          <span className="entry-form__count">{body.length} / 1000자</span>
          <button type="submit" className="entry-form__save" disabled={submitting}>
            {submitting ? '저장 중...' : '📝 저장'}
          </button>
        </div>
      </form>

      {/* 지난 기록 */}
      <section className="past">
        <h3>📅 지난 기록</h3>
        {past.map((j) => (
          <article key={j.id} className="entry">
            <div className="entry__head">
              <span className="entry__date">
                {new Date(j.written_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              </span>
              <span className="entry__mood">{j.mood_emoji ?? '📝'}</span>
            </div>
            <p className="entry__text">{j.body}</p>
            {j.tags && j.tags.length > 0 && (
              <div className="entry__tags">
                {j.tags.map((t) => <span key={t} className="entry__tag">#{t}</span>)}
              </div>
            )}
          </article>
        ))}
      </section>

      <TabBar active="journal" />
    </div>
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
