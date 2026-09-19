import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { BookOpen, CalendarCheck, Award, Users, ArrowRight, ClipboardList, CheckCircle, XCircle, Clock, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setFacultyProfile(res.data.user.profile);
        }
      } catch (err) {
        console.error('Error fetching faculty details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    api.get('/students/update-requests?status=Pending')
      .then(r => setPendingRequests(r.data.data || []))
      .catch(() => {});
  }, []);

  const assignedSubjects = facultyProfile?.assignedSubjects || [];

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          padding: '32px',
          borderRadius: '20px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)',
        }}
      >
        <div>
          <span className="badge badge-ai" style={{ marginBottom: '12px' }}>
            Faculty Teaching Workspace
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '6px 0' }}>
            Welcome, {user?.name}!
          </h1>
          <p style={{ color: '#c7d2fe', fontSize: '0.92rem', margin: 0 }}>
            {facultyProfile?.designation} • {facultyProfile?.department} (ID: {facultyProfile?.employeeId})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/faculty/attendance" className="btn btn-primary" style={{ background: '#4f46e5' }}>
            <CalendarCheck size={18} />
            <span>Mark Daily Attendance</span>
          </Link>
          <Link to="/faculty/marks" className="btn btn-secondary">
            <Award size={18} />
            <span>Upload Marks</span>
          </Link>
        </div>
      </div>

      {/* Assigned Subjects Heading */}
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
          My Assigned Subjects ({assignedSubjects.length})
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
          Courses currently allocated for lecture delivery, attendance tracking, and internal evaluation.
        </p>
      </div>

      {/* Assigned Subjects Grid */}
      <div className="grid-cols-2" style={{ gap: '20px' }}>
        {assignedSubjects.length === 0 ? (
          <div className="glass-card" style={{ padding: '24px', color: '#64748b' }}>
            No subjects currently assigned to your profile. Contact the Dean or Admin office to assign syllabus.
          </div>
        ) : (
          assignedSubjects.map((sub) => (
            <div key={sub._id} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span className="badge badge-info" style={{ marginBottom: '6px' }}>
                    Sem {sub.semester} • {sub.credits || 4} Credits
                  </span>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 700, margin: '4px 0', color: '#0f172a' }}>
                    {sub.subjectName}
                  </h3>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4f46e5' }}>
                    Course Code: {sub.subjectCode}
                  </div>
                </div>

                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#eef2ff',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={22} />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <Link
                  to={`/faculty/attendance?subject=${sub._id}`}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.82rem' }}
                >
                  <CalendarCheck size={15} color="#4f46e5" />
                  <span>Take Attendance</span>
                </Link>
                <Link
                  to={`/faculty/marks?subject=${sub._id}`}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.82rem' }}
                >
                  <Award size={15} color="#16a34a" />
                  <span>Grade Marks</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Faculty Today's Teaching Schedule */}
      <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#4f46e5" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              My Daily Teaching Schedule & Lectures
            </h2>
          </div>
          <span className="badge badge-success">Active Academic Term</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {assignedSubjects.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No classes scheduled.</div>
          ) : (
            assignedSubjects.map((sub, i) => (
              <div
                key={sub._id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {i === 0 ? '09:30 - 10:30 AM' : i === 1 ? '11:30 - 12:30 PM' : '02:00 - 03:30 PM'}
                    </span>
                    <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>Sem {sub.semester}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                    {sub.subjectName}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    Code: {sub.subjectCode} • Dept: {sub.department}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#475569' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="#94a3b8" /> Lecture Hall {300 + i * 2}
                  </span>
                  <Link
                    to={`/faculty/attendance?subject=${sub._id}`}
                    style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    Attendance →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Student Profile Requests */}
      <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <ClipboardList size={20} color="#d97706" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Student Profile Update Requests</h2>
          {pendingRequests.length > 0 && (
            <span style={{ padding: '2px 10px', borderRadius: '999px', background: '#ef4444', color: '#fff', fontSize: '0.72rem', fontWeight: 800 }}>
              {pendingRequests.length} Pending
            </span>
          )}
        </div>
        {pendingRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.85rem' }}>✅ No pending profile requests.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingRequests.map((req) => {
              const student = req.studentId;
              const changes = Object.entries(req.requestedData).filter(([k, v]) => v && String(v) !== String(req.currentData[k]));
              return (
                <div key={req._id} style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{student?.userId?.name}</div>
                      <div style={{ fontSize: '0.73rem', color: '#64748b' }}>{student?.enrollmentNo} &bull; {req.reason}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={async () => {
                          setActionLoading(req._id + '-approve');
                          try {
                            const r = await api.put(`/students/update-requests/${req._id}`, { action: 'approve' });
                            if (r.data.success) { toast.success('Approved!'); setPendingRequests(prev => prev.filter(x => x._id !== req._id)); }
                          } catch { toast.error('Failed'); } finally { setActionLoading(''); }
                        }}
                        disabled={actionLoading === req._id + '-approve'}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#059669', color: '#fff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <CheckCircle size={12} />{actionLoading === req._id + '-approve' ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={async () => {
                          const remarks = window.prompt('Rejection reason (optional):') || '';
                          setActionLoading(req._id + '-reject');
                          try {
                            const r = await api.put(`/students/update-requests/${req._id}`, { action: 'reject', reviewRemarks: remarks });
                            if (r.data.success) { toast.success('Rejected.'); setPendingRequests(prev => prev.filter(x => x._id !== req._id)); }
                          } catch { toast.error('Failed'); } finally { setActionLoading(''); }
                        }}
                        disabled={actionLoading === req._id + '-reject'}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <XCircle size={12} />{actionLoading === req._id + '-reject' ? '...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                  {changes.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '6px' }}>
                      {changes.map(([k, newVal]) => (
                        <div key={k} style={{ padding: '6px 10px', borderRadius: '8px', background: '#fff', border: '1px solid #e2e8f0', fontSize: '0.74rem' }}>
                          <div style={{ color: '#64748b', textTransform: 'capitalize', marginBottom: '2px' }}>{k}</div>
                          <span style={{ color: '#ef4444', textDecoration: 'line-through', marginRight: '4px' }}>{String(req.currentData[k] || '–').slice(0,25)}</span>
                          <span style={{ color: '#94a3b8' }}>→ </span>
                          <span style={{ color: '#059669', fontWeight: 700 }}>{String(newVal).slice(0,25)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
