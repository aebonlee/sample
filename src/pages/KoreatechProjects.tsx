import { useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Highlight, themes } from 'prism-react-renderer';
import {
  KOREATECH_PROJECTS,
  CT_STEPS,
  RUBRIC,
  type CTProjectData,
} from '../data/koreatechProjects';

/* ── 7단계 SVG 프로세스 다이어그램 ── */
const CTProcessSVG = () => (
  <svg viewBox="0 0 868 110" style={{ width: '100%', maxWidth: 868, display: 'block', margin: '0 auto' }}>
    {CT_STEPS.map((step, i) => {
      const x = i * 124;
      const w = 112;
      return (
        <g key={step.id}>
          <rect x={x} y={10} width={w} height={88} rx={14} fill={step.color} opacity={0.1} stroke={step.color} strokeWidth={2} />
          <circle cx={x + w / 2} cy={36} r={14} fill={step.color} />
          <text x={x + w / 2} y={41} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">{i + 1}</text>
          <text x={x + w / 2} y={68} textAnchor="middle" fontSize={12} fontWeight={700} fill={step.color}>{step.labelKo}</text>
          <text x={x + w / 2} y={86} textAnchor="middle" fontSize={11} fill="#999">{step.score}점</text>
          {i < CT_STEPS.length - 1 && (
            <path d={`M${x + w + 2},54 L${x + w + 11},54 L${x + w + 8},48 L${x + w + 16},54 L${x + w + 8},60 L${x + w + 11},54`} fill={step.color} opacity={0.6} />
          )}
        </g>
      );
    })}
  </svg>
);

