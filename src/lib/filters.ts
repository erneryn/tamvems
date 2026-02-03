import dayjs from 'dayjs';
import { VehicleRequest } from '@prisma/client';
import type { Locale } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

export interface RequestFilterOptions {
  status?: string;
  dateRange?: 'today' | 'week' | 'month' | 'year' | '';
  sortOrder?: 'asc' | 'desc';
  sortBy?: 'createdAt' | 'startDateTime' | 'endDateTime';
}

export interface ExtendedVehicleRequest extends VehicleRequest {
  vehicle?: {
    id?: string;
    name: string;
    plate: string;
    image?: string;
  };
  user?: {
    id?: string;
    name: string;
    email: string;
  };
  isIdle?: boolean;
  buttonStatus?: string | null;
}

/**
 * Filter vehicle requests based on provided options
 */
export function filterRequests<T extends ExtendedVehicleRequest>(
  requests: T[],
  options: RequestFilterOptions
): T[] {
  let filtered = [...requests];

  // Filter by status
  if (options.status) {
    filtered = filtered.filter(request => 
      request.status.toLowerCase() === options.status!.toLowerCase()
    );
  }

  // Filter by date range
  if (options.dateRange) {
    const now = dayjs();
    filtered = filtered.filter(request => {
      const requestDate = dayjs(request.startDateTime);
      switch (options.dateRange) {
        case 'today':
          return requestDate.isSame(now, 'day');
        case 'week':
          return requestDate.isSame(now, 'week');
        case 'month':
          return requestDate.isSame(now, 'month');
        case 'year':
          return requestDate.isSame(now, 'year');
        default:
          return true;
      }
    });
  }

  // Sort requests
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';
  
  filtered.sort((a, b) => {
    const dateA = dayjs(a[sortBy]);
    const dateB = dayjs(b[sortBy]);
    return sortOrder === 'desc' 
      ? dateB.valueOf() - dateA.valueOf()
      : dateA.valueOf() - dateB.valueOf();
  });

  return filtered;
}

/**
 * Get date range filter for Prisma queries
 */
export function getDateRangeFilter(dateRange: string) {
  const now = dayjs();
  
  switch (dateRange) {
    case 'today':
      return {
        gte: now.startOf('day').toDate(),
        lte: now.endOf('day').toDate()
      };
    case 'week':
      return {
        gte: now.startOf('week').toDate(),
        lte: now.endOf('week').toDate()
      };
    case 'month':
      return {
        gte: now.startOf('month').toDate(),
        lte: now.endOf('month').toDate()
      };
    case 'year':
      return {
        gte: now.startOf('year').toDate(),
        lte: now.endOf('year').toDate()
      };
    default:
      return undefined;
  }
}

/**
 * Get status filter options for UI (translated by locale)
 */
export function getStatusOptions(locale: Locale = 'id') {
  const t = translations[locale].filters;
  return [
    { value: '', label: t.statusAll },
    { value: 'PENDING', label: t.statusPending },
    { value: 'APPROVED', label: t.statusApproved },
    { value: 'REJECTED', label: t.statusRejected },
    { value: 'IN_USE', label: t.statusInUse },
    { value: 'COMPLETED', label: t.statusCompleted },
    { value: 'CANCELLED', label: t.statusCancelled }
  ];
}

/**
 * Get date range filter options for UI (translated by locale)
 */
export function getDateRangeOptions(locale: Locale = 'id') {
  const t = translations[locale].filters;
  return [
    { value: '', label: t.dateRangeAll },
    { value: 'today', label: t.dateRangeToday },
    { value: 'week', label: t.dateRangeWeek },
    { value: 'month', label: t.dateRangeMonth },
    { value: 'year', label: t.dateRangeYear }
  ];
}

/**
 * Get sort options for UI (translated by locale)
 */
export function getSortOptions(locale: Locale = 'id') {
  const t = translations[locale].filters;
  return [
    { value: 'desc', label: t.sortNewest },
    { value: 'asc', label: t.sortOldest }
  ];
}
