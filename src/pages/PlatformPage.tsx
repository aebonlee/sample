import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import SampleCard from '../components/SampleCard';
import {
  categoryLabels,
  platformDescriptions,
  platformLabels,
  samplesByPlatform,
  type Platform,
  type SampleCategory,
} from '../data/samples';

const validPlatforms = new Set<Platform>(['web', 'app', 'ai', 'data', 'game']);

type Filter = 'all' | SampleCategory;

export default function PlatformPage() {
  const { platform } = useParams<{ platform: string }>();
  const p = (platform ?? 'web') as Platform;
  const valid = validPlatforms.has(p);

  const list = useMemo(() => (valid ? samplesByPlatform(p) : []), [valid, p]);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const availableCategories = useMemo<SampleCategory[]>(() => {
    const set = new Set<SampleCategory>();
    list.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((s) => {
      if (filter !== 'all' && s.category !== filter) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.stack.some((x) => x.toLowerCase().includes(q)) ||
        s.tags.some((x) => x.toLowerCase().includes(q))
      );
    });
  }, [list, filter, query]);

  if (!valid) {
    return (
      <section className="container empty-state" style={{ marginTop: 40 }}>
        <h3>알 수 없는 플랫폼입니다</h3>
        <p>주소를 다시 확인해 주세요.</p>
      </section>
    );
  }

  return (
    <>
      <section className="hero hero--compact">
        <div className="container">
          <h1 className="hero__title">
            {platformLabels[p]} <span className="hero__accent">샘플</span>
          </h1>
          <p className="hero__lead">{platformDescriptions[p]}</p>
        </div>
      </section>

      <section className="container gallery">
        {list.length === 0 ? (
          <div className="empty-state">
            <h3>아직 등록된 샘플이 없습니다</h3>
            <p>
              {platformLabels[p]} 카테고리는 곧 추가될 예정입니다. 다른 카테고리의 샘플을
              먼저 살펴보세요.
            </p>
          </div>
        ) : (
          <>
            <div className="gallery__controls">
              <div className="gallery__filters" role="tablist" aria-label="카테고리 필터">
                <button
                  role="tab"
                  aria-selected={filter === 'all'}
                  onClick={() => setFilter('all')}
                  className={`filter-chip ${filter === 'all' ? 'is-active' : ''}`}
                >
                  전체
                  <span className="filter-chip__count">{list.length}</span>
                </button>
                {availableCategories.map((cat) => {
                  const count = list.filter((s) => s.category === cat).length;
                  return (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={filter === cat}
                      onClick={() => setFilter(cat)}
                      className={`filter-chip ${filter === cat ? 'is-active' : ''}`}
                    >
                      {categoryLabels[cat]}
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
                <h3>검색 결과가 없습니다</h3>
                <p>필터를 바꾸거나 검색어를 지워보세요.</p>
              </div>
            ) : (
              <div className="gallery__grid">
                {filtered.map((s) => (
                  <SampleCard key={s.id} sample={s} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
