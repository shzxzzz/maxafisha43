import { TServiceItem } from 'types/config';

export const ALL_CATEGORY_ID = '__all__';

export const MIN_SEARCH_LENGTH = 2;

enum ERelevance {
  name = 0,
  tag = 1,
  description = 2,
  none = 3,
}

const getRelevance = (item: TServiceItem, query: string): ERelevance => {
  if (item.name.toLowerCase().includes(query)) {
    return ERelevance.name;
  }

  if (item.tags?.some((tag) => tag.toLowerCase().includes(query))) {
    return ERelevance.tag;
  }

  if (item.description.toLowerCase().includes(query)) {
    return ERelevance.description;
  }

  return ERelevance.none;
};

const getPriority = (item: TServiceItem): number => {
  if (item.popular) {
    return 0;
  }

  if (item.federal) {
    return 1;
  }

  return 2;
};

type TSearchResult = {
  item: TServiceItem;
  relevance: ERelevance;
};

export const searchItems = (list: TServiceItem[], query: string): TServiceItem[] => {
  const results: TSearchResult[] = [];

  for (const item of list) {
    const relevance = getRelevance(item, query);

    if (relevance !== ERelevance.none) {
      results.push({ item, relevance });
    }
  }

  results.sort((a, b) => {
    const priorityDiff = getPriority(a.item) - getPriority(b.item);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return a.relevance - b.relevance;
  });

  return results.map((r) => r.item);
};

export const sortByPriority = (a: TServiceItem, b: TServiceItem): number =>
  getPriority(a) - getPriority(b);
