import React from "react";

interface Call {
  id: number;
  name: string;
  phone: string;
  status: string;
  duration: string;
  date: string;
}

interface RecentCallsProps {
  calls?: Call[];
}

export default function RecentCalls({ calls: propCalls }: RecentCallsProps) {
  const callsArray = propCalls || [];

  const getBadgeClass = (status: string) => {
    switch(status) {
      case "completed": return "badge-green";
      case "missed":
      case "failed": return "badge-red";
      case "in-progress": return "badge-blue";
      default: return "";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="card full-width">
      <div className="card-header">
        <h3 className="card-title">Recent Calls</h3>
      </div>
      <div className="card-table-wrapper" style={{ overflowX: 'auto', padding: '0 24px 24px 24px' }}>
        {callsArray.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {callsArray.map((call) => (
                <tr key={call.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{call.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{call.phone}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(call.status)}`}>
                      {formatStatus(call.status)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{call.duration}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{call.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
            No recent calls found.
          </div>
        )}
      </div>
    </div>
  );
}
