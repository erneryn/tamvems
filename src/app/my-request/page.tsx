"use client";
import { Select } from "flowbite-react";
import CardMyRequest from "@/components/CardMyRequest";
import { useEffect, useState, useCallback } from "react";
import { VehicleRequest } from "@prisma/client";
import dayjs from "dayjs";
import { filterRequests, RequestFilterOptions, getStatusOptions, getDateRangeOptions, getSortOptions } from "@/lib/filters";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
interface UserRequest extends VehicleRequest {
  isIdle?: boolean;
  buttonStatus?: string | null;
  vehicle: {
    name: string;
    plate: string;
    image: string;
    description?: string | null;
  };
}

export default function PengajuanSaya() {
  const { locale } = useLanguage();
  const t = translations[locale].myRequest;
  const [userRequest, setUserRequest] = useState<UserRequest[]>([]);
  const [filteredRequest, setFilteredRequest] = useState<UserRequest[]>([]);
  const [filters, setFilters] = useState<RequestFilterOptions>({
    sortOrder: 'desc',
    status: '',
    dateRange: ''
  });
  const [useServerFiltering] = useState(false); // Can be made configurable later

  // Get filter options (translated by locale)
  const statusOptions = getStatusOptions(locale);
  const dateRangeOptions = getDateRangeOptions(locale);
  const sortOptions = getSortOptions(locale);

  const fetchUserRequest = useCallback(async (filterParams?: RequestFilterOptions) => {
    // Build query parameters
    const params = new URLSearchParams();
    if (filterParams?.status) params.append('status', filterParams.status);
    if (filterParams?.dateRange) params.append('dateRange', filterParams.dateRange);
    if (filterParams?.sortOrder) params.append('sortOrder', filterParams.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/api/user-request?${queryString}` : '/api/user-request';
    
    const response = await fetch(url);
    const data = await response.json();
    setUserRequest(data);
  }, []);

  const applyFilters = useCallback(() => {
    if (useServerFiltering) {
      // When using server filtering, the API already returns filtered data
      setFilteredRequest(userRequest);
    } else {
      // Client-side filtering
      const filtered = filterRequests(userRequest, filters);
      setFilteredRequest(filtered);
    }
  }, [userRequest, filters, useServerFiltering]);

  useEffect(() => {
    fetchUserRequest();
  }, [fetchUserRequest]);

  useEffect(() => {
    if (useServerFiltering) {
      fetchUserRequest(filters);
    } else {
      applyFilters();
    }
  }, [filters, useServerFiltering, fetchUserRequest, applyFilters]);

  useEffect(() => {
    if (!useServerFiltering) {
      applyFilters();
    }
  }, [userRequest, useServerFiltering, applyFilters]);

  const handleFilterChange = (filterType: keyof RequestFilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 mt-6 md:mt-10">
      <h1 className="text-2xl md:text-3xl text-center font-bold uppercase">
        {t.title}
      </h1>
      <div
        className="relative w-full lg:w-3/4 mx-auto border-2 border-gray-300 rounded-lg p-4 md:p-10 my-6 md:my-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg-form.jpg)" }}
      >
        <div className="absolute inset-0 bg-white opacity-80 rounded-lg"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 mb-6">
            <div className="w-full sm:w-[200px]">
              <Select 
                id="sortOrder" 
                className="w-full"
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-full sm:w-[200px]">
              <Select 
                id="status" 
                className="w-full"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-full sm:w-[200px]">
              <Select 
                id="dateRange" 
                className="w-full"
                value={filters.dateRange || ''}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="w-full border-2 border-gray-300 rounded-lg my-4"></div>
          
          {/* Results count */}
          <div className="mb-4 text-sm text-gray-600">
            {t.showingCount.replace("{count}", String(filteredRequest.length)).replace("{total}", String(userRequest.length))}
          </div>
          
          <div className="flex flex-col justify-between items-center gap-4 mx-0 md:mx-4 lg:mx-20">
            {filteredRequest.length > 0 ? (
              filteredRequest.map((request) => (
                <CardMyRequest 
                  key={request.id} 
                  title={request.vehicle.name}
                  plate={request.vehicle.plate}
                  description={request.vehicle.description ?? undefined}
                  image={request.vehicle.image || '/default-car.png'}
                  requestDate={request.startDateTime}
                  requestTime={dayjs(request.startDateTime).format("HH:mm")}
                  returnTime={dayjs(request.endDateTime).format("HH:mm")}
                  status={request.status}
                  checkOutAt={request.checkOutAt}
                  buttonStatus={request.buttonStatus}
                  isIdle={request.isIdle}
                  rejectionReason={request.rejectionReason || null}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">{t.noMatch}</p>
                <p className="text-sm mt-2">{t.noMatchHint}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}