/* ── 파이썬 코드 블록 ── */
const CodeBlock = ({ code }: { code: string }) => {
  const cleaned = code.replace(/^```python\n/, '').replace(/\n```$/, '');
  return (
    <div style={{ position: 'relative' }}>
      <span
        style={{
          position: 'absolute',
          top: 8,
          right: 12,
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#94a3b8',
          background: '#334155',
          padding: '2px 8px',
          borderRadius: 6,
          zIndex: 1,
        }}
      >
        Python
      </span>
      <Highlight code={cleaned} language="python" theme={themes.nightOwl}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={className}
            style={{
              ...style,
              padding: '20px 20px 16px',
              borderRadius: 10,
              fontSize: '0.82rem',
              lineHeight: 1.7,
              overflowX: 'auto',
              margin: 0,
              fontFamily: "'Fira Code', 'Consolas', monospace",
            }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

/* ── 개요 페이지 (평가 기준 + 루브릭 + 프로젝트 목록) ── */
const OverviewPage = () => (
  <>
    <div className="ktp-info-box">
      <h3 style={{ marginTop: 0 }}>💡 컴퓨팅 사고 7단계 프로세스 (100점)</h3>
      <div style={{ overflowX: 'auto', padding: '12px 0' }}>
        <CTProcessSVG />
      </div>
      <div className="ktp-step-chips">
        {CT_STEPS.map((step) => (
          <div
            key={step.id}
            className="ktp-step-chip"
            style={{
              background: `${step.color}12`,
              border: `1px solid ${step.color}30`,
              color: step.color,
            }}
          >
            <span>{step.emoji}</span>
            <span>{step.labelKo}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({step.score}점)</span>
          </div>
        ))}
      </div>
    </div>

    <div className="ktp-rubric-wrap">
      <h3>📋 평가 루브릭 (총 100점)</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="ktp-rubric-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>평가 영역</th>
              <th style={{ color: '#bbf7d0' }}>A (우수)</th>
              <th style={{ color: '#fef08a' }}>B (보통)</th>
              <th style={{ color: '#fecaca' }}>C (미흡)</th>
              <th style={{ whiteSpace: 'nowrap' }}>배점</th>
            </tr>
          </thead>
          <tbody>
            {RUBRIC.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{r.step}</td>
                <td style={{ color: '#059669' }}>{r.a}</td>
                <td style={{ color: '#D97706' }}>{r.b}</td>
                <td style={{ color: '#DC2626' }}>{r.c}</td>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>{r.score}</td>
              </tr>
            ))}
            <tr className="ktp-rubric-total">
              <td>합계</td>
              <td colSpan={3}></td>
              <td style={{ textAlign: 'center', fontSize: '1rem' }}>100</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <h3 style={{ marginBottom: 12 }}>📚 프로젝트 주제 ({KOREATECH_PROJECTS.length}개)</h3>
    <div className="ktp-project-grid">
      {KOREATECH_PROJECTS.map((p, i) => (
        <Link key={p.id} to={`/projects-koreatech/${p.id}`} className="ktp-project-card">
          <span
            className="ktp-project-icon"
            style={{
              background: `${p.color}18`,
              color: p.color,
            }}
          >
            {p.emoji}
          </span>
          <div>
            <span className="ktp-project-num">{String(i + 1).padStart(2, '0')}</span>
            <div className="ktp-project-title">{p.title}</div>
          </div>
        </Link>
      ))}
    </div>
  </>
);

/* ── 개별 프로젝트 페이지 (CT 7단계 + 코드) ── */
const ProjectDetailView = ({ project, projectIdx }: { project: CTProjectData; projectIdx: number }) => {
  const defaultPresentationText =
    '1. 프로젝트 결과물(코드) 실행 시연\n2. 컴퓨팅 사고 과정(문제 인식→정의→분해→추상화→알고리즘→구현) 설명\n3. 핵심 알고리즘과 코드 구조 설명\n4. 개선점 및 확장 가능성 제시\n5. 개인별 2분 발표 (질의응답 포함)';

  return (
    <>
      <div
        className="ktp-detail-hero"
        style={{
          background: `${project.color}18`,
          borderLeft: `4px solid ${project.color}`,
        }}
      >
        <span className="ktp-detail-hero-icon" style={{ color: project.color }}>
          {project.emoji}
        </span>
        <div style={{ flex: 1 }}>
          <span className="ktp-detail-num">PROJECT {String(projectIdx + 1).padStart(2, '0')}</span>
          <h3 className="ktp-detail-title">{project.title}</h3>
        </div>
        <Link
          to={`/projects-koreatech/${project.id}/build`}
          className="ktp-build-btn"
          style={{ background: project.color }}
        >
          🎨 구현 페이지 보기 →
        </Link>
      </div>

      {CT_STEPS.map((step) => {
        const content = project.steps[step.id];
        const text =
          content?.ko ?? (step.id === 'presentation' ? defaultPresentationText : null);
        if (!text) return null;
        const isCode = text.startsWith('```');

        return (
          <div key={step.id} className="ktp-step-block">
            <div className="ktp-step-header">
              <span
                className="ktp-step-header-icon"
                style={{ background: step.color }}
              >
                {step.emoji}
              </span>
              <h4 style={{ margin: 0, color: step.color, fontSize: '0.95rem' }}>
                {step.labelKo}
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#999', marginLeft: 4 }}>
                ({step.score}점)
              </span>
            </div>
            <div className="ktp-step-body">
              {isCode ? (
                <CodeBlock code={text} />
              ) : (
                text.split('\n').map((line, li) => (
                  <p key={li} style={{ margin: li === 0 ? 0 : '6px 0 0' }}>
                    {line}
                  </p>
                ))
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

/* ── 메인 페이지 ── */
export default function KoreatechProjects() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activePage = id ?? 'overview';

  const activeProject = useMemo(
    () => KOREATECH_PROJECTS.find((p) => p.id === activePage) ?? null,
    [activePage],
  );
  const activeProjectIdx = useMemo(
    () => KOREATECH_PROJECTS.findIndex((p) => p.id === activePage),
    [activePage],
  );

  useEffect(() => {
    document.title = activeProject
      ? `${activeProject.title} — 한기대 프로젝트`
      : '한기대 프로젝트 — 컴퓨팅 사고 실전';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeProject]);

  const goTo = (target: string) => {
    if (target === 'overview') navigate('/projects-koreatech');
    else navigate(`/projects-koreatech/${target}`);
  };

  return (
    <section className="container ktp-page">
      <header className="ktp-header">
        <div className="ktp-audience-badge">
          <span>👥</span>
          <span>한기대 재학생 과정</span>
        </div>
        <h1>한기대 프로젝트 — 컴퓨팅 사고 실전</h1>
        <p>
          한국기술교육대학교 재학생을 위한 9가지 공학·전공 융합 프로젝트로 컴퓨팅 사고 7단계
          (문제 인식 → 정의 → 분해 → 추상화 → 알고리즘 → 구현 → 발표)를 심화 체험합니다.
        </p>
      </header>

      <div className="ktp-layout">
        <aside className="ktp-sidebar">
          <div className="ktp-sidebar-head">📂 목차</div>
          <nav className="ktp-sidebar-nav">
            <button
              type="button"
              className={`ktp-sidebar-item${activePage === 'overview' ? ' is-active' : ''}`}
              onClick={() => goTo('overview')}
            >
              <span>📋</span>
              <span>평가 기준</span>
            </button>

            <div className="ktp-sidebar-divider" />

            {KOREATECH_PROJECTS.map((p, i) => (
              <button
                type="button"
                key={p.id}
                className={`ktp-sidebar-item${activePage === p.id ? ' is-active' : ''}`}
                onClick={() => goTo(p.id)}
                style={
                  activePage === p.id
                    ? { borderLeftColor: p.color, color: p.color, background: `${p.color}10` }
                    : undefined
                }
              >
                <span style={{ color: p.color }}>{p.emoji}</span>
                <span>
                  {String(i + 1).padStart(2, '0')}. {p.title}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="ktp-content">
          {activeProject ? (
            <ProjectDetailView project={activeProject} projectIdx={activeProjectIdx} />
          ) : (
            <OverviewPage />
          )}

          {activeProject && (
            <div className="ktp-nav-buttons">
              <button
                type="button"
                className="ktp-nav-btn ktp-nav-btn--prev"
                onClick={() =>
                  goTo(
                    activeProjectIdx > 0
                      ? KOREATECH_PROJECTS[activeProjectIdx - 1].id
                      : 'overview',
                  )
                }
              >
                ← {activeProjectIdx > 0 ? KOREATECH_PROJECTS[activeProjectIdx - 1].title : '평가 기준'}
              </button>
              {activeProjectIdx < KOREATECH_PROJECTS.length - 1 && (
                <button
                  type="button"
                  className="ktp-nav-btn ktp-nav-btn--next"
                  onClick={() => goTo(KOREATECH_PROJECTS[activeProjectIdx + 1].id)}
                >
                  {KOREATECH_PROJECTS[activeProjectIdx + 1].title} →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
