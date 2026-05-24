/**
 * CertListPage — 자격증 선택 (홈)
 *
 * 핵심:
 *   - 모든 자격증 카드 그리드 표시
 *   - 검색 + 카테고리 필터
 *   - 사용자가 진행 중인 자격증 우선 표시
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCertifications } from '../supabase';
import type { Certification } from '../types';

const CATEGORIES = ['전체', 'IT/SW', '어학', '경영/금융', '공무원/공기업', '기술'];

export default function CertListPage() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [query, setQuery] = useState('');
  const [cat, setCat]     = useState('전체');

  useEffect(() => { fetchCertifications().then(setCerts); }, []);

  // ─── 필터링 (검색어 + 카테고리) ────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return certs.filter((c) => {
      if (cat !== '전체' && c.category !== cat) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [certs, query, cat]);

  return (
    <>
      <Nav />

      <div className="page-head">
        <h1>🎓 어떤 자격증을 준비하시나요?</h1>
        <p>먼저 진단 평가로 현재 실력을 파악하고, 취약점에 집중하는 학습 계획을 만들어드립니다.</p>
      </div>

      {/* ─── 검색 + 카테고리 ─── */}
      <div className="search-bar">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="자격증명 검색"
        />
      </div>

      <main className="container">
        <div className="cat-tabs">
          {CATEGORIES.map((c) => (
            <span key={c}
              className={`cat ${c === cat ? 'on' : ''}`}
              onClick={() => setCat(c)}
            >{c}</span>
          ))}
        </div>

        <div className="grid">
          {filtered.map((c) => <CertCard key={c.id} cert={c} />)}
        </div>
      </main>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🎓 자격증 코치</div>
      <nav>
        <Link to="/" className="on">자격증 선택</Link>
        <Link to="/diagnose">진단</Link>
        <Link to="/weakness">취약점</Link>
        <Link to="/plan">학습 계획</Link>
      </nav>
    </header>
  );
}

function CertCard({ cert }: { cert: Certification }) {
  return (
    <Link to={`/diagnose/${cert.id}`} className="cert">
      <div className="cert__head">
        <div className="cert__ico">📜</div>
        <div>
          <h3 className="cert__title">{cert.name}</h3>
          <p className="cert__sub">{cert.organization}</p>
        </div>
      </div>
      <div className="cert__meta">
        {cert.avg_months && <span>📚 평균 <strong>{cert.avg_months}개월</strong></span>}
        {cert.pass_rate && <span>📈 합격률 <strong>{cert.pass_rate}%</strong></span>}
      </div>
    </Link>
  );
}
