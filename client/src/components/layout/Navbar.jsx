import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Settings } from 'lucide-react';

export const Navbar = ({ onOpenAi }) => {
  const { user, role } = useAuth();
  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Left: Campus Badge & Date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
          <Calendar size={16} />
          <span>{todayStr}</span>
        </div>
        <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }}></div>
        <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
          {role} Workspace
        </span>
      </div>

      {/* Right: AI Assistant & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Sarvam AI Trigger Pill */}
        <button
          onClick={onOpenAi}
          className="btn btn-ai"
          style={{
            padding: '7px 14px',
            fontSize: '0.82rem',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="ai-pulse"></span>
          <Sparkles size={16} />
          <span>Ask Campus Sahayak</span>
        </button>

        {/* User Avatar Badge + Profile Link */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '12px',
            borderLeft: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
              flexShrink: 0,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>{user?.name}</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{user?.email}</div>
          </div>

          {/* Settings / Profile Link */}
          <Link
            to="/profile"
            title="Account Settings"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              transition: 'all 0.2s ease',
              border: '1px solid var(--border)',
              flexShrink: 0,
              marginLeft: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e0e7ff';
              e.currentTarget.style.color = '#4f46e5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <Settings size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
};
