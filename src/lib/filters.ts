import dayjs from 'dayjs';
import { VehicleRequest, RequestStatus } from '@prisma/client';

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
 * Get status filter options for UI
 */
export function getStatusOptions() {
  return [
    { value: '', label: 'Semua Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Disetujui' },
    { value: 'REJECTED', label: 'Ditolak' },
    { value: 'IN_USE', label: 'Sedang Digunakan' },
    { value: 'COMPLETED', label: 'Selesai' },
    { value: 'CANCELLED', label: 'Dibatalkan' }
  ];
}

/**
 * Get date range filter options for UI
 */
export function getDateRangeOptions() {
  return [
    { value: '', label: 'Semua Waktu' },
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'year', label: 'Tahun Ini' }
  ];
}

/**
 * Get sort options for UI
 */
export function getSortOptions() {
  return [
    { value: 'desc', label: 'Terbaru' },
    { value: 'asc', label: 'Terlama' }
  ];
}
