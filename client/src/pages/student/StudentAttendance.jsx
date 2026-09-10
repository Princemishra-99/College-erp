import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CalendarCheck, AlertTriangle, CheckCircle2, Info, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentAttendance = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const meRes = await api.get('/auth/me');
        const st = meRes.data.user.profile;
        if (st?._id) {
          const res = await api.get(`/attendance/student/${st._id}`);
          if (res.data.success) {
            setAttendanceData(res.data.data);
          }
        }
      } catch (err) {
        toast.error('Failed to load attendance report');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const overall = attendanceData?.overallStats;
  const isDefaulter = overall?.isDefaulter;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Attendance Tracking & Analytics
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
          Detailed course-wise attendance breakdown and 75% university eligibility monitor.
        </p>
      </div>

      {/* Overview Stat Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px 30px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              border: `5px solid ${isDefaulter ? '#ef4444' : '#10b981'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: isDefaulter ? '#dc2626' : '#16a34a',
              background: isDefaulter ? '#fef2f2' : '#f0fdf4',
            }}
          >
            {overall?.percentage || 0}%
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Cumulative Academic Attendance
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
              {overall?.attendedClasses || 0} Attended / {overall?.totalClasses || 0} Delivered
            </h3>
            <span className={`badge ${isDefaulter ? 'badge-danger' : 'badge-success'}`}>
              {isDefaulter ? 'Defaulter Warning: Below 75%' : 'Safe Zone: Above 75%'}
            </span>
          </div>
        </div>

        {/* Info Explainer */}
        <div
          style={{
            maxWidth: '420px',
            padding: '14px 18px',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border)',
            fontSize: '0.8rem',
            color: '#475569',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}
        >
          <Info size={18} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>University 75% Attendance Rule:</strong> Students having less than 75% aggregate attendance in any theory/lab course are withheld from appearing in final semester examinations.
          </div>
        </div>
      </div>

      {/* Subject-Wise Breakdown Cards */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
        Subject-Wise Breakdown
      </h2>

      <div className="grid-cols-2" style={{ gap: '20px' }}>
        {loading ? (
          <div style={{ color: '#64748b' }}>Loading courses...</div>
        ) : !attendanceData?.subjects || attendanceData.subjects.length === 0 ? (
          <div style={{ color: '#64748b' }}>No course attendance records recorded yet.</div>
        ) : (
          attendanceData.subjects.map((sub) => {
            const isSubDefaulter = sub.isDefaulter;
            return (
              <div key={sub.subjectId} className="glass-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4f46e5' }}>
                      {sub.subjectCode}
                    </span>
                    <h3 style={{ fontSize: '1.08rem', fontWeight: 700, margin: '2px 0 0 0' }}>
                      {sub.subjectName}
                    </h3>
                  </div>

                  <span className={`badge ${isSubDefaulter ? 'badge-danger' : 'badge-success'}`}>
                    {sub.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', margin: '14px 0 10px 0' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, sub.percentage)}%`,
                      backgroundColor: isSubDefaulter ? '#ef4444' : '#10b981',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                  <span>Lectures Attended: <strong>{sub.attendedClasses} / {sub.totalClasses}</strong></span>
                  <span style={{ color: isSubDefaulter ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                    {isSubDefaulter ? 'Shortage Alert' : 'Compliant'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
