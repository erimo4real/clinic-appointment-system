import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="w-12 h-12 rounded-xl" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-4 border-b border-gray-100">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="w-14 h-14 rounded-2xl" />
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <Skeleton className="h-6 w-40 mb-4" />
    <Skeleton className="h-64 w-full rounded-lg" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="card rounded-xl p-6">
    <div className="flex items-center space-x-4">
      <Skeleton className="w-20 h-20 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
    <Skeleton className="h-10 w-32" />
  </div>
);

export const DoctorCardSkeleton = () => (
  <div className="card rounded-xl p-5">
    <div className="flex items-start gap-4">
      <Skeleton className="w-16 h-16 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
    <div className="mt-4 flex gap-2">
      <Skeleton className="h-8 flex-1 rounded-lg" />
      <Skeleton className="h-8 flex-1 rounded-lg" />
    </div>
  </div>
);

export const ServiceCardSkeleton = () => (
  <div className="card rounded-xl p-5">
    <Skeleton className="h-6 w-32 mb-2" />
    <Skeleton className="h-4 w-full mb-4" />
    <div className="flex justify-between">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

export const ListItemSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b border-gray-100">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
    <Skeleton className="h-8 w-20 rounded-lg" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </div>
);

export const CalendarSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full mb-2" />
      ))}
      {Array.from({ length: 35 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

export default { 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton, 
  ProfileSkeleton, 
  FormSkeleton, 
  DoctorCardSkeleton, 
  ServiceCardSkeleton,
  ListItemSkeleton,
  StatCardSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  CalendarSkeleton
};
