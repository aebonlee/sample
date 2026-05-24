import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Highlight, themes, type Language } from 'prism-react-renderer';
import { PROJECT_DATA } from '../data/projectDetails';
import { getProjectMockup, type SharedFile } from '../data/projectMockups';

type ViewMode = 'preview' | 'html' | 'css' | 'js';

const FILE_TABS: { id: ViewMode; label: string; lang: Language }[] = [
  { id: 'preview', label: '👁 미리보기', lang: 'markup' },
  { id: 'html',    label: 'HTML',       lang: 'markup' },
  { id: 'css',     label: 'CSS',        lang: 'css' },
  { id: 'js',      label: 'JS',         lang: 'javascript' },
];

function langToPrism(l: string): Language {
  if (l === 'tsx') return 'tsx';
  if (l === 'sql') return 'sql' as Language; // prism supports sql
  if (l === 'css') return 'css';
  if (l === 'js')  return 'javascript';
  return 'markup';
}

/** HTML 문자열에서 <style> · <script> 내용을 추출 */
function extractInline(html: string, kind: 'style' | 'script'): string {
  const re = kind === 'style'
    ? /<style[^>]*>([\s\S]*?)<\/style>/g
    : /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  const blocks: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const body = m[1].trim();
    if (body) blocks.push(body);
  }
  if (!blocks.length) {
    return kind === 'style'
      ? '/* 이 페이지에는 인라인 <style> 블록이 없습니다.\n   공통 style.css 만 사용합니다. */'
      : '// 이 페이지에는 인라인 <script> 블록이 없습니다.';
  }
  return blocks.join('\n\n/* ──────────────── */\n\n');
}

/** HTML에서 <style>·<script>(inline) 제거한 정제본 */
function cleanedHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>\s*/g, '')
    .replace(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>\s*/g, '');
}

