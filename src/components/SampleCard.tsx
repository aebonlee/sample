import { Link } from 'react-router-dom';
import { categoryLabels, type Sample } from '../data/samples';

const difficultyLabel: Record<Sample['difficulty'], string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
};

export default function SampleCard({ sample }: { sample: Sample }) {
  const previewImg = `${import.meta.env.BASE_URL}samples/${sample.id}/preview.png`;
  return (
    <Link to={`/samples/${sample.id}`} className="sample-card">
      <div className="sample-card__thumb">
        <img
          src={previewImg}
          alt={`${sample.title} 데스크탑 미리보기`}
          loading="lazy"
          decoding="async"
          width={1440}
          height={900}
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
