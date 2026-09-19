import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, MapPin, User, Download, Printer, BookOpen, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const WEEKDAY_SCHEDULE = {
  Monday: [
    { period: 1, time: '09:00 - 10:00 AM', code: 'CS301', subject: 'Data Structures & Algorithms', faculty: 'Dr. Ramesh Sharma', room: 'LH-101', type: 'Theory', credits: 4 },
    { period: 2, time: '10:00 - 11:00 AM', code: 'CS302', subject: 'Database Management Systems', faculty: 'Prof. Anjali Verma', room: 'LH-102', type: 'Theory', credits: 4 },
    { period: 3, time: '11:15 - 01:15 PM', code: 'CS301P', subject: 'DSA Lab (Batch A & B)', faculty: 'Dr. Ramesh Sharma', room: 'Lab 3 (Ground Floor)', type: 'Practical', credits: 2 },
    { period: 4, time: '01:15 - 02:00 PM', code: 'LUNCH', subject: 'Lunch Break & Recess', faculty: 'Campus Cafeteria', room: 'Food Court', type: 'Break', credits: 0 },
    { period: 5, time: '02:00 - 03:00 PM', code: 'MA301', subject: 'Discrete Mathematics', faculty: 'Dr. S. K. Gupta', room: 'LH-104', type: 'Theory', credits: 4 },
  ],
  Tuesday: [
    { period: 1, time: '09:00 - 10:00 AM', code: 'CS303', subject: 'Operating Systems', faculty: 'Prof. Vikram Singh', room: 'LH-103', type: 'Theory', credits: 4 },
    { period: 2, time: '10:00 - 11:00 AM', code: 'CS301', subject: 'Data Structures & Algorithms', faculty: 'Dr. Ramesh Sharma', room: 'LH-101', type: 'Theory', credits: 4 },
    { period: 3, time: '11:15 - 12:15 PM', code: 'CS304', subject: 'Computer Networks', faculty: 'Dr. Neha Patel', room: 'LH-105', type: 'Theory', credits: 3 },
    { period: 4, time: '01:15 - 02:00 PM', code: 'LUNCH', subject: 'Lunch Break & Recess', faculty: 'Campus Cafeteria', room: 'Food Court', type: 'Break', credits: 0 },
    { period: 5, time: '02:00 - 04:00 PM', code: 'CS302P', subject: 'DBMS Lab (MySQL / MongoDB)', faculty: 'Prof. Anjali Verma', room: 'Lab 2 (First Floor)', type: 'Practical', credits: 2 },
  ],
  Wednesday: [
    { period: 1, time: '09:00 - 10:00 AM', code: 'MA301', subject: 'Discrete Mathematics', faculty: 'Dr. S. K. Gupta', room: 'LH-104', type: 'Theory', credits: 4 },
    { period: 2, time: '10:00 - 11:00 AM', code: 'CS304', subject: 'Computer Networks', faculty: 'Dr. Neha Patel', room: 'LH-105', type: 'Theory', credits: 3 },
    { period: 3, time: '11:15 - 01:15 PM', code: 'CS303P', subject: 'OS Linux Kernel Lab', faculty: 'Prof. Vikram Singh', room: 'Lab 4 (Second Floor)', type: 'Practical', credits: 2 },
    { period: 4, time: '01:15 - 02:00 PM', code: 'LUNCH', subject: 'Lunch Break & Recess', faculty: 'Campus Cafeteria', room: 'Food Court', type: 'Break', credits: 0 },
    { period: 5, time: '02:00 - 03:30 PM', code: 'CS305', subject: 'AI & Machine Learning Seminar', faculty: 'Guest Speaker', room: 'Auditorium 1', type: 'Seminar', credits: 1 },
  ],
  Thursday: [
    { period: 1, time: '09:00 - 10:00 AM', code: 'CS302', subject: 'Database Management Systems', faculty: 'Prof. Anjali Verma', room: 'LH-102', type: 'Theory', credits: 4 },
    { period: 2, time: '10:00 - 11:00 AM', code: 'CS303', subject: 'Operating Systems', faculty: 'Prof. Vikram Singh', room: 'LH-103', type: 'Theory', credits: 4 },
    { period: 3, time: '11:15 - 12:15 PM', code: 'CS301', subject: 'Data Structures & Algorithms', faculty: 'Dr. Ramesh Sharma', room: 'LH-101', type: 'Theory', credits: 4 },
    { period: 4, time: '01:15 - 02:00 PM', code: 'LUNCH', subject: 'Lunch Break & Recess', faculty: 'Campus Cafeteria', room: 'Food Court', type: 'Break', credits: 0 },
    { period: 5, time: '02:00 - 03:00 PM', code: 'HU301', subject: 'Technical Communication & Ethics', faculty: 'Dr. Priya Nair', room: 'LH-106', type: 'Theory', credits: 2 },
  ],
  Friday: [
    { period: 1, time: '09:00 - 10:00 AM', code: 'CS304', subject: 'Computer Networks', faculty: 'Dr. Neha Patel', room: 'LH-105', type: 'Theory', credits: 3 },
    { period: 2, time: '10:00 - 11:00 AM', code: 'CS302', subject: 'Database Management Systems', faculty: 'Prof. Anjali Verma', room: 'LH-102', type: 'Theory', credits: 4 },
    { period: 3, time: '11:15 - 01:15 PM', code: 'CS306P', subject: 'Web Technologies Lab (MERN)', faculty: 'Prof. R. Mishra', room: 'Advanced Web Lab', type: 'Practical', credits: 2 },
    { period: 4, time: '01:15 - 02:00 PM', code: 'LUNCH', subject: 'Lunch Break & Recess', faculty: 'Campus Cafeteria', room: 'Food Court', type: 'Break', credits: 0 },
    { period: 5, time: '02:00 - 03:30 PM', code: 'LIB301', subject: 'Library & Self Study Hour', faculty: 'Librarian', room: 'Central Library', type: 'Theory', credits: 1 },
  ],
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const StudentTimetable = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayIndex = new Date().getDay();
  const todayName = daysOfWeek[todayIndex - 1] || 'Monday';
  const [activeDay, setActiveDay] = useState(todayName);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'fullWeek'

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setProfile(res.data.user.profile);
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={22} color="#4f46e5" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Class Academic Timetable
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                {profile
                  ? `${profile.department} • Semester ${profile.semester} (Section ${profile.section}) • Academic Session 2025-26`
                  : 'Bachelor of Technology • Academic Schedule 2025-26'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setViewMode(viewMode === 'daily' ? 'fullWeek' : 'daily')}
            className="btn btn-secondary"
            style={{ gap: '6px', fontSize: '0.84rem' }}
          >
            <BookOpen size={16} />
            <span>{viewMode === 'daily' ? 'Switch to Full Week View' : 'Switch to Day View'}</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ gap: '6px', fontSize: '0.84rem' }}>
            <Printer size={16} />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* Quick Info Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)',
          border: '1px solid #bfdbfe',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={20} color="#2563eb" />
          <div style={{ fontSize: '0.88rem', color: '#1e3a8a' }}>
            <strong>Official Academic Notice:</strong> Minimum 75% lecture attendance is required in each theory & lab course to be eligible for End-Semester examinations.
          </div>
        </div>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: '#dbeafe', color: '#1d4ed8' }}>
          Effective: Odd Semester 2025-26
        </span>
      </div>

      {/* Daily View with Day Tabs */}
      {viewMode === 'daily' ? (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          {/* Day selection tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '22px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '5px', borderRadius: '12px', flexWrap: 'wrap' }}>
              {daysOfWeek.map((day) => {
                const isToday = day === todayName;
                const isSelected = day === activeDay;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '9px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.88rem',
                      background: isSelected ? '#4f46e5' : 'transparent',
                      color: isSelected ? '#ffffff' : '#475569',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{day}</span>
                    {isToday && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '999px',
                          background: isSelected ? '#a5b4fc' : '#10b981',
                          color: isSelected ? '#1e1b4b' : '#ffffff',
                        }}
                      >
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Showing lectures for: <strong style={{ color: '#0f172a' }}>{activeDay}</strong>
            </div>
          </div>

          {/* Daily Schedule Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {WEEKDAY_SCHEDULE[activeDay]?.map((slot, idx) => {
              const isBreak = slot.type === 'Break';
              return (
                <div
                  key={idx}
                  style={{
                    padding: '20px 24px',
                    borderRadius: '14px',
                    border: isBreak ? '1.5px dashed #cbd5e1' : '1.5px solid #e2e8f0',
                    background: isBreak ? '#f8fafc' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    transition: 'all 0.2s ease',
                    boxShadow: isBreak ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', minWidth: '220px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: isBreak ? '#f1f5f9' : '#eef2ff',
                        color: isBreak ? '#64748b' : '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                      }}
                    >
                      P{slot.period}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#4f46e5' }}>
                        <Clock size={14} /> {slot.time}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Period duration: 60 mins</div>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: slot.type === 'Practical' ? '#ecfdf5' : slot.type === 'Seminar' ? '#fdf4ff' : slot.type === 'Break' ? '#f1f5f9' : '#eff6ff',
                          color: slot.type === 'Practical' ? '#059669' : slot.type === 'Seminar' ? '#9333ea' : slot.type === 'Break' ? '#64748b' : '#2563eb',
                        }}
                      >
                        {slot.code}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                        {slot.type} • {slot.credits} Credits
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isBreak ? '#64748b' : '#0f172a', margin: 0 }}>
                      {slot.subject}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right', minWidth: '180px' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <User size={14} color="#64748b" /> {slot.faculty}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <MapPin size={13} color="#94a3b8" /> {slot.room}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Full Week Grid View */
        <div className="table-container glass-card" style={{ marginBottom: '24px' }}>
          <table className="custom-table" style={{ fontSize: '0.84rem' }}>
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Day</th>
                <th>09:00 - 10:00</th>
                <th>10:00 - 11:00</th>
                <th>11:15 - 01:15</th>
                <th>01:15 - 02:00</th>
                <th>02:00 - 04:00</th>
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map((day) => {
                const slots = WEEKDAY_SCHEDULE[day] || [];
                const isToday = day === todayName;
                return (
                  <tr key={day} style={{ background: isToday ? '#f8faff' : 'transparent' }}>
                    <td style={{ fontWeight: 800, color: isToday ? '#4f46e5' : '#0f172a' }}>
                      {day} {isToday && '⭐'}
                    </td>
                    {slots.slice(0, 5).map((slot, idx) => (
                      <td key={idx} style={{ verticalAlign: 'top', background: slot.type === 'Break' ? '#f8fafc' : 'inherit' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>{slot.code}</div>
                        <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px' }}>{slot.subject}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>{slot.room} • {slot.faculty}</div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
