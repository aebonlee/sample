/**
 * SearchPage — 정책 검색 (키워드 + 카테고리 + 마감 임박)
 *
 * RAG 검색이 아닌 일반 SQL 필터 검색.
 * 카테고리 칩 + 정렬 (인기/마감/최신/금액).
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Policy, PolicyCategory } from '../types';

const CATS: { value: PolicyCategory | 'all'; emoji: string; label: string }[] = [
  { value: 'all',        emoji: '',    label: '전체' },
  { value: '주거',       emoji: '🏠',  label: '주거' },
  { value: '취업·창업',  emoji: '💼',  label: '취업·창업' },
  { value: '금융·자산',  emoji: '💰',  label: '금융·자산' },
  { value: '교육·역량',  emoji: '📚',  label: '교육·역량' },
  { value: '건강',       emoji: '🏥',  label: '건강' },
];

type SortKey = 'popular' | 'deadline' | 'recent' | 'amount';

export default function SearchPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [query, setQuery]       = useState('');
  const [cat, setCat]           = useState<PolicyCategory | 'all'>('all');
  const [sort, setSort]         = useState<SortKey>('popular');

  useEffect(() => {
    supabase.from('policies').select('*').then(({ data }) => {
      setPolicies((data ?? []) as Policy[]);
    });
  }, []);

  // ─── 필터 + 정렬 ──────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = policies.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (q && !(p.title + p.description).toLowerCase().includes(q)) return false;
      return true;
    });

    switch (sort) {
      case 'deadline':
        list = list.sort((a, b) => (a.apply_deadline ?? '').localeCompare(b.apply_deadline ?? ''));
        break;
      case 'amount':
        list = list.sort((a, b) => b.amount_max - a.amount_max);
        break;
      case 'recent':
        list = list.sort((a, b) => 0);   // 실제로는 created_at 필요
        break;
    }
    return list;
  }, [policies, query, cat, sort]);

  return (
    <>
      <Nav />
      <div className="page-head"><h1>🔍 정책 검색</h1></div>

      {/* 검색 박스 */}
      <div className="search-box">
        <div className="search-box__inner">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예) 청년 월세, 창업 지원금..."
          />
          <button>🔍 검색</button>
        </div>
      </div>

      {/* 카테고리 칩 */}
      <div className="cats">
        {CATS.map((c) => {
          const count = c.value === 'all'
            ? policies.length
            : policies.filter((p) => p.category === c.value).length;
          return (
            <span
              key={c.value}
              className={`cat ${cat === c.value ? 'on' : ''}`}
              onClick={() => setCat(c.value)}
            >
              {c.emoji} {c.label} {count}
            </span>
          );
        })}
      </div>

      <main className="results">
        <div className="results-bar">
          <h3>{query ? `"${query}"` : '전체'} 검색 결과 <strong>{filtered.length}건</strong></h3>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="popular">인기순</option>
            <option value="deadline">마감 임박순</option>
            <option value="recent">최신순</option>
            <option value="amount">지원금 큰 순</option>
          </select>
        </div>

        <div className="grid">
          {filtered.map((p) => <PolicyCard key={p.id} policy={p} />)}
        </div>
      </main>
    </>
  );
}

function PolicyCard({ policy }: { policy: Policy }) {
  const daysLeft = policy.apply_deadline
    ? Math.ceil((new Date(policy.apply_deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <Link to={`/policy/${policy.id}`} className="card policy">
      <span className="policy__cat">{policy.category}</span>
      <h3 className="policy__title">{policy.title}</h3>
      <p className="policy__org">{policy.organization}</p>
      <p className="policy__amount">{policy.amount_summary}</p>
      {daysLeft !== null && daysLeft > 0 && (
        <span className={`deadline ${daysLeft > 30 ? 'deadline--soft' : ''}`}>
          D-{daysLeft} 마감
        </span>
      )}
    </Link>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">💬 청년톡톡</div>
      <nav className="nav-links">
        <Link to="/">챗봇</Link>
        <Link to="/search" className="on">검색</Link>
        <Link to="/my">맞춤 정책</Link>
        <Link to="/checklist">체크리스트</Link>
        <Link to="/calendar">캘린더</Link>
      </nav>
    </header>
  );
}
