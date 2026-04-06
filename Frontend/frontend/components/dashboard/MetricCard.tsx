import React from "react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trendValue: string;
  trendText: string;
  trendDirection: "up" | "down";
}

export default function MetricCard({
  title,
  value,
  icon,
  trendValue,
  trendText,
  trendDirection,
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span>{title}</span>
        {icon}
      </div>
      <div className="metric-value">{value}</div>
      <div className={`metric-trend ${trendDirection === "up" ? "trend-up" : "trend-down"}`}>
        {trendDirection === "up" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
            <polyline points="17 18 23 18 23 12"></polyline>
          </svg>
        )}
        <span>{trendValue}</span> <span className="trend-text">{trendText}</span>
      </div>
    </div>
  );
}
