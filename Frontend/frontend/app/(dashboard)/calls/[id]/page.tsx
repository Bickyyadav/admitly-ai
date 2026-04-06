"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CallDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
        const url = baseUrl.endsWith('/') ? `${baseUrl}users/${id}` : `${baseUrl}/users/${id}`;

        const response = await fetch(url);

        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else if (response.status === 404) {
          setError("User not found.");
        } else {
          setError(`Server error: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        setError("Cannot connect to backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  if (loading) {
    return (
      <main className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center', animation: "fadeInUp 0.6s ease" }}>
          <div className="loading-spinner" style={{ marginBottom: '16px', display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--bg-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.5px' }}>Loading Insights...</p>
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        `}} />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="content-area">
        <div className="page-header" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Link href="/calls" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", fontWeight: 500, width: "fit-content", transition: 'color 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Back to Dashboard
          </Link>
          <div style={{
            padding: '24px', background: 'var(--badge-red-bg)', color: 'var(--badge-red-text)',
            borderRadius: '16px', fontSize: '15px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error || "Could not load data."}
          </div>
        </div>
      </main>
    );
  }

  const { user_info, call_history } = data;

  const latestCallData = call_history && call_history.length > 0 ? call_history[0] : null;
  const callInfo = latestCallData?.call_info || {};
  const analysis = latestCallData?.analysis || {};

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string | undefined | null) => {
    if (!status) return <span className="badge">Unknown</span>;
    const s = status.toLowerCase();
    if (s.includes("completed")) return <span className="badge badge-green" style={{ boxShadow: '0 2px 10px rgba(16, 185, 129, 0.2)' }}>Completed</span>;
    if (s.includes("failed")) return <span className="badge badge-red" style={{ boxShadow: '0 2px 10px rgba(239, 68, 68, 0.2)' }}>Failed</span>;
    if (s.includes("queued") || s.includes("scheduled")) return <span className="badge badge-purple" style={{ boxShadow: '0 2px 10px rgba(139, 92, 246, 0.2)' }}>{status}</span>;
    if (s.includes("answer") || s.includes("busy")) return <span className="badge badge-yellow" style={{ boxShadow: '0 2px 10px rgba(245, 158, 11, 0.2)' }}>{status}</span>;
    return <span className="badge">{status}</span>;
  };

  const safeText = (val: any) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val.content) return val.content;
    return JSON.stringify(val);
  };

  const InfoBlock = ({ icon, label, value, cols = 1 }: { icon: React.ReactNode, label: string, value: React.ReactNode, cols?: number }) => (
    <div style={{
      gridColumn: `span ${cols}`, padding: "16px", backgroundColor: "var(--bg-app)",
      borderRadius: "16px", border: "1px solid var(--border-color)",
      display: "flex", flexDirection: "column", gap: "6px",
      transition: "transform 0.2s ease, box-shadow 0.2s ease"
    }}
      onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--bg-primary)'; }}
      onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)", fontWeight: 600 }}>
        {icon} {label}
      </div>
      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "15px", lineHeight: 1.4, wordBreak: "break-word" }}>
        {value}
      </div>
    </div>
  );

  return (
    <main className="content-area" style={{ position: 'relative' }}>

      {/* Decorative gradient orb background */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, var(--bg-primary) 0%, transparent 60%)', opacity: 0.05, filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }}></div>

      <div className="page-header" style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "slideInRight 0.5s ease", position: 'relative', zIndex: 1 }}>
        <Link href="/calls" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, width: "fit-content", padding: "8px 16px", borderRadius: "20px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)", transition: "all 0.2s" }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-primary)'; e.currentTarget.style.color = 'white'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back to Calls
        </Link>
        <div>
          <h2 className="page-title" style={{ fontSize: "32px", background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>
            {user_info?.name || "User Details"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>Comprehensive intelligence and telemetry for this session.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginBottom: "24px", position: 'relative', zIndex: 1 }}>

        {/* Student Info Card */}
        <div className="card" style={{ borderTop: "4px solid #6366F1", boxShadow: "var(--shadow-md)" }}>
          <div className="card-header" style={{ borderBottom: "none", paddingBottom: "0" }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Student Profile
            </h3>
          </div>
          <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", paddingTop: "20px" }}>
            <InfoBlock cols={2} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>} label="Email Address" value={user_info?.email || "-"} />
            <InfoBlock icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>} label="Phone" value={user_info?.phone_number || "-"} />
            <InfoBlock icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>} label="Registered" value={formatDate(user_info?.created_at)} />

            <InfoBlock cols={2} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>} label="Program & Course" value={`${user_info?.selected_program || "-"} • ${user_info?.selected_course || "-"}`} />
            <InfoBlock cols={2} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>} label="Specialization" value={user_info?.specialization || "-"} />

            <InfoBlock cols={2} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>} label="Location" value={`${user_info?.address || "-"}, ${user_info?.city ? user_info.city + ', ' : ''}${user_info?.state || "-"}`} />
          </div>
        </div>

        {/* Call Info Card */}
        <div className="card" style={{ borderTop: "4px solid #10B981", boxShadow: "var(--shadow-md)" }}>
          <div className="card-header" style={{ borderBottom: "none", paddingBottom: "0" }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              Telemetry & Status
            </h3>
          </div>
          <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", paddingTop: "20px" }}>
            <div style={{ gridColumn: "span 2", display: "flex", gap: "12px" }}>
              <div style={{ flex: 1, padding: "16px", backgroundColor: "var(--bg-app)", borderRadius: "16px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600 }}>Status</span>
                {getStatusBadge(callInfo?.status)}
              </div>
              <div style={{ flex: 1, padding: "16px", backgroundColor: "var(--bg-app)", borderRadius: "16px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600 }}>Duration</span>
                <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--text-primary)" }}>
                  {callInfo?.duration !== null && callInfo?.duration !== undefined ? `${callInfo.duration}s` : "-"}
                </span>
              </div>
            </div>

            <InfoBlock cols={2} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>} label="Call SID" value={<span style={{ fontFamily: "monospace", fontSize: "13px", color: "var(--text-secondary)" }}>{callInfo?.call_sid || "Pending"}</span>} />

            <InfoBlock icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} label="Start Time" value={formatDate(callInfo?.start_time)} />
            <InfoBlock icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} label="End Time" value={formatDate(callInfo?.end_time)} />

            <InfoBlock icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>} label="Retries" value={<span style={{ color: "var(--text-primary)" }}>{callInfo?.retry_count ?? 0} <span style={{ color: "var(--text-tertiary)" }}>/ {callInfo?.max_retries ?? 3}</span></span>} />
            <InfoBlock icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} label="Requested Callback" value={callInfo?.user_requested_callback ? <span style={{ color: "#10B981" }}>Yes</span> : "No"} />

            {callInfo?.failure_reason && (
              <div style={{ gridColumn: "span 2", padding: "16px", backgroundColor: "var(--badge-red-bg)", borderRadius: "16px", border: "1px dashed rgba(239, 68, 68, 0.4)" }}>
                <div style={{ fontSize: "12px", color: "var(--badge-red-text)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Failure Reason</div>
                <div style={{ color: "var(--badge-red-text)", fontSize: "14px", fontWeight: 500 }}>{callInfo.failure_reason}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recording Card - position absolute removed, it's relative container above */}
      <div className="card full-width" style={{ marginBottom: "24px", boxShadow: "var(--shadow-sm)", position: 'relative', zIndex: 1 }}>
        <div className="card-header" style={{ padding: "16px 24px", backgroundColor: "var(--bg-surface-hover)" }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
            Call Recording
          </h3>
        </div>
        <div className="card-body" style={{ minHeight: "auto", padding: "24px" }}>
          {callInfo?.recording_url ? (
            <div style={{ background: "var(--bg-app)", padding: "16px", borderRadius: "100px", border: "1px solid var(--border-color)" }}>
              <audio controls style={{ width: "100%", height: "40px", outline: "none" }}>
                <source src={callInfo.recording_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "20px 0" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--bg-app)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l20 20" /><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M22 9l-6 6" /><path d="M16 9l6 6" /></svg>
              </div>
              <p style={{ color: "var(--text-tertiary)", fontStyle: "italic", fontWeight: 500 }}>No recording available for this session.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", position: 'relative', zIndex: 1 }}>

        {/* Analysis Details */}
        <div className="card" style={{ borderTop: "4px solid #A855F7", boxShadow: "var(--shadow-md)" }}>
          <div className="card-header" style={{ borderBottom: "none", paddingBottom: "0" }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
              AI Intelligence
            </h3>
          </div>
          <div className="card-body" style={{ gap: "20px", minHeight: "auto", paddingTop: "20px" }}>
            <div style={{ padding: "20px", background: "var(--bg-app)", borderRadius: "16px", border: "1px solid var(--border-color)", textAlign: "center" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "1px" }}>Quality Score</div>
              {analysis?.quality_score !== undefined && analysis?.quality_score !== null ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", lineHeight: 1 }}>{analysis.quality_score}<span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>/100</span></span>
                  <div style={{ width: "100%", backgroundColor: "var(--border-color)", height: "6px", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${analysis.quality_score}%`, background: "var(--primary-gradient)", height: "100%", borderRadius: "4px" }}></div>
                  </div>
                </div>
              ) : (
                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>-</div>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ padding: "20px", background: "var(--bg-app)", borderRadius: "16px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "1px" }}>Intent</div>
                <div style={{ fontWeight: 700, color: "var(--bg-primary)", fontSize: "16px" }}>{safeText(analysis?.intent) || "-"}</div>
              </div>
              <div style={{ padding: "20px", background: "var(--bg-app)", borderRadius: "16px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "1px" }}>Outcome</div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "16px" }}>{safeText(analysis?.outcome) || "-"}</div>
              </div>
              {/* <div style={{ padding: "20px", background: "var(--bg-app)", borderRadius: "16px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "1px" }}>Sentiment</div>
                {analysis?.sentiment ? (
                  <div style={{ display: "inline-block", padding: "6px 14px", borderRadius: "20px", backgroundColor: "var(--badge-green-bg)", color: "var(--badge-green-text)", fontSize: "13px", fontWeight: 700, boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)' }}>{safeText(analysis.sentiment)}</div>
                ) : (
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>-</div>
                )}
              </div> */}
              {/* <div style={{ padding: "20px", background: "var(--bg-app)", borderRadius: "16px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "1px" }}>Quality Score</div>
                {analysis?.quality_score !== undefined && analysis?.quality_score !== null ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", lineHeight: 1 }}>{analysis.quality_score}<span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>/100</span></span>
                    <div style={{ width: "100%", backgroundColor: "var(--border-color)", height: "6px", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${analysis.quality_score}%`, background: "var(--primary-gradient)", height: "100%", borderRadius: "4px" }}></div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>-</div>
                )}
              </div> */}
            </div>

            {/* <div style={{ padding: "24px", background: "var(--bg-surface-hover)", borderRadius: "16px", border: "1px dashed var(--border-color)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Executive Summary
              </div>
              <p style={{ color: "var(--text-primary)", lineHeight: 1.7, fontSize: "15px" }}>{safeText(analysis?.summary) || <span style={{ fontStyle: "italic", color: "var(--text-tertiary)" }}>Waiting for AI synopsis...</span>}</p>
            </div> */}

          </div>
        </div>

        {/* Transcript */}
        <div className="card" style={{ borderTop: "4px solid #3B82F6", boxShadow: "var(--shadow-md)" }}>
          <div className="card-header" style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)" }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Conversation Transcript
            </h3>
          </div>
          <div className="card-body" style={{ padding: "0", minHeight: "auto" }}>
            <div style={{ padding: "24px", height: "500px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px", backgroundColor: "var(--bg-app)", borderBottomLeftRadius: "var(--radius-lg)", borderBottomRightRadius: "var(--radius-lg)" }}>
              {analysis?.summary ? (
                Array.isArray(analysis.summary) ? (
                  analysis.summary.map((msg: any, i: number) => {
                    const isAi = msg.role === 'assistant' || msg.role === 'ai';
                    return (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isAi ? "flex-start" : "flex-end" }}>
                        <div style={{
                          maxWidth: "85%",
                          padding: "14px 18px",
                          backgroundColor: isAi ? "var(--bg-surface)" : "var(--bg-primary)",
                          color: isAi ? "var(--text-primary)" : "white",
                          border: isAi ? "1px solid var(--border-color)" : "none",
                          borderRadius: "20px",
                          borderBottomLeftRadius: isAi ? "4px" : "20px",
                          borderBottomRightRadius: !isAi ? "4px" : "20px",
                          boxShadow: isAi ? "var(--shadow-sm)" : "0 4px 12px rgba(99, 102, 241, 0.3)",
                          animation: "fadeInUp 0.3s ease both",
                          animationDelay: `${i * 0.05}s`
                        }}>
                          <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px", color: isAi ? "var(--text-secondary)" : "rgba(255,255,255,0.7)" }}>
                            {isAi ? "AI Agent" : (user_info?.name || "Student")}
                          </div>
                          <div style={{ fontSize: "15px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : typeof analysis.transcript === 'string' ? (
                  analysis.transcript.split('\n\n').map((line: string, i: number) => {
                    const isAi = line.startsWith('AI:');
                    return (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isAi ? "flex-start" : "flex-end" }}>
                        <div style={{
                          maxWidth: "85%",
                          padding: "14px 18px",
                          backgroundColor: isAi ? "var(--bg-surface)" : "var(--bg-primary)",
                          color: isAi ? "var(--text-primary)" : "white",
                          border: isAi ? "1px solid var(--border-color)" : "none",
                          borderRadius: "20px",
                          borderBottomLeftRadius: isAi ? "4px" : "20px",
                          borderBottomRightRadius: !isAi ? "4px" : "20px",
                          boxShadow: isAi ? "var(--shadow-sm)" : "0 4px 12px rgba(99, 102, 241, 0.3)",
                          animation: "fadeInUp 0.3s ease both",
                          animationDelay: `${i * 0.05}s`
                        }}>
                          <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px", color: isAi ? "var(--text-secondary)" : "rgba(255,255,255,0.7)" }}>
                            {isAi ? "AI Agent" : (user_info?.name || "Student")}
                          </div>
                          <div style={{ fontSize: "15px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                            {line.replace(/^(AI|[^:]+): /, '')}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: "center", color: "var(--text-tertiary)" }}>
                    Unsupported transcript format
                  </div>
                )
              ) : (
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", justifyContent: "center", height: "100%", color: "var(--text-tertiary)" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="9" y1="10" x2="15" y2="10" /><line x1="12" y1="7" x2="12" y2="13" /></svg>
                  <span style={{ fontSize: "15px", fontWeight: 500 }}>Awaiting conversation data...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
