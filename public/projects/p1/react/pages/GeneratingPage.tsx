/**
 * GeneratingPage — 동화 생성 진행률
 * ────────────────────────────────────────────────────────────
 * 5단계 파이프라인 시각화:
 *   1) 소재 분석 및 줄거리 구상
 *   2) 연령별 어휘 수준으로 본문 작성
 *   3) 장면별로 분할 (5~8장)
 *   4) 장면별 삽화 프롬프트 생성
 *   5) 독후활동 질문 및 활동 생성
 *
 * 실시간 진행:
 *   - Supabase Realtime 으로 stories.status 변경 구독 (최우선)
 *   - status === 'done' 자동 → /reader/:id
 *   - 백업: 30초 polling + 최대 60초 타임아웃 → ErrorBox
 *
 * 패턴:
 *   - useInterval 로 단계 시각 효과 + progress bar
 *   - useEffect 로 Realtime channel 생명주기 관리
 *   - 에러 상태에서 "다시 시도" 버튼
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useInterval } from '../hooks';
import { ErrorBox } from '../components/Common';

interface Step { title: string; duration: number; }

const STEPS: Step[] = [
  { title: '소재 분석 및 줄거리 구상',          duration: 3 },
  { title: '연령별 어휘 수준으로 본문 작성',     duration: 6 },
  { title: '장면별로 분할 (5~8장)',             duration: 2 },
  { title: '장면별 삽화 프롬프트 생성',          duration: 5 },
  { title: '독후활동 질문 및 활동 생성',         duration: 3 },
];

const TOTAL_DURATION = STEPS.reduce((s, x) => s + x.duration, 0);

type Phase = 'generating' | 'completed' | 'timeout' | 'error';

export default function GeneratingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [phase, setPhase]           = useState<Phase>('generating');
  const [progress, setProgress]     = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed]       = useState(0);

  // ─── Realtime 구독 (status 변경 감지) ────────────────────
  useEffect(() => {
    if (!id || phase !== 'generating') return;
    const channel = supabase
      .channel(`story-${id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stories', filter: `id=eq.${id}` },
        (payload: any) => {
          if (payload.new.status === 'done') {
            setPhase('completed');
            setTimeout(() => navigate(`/reader/${id}`), 600);
          } else if (payload.new.status === 'error') {
            setPhase('error');
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, phase, navigate]);

  // ─── 진행률 시뮬레이션 (1초마다) ─────────────────────────
  useInterval(() => {
    if (phase !== 'generating') return;
    setElapsed((e) => e + 1);
  }, phase === 'generating' ? 1000 : null);

  useEffect(() => {
    if (phase !== 'generating') return;
    const pct = Math.min(95, (elapsed / TOTAL_DURATION) * 100);
    setProgress(pct);

    // 현재 단계 자동 계산
    let acc = 0;
    for (let i = 0; i < STEPS.length; i++) {
      acc += STEPS[i].duration;
      if (elapsed < acc) { setCurrentStep(i); break; }
    }
    if (elapsed >= TOTAL_DURATION) setCurrentStep(STEPS.length);
  }, [elapsed, phase]);

  // ─── 타임아웃 백업 (60초 후 강제 종료) ──────────────────
  useEffect(() => {
    if (phase !== 'generating') return;
    const timer = setTimeout(async () => {
      const { data } = await supabase.from('stories').select('status').eq('id', id).single();
      if (data?.status === 'done') {
        navigate(`/reader/${id}`);
      } else {
        setPhase('timeout');
      }
    }, 60_000);
    return () => clearTimeout(timer);
  }, [id, phase, navigate]);

  // ─── 에러 / 타임아웃 화면 ────────────────────────────
  if (phase === 'error' || phase === 'timeout') {
    return (
      <div className="gen">
        <div className="gen__icon">{phase === 'error' ? '⚠️' : '⏱️'}</div>
        <h1>{phase === 'error' ? '생성 중 오류가 발생했어요' : '시간이 너무 오래 걸려요'}</h1>
        <p className="gen__sub">잠시 후 다시 시도해 주세요.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18 }}>
          <button onClick={() => location.reload()} className="btn btn--primary">🔄 다시 시도</button>
          <Link to="/create" className="btn btn--ghost">← 새로 만들기</Link>
        </div>
      </div>
    );
  }

  // ─── 완료 화면 (잠시 표시 후 자동 이동) ──────────────
  if (phase === 'completed') {
    return (
      <div className="gen">
        <div className="gen__icon" style={{ background: 'linear-gradient(135deg, #22c55e, #4ade80)' }}>
          ✓
        </div>
        <h1>완성됐어요!</h1>
        <p className="gen__sub">동화 뷰어로 이동 중...</p>
      </div>
    );
  }

  // ─── 진행 중 ─────────────────────────────────────────
  const secsLeft = Math.max(0, Math.round(TOTAL_DURATION - elapsed));
  return (
    <div className="gen">
      <div className="gen__icon">✨</div>
      <h1>아이만의 동화를 만들고 있어요</h1>
      <p className="gen__sub">Solar LLM이 한국적 소재를 엮어내는 중입니다</p>

      <div className="progress">
        <div className="progress__bar">
          <div className="progress__fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress__meta">
          <span>{Math.round(progress)}%</span>
          <span>약 {secsLeft}초 남음</span>
        </div>
      </div>

      <ul className="steps">
        {STEPS.map((step, i) => (
          <li key={i} className={`step ${
            i < currentStep ? 'done' : i === currentStep ? 'doing' : 'todo'
          }`}>
            <span className="step__check">{i < currentStep ? '✓' : i + 1}</span>
            <span className="step__title">{step.title}</span>
            <span className="step__time">~{step.duration}초</span>
          </li>
        ))}
      </ul>

      <div className="tip">
        💡 Tip — 동화가 완성되면 PDF로 저장하거나 인쇄해 종이책처럼 읽을 수 있어요.
      </div>
    </div>
  );
}
