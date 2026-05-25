import { PROJECT_DATA, type ProjectData } from './projectDetails';
import { PROJECT_DATA_KOREATECH } from './projectDetailsKoreatech';

/**
 * 프로젝트 메뉴를 2개로 분리해 운영하기 위한 데이터셋 키.
 * - neet     : 기존 7개 (쉬었음 청년 과정용)
 * - koreatech: 신규 7개 (한기대 재학생용)
 */
export type ProjectSetKey = 'neet' | 'koreatech';

export interface ProjectSet {
  key: ProjectSetKey;
  data: ProjectData[];
  basePath: string;           // /projects | /projects-koreatech
  navLabel: string;
  audienceLabel: string;
  pageTitle: string;
  pageDescription: string;
  sidebarHeader: string;      // 사이드바 그룹 헤더
}

export const PROJECT_SETS: Record<ProjectSetKey, ProjectSet> = {
  neet: {
    key: 'neet',
    data: PROJECT_DATA,
    basePath: '/projects',
    navLabel: '쉬었음 청년 프로젝트',
    audienceLabel: '쉬었음 청년 과정',
    pageTitle: '쉬었음 청년 프로젝트 샘플',
    pageDescription:
      'Solar LLM을 활용한 7가지 실전 프로젝트 가이드입니다. 쉬었음 청년 과정 학습자를 위한 일상·서비스형 문제 해결 시나리오 중심으로 구성되어 있습니다.',
    sidebarHeader: '7가지 프로젝트 (쉬었음 청년)',
  },
  koreatech: {
    key: 'koreatech',
    data: PROJECT_DATA_KOREATECH,
    basePath: '/projects-koreatech',
    navLabel: '한기대 프로젝트',
    audienceLabel: '한기대 재학생 과정',
    pageTitle: '한기대 프로젝트 샘플',
    pageDescription:
      'Solar LLM을 활용한 7가지 한기대(KOREATECH) 재학생 전용 프로젝트입니다. 캡스톤·논문·코드 리뷰·실험 보고서·면접·산학협력 등 공학·전공 심화 시나리오로 구성됩니다.',
    sidebarHeader: '7가지 프로젝트 (한기대)',
  },
};

/** 현재 URL pathname으로 데이터셋 결정 */
export const resolveProjectSet = (pathname: string): ProjectSet => {
  if (pathname.startsWith('/projects-koreatech')) return PROJECT_SETS.koreatech;
  return PROJECT_SETS.neet;
};
