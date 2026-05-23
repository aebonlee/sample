import { Link } from 'react-router-dom';
import { platformLabels, samples, type Platform } from '../data/samples';

const platformOrder: Platform[] = ['web', 'app', 'ai', 'data', 'game'];

export default function Projects() {
  return (
    <section className="container projects-page">
      <header className="projects-page__head">
        <h1>프로젝트 샘플</h1>
        <p>
          개별 UI 컴포넌트가 아니라, 그대로 가져다 배포할 수 있는 완성형 프로젝트 모음입니다.
          플랫폼별로 정리되어 있으며 각 항목은 소스 코드와 제작 방법까지 함께 제공됩니다.
        </p>
      </header>

      <div className="projects-page__sections">
        {platformOrder.map((p) => {
          const list = samples.filter((s) => s.platform === p);
          if (list.length === 0) {
            return (
              <section key={p} className="projects-section projects-section--empty">
                <div className="projects-section__head">
                  <h2>{platformLabels[p]}</h2>
                  <span className="projects-section__count">0개</span>
                </div>
                <p className="projects-section__hint">
                  곧 추가될 예정입니다.
                </p>
              </section>
            );
          }
          return (
            <section key={p} className="projects-section">
              <div className="projects-section__head">
                <h2>{platformLabels[p]}</h2>
                <Link to={`/platform/${p}`} className="projects-section__more">
                  전체 보기 →
                </Link>
              </div>
              <div className="projects-list">
                {list.map((s) => (
                  <Link key={s.id} to={`/samples/${s.id}`} className="project-row">
                    <img
                      src={`${import.meta.env.BASE_URL}samples/${s.id}/preview.png`}
                      alt=""
                      loading="lazy"
                      width={1440}
                      height={900}
                    />
                    <div className="project-row__body">
                      <div className="project-row__meta">
                        <span className="tag">{s.stack.join(' · ')}</span>
                        <span className="tag tag--outline">{s.difficulty}</span>
                      </div>
                      <h3>{s.title}</h3>
                      <p>{s.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
