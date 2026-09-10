import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Bell, Plus, Pin, Sparkles, Globe, Trash2, X, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const NoticesPage = () => {
  const { role } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // AI Translation & Summary State
  const [activeTranslation, setActiveTranslation] = useState({}); // { noticeId: translatedText }
  const [activeSummary, setActiveSummary] = useState({}); // { noticeId: [bullets] }
  const [aiLoading, setAiLoading] = useState({}); // { noticeId_action: boolean }

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    targetRole: 'all',
    isPinned: false,
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notices');
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/notices', formData);
      if (res.data.success) {
        toast.success('Notice published successfully');
        setIsAddModalOpen(false);
        setFormData({ title: '', content: '', category: 'General', targetRole: 'all', isPinned: false });
        fetchNotices();
      }
    } catch (err) {
      toast.error('Failed to publish notice');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this notice circular?')) {
      try {
        const res = await api.delete(`/notices/${id}`);
        if (res.data.success) {
          toast.success('Notice deleted');
          fetchNotices();
        }
      } catch (err) {
        toast.error('Failed to delete notice');
      }
    }
  };

  // Sarvam AI Notice Translation
  const handleTranslateToHindi = async (notice) => {
    const key = `${notice._id}_trans`;
    setAiLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const res = await api.post('/ai/translate', {
        title: notice.title,
        content: notice.content,
        targetLanguage: 'hi-IN',
      });

      if (res.data.success) {
        setActiveTranslation((prev) => ({
          ...prev,
          [notice._id]: res.data.translatedText,
        }));
        toast.success(`Translated via ${res.data.provider}`);
      }
    } catch (err) {
      toast.error('Translation service currently unavailable');
    } finally {
      setAiLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Sarvam AI Notice Summarizer
  const handleSummarizeNotice = async (notice) => {
    const key = `${notice._id}_sum`;
    setAiLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const res = await api.post('/ai/summarize', {
        content: notice.content,
      });

      if (res.data.success) {
        setActiveSummary((prev) => ({
          ...prev,
          [notice._id]: res.data.summary,
        }));
        toast.success('Generated AI bullet summary');
      }
    } catch (err) {
      toast.error('Summarizer error');
    } finally {
      setAiLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Campus Circulars & Notice Board
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Official university communications with 1-click Sarvam Indic translation and AI summarizer.
          </p>
        </div>

        {(role === 'admin' || role === 'faculty') && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      {/* Notices Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ color: '#64748b', padding: '24px' }}>Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
            No active notices for your category at this time.
          </div>
        ) : (
          notices.map((n) => {
            const hasTranslation = activeTranslation[n._id];
            const hasSummary = activeSummary[n._id];
            const isTransLoading = aiLoading[`${n._id}_trans`];
            const isSumLoading = aiLoading[`${n._id}_sum`];

            return (
              <div
                key={n._id}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderLeft: n.isPinned ? '4px solid #4f46e5' : '1px solid var(--border)',
                  position: 'relative',
                }}
              >
                {/* Notice Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {n.isPinned && (
                      <span className="badge badge-primary" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                        <Pin size={12} />
                        <span>Pinned Notice</span>
                      </span>
                    )}
                    <span className="badge badge-info">{n.category}</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Audience: <strong style={{ textTransform: 'uppercase' }}>{n.targetRole}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      {new Date(n.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {role === 'admin' && (
                      <button
                        onClick={() => handleDelete(n._id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        title="Delete Notice"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                  {n.title}
                </h3>

                <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: '1.6', marginBottom: '18px', whiteSpace: 'pre-wrap' }}>
                  {n.content}
                </p>

                {/* AI Hindi Translation Section */}
                {hasTranslation && (
                  <div
                    style={{
                      marginTop: '14px',
                      marginBottom: '14px',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #fdf4ff, #fae8ff)',
                      border: '1px solid #f0abfc',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#a21caf', fontWeight: 700, fontSize: '0.82rem' }}>
                      <Globe size={15} />
                      <span>Sarvam AI Hindi Translation (हिंदी अनुवाद):</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#4a044e', lineHeight: '1.6' }}>
                      {hasTranslation}
                    </div>
                  </div>
                )}

                {/* AI Bullet Summary Section */}
                {hasSummary && (
                  <div
                    style={{
                      marginTop: '14px',
                      marginBottom: '14px',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#166534', fontWeight: 700, fontSize: '0.82rem' }}>
                      <Sparkles size={15} />
                      <span>Sarvam AI TL;DR Key Points:</span>
                    </div>
                    <ul style={{ paddingLeft: '20px', fontSize: '0.88rem', color: '#14532d', lineHeight: '1.5' }}>
                      {hasSummary.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bottom Action Bar for Sarvam AI */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Broadcasted by: <strong>{n.postedBy?.name || 'Dean Office'}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleTranslateToHindi(n)}
                      disabled={isTransLoading}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      <Globe size={14} color="#a855f7" />
                      <span>{isTransLoading ? 'Translating...' : 'Translate to हिंदी'}</span>
                    </button>

                    <button
                      onClick={() => handleSummarizeNotice(n)}
                      disabled={isSumLoading}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      <Sparkles size={14} color="#10b981" />
                      <span>{isSumLoading ? 'Summarizing...' : 'AI Summary'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Notice Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Broadcast Campus Circular</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNotice}>
              <div className="form-group">
                <label className="form-label">Notice Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Schedule for Mid-Term Examination 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="General">General Announcement</option>
                    <option value="Exam">Exam & Schedule</option>
                    <option value="Academic">Academic / Syllabus</option>
                    <option value="Fee">Fee Notification</option>
                    <option value="Holiday">Holiday Notice</option>
                    <option value="Placement">Placement Drive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Audience *</label>
                  <select
                    className="form-select"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  >
                    <option value="all">Everyone (Students & Faculty)</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Members Only</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Circular Content *</label>
                <textarea
                  rows="4"
                  className="form-textarea"
                  required
                  placeholder="Enter detailed notice content..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                />
                <label htmlFor="pinCheck" style={{ fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                  Pin to top of the notice board
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