export default function ProjectBuild() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useSearchParams();
  const projectId = Number(id ?? '1');
  const project = PROJECT_DATA.find((p) => p.id === projectId);
  const mockup = getProjectMockup(projectId);

  // 선택 상태: 'page:<id>' 또는 'shared:<filename>'
  const initialSel = search.get('sel') ?? `page:${mockup?.pages[0]?.id ?? 'home'}`;
  const [selection, setSelection] = useState<string>(initialSel);
  const [view, setView] = useState<ViewMode>('preview');

  // 페치 캐시
  const [htmlText, setHtmlText] = useState<string>('');
  const [htmlState, setHtmlState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [sharedText, setSharedText] = useState<string>('');
  const [sharedState, setSharedState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const isPage = selection.startsWith('page:');
  const activePageId = isPage ? selection.slice(5) : null;
  const activeSharedFile = !isPage ? selection.slice(7) : null;

  const activePage = activePageId ? mockup?.pages.find((p) => p.id === activePageId) : undefined;
  const activeShared: SharedFile | undefined = activeSharedFile
    ? mockup?.shared.find((s) => s.filename === activeSharedFile)
    : undefined;

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const pageUrl = mockup && activePage ? `${base}${mockup.baseDir}/${activePage.id}.html` : '';
  const sharedUrl = mockup && activeShared ? `${base}${mockup.baseDir}/${activeShared.filename}` : '';

  // URL sync
  useEffect(() => {
    setSearch((s) => { const n = new URLSearchParams(s); n.set('sel', selection); return n; }, { replace: true });
  }, [selection, setSearch]);

  // doc title
  useEffect(() => { if (project) document.title = `${project.title} — 구현 페이지`; }, [project]);

  // 페이지 선택 → HTML fetch (소스 탭에서 사용)
  useEffect(() => {
    if (!isPage || !pageUrl || activePage?.status !== 'done') return;
    setHtmlState('loading');
    fetch(pageUrl)
      .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
      .then((t) => { setHtmlText(t); setHtmlState('ready'); })
      .catch(() => setHtmlState('error'));
  }, [isPage, pageUrl, activePage?.status]);

  // 공통 파일 선택 → fetch
  useEffect(() => {
    if (isPage || !sharedUrl) return;
    setSharedState('loading');
    fetch(sharedUrl)
      .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
      .then((t) => { setSharedText(t); setSharedState('ready'); })
      .catch(() => setSharedState('error'));
  }, [isPage, sharedUrl]);

  // 페이지 바꿀 때 view를 preview로 리셋
  useEffect(() => { if (isPage) setView('preview'); }, [activePageId]); // eslint-disable-line

  const sourceText = useMemo(() => {
    if (view === 'html') return cleanedHtml(htmlText);
    if (view === 'css')  return extractInline(htmlText, 'style');
    if (view === 'js')   return extractInline(htmlText, 'script');
    return '';
  }, [view, htmlText]);

  const sourceLang: Language = useMemo(() => {
    const tab = FILE_TABS.find((t) => t.id === view);
    return tab?.lang ?? 'markup';
  }, [view]);

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); } catch {}
  }

  if (!project || !mockup) {
    return (
      <section className="container empty-state" style={{ marginTop: 40 }}>
        <h3>프로젝트를 찾을 수 없습니다.</h3>
        <p><Link to="/projects">← 프로젝트 목록</Link></p>
      </section>
    );
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
          <p>왼쪽에서 페이지를 골라 미리보기/HTML/CSS/JS를 확인하거나, 아래 공통 파일에서 SQL 스키마·React 코드를 확인하세요.</p>
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
                className={`pb-side__item ${selection === `page:${p.id}` ? 'is-active' : ''} pb-side__item--${p.status}`}
                onClick={() => setSelection(`page:${p.id}`)}
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

          <h4 className="pb-side__h" style={{ marginTop: 22 }}>공통 파일 ({mockup.shared.length})</h4>
          <nav className="pb-side__nav">
            {mockup.shared.map((s) => (
              <button
                key={s.filename}
                className={`pb-side__item ${selection === `shared:${s.filename}` ? 'is-active' : ''}`}
                onClick={() => setSelection(`shared:${s.filename}`)}
              >
                <span className={`pb-side__lang pb-side__lang--${s.lang}`}>{s.lang.toUpperCase()}</span>
                <span className="pb-side__body">
                  <span className="pb-side__title">{s.label}</span>
                  {s.desc && <span className="pb-side__desc">{s.desc}</span>}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="pb-stage">
          {isPage && activePage ? (
            activePage.status !== 'done' ? (
              <div className="pb-placeholder">
                <span style={{ fontSize: '3rem' }}>🎨</span>
                <h3>{activePage.title}</h3>
                <p>이 페이지는 아직 모형이 만들어지지 않았습니다.</p>
              </div>
            ) : (
              <>
                <div className="pb-tabs">
                  <div className="pb-tabs__left">
                    {FILE_TABS.map((t) => (
                      <button
                        key={t.id}
                        className={`pb-tab ${view === t.id ? 'is-on' : ''}`}
                        onClick={() => setView(t.id)}
                      >{t.label}</button>
                    ))}
                  </div>
                  <div className="pb-tabs__right">
                    <a href={pageUrl} target="_blank" rel="noreferrer" className="pb-mini">새 탭 ↗</a>
                    {view !== 'preview' && htmlState === 'ready' && (
                      <button className="pb-mini" onClick={() => copy(sourceText)}>복사</button>
                    )}
                  </div>
                </div>

                <div className="pb-content">
                  {view === 'preview' ? (
                    <div className="pb-preview">
                      <iframe
                        key={pageUrl}
                        src={pageUrl}
                        title={activePage.title}
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    </div>
                  ) : (
                    <div className="pb-source">
                      {htmlState === 'loading' && <div className="pb-source__state">로드 중…</div>}
                      {htmlState === 'error' && <div className="pb-source__state pb-source__state--err">불러오기 실패</div>}
                      {htmlState === 'ready' && (
                        <CodeView code={sourceText} lang={sourceLang} />
                      )}
                    </div>
                  )}
                </div>
              </>
            )
          ) : activeShared ? (
            <>
              <div className="pb-tabs">
                <div className="pb-tabs__left">
                  <span className="pb-tabs__label">
                    <span className={`pb-side__lang pb-side__lang--${activeShared.lang}`}>{activeShared.lang.toUpperCase()}</span>
                    {activeShared.label}
                  </span>
                </div>
                <div className="pb-tabs__right">
                  <a href={sharedUrl} target="_blank" rel="noreferrer" className="pb-mini">원본 ↗</a>
                  {sharedState === 'ready' && (
                    <button className="pb-mini" onClick={() => copy(sharedText)}>복사</button>
                  )}
                </div>
              </div>
              <div className="pb-content">
                <div className="pb-source">
                  {sharedState === 'loading' && <div className="pb-source__state">로드 중…</div>}
                  {sharedState === 'error' && <div className="pb-source__state pb-source__state--err">불러오기 실패</div>}
                  {sharedState === 'ready' && (
                    <CodeView code={sharedText} lang={langToPrism(activeShared.lang)} />
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CodeView({ code, lang }: { code: string; lang: Language }) {
  return (
    <Highlight code={code.replace(/\n+$/, '')} language={lang} theme={themes.vsDark}>
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
  );
}
