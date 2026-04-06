"use client";

import React from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#10B981", "#EF4444", "#3B82F6"];
const QUALITY_COLORS = ["#EF4444", "#F59E0B", "#FBBF24", "#A3E635", "#22C55E"]; // Red to Green scale

interface ChartProps {
  pieData?: Array<{ name: string; value: number }>;
  barData?: Array<{ name: string; calls: number }>;
  qualityData?: Array<{ name: string; value: number }>;
}

export default function DashboardCharts({ 
  pieData: propPieData, 
  barData: propBarData,
  qualityData: propQualityData 
}: ChartProps) {
  const pie = propPieData || [];
  const bar = propBarData || [];
  const quality = propQualityData || [];

  return (
    <div className="charts-grid block" style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
      gap: "24px", 
      marginBottom: "32px" 
    }}>
      {/* Call Status Distribution */}
      <div className="card chart-card">
        <div className="card-header">
          <h3 className="card-title">Call Status Distribution</h3>
        </div>
        <div className="card-body" style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pie}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-secondary)" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }}></span> Completed</div>
             <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-secondary)" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#EF4444" }}></span> Failed</div>
             <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-secondary)" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3B82F6" }}></span> In Progress</div>
          </div>
        </div>
      </div>

      {/* Quality Score Distribution */}
      <div className="card chart-card">
        <div className="card-header">
          <h3 className="card-title">Quality Score Distribution</h3>
        </div>
        <div className="card-body" style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={quality}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {quality.map((entry, index) => (
                  <Cell key={`cell-q-${index}`} fill={QUALITY_COLORS[index % QUALITY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
             {quality.map((q, i) => (
               <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-secondary)" }}>
                 <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: QUALITY_COLORS[i % QUALITY_COLORS.length] }}></span> {q.name}
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Calls Per Day */}
      <div className="card chart-card" style={{ gridColumn: "span 1" }}>
        <div className="card-header">
          <h3 className="card-title">Calls Per Day</h3>
        </div>
        <div className="card-body" style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bar}
              margin={{
                top: 20,
                right: 30,
                left: -20,
                bottom: 0,
              }}
              barSize={32}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
              <Tooltip 
                cursor={{ fill: "var(--bg-surface-hover)" }} 
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", background: "var(--bg-surface)" }} 
              />
              <Bar dataKey="calls" fill="var(--bg-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
