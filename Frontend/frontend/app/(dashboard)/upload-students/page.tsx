"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Download, 
  ArrowRight,
  Loader2,
  Trash2,
  FileText
} from "lucide-react";

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

const StepTracker = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: "Upload File" },
    { id: 2, label: "Preview Data" },
    { id: 3, label: "Import Success" }
  ];

  return (
    <div className="steps-container">
      {steps.map((step) => (
        <div 
          key={step.id} 
          className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
        >
          <div className="step-circle">
            {currentStep > step.id ? <CheckCircle2 size={20} /> : step.id}
          </div>
          <span className="step-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
};

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

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      REQUIRED_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: "" }), {})
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Student_Upload_Template.xlsx");
  };

  const currentStep = uploadSuccess ? 3 : (file ? 2 : 1);

  return (
    <main className="content-area">
      <div className="page-header" style={{ marginBottom: '48px' }}>
        <h2 className="page-title text-gradient">Import Students</h2>
        <p>Manage your university enrollment by uploading batch student data securely.</p>
      </div>

      <StepTracker currentStep={currentStep} />

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className={`upload-dropzone glass-card ${isDragging ? 'drag-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
              style={{ minHeight: '300px', padding: '64px' }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                style={{ display: 'none' }}
              />
              <div className="upload-icon" style={{ width: '64px', height: '64px', marginBottom: '16px' }}>
                <Upload size={32} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="upload-title" style={{ fontSize: '20px', marginBottom: '8px' }}>
                  Click to upload or drag and drop
                </div>
                <div className="upload-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Support for Microsoft Excel (.xlsx) and CSV files (max. 10MB)
                </div>
                
                <button 
                  className="secondary-button" 
                  onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={18} />
                  Download CSV Template
                </button>
              </div>
            </div>

            <div className="animate-fade-in-up delay-200" style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ color: 'var(--bg-primary)' }}><FileSpreadsheet size={24} /></div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Required Format</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Use our template to ensure your headers match the required fields for seamless processing.</p>
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ color: '#10B981' }}><CheckCircle2 size={24} /></div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Instant Validation</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Our system automatically detects and validates student details before importing them into your database.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && file && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="upload-icon" style={{ borderRadius: '12px' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>{file.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{(file.size / 1024).toFixed(2)} KB • Ready to import</div>
                </div>
              </div>
              <button className="icon-button" onClick={removeFile} style={{ color: '#EF4444' }}>
                <Trash2 size={20} />
              </button>
            </div>

            <div className="preview-table-container">
              <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <h3 className="card-title">Data Preview (First 5 Rows)</h3>
                <span className="badge badge-purple">Schema Map Active</span>
              </div>
              <div className="card-table-wrapper" style={{ overflowX: 'auto' }}>
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
                            const matchKey = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === col.toLowerCase().replace(/[^a-z0-9]/g, ''));
                            const value = matchKey ? row[matchKey] : null;
                            return (
                              <td key={col}>
                                {value ? value : <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Missing</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <p>No data found in the selected file.</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
              <button className="secondary-button" onClick={removeFile} disabled={isUploading}>
                Discard File
              </button>
              <button 
                className="upload-button" 
                onClick={uploadData} 
                disabled={isUploading || previewData.length === 0}
                style={{ minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight size={18} />
                    Confirm & Upload
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', marginTop: '40px', padding: '48px' }}
            className="glass-card"
          >
            <div className="success-animation" style={{ position: 'relative' }}>
               <div style={{ 
                 width: '100px', 
                 height: '100px', 
                 borderRadius: '50%', 
                 background: 'rgba(16, 185, 129, 0.1)', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 color: '#10B981'
               }}>
                 <CheckCircle2 size={64} />
               </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '12px' }}>Batch Upload Completed!</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', fontSize: '16px' }}>
                Your student records have been successfully mapped, validated, and imported into the system. You can now view them in the students directory.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="secondary-button" onClick={() => window.location.href = '/students'}>
                View Students
              </button>
              <button className="upload-button" onClick={removeFile}>
                Upload Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
