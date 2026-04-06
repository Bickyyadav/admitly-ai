"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";

interface CallData {
  user_id: string;
  student_name: string;
  phone_number: string;
  status: string;
  duration: string;
  retries: number;
  scheduled_time: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 12;

export default function CallsPage() {
  const [calls, setCalls] = useState<CallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCalls = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
        const url = baseUrl.endsWith('/') ? `${baseUrl}users` : `${baseUrl}/users`;
        
        const response = await fetch(url);
        
        if (response.ok) {
          const result = await response.json();
          if (result && result.users) {
            setCalls(result.users);
          } else if (Array.isArray(result)) {
            setCalls(result);
          } else {
             setCalls([]);
          }
        } else {
          setError(`Server error: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        setError("Cannot connect to backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  // Derive filtered records
  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      const matchStatus = statusFilter === "all" || (call.status || "").toLowerCase() === statusFilter.toLowerCase();
      const matchSearch = call.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) || call.phone_number?.includes(searchQuery);
      return matchStatus && matchSearch;
    });
  }, [calls, statusFilter, searchQuery]);

  // Derive paginated records
  const totalPages = Math.ceil(filteredCalls.length / ITEMS_PER_PAGE);
  const paginatedCalls = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCalls.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCalls, currentPage]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const getBadgeClass = (status: string) => {
    const normalizedStatus = (status || "").toLowerCase();
    if (normalizedStatus.includes("completed")) return "badge-green";
    if (normalizedStatus.includes("failed")) return "badge-red";
    if (normalizedStatus.includes("scheduled") || normalizedStatus.includes("queued")) return "badge-purple";
    if (normalizedStatus.includes("no-answer")) return "badge-yellow";
    return "";
  };

  const formatBadgeText = (text: string) => {
    if (!text) return "";
    return text.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="content-area">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Operations Center</h2>
          <p>Live monitoring of active and historical outbound calls from the AI engine.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
           <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
             View Live Queue
           </button>
           <button className="upload-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
             Trigger New Campaign
           </button>
        </div>
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
          gap: '8px',
          marginBottom: '24px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
          <div className="loading-spinner" style={{ marginRight: '12px' }}></div>
          <div style={{ color: 'var(--text-secondary)' }}>Loading call records...</div>
        </div>
      ) : (
        <div className="card full-width">
          <div className="filters-bar">
            <div className="filter-group" style={{ flex: 2 }}>
              <label>Search Call Records</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search by student name or phone..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  style={{ paddingLeft: "36px" }}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Filter by Call Status</label>
              <select className="form-input" value={statusFilter} onChange={handleStatusChange}>
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="no-answer">No Answer</option>
                <option value="failed">Failed</option>
                <option value="queued">Queued</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          <div className="card-table-wrapper" style={{ overflowX: 'auto', padding: '0 24px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Phone Number</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Retries</th>
                  <th>Scheduled Time</th>
                  <th>Created At</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCalls.length > 0 ? (
                  paginatedCalls.map(call => (
                    <tr key={call.user_id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{call.student_name || "-"}</td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{call.phone_number || "-"}</td>
                      <td>
                         <span className={`badge ${getBadgeClass(call.status)}`}>
                           {formatBadgeText(call.status)}
                         </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{call.duration || "-"}</td>
                      <td style={{ color: 'var(--text-secondary)', textAlign: "center" }}>
                        {call.retries > 0 ? (
                           <span style={{ 
                             background: 'var(--bg-surface-hover)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' 
                           }}>
                             {call.retries}
                           </span>
                        ) : '-'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{formatDate(call.scheduled_time)}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{formatDate(call.created_at)}</td>
                      <td style={{ textAlign: "right" }}>
                        <Link href={`/calls/${call.user_id}`} className="action-link">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "48px 0", color: "var(--text-secondary)" }}>
                      No call records found matching your specific filtering criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 0 && (
            <div className="pagination">
              <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredCalls.length)}</strong> of <strong>{filteredCalls.length}</strong> calls
              </div>
              
              <div className="pagination-controls">
                <button 
                  className="page-button" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                     pageNum = currentPage - 2 + i;
                     if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                  }
                  
                  return (
                    <button 
                      key={pageNum} 
                      className={`page-button ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button 
                  className="page-button" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

