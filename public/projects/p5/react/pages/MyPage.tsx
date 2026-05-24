/**
 * MyPage — 내 맞춤 정책
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - 프로필 + 맞춤 정책(matchPolicies RPC) + 진행 중 신청 병렬 로드
 *   - 매칭률 ≥90% → 마감 임박, 70-89% → 추천
 *   - 신청 진행률 (preparing/submitted/reviewing)
 *
 * 패턴:
 *   - useAsync 로 병렬 로드
 *   - 예상 총 혜택 합산 계산
 */

import { Link } from 'react-router-dom';
import { supabase, fetchProfile, matchPolicies } from '../supabase';
import { useAsync } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Profile, Policy, Application } from '../types';

export default function MyPage() {
  // ─── 프로필 + 매칭 + 신청 병렬 로드 ────────────────
  const state = useAsync(async () => {
    const [profile, matched, { data: apps }] = await Promise.all([
      fetchProfile(),
      matchPolicies(),
      supabase
        .from('applications')
        .select('*, policy:policies(*)')
        .neq('status', 'approved')
        .neq('status', 'rejected'),
    ]);
    return {
      profile,
      matched,
      applications: (apps ?? []) as Array<Application & { policy: Policy }>,
    };
  }, []);

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;

  const { profile, matched, applications } = state.data;
  const urgent      = matched.filter((m) => m.score >= 0.9).slice(0, 3);
  const recommended = matched.filter((m) => m.score >= 0.7 && m.score < 0.9).slice(0, 3);
  const expectedBenefit = matched.reduce((s, m) => s + (m.amount_total ?? 0), 0);

  if (!profile) {
    return (
      <>
        <Nav />
        <EmptyState
          emoji="👋"
          title="먼저 프로필을 설정해주세요"
          desc="연령·지역·소득 정보를 입력하면 맞춤 정책이 자동으로 매칭됩니다."
        />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/profile/edit" className="btn btn--primary">프로필 만들기</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📋 나의 맞춤 정책</h1>
        <p>등록된 프로필 기준 자동 매칭된 정책입니다.</p>
      </div>

      {/* 프로필 카드 */}
      <div className="profile">
        <article className="card profile__inner">
          <div className="profile__av">{profile.name?.[0] ?? 'U'}</div>
          <div>
            <div className="profile__name">
              {profile.name} ({new Date().getFullYear() - profile.birth_year}세)
            </div>
            <div className="profile__meta">{profile.region} · {profile.employment}</div>
          </div>
          <div className="profile__tags">
            {profile.custom_tags?.map((t) => <span key={t} className="profile__tag">{t}</span>)}
          </div>
          <Link to="/profile/edit" className="profile__edit">✏️ 프로필 수정</Link>
        </article>
      </div>

      {/* KPI */}
      <div className="stats">
        <Stat label="맞춤 정책"      value={matched.length}      suffix="개" />
        <Stat label="신청 진행"      value={applications.length} suffix="건" />
        <Stat label="긴급 (마감≤7일)" value={urgent.length}      suffix="건" />
        <Stat label="예상 총 혜택"   value={`₩${(expectedBenefit / 10000).toFixed(0)}`} suffix="만" />
      </div>

      <main className="sections">
        {urgent.length > 0 && (
          <Section title="🔥 마감 임박 — 지금 신청하세요" count={urgent.length}>
            {urgent.map((p) => <MatchedCard key={p.id} policy={p} highMatch />)}
          </Section>
        )}

        {applications.length > 0 && (
          <Section title="📤 신청 진행 중" count={applications.length}>
            {applications.map((a) => <ApplicationCard key={a.id} app={a} />)}
          </Section>
        )}

        {recommended.length > 0 ? (
          <Section title="🎯 추천 정책" count={recommended.length}>
            {recommended.map((p) => <MatchedCard key={p.id} policy={p} />)}
          </Section>
        ) : matched.length === 0 && (
          <EmptyState
            emoji="🔍"
            title="아직 매칭된 정책이 없어요"
            desc="프로필 정보를 더 자세히 입력하면 매칭률이 올라가요."
          />
        )}
      </main>
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="section__head"><h2>{title}</h2><span>{count}건</span></div>
      <div className="grid">{children}</div>
    </section>
  );
}

function MatchedCard({ policy, highMatch }: { policy: Policy & { score: number }; highMatch?: boolean }) {
  return (
    <Link to={`/policy/${policy.id}`} className="card item">
      <div className="item__head">
        <span className="item__cat">{policy.category}</span>
        <span className={`item__match ${highMatch ? 'item__match--high' : ''}`}>
          매칭률 {Math.round(policy.score * 100)}%
        </span>
      </div>
      <h3>{policy.title}</h3>
      <p className="item__org">{policy.organization}</p>
      <div className="item__amt">{policy.amount_summary}</div>
    </Link>
  );
}

function ApplicationCard({ app }: { app: Application & { policy: Policy } }) {
  const stepMap = { preparing: 25, submitted: 50, reviewing: 75 } as const;
  const pct = stepMap[app.status as keyof typeof stepMap] ?? 100;
  const labelMap = { preparing: '준비 중', submitted: '제출 완료', reviewing: '심사 중' } as const;
  return (
    <article className="card item item--applied">
      <div className="item__head">
        <span className="item__cat">{app.policy.category}</span>
        <span className="item__match item__match--high">
          {labelMap[app.status as keyof typeof labelMap] ?? app.status}
        </span>
      </div>
      <h3>{app.policy.title}</h3>
      <p className="item__org">{app.policy.organization}</p>
      <div className="item__progress">
        <div className="item__progress-bar">
          <div className="item__progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="item__progress-label">
          <span>접수 → 심사 → 발표</span>
          <span>{pct}%</span>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number | string; suffix: string }) {
  return <div className="stat"><span>{label}</span><strong>{value}<em>{suffix}</em></strong></div>;
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">💬 청년톡톡</div>
      <nav className="nav-links">
        <Link to="/">챗봇</Link>
        <Link to="/search">검색</Link>
        <Link to="/my" className="on">맞춤 정책</Link>
        <Link to="/checklist">체크리스트</Link>
        <Link to="/calendar">캘린더</Link>
      </nav>
    </header>
  );
}
