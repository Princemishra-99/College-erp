import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { GraduationCap, Plus, Trash2, X, Briefcase, Mail, Phone, Pencil, Save, ShieldCheck, ShieldOff, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editFaculty, setEditFaculty] = useState(null);
  const [editFacultyForm, setEditFacultyForm] = useState({});
  const [editFacultyLoading, setEditFacultyLoading] = useState(false);
  const [pendingFaculty, setPendingFaculty] = useState([]);
  const [approvalLoading, setApprovalLoading] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: 'Computer Science & Engg',
    designation: 'Assistant Professor',
    qualification: 'M.Tech in CSE',
    experienceYears: 4,
    phone: '',
    password: 'Faculty@123',
  });

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await api.get('/faculty');
      if (res.data.success) {
        setFaculty(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load faculty list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/faculty/pending-approvals');
      if (res.data.success) setPendingFaculty(res.data.data);
    } catch (err) { /* ignore */ }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/faculty', formData);
      if (res.data.success) {
        toast.success('Faculty registered successfully');
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          email: '',
          employeeId: '',
          department: 'Computer Science & Engg',
          designation: 'Assistant Professor',
          qualification: 'M.Tech in CSE',
          experienceYears: 4,
          phone: '',
          password: 'Faculty@123',
        });
        fetchFaculty();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register faculty');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove faculty member ${name}?`)) {
      try {
        const res = await api.delete(`/faculty/${id}`);
        if (res.data.success) {
          toast.success('Faculty removed');
          fetchFaculty();
        }
      } catch (err) {
        toast.error('Failed to remove faculty');
      }
    }
  };

  const handleOpenEditFaculty = (f) => {
    setEditFaculty(f);
    setEditFacultyForm({
      name: f.userId?.name || '',
      department: f.department,
      designation: f.designation,
      qualification: f.qualification,
      phone: f.phone,
      experienceYears: f.experienceYears,
    });
  };

  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    if (!editFaculty) return;
    setEditFacultyLoading(true);
    try {
      const res = await api.put(`/faculty/${editFaculty._id}`, editFacultyForm);
      if (res.data.success) {
        toast.success('Faculty details updated successfully!');
        setEditFaculty(null);
        fetchFaculty();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setEditFacultyLoading(false);
    }
  };

  const handleApprove = async (facultyId, name) => {
    setApprovalLoading(facultyId + '-approve');
    try {
      const res = await api.put(`/faculty/${facultyId}/approve`);
      if (res.data.success) {
        toast.success(`✅ ${name} is now approved and can login!`);
        fetchFaculty();
        fetchPending();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setApprovalLoading('');
    }
  };

  const handleRevokeAccess = async (facultyId, name) => {
    if (!window.confirm(`Revoke login access for ${name}? They will not be able to login until re-approved.`)) return;
    setApprovalLoading(facultyId + '-revoke');
    try {
      const res = await api.put(`/faculty/${facultyId}/revoke`);
      if (res.data.success) {
        toast.success(`🔒 Access revoked for ${name}.`);
        fetchFaculty();
        fetchPending();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Revoke failed');
    } finally {
      setApprovalLoading('');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Faculty & Teaching Staff
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Manage professors, assistant professors, subject allotments, and department coordinators.
          </p>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid-cols-3" style={{ gap: '20px' }}>
        {loading ? (
          <div style={{ color: '#64748b', padding: '24px' }}>Loading faculty members...</div>
        ) : faculty.length === 0 ? (
          <div style={{ color: '#64748b', padding: '24px' }}>No faculty members registered.</div>
        ) : (
          faculty.map((f) => (
            <div key={f._id} className="glass-card" style={{ padding: '22px', position: 'relative' }}>
              <button
                onClick={() => handleOpenEditFaculty(f)}
                style={{ position: 'absolute', top: '16px', right: '44px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                title="Edit Faculty"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#059669')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(f._id, f.userId?.name)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                title="Remove Faculty"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <Trash2 size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}
                >
                  {f.userId?.name?.charAt(0) || 'F'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{f.userId?.name}</h3>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    {f.designation}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={14} color="#64748b" />
                  <span><strong>ID:</strong> {f.employeeId} | {f.department}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} color="#64748b" />
                  <span>{f.userId?.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="#64748b" />
                  <span>{f.phone}</span>
                </div>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: '#64748b' }}>
                <strong>Assigned Courses:</strong>{' '}
                {f.assignedSubjects && f.assignedSubjects.length > 0 ? (
                  f.assignedSubjects.map((s) => s.subjectCode).join(', ')
                ) : (
                  <span style={{ color: '#94a3b8' }}>None assigned</span>
                )}
              </div>

              {/* Approval Status */}
              <div style={{ paddingTop: '10px', marginTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {f.isApproved ? (
                    <><ShieldCheck size={14} color="#059669" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>Access Approved</span></>
                  ) : (
                    <><Clock size={14} color="#d97706" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>Pending Approval</span></>
                  )}
                </div>
                {f.isApproved ? (
                  <button
                    onClick={() => handleRevokeAccess(f._id, f.userId?.name)}
                    disabled={approvalLoading === f._id + '-revoke'}
                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Revoke login access"
                  >
                    <ShieldOff size={11} /> {approvalLoading === f._id + '-revoke' ? '...' : 'Revoke'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(f._id, f.userId?.name)}
                    disabled={approvalLoading === f._id + '-approve'}
                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#059669', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Approve faculty login"
                  >
                    <ShieldCheck size={11} /> {approvalLoading === f._id + '-approve' ? '...' : 'Approve'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pending Faculty Approvals Section ────────────────────────── */}
      {pendingFaculty.length > 0 && (
        <div className="glass-card" style={{ padding: '28px', marginTop: '24px', border: '2px solid #fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#d97706" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 2px 0', color: '#92400e' }}>Pending Faculty Approvals</h2>
              <p style={{ fontSize: '0.8rem', color: '#b45309', margin: 0 }}>These faculty registered via OTP. Review and approve their access before they can login.</p>
            </div>
            <span style={{ marginLeft: 'auto', padding: '3px 12px', borderRadius: '999px', background: '#ef4444', color: '#fff', fontSize: '0.78rem', fontWeight: 800 }}>
              {pendingFaculty.length} Pending
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingFaculty.map((f) => (
              <div key={f._id} style={{ padding: '18px', borderRadius: '14px', background: '#fffbeb', border: '1.5px solid #fde68a', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #d97706, #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                  {f.userId?.name?.charAt(0) || 'F'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{f.userId?.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{f.userId?.email} &bull; {f.employeeId} &bull; {f.department}</div>
                  <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '2px' }}>
                    {f.designation} &bull; {f.qualification} &bull; {f.experienceYears} yrs experience
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleApprove(f._id, f.userId?.name)}
                    disabled={approvalLoading === f._id + '-approve'}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#059669', color: '#fff', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ShieldCheck size={14} /> {approvalLoading === f._id + '-approve' ? 'Approving...' : 'Approve Access'}
                  </button>
                  <button
                    onClick={() => handleDelete(f._id, f.userId?.name)}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#fef2f2', color: '#dc2626', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}
                    title="Reject and delete this registration"
                  >
                    <Trash2 size={13} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Faculty Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Register Faculty Member</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFaculty}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employee ID *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. FAC-CSE-005"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Computer Science & Engg">Computer Science & Engg</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Mechanical Engg">Mechanical Engg</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Designation *</label>
                  <select
                    className="form-select"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Head of Department">Head of Department</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Qualification *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Ph.D / M.Tech"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Faculty Modal */}
      {editFaculty && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 2px 0' }}>✏️ Edit Faculty Details</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Employee ID: {editFaculty.employeeId}</span>
              </div>
              <button onClick={() => setEditFaculty(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateFaculty}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-input" required value={editFacultyForm.name}
                    onChange={e => setEditFacultyForm({ ...editFacultyForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input type="text" className="form-input" required value={editFacultyForm.phone}
                    onChange={e => setEditFacultyForm({ ...editFacultyForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-select" value={editFacultyForm.department} onChange={e => setEditFacultyForm({ ...editFacultyForm, department: e.target.value })}>
                    <option>Computer Science & Engg</option>
                    <option>Information Technology</option>
                    <option>Electronics & Comm</option>
                    <option>Mechanical Engg</option>
                    <option>Civil Engg</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Designation *</label>
                  <select className="form-select" value={editFacultyForm.designation} onChange={e => setEditFacultyForm({ ...editFacultyForm, designation: e.target.value })}>
                    <option>Professor</option>
                    <option>Associate Professor</option>
                    <option>Assistant Professor</option>
                    <option>Head of Department</option>
                    <option>Lecturer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification *</label>
                  <input type="text" className="form-input" required value={editFacultyForm.qualification}
                    onChange={e => setEditFacultyForm({ ...editFacultyForm, qualification: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input type="number" className="form-input" min="0" value={editFacultyForm.experienceYears}
                    onChange={e => setEditFacultyForm({ ...editFacultyForm, experienceYears: Number(e.target.value) })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setEditFaculty(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editFacultyLoading}>
                  <Save size={15} />
                  <span>{editFacultyLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
