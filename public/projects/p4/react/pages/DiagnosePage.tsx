/**
 * DiagnosePage — 진단 평가 시작 화면
 *
 * 흐름:
 *   1) 자격증 정보 표시 + 평가 개요
 *   2) "진단 시작" 클릭 → 3초 카운트다운
 *   3) Edge Function `diagnose` 호출 → 25문제 선별
 *   4) /result/:diagnoseId 로 이동
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Certification } from '../types';

export default function DiagnosePage() {
  const { certId } = useParams<{ certId: string }>();
  const navigate = useNavigate();
  const [cert, setCert] = useState<Certification | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!certId) return;
    supabase.from('certifications').select('*').eq('id', certId).single()
      .then(({ data }) => setCert(data as Certification));
  }, [certId]);

  // 3초 카운트다운 후 진단 시작
  useEffect(() => {
    if (countdown <= 0) return;
    if (countdown === 1) {
      setTimeout(async () => {
        const { data } = await supabase.functions.invoke('diagnose', { body: { cert_id: certId } });
        navigate(`/result/${data?.diagnosis_id ?? 'sample'}`);
      }, 800);
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 800);
    return () => clearTimeout(t);
  }, [countdown, certId, navigate]);

  if (!cert) return <p style={{ padding: 40 }}>로딩 중...</p>;

  return (
    <>
      <Nav />
      <div className="page-head">
        <span className="badge">{cert.name}</span>
        <h1>🩺 진단 평가</h1>
        <p>현재 실력을 정확히 파악한 후 맞춤 학습 계획을 만들어드립니다.</p>
      </div>

      <main className="intro">
        <article className="info card">
          <div className="info__head">
            <div className="info__ico">💻</div>
            <div>
              <h2 className="info__title">{cert.name} — 종합 진단</h2>
              <p className="info__sub">25문항 · 약 30분 소요</p>
            </div>
          </div>
          <div className="info__grid">
            <div><span>총 문항</span><strong>25문제</strong></div>
            <div><span>제한 시간</span><strong>30분</strong></div>
            <div><span>난이도</span><strong>★★★☆☆</strong></div>
          </div>

          <div style={{ background: 'rgba(245,158,11,.08)', borderLeft: '3px solid var(--warn)',
                       padding: '12px 14px', borderRadius: '0 10px 10px 0', fontSize: '.85rem' }}>
            💡 <strong>안내</strong>: 진단 평가는 횟수 제한 없이 다시 볼 수 있어요. 한 번 풀면 결과가 자동 저장됩니다.
          </div>
        </article>

        <div className="card start" style={{ marginTop: 16 }}>
          <p className="start__big">준비되셨나요?</p>
          <p className="start__sub">진단을 시작하면 30분 타이머가 자동으로 작동합니다.</p>
          <button className="btn btn--primary"
                  onClick={() => setCountdown(3)}
                  disabled={countdown > 0}>
            🩺 진단 시작 →
          </button>
        </div>
      </main>

      {/* 카운트다운 모달 */}
      {countdown > 0 && (
        <div className="timer-modal">
          <div className="timer-modal__panel">
            <div className="timer-modal__count">{countdown}</div>
            <p style={{ margin: 0, color: 'var(--text-dim)' }}>곧 시작됩니다…</p>
          </div>
        </div>
      )}
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🎓 자격증 코치</div>
      <nav className="nav-links">
        <Link to="/">자격증 선택</Link>
        <Link to="/diagnose" className="on">진단</Link>
      </nav>
    </header>
  );
}
