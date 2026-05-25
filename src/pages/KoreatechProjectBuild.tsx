import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Highlight, themes, type Language } from 'prism-react-renderer';
import JSZip from 'jszip';
import { KOREATECH_PROJECTS } from '../data/koreatechProjects';
import { getKoreatechMockup } from '../data/koreatechMockups';

/** 빌드 페이지 탭 모드 */
type ViewMode = 'preview' | 'html' | 'css' | 'js' | 'python' | 'output';

const FILE_TABS: { id: ViewMode; label: string; filename?: string; lang: Language }[] = [
  { id: 'preview', label: '👁 미리보기',                  lang: 'markup'     },
  { id: 'html',    label: 'HTML',   filename: 'index.html', lang: 'markup'     },
  { id: 'css',     label: 'CSS',    filename: 'style.css',  lang: 'css'        },
  { id: 'js',      label: 'JS',     filename: 'script.js',  lang: 'javascript' },
  { id: 'python',  label: 'Python', filename: 'main.py',    lang: 'python'     },
  { id: 'output',  label: '예상 출력', filename: 'output.txt', lang: 'shell'    },
];

/** ZIP 다운로드 (index.html + style.css + script.js + main.py + README.md) */
async function downloadZip(baseUrl: string, projectTitle: string, files: string[]) {
  const zip = new JSZip();
  const folder = zip.folder(`koreatech-${projectTitle.replace(/[^\w가-힣]+/g, '-').slice(0, 40)}`)!;
  await Promise.all(
    files.map(async (name) => {
      try {
        const res = await fetch(`${baseUrl}/${name}`);
        if (!res.ok) throw new Error(`fetch failed: ${name}`);
        folder.file(name, await res.text());
      } catch {
        /* skip missing files */
      }
    }),
  );
  folder.file(
    'README.md',
    `# ${projectTitle}\n\n` +
      'sample.dreamitbiz.com 의 한기대 프로젝트 구현 페이지에서 생성된 ZIP 입니다.\n\n' +
      '## 파일\n\n' +
      '```\n' +
      'index.html     # 인터랙티브 알고리즘 데모 (브라우저에서 바로 실행)\n' +
      'style.css      # 데모 스타일\n' +
      'script.js      # 데모 동작 스크립트\n' +
      'main.py        # 파이썬 알고리즘 원본 코드\n' +
      'README.md      # 이 파일\n' +
      '```\n\n' +
      '## 파이썬 실행\n\n' +
      '```bash\npython main.py\n```\n\n' +
      '## 웹 데모 실행\n\n' +
      'index.html 을 브라우저로 열면 됩니다.\n',
  );
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `koreatech-${projectTitle.replace(/[^\w가-힣]+/g, '-').slice(0, 40)}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * 다른 샘플 빌드 페이지(Projects/ProjectBuild)와 동일한 토큰 단위
 * 소스 뷰어. .source-viewer__* 클래스 + vsDark 테마로 일관성 확보.
 */
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

export default function KoreatechProjectBuild() {
  const { id } = useParams<{ id: string }>();
  const project = KOREATECH_PROJECTS.find((p) => p.id === id);
  const mockup = id ? getKoreatechMockup(id) : undefined;

  const [view, setView] = useState<ViewMode>('preview');

  type FetchState = 'idle' | 'loading' | 'ready' | 'error';
  const [htmlText, setHtmlText] = useState(''); const [htmlState, setHtmlState] = useState<FetchState>('idle');
  const [cssText, setCssText]   = useState(''); const [cssState, setCssState]   = useState<FetchState>('idle');
  const [jsText, setJsText]     = useState(''); const [jsState, setJsState]     = useState<FetchState>('idle');
  const [pyText, setPyText]     = useState(''); const [pyState, setPyState]     = useState<FetchState>('idle');

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const previewUrl = mockup ? `${base}${mockup.baseDir}/${mockup.demoFile}` : '';
  const cssUrl     = mockup ? `${base}${mockup.baseDir}/${mockup.cssFile}`  : '';
  const jsUrl      = mockup ? `${base}${mockup.baseDir}/${mockup.jsFile}`   : '';
  const pyUrl      = mockup ? `${base}${mockup.baseDir}/${mockup.pyFile}`   : '';

  useEffect(() => {
    if (!project) return;
    document.title = `${project.title} — 구현 페이지`;
  }, [project]);

  useEffect(() => {
    if (view !== 'html' || !previewUrl || htmlState !== 'idle') return;
    setHtmlState('loading');
    fetch(previewUrl)
      .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
      .then((t) => { setHtmlText(t); setHtmlState('ready'); })
      .catch(() => setHtmlState('error'));
  }, [view, previewUrl, htmlState]);

  useEffect(() => {
    if (view !== 'css' || !cssUrl || cssState !== 'idle') return;
    setCssState('loading');
    fetch(cssUrl)
      .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
      .then((t) => { setCssText(t); setCssState('ready'); })
      .catch(() => setCssState('error'));
  }, [view, cssUrl, cssState]);

  useEffect(() => {
    if (view !== 'js' || !jsUrl || jsState !== 'idle') return;
    setJsState('loading');
    fetch(jsUrl)
      .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
      .then((t) => { setJsText(t); setJsState('ready'); })
      .catch(() => setJsState('error'));
  }, [view, jsUrl, jsState]);

  useEffect(() => {
    if (view !== 'python' || !pyUrl || pyState !== 'idle') return;
    setPyState('loading');
    fetch(pyUrl)
      .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
      .then((t) => { setPyText(t); setPyState('ready'); })
      .catch(() => setPyState('error'));
  }, [view, pyUrl, pyState]);

  const active = useMemo(() => {
    if (view === 'html')   return { text: htmlText, lang: 'markup'     as Language, state: htmlState, url: previewUrl };
    if (view === 'css')    return { text: cssText,  lang: 'css'        as Language, state: cssState,  url: cssUrl };
    if (view === 'js')     return { text: jsText,   lang: 'javascript' as Language, state: jsState,   url: jsUrl };
    if (view === 'python') return { text: pyText,   lang: 'python'     as Language, state: pyState,   url: pyUrl };
    if (view === 'output') return { text: mockup?.expectedOutput ?? '', lang: 'shell' as Language, state: 'ready' as FetchState, url: '' };
    return { text: '', lang: 'markup' as Language, state: 'ready' as FetchState, url: '' };
  }, [view, htmlText, cssText, jsText, pyText, htmlState, cssState, jsState, pyState, previewUrl, cssUrl, jsUrl, pyUrl, mockup]);

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  if (!project || !mockup) {
    return (
      <section className="container empty-state" style={{ marginTop: 40, textAlign: 'center' }}>
        <h3>한기대 프로젝트를 찾을 수 없습니다.</h3>
        <p><Link to="/projects-koreatech">← 한기대 프로젝트 목록</Link></p>
      </section>
    );
  }

  const activeTabMeta = FILE_TABS.find((t) => t.id === view);

  return (
    <div className="container pb-page" style={{ paddingTop: 24 }}>
      <nav className="breadcrumb">
        <Link to="/projects-koreatech">한기대 프로젝트</Link>
        <span>›</span>
        <Link to={`/projects-koreatech/${project.id}`}>{project.title}</Link>
        <span>›</span>
        <span aria-current="page">구현 페이지</span>
      </nav>

      <header className="pb-head" style={{ borderLeftColor: project.color }}>
        <span className="pb-head__icon" style={{ background: `${project.color}1a`, color: project.color }}>
          {project.emoji}
        </span>
        <div>
          <h1>{project.title} — 구현 페이지</h1>
          <p>인터랙티브 데모(HTML/CSS/JS)와 파이썬 알고리즘 소스, 예상 콘솔 출력까지 한 화면에서 확인하고 ZIP으로 다운로드할 수 있습니다.</p>
        </div>
        <div className="pb-head__actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => downloadZip(
              `${base}${mockup.baseDir}`,
              project.title,
              [mockup.demoFile, mockup.cssFile, mockup.jsFile, mockup.pyFile],
            )}
          >
            📦 ZIP 다운로드
          </button>
          <Link to={`/projects-koreatech/${project.id}`} className="btn btn--ghost btn--sm">
            ← 가이드
          </Link>
        </div>
      </header>

      {/* 다른 샘플 빌드 페이지와 동일한 .pb-stage / .pb-tabs / .pb-content 구조 */}
      <div className="pb-stage">
        <div className="pb-tabs">
          <div className="pb-tabs__left">
            {FILE_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`pb-tab ${view === t.id ? 'is-on' : ''}`}
                onClick={() => setView(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="pb-tabs__right">
            {view !== 'preview' && view !== 'output' && active.url && (
              <a href={active.url} target="_blank" rel="noreferrer" className="pb-mini">
                새 탭 ↗️
              </a>
            )}
            {view === 'preview' && previewUrl && (
              <a href={previewUrl} target="_blank" rel="noreferrer" className="pb-mini">
                새 탭 ↗️
              </a>
            )}
            {view !== 'preview' && active.state === 'ready' && (
              <button type="button" className="pb-mini" onClick={() => copy(active.text)}>
                📋 복사
              </button>
            )}
          </div>
        </div>

        {/* 파일명 보조 표시줄 (소스 뷰일 때만) */}
        {view !== 'preview' && activeTabMeta?.filename && (
          <div className="source-viewer__toolbar">
            <span className="source-viewer__filename">📄 {activeTabMeta.filename}</span>
            <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>
              {mockup.demoTitle}
            </span>
          </div>
        )}

        <div className="pb-content">
          {view === 'preview' ? (
            <div className="pb-preview">
              <iframe
                key={previewUrl}
                src={previewUrl}
                title={`${project.title} 인터랙티브 데모`}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          ) : (
            <div className="pb-source">
              {active.state === 'loading' && <div className="pb-source__state">로드 중…</div>}
              {active.state === 'error'   && <div className="pb-source__state pb-source__state--err">불러오기 실패</div>}
              {active.state === 'ready'   && <CodeView code={active.text} lang={active.lang} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
