"use client";

import React, { useState, useEffect } from "react";
import MetricCard from "@/components/dashboard/MetricCard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import RecentCalls from "@/components/dashboard/RecentCalls";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
        const url = baseUrl.endsWith('/') ? `${baseUrl}stats` : `${baseUrl}/stats`;
        
        console.log("Fetching stats from:", url);
        const response = await fetch(url);
        
        if (response.ok) {
          const result = await response.json();
          console.log("Stats received:", result);
          setStats(result);
        } else {
          setError(`Server error: ${response.status} ${response.statusText}`);
          console.error("Backend error:", response.status);
        }
      } catch (err) {
        setError("Cannot connect to backend server. Please ensure it is running at http://localhost:8000");
        console.error("Connection error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      bar: stats?.chart_data?.bar ?? []
    }
  };

  return (
    <main className="content-area">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Dashboard Overview</h2>
          <p>Welcome back! Here's what's happening with your AI caller today.</p>
        </div>
        {error && (
          <div style={{ 
            padding: '12px 20px', 
            background: 'var(--badge-red-bg)', 
            color: 'var(--badge-red-text)', 
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}
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
      />
      
      <RecentCalls calls={data.recent_calls} />
    </main>
  );
}
