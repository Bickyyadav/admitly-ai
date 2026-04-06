"use client";

import React, { useState, useEffect } from "react";
import MetricCard from "@/components/dashboard/MetricCard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import RecentCalls from "@/components/dashboard/RecentCalls";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [qualityStats, setQualityStats] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [isRefreshingQuality, setIsRefreshingQuality] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      else setIsRefreshingQuality(true);
      
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
        
        // 1. Fetch Main Stats (only on initial load)
        if (isInitial) {
          const statsUrl = baseUrl.endsWith('/') ? `${baseUrl}stats` : `${baseUrl}/stats`;
          const statsResponse = await fetch(statsUrl);
          if (statsResponse.ok) {
            const statsResult = await statsResponse.json();
            setStats(statsResult);
          }
        }

        // 2. Fetch Quality Stats (depends on selectedDate)
        const qualityUrl = baseUrl.endsWith('/') ? 
          `${baseUrl}quality-score-stats?date=${selectedDate}` : 
          `${baseUrl}/quality-score-stats?date=${selectedDate}`;
        
        const qualityResponse = await fetch(qualityUrl);
        
        if (qualityResponse.ok) {
          const qualityResult = await qualityResponse.json();
          const categories = qualityResult.category_totals || {};
          const transformed = Object.entries(categories).map(([name, value]) => ({
            name,
            value: Number(value)
          }));
          setQualityStats(transformed);
        } else {
          console.error("Quality stats fetch failed");
        }

      } catch (err) {
        setError("Cannot connect to backend server. Please ensure it is running at http://localhost:8000");
        console.error("Connection error:", err);
      } finally {
        setLoading(false);
        setIsRefreshingQuality(false);
      }
    };

    fetchAllData(stats === null);
  }, [selectedDate]);

  if (loading) {
    return (
      <main className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ marginBottom: '16px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your dashboard stats...</p>
        </div>
      </main>
    );
  }

  // Robust data mapping with defaults for every field
  const data = {
    total_students: stats?.total_students ?? 0,
    total_calls: stats?.total_calls ?? 0,
    completed_calls: stats?.completed_calls ?? 0,
    failed_calls: stats?.failed_calls ?? 0,
    recent_calls: stats?.recent_calls ?? [],
    chart_data: {
      pie: stats?.chart_data?.pie ?? [],
      bar: stats?.chart_data?.bar ?? [],
      quality: qualityStats
    }
  };

  return (
    <main className="content-area">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="page-title">Dashboard Overview</h2>
          <p>Welcome back! Here's what's happening with your AI caller.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div className="filter-group" style={{ margin: 0, width: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>
              Analysis Date
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="date" 
                className="form-input" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                style={{ 
                  padding: '10px 14px', 
                  borderRadius: '12px', 
                  fontSize: '14px',
                  borderColor: isRefreshingQuality ? 'var(--bg-primary)' : 'var(--border-color)',
                  transition: 'all 0.2s ease'
                }}
              />
              {isRefreshingQuality && (
                <div style={{ position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)' }}>
                   <div className="loading-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div style={{ 
              padding: '10px 16px', 
              background: 'var(--badge-red-bg)', 
              color: 'var(--badge-red-text)', 
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '42px'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard 
          title="Total Students" 
          value={data.total_students.toLocaleString()} 
          trendValue="--" 
          trendText="Real-time" 
          trendDirection="up" 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} 
        />
        <MetricCard 
          title="Total Calls" 
          value={data.total_calls.toLocaleString()} 
          trendValue="--" 
          trendText="Real-time" 
          trendDirection="up" 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>} 
        />
        <MetricCard 
          title="Completed Calls" 
          value={data.completed_calls.toLocaleString()} 
          trendValue="--" 
          trendText="Real-time" 
          trendDirection="up" 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>} 
        />
        <MetricCard 
          title="Failed Calls" 
          value={data.failed_calls.toLocaleString()} 
          trendValue="--" 
          trendText="Real-time" 
          trendDirection="down" 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>} 
        />
      </div>

      <DashboardCharts 
        pieData={data.chart_data.pie} 
        barData={data.chart_data.bar} 
        qualityData={data.chart_data.quality}
      />
      
      <RecentCalls calls={data.recent_calls} />
    </main>
  );
}
