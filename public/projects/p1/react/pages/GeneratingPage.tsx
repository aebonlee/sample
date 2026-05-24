/**
 * GeneratingPage — 동화 생성 진행률
 * ────────────────────────────────────────────────────────────
 * 5단계 파이프라인의 진행을 시각화합니다:
 *   1) 소재 분석 및 줄거리 구상
 *   2) 연령별 어휘 수준으로 본문 작성
 *   3) 장면별로 분할 (5~8장)
 *   4) 장면별 삽화 프롬프트 생성
 *   5) 독후활동 질문 및 활동 생성
 *
 * 실시간 진행:
 *   - Supabase Realtime 으로 stories 테이블의 status 변경 구독
 *   - status === 'done' 이 되면 자동으로 /reader/:id 로 이동
 *   - 백업: 30초 polling
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';

interface Step {
  title: string;
  duration: number; // 예상 소요 (초)
}

const STEPS: Step[] = [
  { title: '소재 분석 및 줄거리 구상',          duration: 3 },
  { title: '연령별 어휘 수준으로 본문 작성',     duration: 6 },
  { title: '장면별로 분할 (5~8장)',             duration: 2 },
  { title: '장면별 삽화 프롬프트 생성',          duration: 5 },
  { title: '독후활동 질문 및 활동 생성',         duration: 3 },
];

const TOTAL_DURATION = STEPS.reduce((s, x) => s + x.duration, 0); // 19초

export default function GeneratingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // ─── Supabase Realtime 구독 (status 변경 감지) ──────────
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`story-${id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stories', filter: `id=eq.${id}` },
        (payload: any) => {
          if (payload.new.status === 'done') navigate(`/reader/${id}`);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, navigate]);

  // ─── 단계 시뮬레이션 (시각 효과용) ──────────────────────
  useEffect(() => {
    const start = Date.now();
    let frame: number;

    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const pct = Math.min(100, (elapsed / TOTAL_DURATION) * 100);
      setProgress(pct);

      // 현재 단계 결정
      let acc = 0;
      for (let i = 0; i < STEPS.length; i++) {
        acc += STEPS[i].duration;
        if (elapsed < acc) { setCurrentStep(i); break; }
      }
      if (elapsed >= TOTAL_DURATION) setCurrentStep(STEPS.length);

      if (pct < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // ─── 백업 polling: 30초 후에도 status 변화 없으면 강제 이동 ──
  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(async () => {
      const { data } = await supabase.from('stories').select('status').eq('id', id).single();
      if (data?.status === 'done') navigate(`/reader/${id}`);
    }, 30_000);
    return () => clearTimeout(timer);
  }, [id, navigate]);

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
          <span>약 {Math.max(0, Math.round(TOTAL_DURATION - (progress / 100) * TOTAL_DURATION))}초 남음</span>
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
