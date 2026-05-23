import { useEffect, useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';

function languageFor(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
    case 'htm':
      return 'markup';
    case 'css':
      return 'css';
    case 'js':
    case 'mjs':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'tsx';
    case 'jsx':
      return 'jsx';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    default:
      return 'markup';
  }
}

interface Props {
  sampleId: string;
  filename: string;
}

export default function SourceViewer({ sampleId, filename }: Props) {
  const [code, setCode] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [copied, setCopied] = useState(false);

  const fileUrl = `${import.meta.env.BASE_URL}samples/${sampleId}/${filename}`;

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetch(fileUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        setCode(text);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  if (status === 'loading') {
    return <div className="source-viewer source-viewer--state">로드 중…</div>;
  }
  if (status === 'error') {
    return (
      <div className="source-viewer source-viewer--state source-viewer--error">
        파일을 불러오지 못했습니다: {filename}
      </div>
    );
  }

  return (
    <div className="source-viewer">
      <div className="source-viewer__toolbar">
        <span className="source-viewer__filename">{filename}</span>
        <div className="source-viewer__actions">
          <button type="button" onClick={handleCopy}>
            {copied ? '복사됨!' : '복사'}
          </button>
          <a href={fileUrl} download={filename}>
            다운로드
          </a>
        </div>
      </div>
      <Highlight code={code.replace(/\n+$/, '')} language={languageFor(filename)} theme={themes.vsDark}>
        {({ className, style, tokens, getTokenProps }) => (
          <pre className={`source-viewer__pre ${className}`} style={style}>
            <code className="source-viewer__code">
              {tokens.map((line, i) => (
                <div key={i} className="source-viewer__line">
                  <span className="source-viewer__lineno">{i + 1}</span>
                  {line.map((token, j) => {
                    const { key: _tk, ...tokenProps } = getTokenProps({ token });
                    return <span key={j} {...tokenProps} />;
                  })}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
