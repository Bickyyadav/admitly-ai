"use client";

import React, { useState, useMemo, useEffect } from "react";

const ITEMS_PER_PAGE = 10;

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
        const url = baseUrl.endsWith('/') ? `${baseUrl}users/details` : `${baseUrl}/users/details`;

        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          const mapped = (data.users || []).map((u: any, i: number) => ({
            id: `STU-${1000 + i}`,
            name: u["Name"] || "Unknown",
            phone: u["Phone Number"] || "",
            email: u["Email"] || "",
            city: u["City"] || "Unknown",
            course: u["Selected Course"] || "Unknown",
            specialization: u["Specialization"] || "Unknown",
            createdAt: u["Created At"] ? new Date(u["Created At"]).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }) : "--"
          }));
          setStudents(mapped);
        } else {
          setError(`Server error: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        setError("Cannot connect to backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Compute unique cities and courses for filter dropdowns
  const availableCities = useMemo(() => Array.from(new Set(students.map(s => s.city))), [students]);
  const availableCourses = useMemo(() => Array.from(new Set(students.map(s => s.course))), [students]);

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.phone.includes(searchQuery);

      const matchesCity = cityFilter === "" || student.city === cityFilter;
      const matchesCourse = courseFilter === "" || student.course === courseFilter;

      return matchesSearch && matchesCity && matchesCourse;
    });
  }, [students, searchQuery, cityFilter, courseFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset page on filter change
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCityFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCourseFilter(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <main className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ marginBottom: '16px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading students directory...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="content-area">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Students Directory</h2>
          <p>Manage and review the directory of all students stored in the CRM.</p>
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

      <div className="card full-width">
        <div className="filters-bar">
          <div className="filter-group" style={{ flex: 2 }}>
            <label>Search Students</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="Search by name or phone number..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ paddingLeft: "36px" }}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Filter by City</label>
            <select className="form-input" value={cityFilter} onChange={handleCityChange}>
              <option value="">All Cities</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Course</label>
            <select className="form-input" value={courseFilter} onChange={handleCourseChange}>
              <option value="">All Courses</option>
              {availableCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-table-wrapper" style={{ overflowX: 'auto', padding: '0 24px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>City</th>
                <th>Selected Course</th>
                <th>Specialization</th>
                <th>Created At</th>
                {/* <th style={{ textAlign: "right" }}>Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map(student => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{student.phone}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{student.email}</td>
                    <td>{student.city}</td>
                    <td><span className="badge badge-blue">{student.course}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{student.specialization}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{student.createdAt}</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "48px 0", color: "var(--text-secondary)" }}>
                    No students found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="pagination">
            <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)}</strong> of <strong>{filteredStudents.length}</strong> students
            </div>

            <div className="pagination-controls">
              <button
                className="page-button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`page-button ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

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
    </main>
  );
}
