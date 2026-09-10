import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Users, GraduationCap, BookOpen, CreditCard, ArrowUpRight, TrendingUp, AlertCircle, Plus, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/academics/dashboard-stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    // Fetch pending profile update requests
    api.get('/students/update-requests?status=Pending')
      .then(r => setPendingRequests(r.data.data || []))
      .catch(() => {});
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      val || 0
    );
  };

  if (loading) {
    return <div style={{ padding: '24px', color: '#64748b' }}>Loading dashboard analytics...</div>;
  }

  const chartData = (stats?.deptDistribution || []).map((item) => ({
    name: item._id?.replace('Computer Science & Engg', 'CSE').replace('Information Technology', 'IT') || 'General',
    students: item.count,
  }));

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Administrative Command Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
            Real-time institutional oversight, enrollment analytics, and financial ledger.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/students" className="btn btn-primary">
            <Plus size={16} />
            <span>New Admission</span>
          </Link>
          <Link to="/notices" className="btn btn-secondary">
            <span>Broadcast Notice</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Users size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Enrolled Students
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{stats?.totalStudents || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={13} />
              <span>Active Academic Year</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <GraduationCap size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Faculty Members
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{stats?.totalFaculty || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Professors & Lecturers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <BookOpen size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Active Courses/Subjects
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{stats?.totalSubjects || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Accredited Syllabus</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <CreditCard size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Fee Collection
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              {formatCurrency(stats?.fees?.totalCollected)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>
              Pending: {formatCurrency(stats?.fees?.totalDue)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Overview */}
      <div className="grid-cols-2" style={{ marginBottom: '28px' }}>
        {/* Department Distribution Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Enrollment by Department</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Student distribution across academic branches</p>
            </div>
            <span className="badge badge-info">Current Term</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Overview Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Tuition & Fee Revenue</h3>
              <Link to="/admin/fees" style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View Full Ledger</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Semester collection progress towards total expected tuition fees.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Collected So Far:</span>
                  <span style={{ fontWeight: 700, color: '#16a34a' }}>
                    {formatCurrency(stats?.fees?.totalCollected)}
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: '#10b981',
                      width: `${
                        stats?.fees?.totalExpected > 0
                          ? Math.min(100, ((stats?.fees?.totalCollected / stats?.fees?.totalExpected) * 100)).toFixed(0)
                          : 0
                      }%`,
                      borderRadius: '999px',
                    }}
                  />
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={22} color="#d97706" />
                <div style={{ fontSize: '0.82rem', color: '#92400e' }}>
                  <strong>Outstanding Dues:</strong> {formatCurrency(stats?.fees?.totalDue)} remains pending across enrolled students. Automated SMS alerts can be dispatched via notice board.
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ERP Database State:</span>
            <span className="badge badge-success">MongoDB Connected & Synced</span>
          </div>
        </div>
      </div>

      {/* Pending Profile Requests Section */}
      <div className="glass-card" style={{ padding: '28px', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={20} color="#d97706" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 2px 0' }}>Student Profile Update Requests</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Review and approve/reject student profile change requests.</p>
            </div>
            {pendingRequests.length > 0 && (
              <span style={{ padding: '3px 10px', borderRadius: '999px', background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>
                {pendingRequests.length} Pending
              </span>
            )}
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', color: '#94a3b8', fontSize: '0.88rem' }}>✅ No pending profile update requests at this time.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {pendingRequests.map((req) => {
              const student = req.studentId;
              const changes = Object.entries(req.requestedData).filter(([k, v]) => v && String(v) !== String(req.currentData[k]));
              return (
                <div key={req._id} style={{ padding: '18px', borderRadius: '14px', background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{student?.userId?.name || 'Student'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{student?.enrollmentNo} &bull; {student?.userId?.email}</div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}><strong>Reason:</strong> {req.reason}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={async () => {
                          setActionLoading(req._id + '-approve');
                          try {
                            const r = await api.put(`/students/update-requests/${req._id}`, { action: 'approve' });
                            if (r.data.success) {
                              toast.success('Request approved & profile updated!');
                              setPendingRequests(prev => prev.filter(x => x._id !== req._id));
                            }
                          } catch(e) { toast.error('Failed to approve request'); }
                          finally { setActionLoading(''); }
                        }}
                        disabled={actionLoading === req._id + '-approve'}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#059669', color: '#fff', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <CheckCircle size={13} /> {actionLoading === req._id + '-approve' ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={async () => {
                          const remarks = window.prompt('Reason for rejection (optional):') || '';
                          setActionLoading(req._id + '-reject');
                          try {
                            const r = await api.put(`/students/update-requests/${req._id}`, { action: 'reject', reviewRemarks: remarks });
                            if (r.data.success) {
                              toast.success('Request rejected.');
                              setPendingRequests(prev => prev.filter(x => x._id !== req._id));
                            }
                          } catch(e) { toast.error('Failed to reject request'); }
                          finally { setActionLoading(''); }
                        }}
                        disabled={actionLoading === req._id + '-reject'}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#ef4444', color: '#fff', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <XCircle size={13} /> {actionLoading === req._id + '-reject' ? '...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                  {/* Diff: current vs requested */}
                  {changes.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {changes.map(([k, newVal]) => (
                        <div key={k} style={{ padding: '8px 12px', borderRadius: '8px', background: '#fff', border: '1px solid #e2e8f0', fontSize: '0.77rem' }}>
                          <div style={{ color: '#64748b', fontWeight: 600, textTransform: 'capitalize', marginBottom: '2px' }}>{k}</div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>{String(req.currentData[k] || '–').slice(0, 30)}</span>
                            <span style={{ color: '#94a3b8' }}>→</span>
                            <span style={{ color: '#059669', fontWeight: 700 }}>{String(newVal).slice(0, 30)}</span>
                          </div>
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
