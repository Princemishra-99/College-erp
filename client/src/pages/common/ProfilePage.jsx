import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  User, Lock, Shield, Eye, EyeOff, CheckCircle, Save, Phone,
  MapPin, Users, Calendar, AlertTriangle, Clock, Send, X, ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, setUser, logout, role } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPass, setChangingPass] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Student profile request states
  const [studentProfile, setStudentProfile] = useState(null);
  const [myRequest, setMyRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: '', phone: '', guardianName: '', guardianPhone: '', address: '', gender: '', dob: '', reason: '' });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Fetch student profile & request status
  useEffect(() => {
    if (role === 'student') {
      fetchStudentData();
    }
  }, [role]);

  const fetchStudentData = async () => {
    try {
      const meRes = await api.get('/auth/me');
      const profile = meRes.data.user?.profile;
      setStudentProfile(profile);
      if (profile) {
        setRequestForm({
          name: user?.name || '',
          phone: profile.phone || '',
          guardianName: profile.guardianName || '',
          guardianPhone: profile.guardianPhone || '',
          address: profile.address || '',
          gender: profile.gender || 'Male',
          dob: profile.dob ? profile.dob.split('T')[0] : '',
          reason: '',
        });
      }
      const reqRes = await api.get('/students/my-request');
      setMyRequest(reqRes.data.data);
    } catch (err) {
      // ignore fetch errors
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.reason || requestForm.reason.trim().length < 5) {
      toast.error('Please provide a valid reason (min 5 characters)');
      return;
    }
    setSubmittingRequest(true);
    try {
      const res = await api.post('/students/request-update', requestForm);
      if (res.data.success) {
        toast.success(res.data.message);
        setShowRequestModal(false);
        fetchStudentData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    setChangingPass(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => logout(), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setChangingPass(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setUpdatingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name: name.trim() });
      if (res.data.success) {
        toast.success('Display name updated!');
        setUser((prev) => ({ ...prev, name: name.trim() }));
        localStorage.setItem('college_erp_user', JSON.stringify({ ...user, name: name.trim() }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile update failed');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getRoleBadgeColor = () => {
    if (user?.role === 'admin') return '#dc2626';
    if (user?.role === 'faculty') return '#2563eb';
    return '#16a34a';
  };

  const getRequestStatusInfo = () => {
    if (!myRequest) return null;
    if (myRequest.status === 'Pending') return { color: '#d97706', bg: '#fef3c7', border: '#fde68a', icon: <Clock size={16} />, label: 'Pending Review by Faculty / Admin' };
    if (myRequest.status === 'Approved') return { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: <CheckCircle size={16} />, label: 'Approved & Applied' };
    return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: <X size={16} />, label: `Rejected: ${myRequest.reviewRemarks || 'No reason given'}` };
  };

  const hasPendingRequest = myRequest?.status === 'Pending';
  const statusInfo = getRequestStatusInfo();
  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.88rem', background: '#f8fafc', outline: 'none', boxSizing: 'border-box', color: '#0f172a' };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Account Settings & Profile</h1>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Manage your account information and update login credentials.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: role === 'student' ? '1fr 1fr' : '1fr 1fr', gap: '24px' }}>

        {/* Left Column – Profile Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Identity Card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={22} color="#4f46e5" />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Account Information</h2>
            </div>

            <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#c7d2fe' }}>{user?.email}</div>
                  <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: getRoleBadgeColor(), color: '#fff' }}>
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {role === 'student' ? (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Official Student Name (Read-only)</label>
                  <input type="text" style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} value={name} disabled />
                  <span style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    🔒 To change your registered name or personal details, submit a <strong>Profile Update Request</strong> below for Admin/Faculty review.
                  </span>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Registered Email (Read-only)</label>
                  <input type="email" style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} value={user?.email || ''} disabled />
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Display Name</label>
                  <input type="text" style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Email (Read-only)</label>
                  <input type="email" style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} value={user?.email || ''} disabled />
                </div>
                <button type="submit" className="btn btn-primary" disabled={updatingProfile} style={{ width: '100%' }}>
                  <Save size={15} /><span>{updatingProfile ? 'Updating...' : 'Update Display Name'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Student Profile Details */}
          {role === 'student' && studentProfile && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ClipboardList size={18} color="#059669" />
                  </div>
                  <h3 style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>Academic Profile</h3>
                </div>
                {/* Request Update button – disabled when pending */}
                <button
                  onClick={() => { if (!hasPendingRequest) setShowRequestModal(true); }}
                  disabled={hasPendingRequest}
                  style={{
                    padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: hasPendingRequest ? 'not-allowed' : 'pointer',
                    background: hasPendingRequest ? '#f1f5f9' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: hasPendingRequest ? '#94a3b8' : '#fff', fontSize: '0.8rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '6px', opacity: hasPendingRequest ? 0.7 : 1,
                  }}
                  title={hasPendingRequest ? 'A request is already pending approval' : 'Request to update your profile details'}
                >
                  <Send size={13} />{hasPendingRequest ? 'Request Pending' : 'Request Update'}
                </button>
              </div>

              {/* Pending / Last request status banner */}
              {statusInfo && (
                <div style={{ padding: '12px 14px', borderRadius: '10px', background: statusInfo.bg, border: `1.5px solid ${statusInfo.border}`, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ color: statusInfo.color }}>{statusInfo.icon}</span>
                  <div style={{ fontSize: '0.8rem', color: statusInfo.color, fontWeight: 600 }}>
                    <strong>Profile Update:</strong> {statusInfo.label}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                {[
                  { icon: <Users size={14} />, label: 'Department', val: studentProfile.department },
                  { icon: <Calendar size={14} />, label: 'Semester / Section', val: `Sem ${studentProfile.semester} – Sec ${studentProfile.section}` },
                  { icon: <Phone size={14} />, label: 'Phone', val: studentProfile.phone },
                  { icon: <Users size={14} />, label: 'Guardian', val: `${studentProfile.guardianName} (${studentProfile.guardianPhone || 'N/A'})` },
                  { icon: <MapPin size={14} />, label: 'Address', val: studentProfile.address || 'Not provided' },
                  { icon: <User size={14} />, label: 'Gender', val: studentProfile.gender || 'Not specified' },
                  { icon: <Calendar size={14} />, label: 'Date of Birth', val: studentProfile.dob ? new Date(studentProfile.dob).toLocaleDateString('en-IN') : 'Not provided' },
                ].map(({ icon, label, val }) => (
                  <div key={label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 12px', borderRadius: '8px', background: '#f8fafc' }}>
                    <span style={{ color: '#64748b', marginTop: '1px' }}>{icon}</span>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column – Change Password */}
        <div className="glass-card" style={{ padding: '28px', alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={22} color="#d97706" />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Change Password</h2>
          </div>

          <div style={{ padding: '13px 15px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: '18px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Shield size={17} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: '#166534' }}>
              <strong>Security:</strong> After changing your password, you will be automatically logged out and need to sign in again.
            </div>
          </div>

          <form onSubmit={handleChangePassword}>
            {[
              { label: 'Current Password *', key: 'currentPassword', show: showCurrent, setShow: setShowCurrent },
              { label: 'New Password *', key: 'newPassword', show: showNew, setShow: setShowNew },
              { label: 'Confirm New Password *', key: 'confirmPassword', show: showConfirm, setShow: setShowConfirm },
            ].map(({ label, key, show, setShow }) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <input type={show ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '42px' }}
                    value={passwords[key]} onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                    placeholder={key === 'currentPassword' ? 'Enter current password' : key === 'newPassword' ? 'Minimum 6 characters' : 'Re-enter new password'}
                    required />
                  <button type="button" onClick={() => setShow(!show)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {key === 'confirmPassword' && passwords.newPassword && passwords.confirmPassword && passwords.newPassword === passwords.confirmPassword && (
                  <p style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 0 0' }}>
                    <CheckCircle size={12} /> Passwords match!
                  </p>
                )}
              </div>
            ))}

            <button type="submit" className="btn btn-primary" disabled={changingPass}
              style={{ width: '100%', marginTop: '6px', background: 'linear-gradient(135deg, #d97706, #b45309)', border: 'none' }}>
              <Lock size={15} /><span>{changingPass ? 'Updating Password...' : 'Update Password Securely'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Request Update Modal (Student Only) */}
      {showRequestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowRequestModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={20} />
            </button>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>📋 Request Profile Update</h3>
              <p style={{ color: '#64748b', fontSize: '0.83rem', margin: 0 }}>Fill in the details you want to update. Your request will be sent to Faculty / Admin for approval.</p>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#fef3c7', border: '1px solid #fde68a', marginBottom: '20px', fontSize: '0.8rem', color: '#92400e' }}>
              ⚠️ <strong>Note:</strong> You cannot submit another request until this one is reviewed. Be accurate with your information.
            </div>

            <form onSubmit={handleSubmitRequest}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
                  { label: 'Phone Number', key: 'phone', type: 'text', placeholder: '10-digit mobile number' },
                  { label: 'Guardian Name', key: 'guardianName', type: 'text', placeholder: "Parent/Guardian's name" },
                  { label: 'Guardian Phone', key: 'guardianPhone', type: 'text', placeholder: 'Guardian mobile number' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>{label}</label>
                    <input type={type} style={inputStyle} value={requestForm[key]} placeholder={placeholder}
                      onChange={e => setRequestForm({ ...requestForm, [key]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Gender</label>
                  <select style={inputStyle} value={requestForm.gender} onChange={e => setRequestForm({ ...requestForm, gender: e.target.value })}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Date of Birth</label>
                  <input type="date" style={inputStyle} value={requestForm.dob} onChange={e => setRequestForm({ ...requestForm, dob: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Address</label>
                  <input type="text" style={inputStyle} value={requestForm.address} placeholder="Full residential address" onChange={e => setRequestForm({ ...requestForm, address: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Reason for Update *</label>
                  <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={requestForm.reason} placeholder="e.g. Shifted to new address, got new phone number, name correction..." required
                    onChange={e => setRequestForm({ ...requestForm, reason: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowRequestModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submittingRequest} style={{
                  padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                  display: 'flex', alignItems: 'center', gap: '8px', opacity: submittingRequest ? 0.7 : 1,
                }}>
                  <Send size={14} />{submittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
