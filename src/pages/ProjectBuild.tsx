import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Highlight, themes } from 'prism-react-renderer';
import { PROJECT_DATA } from '../data/projectDetails';
import { getProjectMockup } from '../data/projectMockups';

type ViewTab = 'preview' | 'source';

export default function ProjectBuild() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useSearchParams();
  const projectId = Number(id ?? '1');
  const project = PROJECT_DATA.find((p) => p.id === projectId);
  const mockup = getProjectMockup(projectId);

  const initialPage = search.get('page') ?? mockup?.pages[0]?.id ?? 'home';
  const [activePageId, setActivePageId] = useState<string>(initialPage);
  const [tab, setTab] = useState<ViewTab>('preview');
  const [source, setSource] = useState<string>('');
  const [sourceState, setSourceState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const activePage = mockup?.pages.find((p) => p.id === activePageId);
  const pageUrl = mockup && activePage
    ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${mockup.baseDir}/${activePage.id}.html`
    : '';

  useEffect(() => {
    setSearch((s) => {
      const next = new URLSearchParams(s);
      next.set('page', activePageId);
      return next;
    }, { replace: true });
  }, [activePageId, setSearch]);

  useEffect(() => {
    if (project) document.title = `${project.title} — 구현 페이지`;
  }, [project]);

  useEffect(() => {
    if (tab !== 'source' || !pageUrl) return;
    setSourceState('loading');
    fetch(pageUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        setSource(text);
        setSourceState('ready');
      })
      .catch(() => setSourceState('error'));
  }, [tab, pageUrl]);

  if (!project || !mockup) {
    return (
      <section className="container empty-state" style={{ marginTop: 40 }}>
        <h3>프로젝트를 찾을 수 없습니다.</h3>
        <p><Link to="/projects">← 프로젝트 목록</Link></p>
      </section>
    );
  }

  async function copy() {
    try { await navigator.clipboard.writeText(source); } catch {}
  }

  return (
    <div className="container pb-page">
      <nav className="breadcrumb">
        <Link to="/projects">프로젝트 샘플</Link>
        <span>›</span>
        <Link to={`/projects/${project.id}`}>{project.title}</Link>
        <span>›</span>
        <span aria-current="page">구현 페이지</span>
      </nav>

      <header className="pb-head" style={{ borderLeftColor: project.color }}>
        <span className="pb-head__icon" style={{ background: `${project.color}1a`, color: project.color }}>
          {project.icon}
        </span>
        <div>
          <h1>{project.title} — 구현 페이지</h1>
          <p>왼쪽에서 페이지를 골라 실제 동작과 소스를 확인하세요. ✓ 완성된 페이지는 바로 사용 가능합니다.</p>
        </div>
        <Link to={`/projects/${project.id}`} className="btn btn--ghost btn--sm" style={{ marginLeft: 'auto' }}>
          ← 프로젝트 가이드
        </Link>
      </header>

      <div className="pb-layout">
        <aside className="pb-side">
          <h4 className="pb-side__h">페이지 ({mockup.pages.length})</h4>
          <nav className="pb-side__nav">
            {mockup.pages.map((p, idx) => (
              <button
                key={p.id}
                className={`pb-side__item ${p.id === activePageId ? 'is-active' : ''} pb-side__item--${p.status}`}
                onClick={() => setActivePageId(p.id)}
              >
                <span className="pb-side__num">{String(idx + 1).padStart(2, '0')}</span>
                <span className="pb-side__body">
                  <span className="pb-side__title">{p.title}</span>
                  {p.desc && <span className="pb-side__desc">{p.desc}</span>}
                </span>
                <span className="pb-side__badge">
                  {p.status === 'done' ? '✓' : p.status === 'wip' ? '⋯' : '○'}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="pb-stage">
          {activePage && activePage.status !== 'done' ? (
            <div className="pb-placeholder">
              <span style={{ fontSize: '3rem' }}>🎨</span>
              <h3>{activePage.title}</h3>
              <p>이 페이지는 아직 모형이 만들어지지 않았습니다.</p>
              <p className="pb-placeholder__hint">
                현재 완성된 페이지: <strong>{mockup.pages.filter((p) => p.status === 'done').length}</strong> / {mockup.pages.length}
                <br/>요청해 주시면 동일한 수준으로 추가 제작합니다.
              </p>
            </div>
          ) : (
            <>
              <div className="pb-tabs">
                <div className="pb-tabs__left">
                  <button
                    className={`pb-tab ${tab === 'preview' ? 'is-on' : ''}`}
                    onClick={() => setTab('preview')}
                  >👁 미리보기</button>
                  <button
                    className={`pb-tab ${tab === 'source' ? 'is-on' : ''}`}
                    onClick={() => setTab('source')}
                  >&lt;/&gt; 소스</button>
                </div>
                <div className="pb-tabs__right">
                  <a href={pageUrl} target="_blank" rel="noreferrer" className="pb-mini">새 탭 ↗</a>
                  {tab === 'source' && sourceState === 'ready' && (
                    <button className="pb-mini" onClick={copy}>복사</button>
                  )}
                </div>
              </div>

              <div className="pb-content">
                {tab === 'preview' ? (
                  <div className="pb-preview">
                    <iframe
                      key={pageUrl}
                      src={pageUrl}
                      title={activePage?.title ?? ''}
                      sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                  </div>
                ) : (
                  <div className="pb-source">
                    {sourceState === 'loading' && <div className="pb-source__state">로드 중…</div>}
                    {sourceState === 'error' && <div className="pb-source__state pb-source__state--err">불러오기 실패</div>}
                    {sourceState === 'ready' && (
                      <Highlight code={source} language="markup" theme={themes.vsDark}>
                        {({ className, style, tokens, getTokenProps }) => (
                          <pre className={`source-viewer__pre ${className}`} style={style}>
                            <code className="source-viewer__code">
                              {tokens.map((line, i) => (
                                <div key={i} className="source-viewer__line">
                                  <span className="source-viewer__lineno">{i + 1}</span>
                                  {line.map((token, j) => {
                                    const { key: _k, ...tp } = getTokenProps({ token });
                                    return <span key={j} {...tp} />;
                                  })}
                                </div>
                              ))}
                            </code>
                          </pre>
                        )}
                      </Highlight>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
