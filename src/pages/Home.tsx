import { Link } from 'react-router-dom';
import SampleCard from '../components/SampleCard';
import {
  platformDescriptions,
  platformLabels,
  samples,
  samplesByPlatform,
  type Platform,
} from '../data/samples';

const platformOrder: Platform[] = ['web', 'app', 'ai', 'data', 'game'];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="hero__title">
            웹사이트 디자인 <span className="hero__accent">샘플 갤러리</span>
          </h1>
          <p className="hero__lead">
            개인 포트폴리오 · 회사 사이트 · 학습 사이트 · 블로그 등 프로젝트 타입별 디자인 샘플과
            소스코드를 제공합니다. 마음에 드는 디자인을 골라 그대로 가져다 쓰거나, 제작 방법을
            보고 직접 만들어 보세요.
          </p>
          <div className="hero__cta">
            <Link className="btn btn--primary" to="/platform/web">웹개발 샘플 보기</Link>
            <Link className="btn btn--ghost" to="/about">About 보기</Link>
          </div>
        </div>
      </section>

      <section className="container platforms">
        <h2 className="section-title">샘플 플랫폼</h2>
        <div className="platforms__grid">
          {platformOrder.map((p) => {
            const count = samplesByPlatform(p).length;
            return (
              <Link key={p} to={`/platform/${p}`} className="platform-card">
                <div className="platform-card__head">
                  <span className="platform-card__label">{platformLabels[p]}</span>
                  <span className="platform-card__count">{count}</span>
                </div>
                <p className="platform-card__desc">{platformDescriptions[p]}</p>
                <span className="platform-card__cta">살펴보기 →</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="all" className="container gallery">
        <h2 className="section-title">전체 샘플 ({samples.length})</h2>
        <div className="gallery__grid">
          {samples.map((s) => (
            <SampleCard key={s.id} sample={s} />
          ))}
        </div>
      </section>
    </>
  );
}
