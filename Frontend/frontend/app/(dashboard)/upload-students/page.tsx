"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";

const REQUIRED_COLUMNS = [
  "Name",
  "Email",
  "Phone Number",
  "State",
  "City",
  "Program",
  "Course",
  "Specialization"
];

export default function UploadStudentsPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = (selectedFile: File) => {
    setUploadSuccess(false);
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (fileExt !== 'xlsx' && fileExt !== 'csv') {
      alert("Please upload only .xlsx or .csv files.");
      return;
    }
    
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      try {
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        setPreviewData(json.slice(0, 5)); // Preview top 5 rows
      } catch (error) {
        console.error("Error parsing file", error);
        alert("Error parsing the file. Please ensure it is a valid Excel or CSV file.");
        removeFile();
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreviewData([]);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadData = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Handle the base URL and endpoint construction safely
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
      const url = baseUrl.endsWith('/') ? `${baseUrl}upload` : `${baseUrl}/upload`;

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Upload failed: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred while uploading. Please check if the backend is running at http://localhost:8000/");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="content-area">
      <div className="page-header">
        <h2 className="page-title">Upload Students</h2>
        <p>Import new student records by uploading an Excel (.xlsx) or CSV file.</p>
      </div>
      
      {!file && !uploadSuccess && (
        <div 
          className={`upload-dropzone ${isDragging ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            style={{ display: 'none' }}
          />
          <div className="upload-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          <div>
            <div className="upload-title">Click to upload or drag and drop</div>
            <div className="upload-subtitle">XLSX or CSV (max. 10MB)</div>
          </div>
        </div>
      )}

      {file && !uploadSuccess && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="upload-icon" style={{ width: '40px', height: '40px', padding: '10px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{(file.size / 1024).toFixed(2)} KB</div>
              </div>
            </div>
            <button className="icon-button" onClick={removeFile}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="card full-width">
            <div className="card-header">
              <h3 className="card-title">Data Preview (First 5 Rows)</h3>
            </div>
            <div className="card-table-wrapper" style={{ overflowX: 'auto', padding: '0 24px 24px 24px' }}>
              {previewData.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      {REQUIRED_COLUMNS.map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i}>
                        {REQUIRED_COLUMNS.map(col => {
                          // Try to find matching column ignoring case/spaces gracefully
                          const matchKey = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === col.toLowerCase().replace(/[^a-z0-9]/g, ''));
                          return (
                            <td key={col}>{matchKey ? row[matchKey] : <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Empty</span>}</td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No data found in the selected file.</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button className="secondary-button" onClick={removeFile} disabled={isUploading}>
              Cancel
            </button>
            <button className="upload-button" onClick={uploadData} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Data"}
            </button>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', marginTop: '48px' }}>
           <div className="upload-icon" style={{ width: '64px', height: '64px', padding: '16px', background: 'var(--badge-green-bg)', color: 'var(--badge-green-text)' }}>
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
           </div>
           <div style={{ textAlign: 'center' }}>
             <h2 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '8px' }}>Upload Successful!</h2>
             <p style={{ color: 'var(--text-secondary)' }}>The student records have been mapped and imported into the system securely.</p>
           </div>
           
           <button className="upload-button" onClick={removeFile} style={{ marginTop: '16px' }}>
             Upload Another File
           </button>
        </div>
      )}

    </main>
  );
}
