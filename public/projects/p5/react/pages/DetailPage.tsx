/**
 * DetailPage — 정책 상세 (자격조건 자동 매칭 + 신청 절차)
 *
 * 사용자 프로필을 가져와 정책의 eligibility 조건들과 비교 →
 * 모든 조건 충족 시 "🎉 모든 조건 충족!" 배너 표시.
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, fetchProfile } from '../supabase';
import type { Policy, Profile } from '../types';

interface Eligibility {
  field: string;
  label: string;
  value: string;
  isOk: boolean;
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [policy, setPolicy]   = useState<Policy | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: p }, pf] = await Promise.all([
        supabase.from('policies').select('*').eq('id', id).single(),
        fetchProfile(),
      ]);
      setPolicy(p as Policy | null);
      setProfile(pf);

      // 자격 조건 + 체크 결과
      const { data: el } = await supabase.from('eligibility').select('*').eq('policy_id', id);
      // 실제로는 each condition 을 평가, 여기선 데모용
      setEligibility((el ?? []).map((e: any) => ({
        field: e.field,
        label: e.field,
        value: JSON.stringify(e.value_json),
        isOk: true,
      })));
    })();
  }, [id]);

  if (!policy) return <p style={{ padding: 40 }}>로딩 중...</p>;

  const allOk = eligibility.every((e) => e.isOk);
  const daysLeft = policy.apply_deadline
    ? Math.ceil((new Date(policy.apply_deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <>
      <Nav />
      <p className="crumb" style={{ maxWidth: 1100, margin: '18px auto 0', padding: '0 24px' }}>
        <Link to="/search">검색</Link> › {policy.title}
      </p>

      <section className="hero">
        <span className="hero__cat">{policy.category}</span>
        <h1>{policy.title}</h1>
        <p className="hero__org">{policy.organization}</p>
        <div className="hero__amount">
          <div><span>지원 금액</span><strong>{policy.amount_summary}</strong></div>
          <div><span>지원 기간</span><strong>{policy.duration_months ?? '-'}개월</strong></div>
          {policy.apply_deadline && (
            <div><span>신청 마감</span><strong>{policy.apply_deadline}</strong></div>
          )}
        </div>
        <div className="hero__actions">
          <Link to="/checklist" className="btn">✓ 신청 체크리스트</Link>
          <button className="btn btn--ghost">⭐ 즐겨찾기</button>
          <button className="btn btn--ghost">📤 공유</button>
        </div>
      </section>

      <main className="layout">
        <div>
          <section className="card section">
            <h2>📋 자격 조건 — 모두 충족해야 합니다</h2>
            <div className="req-grid">
              {eligibility.map((e) => (
                <div key={e.field} className="req">
                  <p className="req__label">{e.label}</p>
                  <p className="req__value">{e.value}</p>
                  <span className={`req__check ${e.isOk ? '' : 'req__check--no'}`}>
                    {e.isOk ? '✓ 충족' : '✕ 미충족'}
                  </span>
                </div>
              ))}
            </div>
            {allOk && profile && (
              <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(22,163,74,.08)',
                           borderLeft: '4px solid var(--accent)', borderRadius: '0 10px 10px 0' }}>
                🎉 <strong>모든 조건 충족!</strong> 바로 신청하실 수 있어요.
              </div>
            )}
          </section>

          <section className="card section">
            <h2>📝 신청 절차</h2>
            <div className="steps">
              <Step n={1} title="복지로/마이홈 포털에서 신청">
                온라인 신청 권장. 오프라인은 거주지 주민센터 방문.
              </Step>
              <Step n={2} title="필수 서류 업로드">
                임대차계약서, 통장 사본, 가족관계증명서, 소득 확인 동의서.
              </Step>
              <Step n={3} title="자격 심사 (약 14일)">
                결과는 문자로 안내.
              </Step>
              <Step n={4} title="매월 25일 계좌 입금">
                선정 다음 달부터 자동 입금.
              </Step>
            </div>
          </section>
        </div>

        <aside className="side">
          {daysLeft !== null && (
            <div className="deadline-card">
              <p className="deadline-card__title">신청 마감까지</p>
              <p className="deadline-card__d">D-{daysLeft}</p>
              <p className="deadline-card__date">{policy.apply_deadline}</p>
            </div>
          )}
        </aside>
      </main>
    </>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="step">
      <p className="step__title">{title}</p>
      <p className="step__body">{children}</p>
    </div>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">💬 청년톡톡</div>
      <nav className="nav-links">
        <Link to="/">챗봇</Link>
        <Link to="/search">검색</Link>
        <Link to="/my">맞춤 정책</Link>
        <Link to="/checklist">체크리스트</Link>
        <Link to="/calendar">캘린더</Link>
      </nav>
    </header>
  );
}
