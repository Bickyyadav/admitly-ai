"use client";

import React from "react";
import { 
  PieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

// 1. Call Success vs Failure Data
const statusData = [
  { name: "Completed", value: 6540 },
  { name: "Failed", value: 320 },
  { name: "No Answer", value: 1250 },
];
const STATUS_COLORS = ["#10B981", "#EF4444", "#9CA3AF"];

// 2. Average Call Duration
const durationData = [
  { name: "Mon", duration: 120 },
  { name: "Tue", duration: 145 },
  { name: "Wed", duration: 110 },
  { name: "Thu", duration: 180 },
  { name: "Fri", duration: 210 },
  { name: "Sat", duration: 90 },
  { name: "Sun", duration: 85 },
];

// 3. Sentiment Analysis Data
const sentimentData = [
  { name: "Positive", value: 4800, fill: "#10B981" },
  { name: "Neutral", value: 2900, fill: "#3B82F6" },
  { name: "Negative", value: 410, fill: "#EF4444" },
];

// 4. Quality Score Distribution
const qualityData = [
  { bucket: "0-20", count: 12 },
  { bucket: "21-40", count: 45 },
  { bucket: "41-60", count: 120 },
  { bucket: "61-80", count: 1850 },
  { bucket: "81-100", count: 6083 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "var(--bg-surface)", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", boxShadow: "var(--shadow-md)" }}>
        <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ margin: 0, color: p.color || p.payload.fill || "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsCharts() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px", marginBottom: "32px" }}>
      
      {/* 1. Call Success vs Failure */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Call Outcomes</h3>
        </div>
        <div className="card-body" style={{ height: "350px", display: "flex", flexDirection: "column" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "16px" }}>
             {statusData.map((entry, index) => (
               <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
                 <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: STATUS_COLORS[index] }}></span> 
                 {entry.name}
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* 2. Average Call Duration */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Average Call Duration (Seconds)</h3>
        </div>
        <div className="card-body" style={{ height: "350px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={durationData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--bg-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--bg-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="duration" name="Avg Duration" stroke="var(--bg-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorDuration)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Sentiment Analysis */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Call Sentiment Breakdown</h3>
        </div>
        <div className="card-body" style={{ height: "350px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sentimentData} layout="vertical" margin={{ top: 20, right: 30, left: 10, bottom: 0 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "var(--text-secondary)", fontWeight: 500 }} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-surface-hover)", opacity: 0.4 }} />
              <Bar dataKey="value" name="Calls" radius={[0, 6, 6, 0]}>
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Quality Score Distribution */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quality Score Distribution</h3>
        </div>
        <div className="card-body" style={{ height: "350px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={qualityData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-surface-hover)", opacity: 0.4 }} />
              <Bar dataKey="count" name="Calls" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
