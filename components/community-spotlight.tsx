'use client';

import { useState, useEffect } from 'react';
import { getWinners, getRecentActivities } from '@/lib/airtable-service';
import { useCachedData, winnersCache, activitiesCache, useIntersectionObserver } from '@/lib/performance-utils';
import RecentWinners from '@/components/recent-winners';
import RecentActivities from '@/components/recent-activities';
import Link from 'next/link';
import { ArrowRight, Award, Activity, Loader2 } from 'lucide-react';

interface CommunitySpotlightProps {
  initialWinners?: any[];
  initialActivities?: any[];
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-700 rounded mb-4"></div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Error fallback component
function ErrorFallback({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="text-red-400 mb-4">Failed to load data</div>
      <button
        onClick={retry}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

export default function CommunitySpotlight({ initialWinners = [], initialActivities = [] }: CommunitySpotlightProps) {
  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Always load data for this critical component
  const shouldLoadData = true;

  // Use cached data with fallback to initial data
  const {
    data: winners,
    loading: winnersLoading,
    error: winnersError,
    refetch: refetchWinners,
  } = useCachedData(
    () => getWinners(),
    'recent-winners',
    winnersCache,
    [shouldLoadData]
  );

  const {
    data: activities,
    loading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useCachedData(
    () => getRecentActivities(),
    'recent-activities',
    activitiesCache,
    [shouldLoadData]
  );

  // Use initial data if available and no cached data
  const displayWinners = winners || initialWinners;
  const displayActivities = activities || initialActivities;

  // Auto-refresh activities every 30 seconds when visible
  useEffect(() => {
    if (!shouldLoadData) return;

    const interval = setInterval(() => {
      refetchActivities();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [hasIntersected, refetchActivities]);

  return (
    <section ref={elementRef} className="section-gradient community-spotlight-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Enhanced Typography */}
        <div className="section-header">
          <h2 className="community-title bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Community Spotlight
          </h2>
          <p className="community-subtitle">
            Discover our latest champions and stay updated with real-time platform activity
          </p>
        </div>

        {hasIntersected && (
          <div className="community-spotlight-grid">
            {/* Recent Winners */}
            <div className="community-card">
              <div className="community-card-header">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 flex items-center gap-2 md:gap-3">
                      <Award className="h-6 w-6 md:h-8 md:w-8 text-yellow-400" />
                      Recent Champions
                      {winnersLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      )}
                    </h3>
                    <p className="text-base md:text-lg text-gray-300">Celebrating our latest bounty winners</p>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-xl md:text-2xl font-bold text-green-400">{displayWinners.length}</div>
                    <div className="text-xs md:text-sm text-gray-400">Total Winners</div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="community-stats-grid">
                  <div className="community-stat-card">
                    <div className="text-sm md:text-lg font-bold text-blue-400">
                      ${displayWinners.reduce((sum, winner) => sum + (parseFloat(String(winner.reward || '0').replace('$', '').replace(',', ''))), 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Total Rewards</div>
                  </div>
                  <div className="community-stat-card">
                    <div className="text-sm md:text-lg font-bold text-purple-400">
                      {new Set(displayWinners.map(w => w.bountyTitle)).size}
                    </div>
                    <div className="text-xs text-gray-400">Unique Bounties</div>
                  </div>
                  <div className="community-stat-card md:hidden">
                    <div className="text-sm font-bold text-yellow-400">
                      {displayWinners.filter(w => parseFloat(String(w.reward || '0').replace('$', '').replace(',', '')) >= 1000).length}
                    </div>
                    <div className="text-xs text-gray-400">High Value</div>
                  </div>
                </div>
              </div>
              
              {!shouldLoadData ? (
              <LoadingSkeleton />
            ) : winnersError ? (
              <ErrorFallback error={winnersError} retry={refetchWinners} />
            ) : winnersLoading && !displayWinners.length ? (
              <LoadingSkeleton />
            ) : (
              <RecentWinners winners={displayWinners} />
            )}
              

            </div>

            {/* Recent Activities */}
            <div className="community-card">
              <div className="community-card-header">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 flex items-center gap-2 md:gap-3">
                      <Activity className="h-6 w-6 md:h-8 md:w-8 text-green-400" />
                      Live Activity
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse ml-1 md:ml-2"></div>
                      {activitiesLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-green-400" />
                      )}
                    </h3>
                    <p className="text-base md:text-lg text-gray-300">Real-time platform updates</p>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-xl md:text-2xl font-bold text-blue-400">{displayActivities.length}</div>
                    <div className="text-xs md:text-sm text-gray-400">Recent Events</div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="community-stats-grid grid-cols-3">
                  <div className="community-stat-card">
                    <div className="text-xs md:text-sm font-bold text-green-400">
                      {displayActivities.filter(a => a.type === 'new_bounty').length}
                    </div>
                    <div className="text-xs text-gray-400">New Bounties</div>
                  </div>
                  <div className="community-stat-card">
                    <div className="text-xs md:text-sm font-bold text-yellow-400">
                      {displayActivities.filter(a => a.type === 'payment').length}
                    </div>
                    <div className="text-xs text-gray-400">Payments</div>
                  </div>
                  <div className="community-stat-card">
                    <div className="text-xs md:text-sm font-bold text-purple-400">
                      {displayActivities.filter(a => a.type === 'submission').length}
                    </div>
                    <div className="text-xs text-gray-400">Submissions</div>
                  </div>
                </div>
              </div>
              
              {!shouldLoadData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center text-gray-400">
                    Loading activity feed...
                  </div>
                </div>
              ) : activitiesError ? (
                <ErrorFallback error={activitiesError} retry={refetchActivities} />
              ) : activitiesLoading && !displayActivities.length ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center text-gray-400">
                    Loading activity feed...
                  </div>
                </div>
              ) : (
                <RecentActivities activities={displayActivities} />
              )}
              

            </div>
          </div>
        )}

        {/* Loading placeholder when not intersected */}
        {!hasIntersected && (
          <div className="community-spotlight-grid">
            <div className="community-card">
              <div className="h-64 flex items-center justify-center">
                <div className="text-gray-400">Loading community data...</div>
              </div>
            </div>
            <div className="community-card">
              <div className="h-64 flex items-center justify-center">
                <div className="text-gray-400">Loading activity feed...</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}