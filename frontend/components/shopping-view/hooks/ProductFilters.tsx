import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createLogger } from '@/utils/logger';

const logger = createLogger({ context: 'useProductFilters' });

type FilterParams = Record<string, string[]>;

const useProductFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterParams>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const categorySearchParam = searchParams?.get('category') || null;

  // Initialize filters from session storage
  useEffect(() => {
    const storedFilters = sessionStorage.getItem('filters');
    if (storedFilters) {
      try {
        setFilters(JSON.parse(storedFilters));
      } catch (error) {
        logger.error('Failed to parse stored filters:', error);
      }
    }
    setIsInitialLoad(false);
  }, [categorySearchParam]);

  // Update URL when filters change
  useEffect(() => {
    if (isInitialLoad) return;

    const queryString = createSearchParamsHelper(filters);
    sessionStorage.setItem('filters', JSON.stringify(filters));

    if (queryString) {
      router.replace(`?${queryString}`, { scroll: false });
    }
  }, [filters, isInitialLoad, router]);

  const handleFilter = useCallback((sectionId: string, option: string) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      const currentOptions = newFilters[sectionId] || [];

      const optionIndex = currentOptions.indexOf(option);
      if (optionIndex === -1) {
        newFilters[sectionId] = [...currentOptions, option];
      } else {
        newFilters[sectionId] = currentOptions.filter((o) => o !== option);
        if (newFilters[sectionId].length === 0) {
          delete newFilters[sectionId];
        }
      }

      return newFilters;
    });
  }, []);

  return { filters, handleFilter, isInitialLoad };
};

const createSearchParamsHelper = (filterParams: FilterParams): string => {
  const queryParams: string[] = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(',');
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  return queryParams.join('&');
};

export default useProductFilters;