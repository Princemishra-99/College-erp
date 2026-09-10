import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Award, Save, CheckCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const UploadMarks = () => {
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || '';

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubject);
  const [examType, setExamType] = useState('MidSem1');
  const [maxMarks, setMaxMarks] = useState(100);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({}); // { studentId: number }
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/academics/subjects');
        if (res.data.success) {
          setSubjects(res.data.data);
          if (!selectedSubjectId && res.data.data.length > 0) {
            setSelectedSubjectId(res.data.data[0]._id);
          }
        }
      } catch (err) {
        toast.error('Failed to load subjects');
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) return;

    const currentSub = subjects.find((s) => s._id === selectedSubjectId);
    if (!currentSub) return;

    const fetchClassStudents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/students', {
          params: { department: currentSub.department, semester: currentSub.semester },
        });

        if (res.data.success) {
          setStudents(res.data.data);
          const initialMarks = {};
          res.data.data.forEach((s) => {
            initialMarks[s._id] = 75;
          });
          setMarksData(initialMarks);
        }
      } catch (err) {
        toast.error('Failed to fetch class roster');
      } finally {
        setLoading(false);
      }
    };

    fetchClassStudents();
  }, [selectedSubjectId, subjects]);

  const handleMarkChange = (studentId, val) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: Number(val),
    }));
  };

  const getGrade = (score, max) => {
    if (!max || max <= 0) return '—';
    const pct = (score / max) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'P';
    return 'F';
  };

  const handleSubmit = async () => {
    if (!selectedSubjectId || !examType) {
      toast.error('Please specify subject and exam category');
      return;
    }

    setSubmitting(true);
    try {
      const payload = Object.entries(marksData).map(([studentId, marksObtained]) => ({
        studentId,
        marksObtained,
      }));

      const res = await api.post('/marks/batch', {
        subjectId: selectedSubjectId,
        examType,
        maxMarks: Number(maxMarks),
        marksData: payload,
      });

      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit marks');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Examination & Grade Entry
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
          Enter Mid-Term or End-Semester examination scores. Letter grades are calculated dynamically.
        </p>
      </div>

      {/* Exam Configuration Bar */}
      <div
        className="glass-card"
        style={{
          padding: '20px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div>
          <label className="form-label">Subject / Course *</label>
          <select
            className="form-select"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.subjectCode} - {s.subjectName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Evaluation Category *</label>
          <select className="form-select" value={examType} onChange={(e) => setExamType(e.target.value)}>
            <option value="MidSem1">Mid-Semester Exam 1</option>
            <option value="MidSem2">Mid-Semester Exam 2</option>
            <option value="EndSem">End-Semester University Exam</option>
            <option value="Internal Assessment">Internal Assessment / Quiz</option>
          </select>
        </div>

        <div>
          <label className="form-label">Maximum Marks *</label>
          <input
            type="number"
            className="form-input"
            min="10"
            max="100"
            value={maxMarks}
            onChange={(e) => setMaxMarks(e.target.value)}
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="table-container glass-card" style={{ marginBottom: '24px' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Max Score</th>
              <th style={{ width: '180px' }}>Marks Scored</th>
              <th style={{ textAlign: 'center' }}>Calculated Grade</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Loading student roster...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No students found in this course.
                </td>
              </tr>
            ) : (
              students.map((st) => {
                const score = marksData[st._id] !== undefined ? marksData[st._id] : 0;
                const grade = getGrade(score, maxMarks);
                const isPassing = grade !== 'F';

                return (
                  <tr key={st._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#4f46e5' }}>{st.enrollmentNo}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{st.userId?.name}</td>
                    <td>/ {maxMarks}</td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        max={maxMarks}
                        value={score}
                        onChange={(e) => handleMarkChange(st._id, e.target.value)}
                        style={{ width: '120px', padding: '6px 12px' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className={`badge ${isPassing ? 'badge-success' : 'badge-danger'}`}
                        style={{ fontSize: '0.85rem', padding: '4px 14px' }}
                      >
                        {grade}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Submit */}
      {students.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {submitting ? 'Submitting Marks...' : 'Publish Examination Marks'}
          </button>
        </div>
      )}
    </div>
  );
};
