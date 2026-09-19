import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { CalendarCheck, Award, CreditCard, AlertTriangle, CheckCircle2, Sparkles, ArrowRight, Bell, Clock, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const WEEKDAY_SCHEDULE = {
  Monday: [
    { time: '09:30 - 10:30 AM', code: 'CS401', subject: 'Data Structures & Algorithms', room: 'Room 302', faculty: 'Dr. Rahul Sharma', type: 'Lecture' },
    { time: '10:30 - 11:30 AM', code: 'CS402', subject: 'Database Management Systems', room: 'Room 204', faculty: 'Prof. Ananya Verma', type: 'Lecture' },
    { time: '11:30 - 12:30 PM', code: 'CS403', subject: 'Operating Systems', room: 'Room 108', faculty: 'Dr. K. P. Singh', type: 'Lecture' },
    { time: '12:30 - 01:30 PM', code: 'BREAK', subject: '🥪 Lunch Break & Campus Commons', room: 'Cafeteria', faculty: 'Campus', type: 'Break' },
    { time: '01:30 - 03:30 PM', code: 'CS404L', subject: 'Computer Networks Lab', room: 'Software Lab 3', faculty: 'Prof. S. Gupta', type: 'Practical' },
  ],
  Tuesday: [
    { time: '09:30 - 10:30 AM', code: 'CS403', subject: 'Operating Systems', room: 'Room 108', faculty: 'Dr. K. P. Singh', type: 'Lecture' },
    { time: '10:30 - 11:30 AM', code: 'CS401', subject: 'Data Structures & Algorithms', room: 'Room 302', faculty: 'Dr. Rahul Sharma', type: 'Lecture' },
    { time: '11:30 - 12:30 PM', code: 'CS405', subject: 'Discrete Mathematics', room: 'Room 201', faculty: 'Prof. R. C. Mathur', type: 'Lecture' },
    { time: '12:30 - 01:30 PM', code: 'BREAK', subject: '🥪 Lunch Break', room: 'Cafeteria', faculty: 'Campus', type: 'Break' },
    { time: '01:30 - 03:30 PM', code: 'CS402L', subject: 'DBMS MySQL Lab', room: 'Database Lab 2', faculty: 'Prof. Ananya Verma', type: 'Practical' },
  ],
  Wednesday: [
    { time: '09:30 - 10:30 AM', code: 'CS402', subject: 'Database Management Systems', room: 'Room 204', faculty: 'Prof. Ananya Verma', type: 'Lecture' },
    { time: '10:30 - 11:30 AM', code: 'CS404', subject: 'Computer Networks', room: 'Room 305', faculty: 'Prof. S. Gupta', type: 'Lecture' },
    { time: '11:30 - 12:30 PM', code: 'AI401', subject: 'Sarvam Indic AI & NLP Seminar', room: 'Auditorium B', faculty: 'Dr. Rahul Sharma', type: 'Seminar' },
    { time: '12:30 - 01:30 PM', code: 'BREAK', subject: '🥪 Lunch Break', room: 'Cafeteria', faculty: 'Campus', type: 'Break' },
    { time: '01:30 - 03:30 PM', code: 'CS406', subject: 'Web Technologies (MERN Stack)', room: 'Innovation Lab', faculty: 'Dr. P. Mishra', type: 'Practical' },
  ],
  Thursday: [
    { time: '09:30 - 10:30 AM', code: 'CS404', subject: 'Computer Networks', room: 'Room 305', faculty: 'Prof. S. Gupta', type: 'Lecture' },
    { time: '10:30 - 11:30 AM', code: 'CS403', subject: 'Operating Systems', room: 'Room 108', faculty: 'Dr. K. P. Singh', type: 'Lecture' },
    { time: '11:30 - 12:30 PM', code: 'CS401', subject: 'Data Structures & Algorithms', room: 'Room 302', faculty: 'Dr. Rahul Sharma', type: 'Tutorial' },
    { time: '12:30 - 01:30 PM', code: 'BREAK', subject: '🥪 Lunch Break', room: 'Cafeteria', faculty: 'Campus', type: 'Break' },
    { time: '01:30 - 03:30 PM', code: 'LIB', subject: 'Digital Library & Research Hours', room: 'Central Library', faculty: 'Chief Librarian', type: 'Library' },
  ],
  Friday: [
    { time: '09:30 - 10:30 AM', code: 'CS405', subject: 'Discrete Mathematics', room: 'Room 201', faculty: 'Prof. R. C. Mathur', type: 'Lecture' },
    { time: '10:30 - 11:30 AM', code: 'CS402', subject: 'Database Management Systems', room: 'Room 204', faculty: 'Prof. Ananya Verma', type: 'Lecture' },
    { time: '11:30 - 12:30 PM', code: 'CS406', subject: 'MERN Full-Stack Development', room: 'Room 302', faculty: 'Dr. P. Mishra', type: 'Lecture' },
    { time: '12:30 - 01:30 PM', code: 'BREAK', subject: '🥪 Lunch Break', room: 'Cafeteria', faculty: 'Campus', type: 'Break' },
    { time: '01:30 - 03:30 PM', code: 'PROJ', subject: 'Major Project Evaluation & Mentoring', room: 'Seminar Hall', faculty: 'HOD & Faculty Panel', type: 'Project' },
  ],
};

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [feeData, setFeeData] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Timetable State
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const todayIndex = new Date().getDay();
  const todayName = daysOfWeek[todayIndex - 1] || 'Monday';
  const [activeDay, setActiveDay] = useState(todayName);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Get Me (profile)
        const meRes = await api.get('/auth/me');
        const st = meRes.data.user.profile;
        setStudentProfile(st);

        if (st?._id) {
          // 2. Attendance
          const attRes = await api.get(`/attendance/student/${st._id}`);
          if (attRes.data.success) {
            setAttendanceData(attRes.data.data);
          }

          // 3. Fees
          const feeRes = await api.get(`/fees/student/${st._id}`);
          if (feeRes.data.success) {
            setFeeData(feeRes.data.data);
          }

          // 4. Marks (for CGPA calculation)
          const marksRes = await api.get(`/marks/student/${st._id}`);
          if (marksRes.data.success) {
            setMarksData(marksRes.data.data);
          }
        }

        // 5. Notices
        const noticeRes = await api.get('/notices');
        if (noticeRes.data.success) {
          setRecentNotices(noticeRes.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const overallAtt = attendanceData?.overallStats?.percentage || 0;
  const isAttendanceDefaulter = overallAtt < 75;
  const currentFee = feeData[0];

  // Calculate real CGPA from marks data
  const calculateCGPA = () => {
    if (!marksData || marksData.length === 0) return null;
    const totalPercentage = marksData.reduce((sum, m) => {
      return sum + (m.marksObtained / m.maxMarks) * 100;
    }, 0);
    const avg = totalPercentage / marksData.length;
    // Convert percentage to 10-point GPA scale
    return (avg / 10).toFixed(2);
  };

  const cgpa = calculateCGPA();

  return (
    <div>
      {/* Student Welcome Banner */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          color: '#ffffff',
          padding: '30px',
          borderRadius: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px -5px rgba(30, 27, 75, 0.4)',
        }}
      >
        <div>
          <span className="badge badge-ai" style={{ marginBottom: '10px' }}>
            Student Academic Portal
          </span>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
            Hello, {user?.name}!
          </h1>
          <p style={{ color: '#c7d2fe', fontSize: '0.88rem', margin: 0 }}>
            Roll No: <strong>{studentProfile?.enrollmentNo || '—'}</strong> • {studentProfile?.department || '—'} • Semester {studentProfile?.semester || '—'} (Sec {studentProfile?.section || '—'})
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Current Term</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Academic Year 2025-26</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
            Batch: {studentProfile?.batchYear || '2023-2027'}
          </div>
        </div>
      </div>

      {/* 75% Attendance Compliance Alert Banner */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '16px',
          marginBottom: '24px',
          backgroundColor: isAttendanceDefaulter ? '#fef2f2' : '#f0fdf4',
          border: `1.5px solid ${isAttendanceDefaulter ? '#fecaca' : '#bbf7d0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isAttendanceDefaulter ? (
            <AlertTriangle size={26} color="#dc2626" />
          ) : (
            <CheckCircle2 size={26} color="#16a34a" />
          )}
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: isAttendanceDefaulter ? '#991b1b' : '#14532d',
              }}
            >
              {isAttendanceDefaulter
                ? 'Attendance Shortage Warning (< 75%)'
                : 'Attendance Compliant (>= 75%)'}
            </div>
            <div style={{ fontSize: '0.82rem', color: isAttendanceDefaulter ? '#b91c1c' : '#166534' }}>
              {isAttendanceDefaulter
                ? `Your cumulative attendance is currently ${overallAtt}%. University rules require a minimum of 75% to receive the exam admit card.`
                : `Great job! Your current cumulative attendance is ${overallAtt}%. You are eligible to appear in semester examinations.`}
            </div>
          </div>
        </div>

        <Link
          to="/student/attendance"
          className="btn"
          style={{
            backgroundColor: isAttendanceDefaulter ? '#ef4444' : '#10b981',
            color: '#fff',
            fontSize: '0.82rem',
            padding: '8px 16px',
          }}
        >
          View Subject Breakdown
        </Link>
      </div>

      {/* 3 Quick Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '28px' }}>
        {/* Attendance Card */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Overall Attendance
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: isAttendanceDefaulter ? '#dc2626' : '#16a34a',
                }}
              >
                {overallAtt}%
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: isAttendanceDefaulter ? '#fee2e2' : '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isAttendanceDefaulter ? '#dc2626' : '#16a34a',
              }}
            >
              <CalendarCheck size={22} />
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>
            {attendanceData?.overallStats?.attendedClasses || 0} attended out of{' '}
            {attendanceData?.overallStats?.totalClasses || 0} scheduled classes.
          </div>

          <Link to="/student/attendance" style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Detailed Subject Report</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Academic Marks Card */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Semester CGPA
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                {cgpa !== null ? cgpa : '—'}
                {cgpa && <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}> /10</span>}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <Award size={22} />
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>
            {marksData.length > 0
              ? `${marksData.length} subject evaluations recorded this semester.`
              : 'No exam marks published yet for this semester.'}
          </div>

          <Link to="/student/marks" style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>View Marksheet & PDF</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Fee Status Card */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Tuition Fee Status
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                <span
                  className={`badge ${
                    currentFee?.status === 'Paid'
                      ? 'badge-success'
                      : currentFee?.status === 'Partial'
                      ? 'badge-warning'
                      : 'badge-danger'
                  }`}
                  style={{ fontSize: '0.85rem' }}
                >
                  {currentFee?.status || 'Pending'}
                </span>
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
              }}
            >
              <CreditCard size={22} />
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>
            {currentFee?.dueAmount > 0
              ? `Outstanding Dues: ₹${currentFee.dueAmount.toLocaleString('en-IN')}`
              : 'All semester fees cleared. ✓'}
          </div>

          <Link to="/student/fees" style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Fee Receipts & Payment</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Interactive Class Timetable Widget */}
      <div className="glass-card" style={{ padding: '26px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={22} color="#4f46e5" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Weekly Lecture Timetable
              </h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '4px 0 0 0' }}>
              {studentProfile ? `${studentProfile.department} • Semester ${studentProfile.semester} (Sec ${studentProfile.section})` : 'Semester Academic Schedule'}
            </p>
          </div>

          {/* Day selection tabs */}
          <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', flexWrap: 'wrap' }}>
            {daysOfWeek.map((day) => {
              const isToday = day === todayName;
              const isSelected = day === activeDay;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.82rem',
                    background: isSelected ? '#4f46e5' : 'transparent',
                    color: isSelected ? '#ffffff' : '#475569',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isSelected ? '#a5b4fc' : '#10b981',
                      display: 'inline-block',
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {WEEKDAY_SCHEDULE[activeDay]?.map((slot, idx) => {
            const isBreak = slot.type === 'Break';
            return (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: isBreak ? '1.5px dashed #cbd5e1' : '1.5px solid #e2e8f0',
                  background: isBreak ? '#f8fafc' : '#ffffff',
                  boxShadow: isBreak ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {slot.time}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: slot.type === 'Practical' ? '#ecfdf5' : slot.type === 'Seminar' ? '#fdf4ff' : '#eff6ff',
                        color: slot.type === 'Practical' ? '#059669' : slot.type === 'Seminar' ? '#9333ea' : '#2563eb',
                      }}
                    >
                      {slot.code}
                    </span>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isBreak ? '#64748b' : '#0f172a', lineHeight: 1.35 }}>
                    {slot.subject}
                  </div>
                </div>

                <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="#94a3b8" /> {slot.room}
                  </span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>
                    {slot.faculty}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="/student/timetable" style={{ fontSize: '0.84rem', color: '#4f46e5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Open Complete Week Timetable & Print View</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Notices Feed */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="#4f46e5" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Campus Circulars & Updates</h3>
          </div>
          <Link to="/notices" style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 600 }}>
            View All Circulars →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentNotices.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.88rem' }}>No active circulars.</div>
          ) : (
            recentNotices.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-info">{n.category}</span>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{n.title}</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    {n.content?.slice(0, 110)}...
                  </p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                  {new Date(n.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
