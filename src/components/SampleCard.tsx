import { Link } from 'react-router-dom';
import { categoryLabels, type Sample } from '../data/samples';

const difficultyLabel: Record<Sample['difficulty'], string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
};

// SVG로 직접 그린 미리보기를 사용하는 샘플 id 목록.
// 이미지 파일 대신 /public/samples/<id>/preview.svg 를 사용한다.
const SVG_PREVIEW_IDS = new Set<string>(['portfolio-02', 'personal-04']);

export default function SampleCard({ sample }: { sample: Sample }) {
  const ext = SVG_PREVIEW_IDS.has(sample.id) ? 'svg' : 'png';
  const previewImg = `${import.meta.env.BASE_URL}samples/${sample.id}/preview.${ext}`;
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
