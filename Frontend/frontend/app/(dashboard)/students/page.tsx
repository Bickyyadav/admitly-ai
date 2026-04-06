"use client";

import React, { useState, useMemo } from "react";

// Mock student data
const MOCK_STUDENTS = Array.from({ length: 45 }).map((_, i) => ({
  id: `STU-${1000 + i}`,
  name: [
    "John Smith", "Alice Williams", "Robert Taylor", "Mary Johnson", "James Brown",
    "Emma Davis", "Michael Miller", "Sarah Wilson", "David Moore", "Jessica Taylor"
  ][i % 10] + (i > 9 ? ` ${Math.floor(i / 10)}` : ""),
  phone: `+1 (555) ${100 + i % 900}-${Math.floor(1000 + Math.random() * 9000)}`,
  email: `student${i}@university.edu`,
  city: ["New York", "Chicago", "Los Angeles", "Houston", "Miami"][i % 5],
  course: ["Computer Science", "Business Admin", "Nursing", "Engineering", "Data Science"][i % 5],
  specialization: ["AI & ML", "Marketing", "Pediatrics", "Robotics", "Analytics"][i % 5],
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
}));

const ITEMS_PER_PAGE = 10;

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Compute unique cities and courses for filter dropdowns
  const availableCities = useMemo(() => Array.from(new Set(MOCK_STUDENTS.map(s => s.city))), []);
  const availableCourses = useMemo(() => Array.from(new Set(MOCK_STUDENTS.map(s => s.course))), []);

  // Filter logic
  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.phone.includes(searchQuery);
      
      const matchesCity = cityFilter === "" || student.city === cityFilter;
      const matchesCourse = courseFilter === "" || student.course === courseFilter;

      return matchesSearch && matchesCity && matchesCourse;
    });
  }, [searchQuery, cityFilter, courseFilter]);

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

  return (
    <main className="content-area">
      <div className="page-header">
        <h2 className="page-title">Students Directory</h2>
        <p>Manage and review the directory of all students stored in the CRM.</p>
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
                <th style={{ textAlign: "right" }}>Actions</th>
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
                    <td style={{ textAlign: "right" }}>
                      <button className="action-link" onClick={() => alert(`Viewing details for ${student.name}`)}>
                        View Details
                      </button>
                    </td>
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
