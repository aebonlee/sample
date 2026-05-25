import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Highlight, themes, type Language } from 'prism-react-renderer';
import JSZip from 'jszip';
import { KOREATECH_PROJECTS } from '../data/koreatechProjects';
import { getKoreatechMockup } from '../data/koreatechMockups';

type Tab = 'preview' | 'python' | 'output' | 'html';

const TABS: { id: Tab; label: string }[] = [
  { id: 'preview', label: '👁 미리보기' },
  { id: 'python',  label: 'Python' },
  { id: 'output',  label: '예상 출력' },
  { id: 'html',    label: 'HTML 소스' },
];

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

export default function KoreatechProjectBuild() {
  const { id } = useParams<{ id: string }>();
  const project = KOREATECH_PROJECTS.find((p) => p.id === id);
  const mockup = id ? getKoreatechMockup(id) : undefined;

  const [tab, setTab] = useState<Tab>('preview');
  const [pyText, setPyText] = useState<string>('');
  const [pyState, setPyState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [htmlText, setHtmlText] = useState<string>('');
  const [htmlState, setHtmlState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const previewUrl = mockup ? `${base}${mockup.baseDir}/${mockup.demoFile}` : '';
  const pyUrl = mockup ? `${base}${mockup.baseDir}/${mockup.pyFile}` : '';

  useEffect(() => {
    if (!project) return;
    document.title = `${project.title} — 구현 페이지`;
  }, [project]);

  // Python 소스 lazy fetch
  useEffect(() => {
    if (tab !== 'python' || !pyUrl || pyState !== 'idle') return;
    setPyState('loading');
    fetch(pyUrl)
      .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
      .then((t) => { setPyText(t); setPyState('ready'); })
      .catch(() => setPyState('error'));
  }, [tab, pyUrl, pyState]);

  // HTML 소스 lazy fetch
  useEffect(() => {
    if (tab !== 'html' || !previewUrl || htmlState !== 'idle') return;
    setHtmlState('loading');
    fetch(previewUrl)
      .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
      .then((t) => { setHtmlText(t); setHtmlState('ready'); })
      .catch(() => setHtmlState('error'));
  }, [tab, previewUrl, htmlState]);

  const code = useMemo(() => {
    if (tab === 'python')  return { text: pyText, lang: 'python' as Language, state: pyState };
    if (tab === 'html')    return { text: htmlText, lang: 'markup' as Language, state: htmlState };
    if (tab === 'output')  return { text: mockup?.expectedOutput ?? '', lang: 'shell' as Language, state: 'ready' as const };
    return { text: '', lang: 'markup' as Language, state: 'ready' as const };
  }, [tab, pyText, htmlText, pyState, htmlState, mockup]);

  if (!project || !mockup) {
    return (
      <section className="container empty-state" style={{ marginTop: 40, textAlign: 'center' }}>
        <h3>한기대 프로젝트를 찾을 수 없습니다.</h3>
        <p><Link to="/projects-koreatech">← 한기대 프로젝트 목록</Link></p>
      </section>
    );
  }

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
          <p>인터랙티브 데모(HTML/JS)와 파이썬 알고리즘 소스, 예상 콘솔 출력까지 한 화면에서 확인하고 ZIP으로 다운로드할 수 있습니다.</p>
        </div>
        <div className="pb-head__actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => downloadZip(`${base}${mockup.baseDir}`, project.title, [mockup.demoFile, mockup.pyFile])}
          >
            📦 ZIP 다운로드
          </button>
          <Link to={`/projects-koreatech/${project.id}`} className="btn btn--ghost btn--sm">
            ← 가이드
          </Link>
        </div>
      </header>

      <div className="pb-tabs" role="tablist" aria-label="구현 페이지 뷰 모드">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`pb-tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-mute, #94a3b8)' }}>
          {mockup.demoTitle}
        </div>
      </div>

      <div className="pb-stage" style={{ marginTop: 0 }}>
        {tab === 'preview' ? (
          <iframe
            src={previewUrl}
            title={`${project.title} 인터랙티브 데모`}
            className="pb-iframe"
            style={{ width: '100%', height: 720, border: '1px solid var(--border)', borderRadius: 12, background: '#0f172a' }}
          />
        ) : (
          <div style={{ position: 'relative' }}>
            {code.state === 'loading' && (
              <div style={{ padding: 24, color: 'var(--text-mute, #94a3b8)' }}>소스 불러오는 중…</div>
            )}
            {code.state === 'error' && (
              <div style={{ padding: 24, color: '#ef4444' }}>소스를 불러오지 못했습니다.</div>
            )}
            {code.state === 'ready' && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                style={{ position: 'absolute', top: 10, right: 12, zIndex: 2 }}
                onClick={() => navigator.clipboard?.writeText(code.text)}
              >
                📋 복사
              </button>
            )}
            {code.state === 'ready' && (
              <Highlight code={code.text} language={code.lang} theme={themes.nightOwl}>
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre
                    className={className}
                    style={{
                      ...style,
                      padding: '20px 20px 16px',
                      borderRadius: 12,
                      fontSize: '0.82rem',
                      lineHeight: 1.65,
                      overflowX: 'auto',
                      margin: 0,
                      maxHeight: 720,
                      overflowY: 'auto',
                      fontFamily: "'Fira Code', 'Consolas', monospace",
                    }}
                  >
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })}>
                        <span style={{ display: 'inline-block', width: 32, color: '#475569', textAlign: 'right', paddingRight: 12, userSelect: 'none' }}>{i + 1}</span>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
