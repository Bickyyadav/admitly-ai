"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path> },
    { name: "Upload Students", href: "/upload-students", icon: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></> },
    { name: "Students List", href: "/students", icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></> },
    { name: "Call History", href: "/calls", icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path> },
    { name: "Advanced Analytics", href: "/analytics", icon: <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo" style={{ gap: "15px" }}>
          <div className="logo-icon">TTA</div>
          <span style={{ fontSize: "15px", letterSpacing: "-0.5px" }}>Talk To Admission</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`nav-item ${isActive ? "active" : ""}`}
              style={{ position: 'relative' }}
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {item.icon}
              </svg>
              {item.name}
              {isActive && (
                <div style={{ 
                  position: 'absolute', 
                  left: '-16px', 
                  width: '4px', 
                  height: '20px', 
                  backgroundColor: 'white', 
                  borderRadius: '0 4px 4px 0' 
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "24px", marginTop: "auto", borderTop: "1px solid var(--border-color)" }}>
        <div className="card" style={{ padding: "16px", background: "rgba(99, 102, 241, 0.1)", border: "none", boxShadow: "none" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>Cloud Usage</p>
          <div style={{ height: "4px", background: "var(--border-color)", borderRadius: "2px", overflow: "hidden" }}>
             <div style={{ width: "65%", height: "100%", background: "var(--bg-primary)" }}></div>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "8px" }}>6.5k / 10k minutes used</p>
        </div>
      </div>
    </aside>
  );
}
