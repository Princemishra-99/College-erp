import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CampusSahayakModal } from '../ai/CampusSahayakModal';
import { Sparkles } from 'lucide-react';

export const AppLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          background: '#f8fafc',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        ></div>
        <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>
          Loading College ERP System...
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <Sidebar onOpenAi={() => setIsAiModalOpen(true)} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar onOpenAi={() => setIsAiModalOpen(true)} />

        <main style={{ flex: 1, padding: '28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Floating Sarvam AI Assistant Trigger (Bottom Right) */}
      <button
        onClick={() => setIsAiModalOpen(true)}
        className="btn-ai"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          padding: '14px 20px',
          borderRadius: '999px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 90,
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.45)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <span className="ai-pulse"></span>
        <Sparkles size={20} />
        <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>Campus Sahayak</span>
      </button>

      {/* Sarvam AI Interactive Modal */}
      <CampusSahayakModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
};
