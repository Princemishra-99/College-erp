import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { CalendarCheck, CheckCircle2, XCircle, Save, Check, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const MarkAttendance = () => {
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || '';

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubject);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: 'Present' | 'Absent' }
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load faculty's subjects
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
        toast.error('Failed to load courses');
      }
    };
    fetchSubjects();
  }, []);

  // When subject changes, fetch enrolled students for that semester & branch
  useEffect(() => {
    if (!selectedSubjectId) return;

    const currentSub = subjects.find((s) => s._id === selectedSubjectId);
    if (!currentSub) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/students', {
          params: { department: currentSub.department, semester: currentSub.semester },
        });

        if (res.data.success) {
          setStudents(res.data.data);
          // Default all to 'Present'
          const initialMap = {};
          res.data.data.forEach((st) => {
            initialMap[st._id] = 'Present';
          });
          setAttendanceRecords(initialMap);
        }
      } catch (err) {
        toast.error('Failed to load student roster for this class');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSubjectId, subjects]);

  const toggleStatus = (studentId) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  const markAllPresent = () => {
    const updated = {};
    students.forEach((st) => {
      updated[st._id] = 'Present';
    });
    setAttendanceRecords(updated);
    toast.success('Marked all students as Present');
  };

  const markAllAbsent = () => {
    const updated = {};
    students.forEach((st) => {
      updated[st._id] = 'Absent';
    });
    setAttendanceRecords(updated);
    toast.success('Marked all students as Absent');
  };

  const handleSubmit = async () => {
    if (!selectedSubjectId || !date) {
      toast.error('Please select subject and date');
      return;
    }

    setSubmitting(true);
    try {
      const recordsArray = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const res = await api.post('/attendance/mark', {
        subjectId: selectedSubjectId,
        date,
        records: recordsArray,
      });

      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const currentSubjectObj = subjects.find((s) => s._id === selectedSubjectId);
  const presentCount = Object.values(attendanceRecords).filter((s) => s === 'Present').length;
  const absentCount = Object.values(attendanceRecords).filter((s) => s === 'Absent').length;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Class Attendance Marker
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
          Record daily lecture presence. Data immediately synchronizes with students' portal and 75% criteria calculation.
        </p>
      </div>

      {/* Selector Toolbar */}
      <div
        className="glass-card"
        style={{
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ minWidth: '280px' }}>
            <label className="form-label">Subject / Course *</label>
            <select
              className="form-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              style={{ height: '42px' }}
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectCode} - {s.subjectName} (Sem {s.semester})
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '180px' }}>
            <label className="form-label">Attendance Date *</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ height: '42px' }}
            />
          </div>
        </div>

        {/* Quick Bulk Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={markAllPresent} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>Mark All Present</span>
          </button>
          <button onClick={markAllAbsent} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
            <XCircle size={16} color="#dc2626" />
            <span>Mark All Absent</span>
          </button>
        </div>
      </div>

      {/* Class Statistics Badge Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '0 4px',
        }}
      >
        <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
          Roster for {currentSubjectObj?.department || 'Selected Course'} (Total: {students.length} Students)
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
          <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
            Present: {presentCount}
          </span>
          <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
            Absent: {absentCount}
          </span>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="table-container glass-card" style={{ marginBottom: '24px' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Section</th>
              <th style={{ textAlign: 'center' }}>Attendance Status</th>
              <th style={{ textAlign: 'right' }}>Quick Toggle</th>
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
                  No students found enrolled in this semester.
                </td>
              </tr>
            ) : (
              students.map((st) => {
                const status = attendanceRecords[st._id] || 'Present';
                const isPresent = status === 'Present';

                return (
                  <tr key={st._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#4f46e5' }}>{st.enrollmentNo}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{st.userId?.name}</td>
                    <td>Section {st.section}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${isPresent ? 'badge-success' : 'badge-danger'}`} style={{ padding: '4px 12px' }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => toggleStatus(st._id)}
                        className={`btn ${isPresent ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                      >
                        {isPresent ? 'Mark Absent' : 'Mark Present'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Save Button Bar */}
      {students.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {submitting ? (
              'Submitting Attendance...'
            ) : (
              <>
                <Save size={18} />
                <span>Save Class Attendance</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
