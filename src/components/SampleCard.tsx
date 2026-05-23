import { Link } from 'react-router-dom';
import { categoryLabels, type Sample } from '../data/samples';

const difficultyLabel: Record<Sample['difficulty'], string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
};

export default function SampleCard({ sample }: { sample: Sample }) {
  const previewUrl = `${import.meta.env.BASE_URL}samples/${sample.id}/index.html`;
  return (
    <Link to={`/samples/${sample.id}`} className="sample-card">
      <div className="sample-card__thumb">
        <iframe
          src={previewUrl}
          title={sample.title}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
        <div className="sample-card__thumb-overlay" />
      </div>
      <div className="sample-card__body">
        <div className="sample-card__meta">
          <span className="chip chip--category">{categoryLabels[sample.category]}</span>
          <span className={`chip chip--diff chip--diff-${sample.difficulty}`}>
            {difficultyLabel[sample.difficulty]}
          </span>
        </div>
        <h3 className="sample-card__title">{sample.title}</h3>
        <p className="sample-card__desc">{sample.description}</p>
        <div className="sample-card__tags">
          {sample.stack.map((s) => (
            <span key={s} className="tag">
              {s}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
