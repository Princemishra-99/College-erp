import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, Download, CheckCircle, FileText, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export const StudentMarks = () => {
  const [marks, setMarks] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        const meRes = await api.get('/auth/me');
        const st = meRes.data.user.profile;
        setStudentInfo(st);

        if (st?._id) {
          const res = await api.get(`/marks/student/${st._id}`);
          if (res.data.success) {
            setMarks(res.data.data);
          }
        }
      } catch (err) {
        toast.error('Failed to load marksheet');
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  const downloadPDFMarksheet = () => {
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(30, 27, 75);
      doc.rect(0, 0, 210, 36, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('COLLEGE OF ENGINEERING & TECHNOLOGY', 105, 16, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL ACADEMIC GRADE TRANSCRIPT / MARKSHEET', 105, 24, { align: 'center' });
      doc.text('Accredited Autonomous Institution • ERP Academic Cell', 105, 30, { align: 'center' });

      // Student Meta Table
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Candidate Credentials:', 14, 46);

      const roll = studentInfo?.enrollmentNo || '23CSE001';
      const dept = studentInfo?.department || 'Computer Science & Engg';
      const sem = studentInfo?.semester || 4;

      autoTable(doc, {
        startY: 50,
        theme: 'plain',
        body: [
          ['Roll / Enrollment No:', roll, 'Academic Term:', `Semester ${sem} (2025-26)`],
          ['Department / Branch:', dept, 'Issued Date:', new Date().toLocaleDateString()],
        ],
        styles: { fontSize: 9, cellPadding: 2 },
      });

      // Marks Table
      const tableRows = marks.map((m) => [
        m.subjectId?.subjectCode || 'CS401',
        m.subjectId?.subjectName || 'Course',
        m.subjectId?.credits || 4,
        m.examType,
        `${m.marksObtained} / ${m.maxMarks}`,
        m.grade,
        m.grade !== 'F' ? 'PASS' : 'FAIL',
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [['Subject Code', 'Subject Title', 'Credits', 'Exam Type', 'Score', 'Grade', 'Result']],
        body: tableRows,
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      // Footer Signatures
      const finalY = doc.lastAutoTable.finalY + 30;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Prepared by: ERP System', 20, finalY);
      doc.text('Controller of Examinations', 140, finalY);

      doc.save(`Marksheet_${roll}.pdf`);
      toast.success('Official Marksheet PDF downloaded!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF marksheet');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Academic Performance & Marksheet
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Semester evaluation transcripts, continuous assessments, and official transcript download.
          </p>
        </div>

        <button onClick={downloadPDFMarksheet} className="btn btn-primary" style={{ gap: '8px' }}>
          <Download size={18} />
          <span>Download Marksheet (PDF)</span>
        </button>
      </div>

      {/* Grade Sheet Table */}
      <div className="table-container glass-card" style={{ marginBottom: '24px' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credits</th>
              <th>Evaluation Category</th>
              <th>Marks Scored</th>
              <th>Letter Grade</th>
              <th style={{ textAlign: 'right' }}>Result Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Loading academic marks...
                </td>
              </tr>
            ) : marks.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No examination marks published yet for this semester.
                </td>
              </tr>
            ) : (
              marks.map((m) => (
                <tr key={m._id}>
                  <td>
                    <span style={{ fontWeight: 800, color: '#4f46e5' }}>
                      {m.subjectId?.subjectCode}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{m.subjectId?.subjectName}</td>
                  <td>{m.subjectId?.credits || 4}</td>
                  <td>{m.examType}</td>
                  <td style={{ fontWeight: 700 }}>
                    {m.marksObtained} <span style={{ color: '#94a3b8', fontWeight: 400 }}>/ {m.maxMarks}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${m.grade !== 'F' ? 'badge-success' : 'badge-danger'}`}
                      style={{ fontSize: '0.82rem', padding: '3px 12px' }}
                    >
                      {m.grade}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ color: m.grade !== 'F' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                      {m.grade !== 'F' ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
