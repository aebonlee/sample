import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { Highlight, themes, type Language } from 'prism-react-renderer';
import JSZip from 'jszip';
import { resolveProjectSet } from '../data/projectSets';
import { getProjectMockup, type SharedFile } from '../data/projectMockups';

type ViewMode = 'preview' | 'html' | 'css' | 'js';

const FILE_TABS: { id: ViewMode; label: string; lang: Language }[] = [
  { id: 'preview', label: '👁 미리보기', lang: 'markup' },
  { id: 'html',    label: 'HTML',       lang: 'markup' },
  { id: 'css',     label: 'CSS',        lang: 'css' },
  { id: 'js',      label: 'JS',         lang: 'javascript' },
];

function langToPrism(l: string): Language {
  if (l === 'tsx' || l === 'ts') return 'tsx';
  if (l === 'sql') return 'sql' as Language;
  if (l === 'css') return 'css';
  if (l === 'js')  return 'javascript';
  if (l === 'md')  return 'markdown';
  return 'markup';
}

/** 프로젝트 전체를 ZIP으로 묶어 다운로드 */
async function downloadProjectZip(
  baseUrl: string,
  projectTitle: string,
  pages: { id: string }[],
  shared: SharedFile[],
) {
  const zip = new JSZip();
  const root = zip.folder(`project-${projectTitle.replace(/[^\w가-힣]+/g, '-').slice(0, 40)}`)!;

  const fetchText = async (path: string): Promise<string> => {
    const r = await fetch(`${baseUrl}/${path}`);
    if (!r.ok) throw new Error(`fetch failed: ${path}`);
    return r.text();
  };

  // 페이지 HTML들 → pages/
  const pagesFolder = root.folder('pages')!;
  await Promise.all(pages.map(async (p) => {
    try {
      const html = await fetchText(`${p.id}.html`);
      pagesFolder.file(`${p.id}.html`, html);
    } catch {}
  }));

  // 공통 파일들 → 경로 그대로 보존
  await Promise.all(shared.map(async (s) => {
    try {
      const text = await fetchText(s.filename);
      root.file(s.filename, text);
    } catch {}
  }));

  // 설명 README
  root.file('PROJECT.md',
    `# ${projectTitle}\n\n` +
    `이 프로젝트는 sample.dreamitbiz.com 의 ProjectBuild 페이지에서 자동 생성된 ZIP 입니다.\n\n` +
    `## 폴더 구조\n\n` +
    '```\n' +
    'pages/         # 정적 HTML 모형 (iframe 미리보기용)\n' +
    'style.css      # 공통 디자인 토큰\n' +
    'schema.sql     # Supabase / PostgreSQL 스키마\n' +
    'react/         # React 19 + Supabase 실제 구현 예시\n' +
    '  App.tsx\n' +
    '  supabase.ts\n' +
    '  types.ts\n' +
    '  pages/HomePage.tsx\n' +
    '  README.md\n' +
    '```\n\n' +
    '## 실행\n\n' +
    '```bash\n' +
    'cd react\n' +
    'npm install\n' +
    'cp .env.example .env.local\n' +
    'npm run dev\n' +
    '```\n',
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectTitle.replace(/[^\w가-힣]+/g, '-').slice(0, 40)}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
  const location = useLocation();
  const set = resolveProjectSet(location.pathname);
  const projectId = Number(id ?? '1');
  const project = set.data.find((p) => p.id === projectId);
  const mockup = getProjectMockup(projectId);

  // 선택 상태: 'page:<id>' 또는 'shared:<filename>'
  const initialSel = search.get('sel') ?? `page:${mockup?.pages[0]?.id ?? 'home'}`;
  const [selection, setSelection] = useState<string>(initialSel);
  const [view, setView] = useState<ViewMode>('preview');
  // 좌측 사이드바 드롭다운: 'pages' | 'shared' | null — 아코디언(한 번에 하나)
  const [openGroup, setOpenGroup] = useState<'pages' | 'shared' | null>(
    initialSel.startsWith('shared:') ? 'shared' : 'pages',
  );

  /** 항목 클릭 → 선택 적용 + 드롭다운 자동 닫기 */
  function pick(sel: string) {
    setSelection(sel);
    setOpenGroup(null);
  }
  /** 헤더 클릭 → 같은 그룹이면 닫기, 다른 그룹이면 그것만 열기(아코디언) */
  function toggleGroup(g: 'pages' | 'shared') {
    setOpenGroup((cur) => (cur === g ? null : g));
  }

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

  if (!project) {
    return (
      <section className="container empty-state" style={{ marginTop: 40 }}>
        <h3>프로젝트를 찾을 수 없습니다.</h3>
        <p><Link to={set.basePath}>← 프로젝트 목록</Link></p>
      </section>
    );
  }

  // 한기대 프로젝트는 가이드(아키텍처/파이프라인/Solar API 등)만 제공하고
  // 구현 페이지(HTML/CSS/JS 목업)는 추후 추가 예정
  if (set.key === 'koreatech' || !mockup) {
    return (
      <section className="container empty-state" style={{ marginTop: 40, textAlign: 'center', padding: '64px 16px' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚧</div>
        <h3 style={{ marginBottom: 12 }}>구현 페이지 준비 중입니다</h3>
        <p style={{ color: 'var(--text-dim, #6B7280)', maxWidth: 520, margin: '0 auto 24px' }}>
          {set.key === 'koreatech'
            ? '한기대 프로젝트는 현재 아키텍처·Solar API·프롬프트 가이드까지 제공되며, HTML/CSS/JS 목업과 React 소스 다운로드는 추후 단계적으로 공개될 예정입니다.'
            : '이 프로젝트의 구현 목업은 아직 준비되지 않았습니다.'}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Link to={`${set.basePath}/${project.id}`} className="btn btn--primary btn--sm">
            ← 가이드로 돌아가기
          </Link>
          <Link to={set.basePath} className="btn btn--ghost btn--sm">
            프로젝트 목록
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="container pb-page">
      <nav className="breadcrumb">
        <Link to={set.basePath}>{set.navLabel}</Link>
        <span>›</span>
        <Link to={`${set.basePath}/${project.id}`}>{project.title}</Link>
        <span>›</span>
        <span aria-current="page">구현 페이지</span>
      </nav>

      <header className="pb-head" style={{ borderLeftColor: project.color }}>
        <span className="pb-head__icon" style={{ background: `${project.color}1a`, color: project.color }}>
          {project.icon}
        </span>
        <div>
          <h1>{project.title} — 구현 페이지</h1>
          <p>페이지별로 HTML/CSS/JS가 분리되고, React 소스(App.tsx + supabase.ts + types.ts + pages/HomePage.tsx)와 SQL 스키마는 공통 파일에서 확인할 수 있습니다.</p>
        </div>
        <div className="pb-head__actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => downloadProjectZip(
              `${base}${mockup.baseDir}`,
              project.title,
              mockup.pages.filter((p) => p.status === 'done'),
              mockup.shared,
            )}
          >
            📦 ZIP 다운로드
          </button>
          <Link to={`${set.basePath}/${project.id}`} className="btn btn--ghost btn--sm">
            ← 가이드
          </Link>
        </div>
      </header>

      <div className="pb-layout">
        <aside className="pb-side">
          {/* 페이지 그룹 */}
          <div className={`pb-side__group ${openGroup === 'pages' ? 'is-open' : ''}`}>
            <button
              type="button"
              className="pb-side__h"
              onClick={() => toggleGroup('pages')}
              aria-expanded={openGroup === 'pages'}
            >
              <span>
                📄 페이지 <em>{mockup.pages.length}</em>
                {selection.startsWith('page:') && (
                  <small className="pb-side__current">
                    · {mockup.pages.find((p) => `page:${p.id}` === selection)?.title}
                  </small>
                )}
              </span>
              <span className="pb-side__caret">▾</span>
            </button>
            {openGroup === 'pages' && (
              <nav className="pb-side__nav">
                {mockup.pages.map((p, idx) => (
                  <button
                    key={p.id}
                    className={`pb-side__item ${selection === `page:${p.id}` ? 'is-active' : ''} pb-side__item--${p.status}`}
                    onClick={() => pick(`page:${p.id}`)}
                  >
                    <span className="pb-side__num">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="pb-side__body">
                      <span className="pb-side__title">{p.title}</span>
                      {p.desc && <span className="pb-side__desc">{p.desc}</span>}
                    </span>
                    <span className="pb-side__badge">
                      {p.status === 'done' ? '✓️' : p.status === 'wip' ? '⋯' : '○'}
                    </span>
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* 공통 파일 그룹 */}
          <div className={`pb-side__group ${openGroup === 'shared' ? 'is-open' : ''}`}>
            <button
              type="button"
              className="pb-side__h"
              onClick={() => toggleGroup('shared')}
              aria-expanded={openGroup === 'shared'}
            >
              <span>
                📦 공통 파일 <em>{mockup.shared.length}</em>
                {selection.startsWith('shared:') && (
                  <small className="pb-side__current">
                    · {mockup.shared.find((s) => `shared:${s.filename}` === selection)?.label}
                  </small>
                )}
              </span>
              <span className="pb-side__caret">▾</span>
            </button>
            {openGroup === 'shared' && (
              <nav className="pb-side__nav">
                {mockup.shared.map((s) => (
                  <button
                    key={s.filename}
                    className={`pb-side__item ${selection === `shared:${s.filename}` ? 'is-active' : ''}`}
                    onClick={() => pick(`shared:${s.filename}`)}
                  >
                    <span className={`pb-side__lang pb-side__lang--${s.lang}`}>{s.lang.toUpperCase()}</span>
                    <span className="pb-side__body">
                      <span className="pb-side__title">{s.label}</span>
                      {s.desc && <span className="pb-side__desc">{s.desc}</span>}
                    </span>
                  </button>
                ))}
              </nav>
            )}
          </div>
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
                    <a href={pageUrl} target="_blank" rel="noreferrer" className="pb-mini">새 탭 ↗️</a>
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
                  <a href={sharedUrl} target="_blank" rel="noreferrer" className="pb-mini">원본 ↗️</a>
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
