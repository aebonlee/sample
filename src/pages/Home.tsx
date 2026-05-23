import { useMemo, useState } from 'react';
import SampleCard from '../components/SampleCard';
import { categoryLabels, samples, type SampleCategory } from '../data/samples';

type Filter = 'all' | SampleCategory;

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: '전체' },
  ...(Object.entries(categoryLabels) as [SampleCategory, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

export default function Home() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return samples.filter((s) => {
      if (filter !== 'all' && s.category !== filter) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.stack.some((x) => x.toLowerCase().includes(q)) ||
        s.tags.some((x) => x.toLowerCase().includes(q))
      );
    });
  }, [filter, query]);

  const availableCount = (cat: Filter) =>
    cat === 'all' ? samples.length : samples.filter((s) => s.category === cat).length;

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
            <a className="btn btn--primary" href="#gallery">
              샘플 둘러보기
            </a>
            <a className="btn btn--ghost" href="#/about">
              제작 방법 보기
            </a>
          </div>
        </div>
      </section>

      <section id="gallery" className="container gallery">
        <div className="gallery__controls">
          <div className="gallery__filters" role="tablist" aria-label="카테고리 필터">
            {filters.map((f) => {
              const count = availableCount(f.value);
              const disabled = count === 0;
              return (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={filter === f.value}
                  disabled={disabled}
                  onClick={() => setFilter(f.value)}
                  className={`filter-chip ${filter === f.value ? 'is-active' : ''}`}
                >
                  {f.label}
                  <span className="filter-chip__count">{count}</span>
                </button>
              );
            })}
          </div>
          <input
            className="gallery__search"
            type="search"
            placeholder="제목, 태그, 기술 스택 검색…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>아직 등록된 샘플이 없습니다</h3>
            <p>
              곧 다양한 프로젝트 타입의 샘플이 추가될 예정입니다. 카테고리를 바꿔보거나 검색어를
              지워보세요.
            </p>
          </div>
        ) : (
          <div className="gallery__grid">
            {filtered.map((s) => (
              <SampleCard key={s.id} sample={s} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
