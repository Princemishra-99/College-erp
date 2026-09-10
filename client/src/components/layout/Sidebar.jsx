import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  CreditCard,
  Bell,
  LogOut,
  Sparkles,
  Settings,
} from 'lucide-react';

export const Sidebar = ({ onOpenAi }) => {
  const { user, role, logout } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/students', label: 'Manage Students', icon: Users },
          { to: '/admin/faculty', label: 'Manage Faculty', icon: GraduationCap },
          { to: '/admin/academics', label: 'Courses & Subjects', icon: BookOpen },
          { to: '/admin/fees', label: 'Fee Management', icon: CreditCard },
          { to: '/notices', label: 'Campus Notices', icon: Bell },
          { to: '/profile', label: 'Account Settings', icon: Settings },
        ];
      case 'faculty':
        return [
          { to: '/faculty/dashboard', label: 'Faculty Portal', icon: LayoutDashboard },
          { to: '/faculty/students', label: 'Students Directory', icon: Users },
          { to: '/faculty/attendance', label: 'Mark Attendance', icon: CalendarCheck },
          { to: '/faculty/marks', label: 'Upload Marks', icon: Award },
          { to: '/notices', label: 'Campus Notices', icon: Bell },
          { to: '/profile', label: 'Account Settings', icon: Settings },
        ];
      case 'student':
        return [
          { to: '/student/dashboard', label: 'Student Portal', icon: LayoutDashboard },
          { to: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
          { to: '/student/marks', label: 'Grades & Marksheet', icon: Award },
          { to: '/student/fees', label: 'Fee Ledger & Receipts', icon: CreditCard },
          { to: '/notices', label: 'Campus Notices', icon: Bell },
          { to: '/profile', label: 'Account Settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 15px rgba(0, 0, 0, 0.1)',
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
          }}
        >
          <GraduationCap size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
            COLLEGE ERP
          </h2>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
            Smart Campus 2.1
          </span>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div style={{ padding: '16px 20px 8px 20px' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Logged in as:</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9', textTransform: 'capitalize' }}>
              {user?.name?.split(' ')[0]} ({role})
            </div>
          </div>
          <span
            className={`badge ${
              role === 'admin' ? 'badge-danger' : role === 'faculty' ? 'badge-info' : 'badge-success'
            }`}
            style={{ fontSize: '0.68rem', padding: '2px 8px' }}
          >
            {role?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#64748b',
            letterSpacing: '0.08em',
            padding: '6px 12px',
          }}
        >
          Main Navigation
        </div>

        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? 'rgba(79, 70, 229, 0.9)' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              })}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        {/* Sarvam AI Quick Launcher in Sidebar */}
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={onOpenAi}
            className="btn btn-ai"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.85rem',
            }}
          >
            <Sparkles size={18} />
            <span>Campus Sahayak AI</span>
          </button>
        </div>
      </nav>

      {/* Logout Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '9px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
