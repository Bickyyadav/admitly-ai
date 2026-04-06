import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Topbar() {
  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button className="mobile-toggle" style={{ 
          background: "var(--bg-surface)", 
          border: "1px solid var(--border-color)", 
          borderRadius: "8px",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>University Portal</h1>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: "500" }}>System Administrator Control</p>
        </div>
      </div>
      
      <div className="topbar-actions" style={{ gap: "20px" }}>
        <ThemeToggle />
        <button className="icon-button" style={{ 
          position: "relative",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          width: "40px",
          height: "40px"
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <div style={{ position: "absolute", top: "8px", right: "8px", width: "8px", height: "8px", background: "#EF4444", borderRadius: "50%", border: "2px solid var(--bg-surface)" }}></div>
        </button>
        
        <div className="user-profile" style={{ 
          padding: "4px 4px 4px 16px", 
          border: "1px solid var(--border-color)",
          background: "var(--bg-surface)",
          borderRadius: "14px"
        }}>
          <div className="user-info" style={{ marginRight: "12px" }}>
            <span className="user-name">Admin User</span>
            <span className="user-role">System Admin</span>
          </div>
          <div className="avatar" style={{ 
            width: "36px", 
            height: "36px", 
            borderRadius: "10px",
            background: "var(--primary-gradient)",
            color: "white",
            fontSize: "13px",
            boxShadow: "0 4px 10px rgba(99, 102, 241, 0.2)"
          }}>AD</div>
        </div>
      </div>
    </header>
  );
}
