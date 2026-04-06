import React from "react";
import AnalyticsCharts from "@/components/analytics/AnalyticsCharts";

export default function AnalyticsPage() {
  return (
    <main className="content-area">
      <div className="page-header">
        <h2 className="page-title">System Analytics</h2>
        <p>In-depth insights tracking overall engagement and system efficiency.</p>
      </div>
      
      <AnalyticsCharts />
    </main>
  );
}
