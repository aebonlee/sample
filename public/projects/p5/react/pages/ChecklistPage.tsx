/**
 * ChecklistPage — 신청 체크리스트
 *
 * 5단계 진행률 + 단계별 세부 체크.
 * applications.checklist (jsonb) 에 토글 상태 저장.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

interface ChecklistStep {
  id: string;
  title: string;
  desc: string;
  items: string[];
}

const STEPS: ChecklistStep[] = [
  {
    id: 'step1',
    title: '자격 확인',
    desc: '연령·소득·주택 소유 등 기본 조건을 확인합니다.',
    items: ['만 19~34세인가요?', '무주택 (본인+부모)인가요?', '중위소득 100% 이하인가요?'],
  },
  {
    id: 'step2',
    title: '필수 서류 준비',
    desc: 'PDF로 준비, 합계 10MB 이내.',
    items: ['임대차계약서 사본', '본인 명의 통장 사본', '가족관계증명서', '소득 확인 동의서', '신분증 사본'],
  },
  {
    id: 'step3',
    title: '복지로 회원가입 + 본인 인증',
    desc: '간편인증(카카오·네이버·PASS)으로 본인 인증.',
    items: ['bokjiro.go.kr 가입 완료', '간편인증 로그인 성공'],
  },
  {
    id: 'step4',
    title: '신청서 작성 및 제출',
    desc: '복지로 → 청년 월세 한시 특별지원 메뉴.',
    items: ['신청서 기본 정보 입력', '임대차 정보 입력', '서류 5종 업로드', '개인정보 활용 동의', '최종 제출'],
  },
  {
    id: 'step5',
    title: '심사 결과 확인 & 입금',
    desc: '평균 14일 이내 결과 통보.',
    items: ['심사 결과 문자 수신', '첫 달 입금 확인'],
  },
];

export default function ChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // 진행률 계산
  const { totalItems, checkedItems, pct, currentStep } = useMemo(() => {
    const allItems = STEPS.flatMap((s) => s.items.map((i) => `${s.id}:${i}`));
    const total = allItems.length;
    const done = allItems.filter((k) => checked[k]).length;
    // 현재 단계: 모든 항목이 체크된 첫 단계의 다음
    let cur = 0;
    for (let i = 0; i < STEPS.length; i++) {
      const stepDone = STEPS[i].items.every((it) => checked[`${STEPS[i].id}:${it}`]);
      if (!stepDone) { cur = i; break; }
      if (i === STEPS.length - 1) cur = STEPS.length;
    }
    return {
      totalItems: total,
      checkedItems: done,
      pct: total ? Math.round((done / total) * 100) : 0,
      currentStep: cur,
    };
  }, [checked]);

  function toggle(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>✓ 신청 체크리스트</h1>
        <p>한 단계씩 따라하시면 누락 없이 신청할 수 있습니다.</p>
      </div>

      {/* 대상 정책 */}
      <div className="target">
        <div className="target__inner">
          <div className="target__ico">🏠</div>
          <div>
            <h2>청년 월세 한시 특별지원</h2>
            <p>매월 20만 원 × 12개월 = 총 240만 원</p>
          </div>
          <div className="target__d">
            <span style={{ opacity: .85, fontSize: '.8rem' }}>신청 마감</span>
            <strong>D-37</strong>
          </div>
        </div>
      </div>

      {/* 진행률 */}
      <div className="progress">
        <div className="progress__inner">
          <span className="progress__txt">진행률</span>
          <div className="progress__bar">
            <div className="progress__fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="progress__pct">{pct}% ({checkedItems}/{totalItems})</span>
        </div>
      </div>

      {/* 단계 카드 */}
      <main className="list">
        {STEPS.map((step, i) => {
          const stepClass = i < currentStep ? 'done' : i === currentStep ? 'now' : '';
          const allChecked = step.items.every((it) => checked[`${step.id}:${it}`]);
          return (
            <article key={step.id} className={`card step ${stepClass}`}>
              <span className="step__num">{allChecked ? '✓' : i + 1}</span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__desc">{step.desc}</p>
              <div className="checks">
                {step.items.map((item) => {
                  const k = `${step.id}:${item}`;
                  return (
                    <label key={k} className={`check ${checked[k] ? 'done' : ''}`}>
                      <input type="checkbox" checked={!!checked[k]} onChange={() => toggle(k)} />
                      {item}
                    </label>
                  );
                })}
              </div>
            </article>
          );
        })}
      </main>
    </>
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
        <Link to="/checklist" className="on">체크리스트</Link>
        <Link to="/calendar">캘린더</Link>
      </nav>
    </header>
  );
}
