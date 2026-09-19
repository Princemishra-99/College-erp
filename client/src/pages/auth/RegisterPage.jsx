import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  GraduationCap, User, Mail, Lock, Phone, BookOpen,
  Eye, EyeOff, ArrowLeft, CheckCircle, RefreshCw, ShieldCheck,
  RotateCcw, KeyRound, Copy
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engg',
  'Information Technology',
  'Electronics & Comm',
  'Mechanical Engg',
  'Civil Engg',
];

const DESIGNATIONS = [
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Head of Department',
  'Lecturer',
];

const initialFormData = {
  name: '',
  email: '',
  password: '',
  phone: '',
  department: 'Computer Science & Engg',
  // Student
  enrollmentNo: '',
  semester: '1',
  section: 'A',
  guardianName: '',
  guardianPhone: '',
  address: '',
  gender: 'Male',
  batchYear: '2023-2027',
  // Faculty
  employeeId: '',
  designation: 'Assistant Professor',
  qualification: '',
  experienceYears: '0',
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Step: 'form' | 'otp' | 'success'
  const [step, setStep] = useState('form');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [devOtp, setDevOtp] = useState(''); // shown on page and received via API

  const [formData, setFormData] = useState({ ...initialFormData });

  const [otp, setOtp] = useState('');

  // Handle Role Switching - Clears/resets all form fields cleanly
  const handleRoleChange = (newRole) => {
    if (newRole === role) return;
    setRole(newRole);
    setFormData({
      ...initialFormData,
      department: newRole === 'faculty' ? DEPARTMENTS[0] : 'Computer Science & Engg',
    });
    setOtp('');
    setDevOtp('');
  };

  // Manual Clear/Reset Form
  const handleResetForm = () => {
    setFormData({ ...initialFormData });
    toast.success('Form cleared!');
  };

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpTimer]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast.error('Please fill all required fields first');
      return;
    }
    const cleanPhone = formData.phone.trim().replace(/^(\+91|0)/, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/send-register-otp', { email: formData.email });
      if (res.data.success) {
        toast.success(res.data.message || `OTP sent to ${formData.email}`);
        if (res.data.devOtp) {
          setDevOtp(res.data.devOtp);
          toast(`🔑 Verification OTP: ${res.data.devOtp}`, {
            icon: '🔑',
            style: { background: '#1e1b4b', color: '#c7d2fe', fontWeight: 700 },
            duration: 30000,
          });
        }
        setStep('otp');
        setOtpTimer(60);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP + Register ──────────────────────────────────────────
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        otp,
        role,
        semester: Number(formData.semester),
        experienceYears: Number(formData.experienceYears),
      };
      const res = await api.post('/auth/verify-and-register', payload);
      if (res.data.success) {
        if (res.data.requiresApproval) {
          setStep('faculty-pending');
          toast.success(res.data.message || 'Faculty registration submitted for Admin approval!');
        } else {
          authLogin(res.data.user, res.data.token);
          toast.success(res.data.message || 'Account created successfully!');
          const dest = role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard';
          navigate(dest, { replace: true });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please check OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '0.9rem', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box', color: '#0f172a',
    transition: 'border-color 0.2s',
  };

  const labelStyle = { fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '5px', display: 'block' };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(79,70,229,0.4)',
          }}>
            <GraduationCap size={30} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 900, margin: '0 0 6px 0' }}>
            Create Your Account
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            Join College ERP System with OTP Verification
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            {['Fill Details', 'Verify OTP'].map((label, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: (step === 'otp' ? i <= 1 : i === 0) ? '#4f46e5' : '#e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: (step === 'otp' ? i <= 1 : i === 0) ? '#fff' : '#94a3b8',
                    fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {step === 'otp' && i === 0 ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: (step === 'otp' ? i <= 1 : i === 0) ? '#4f46e5' : '#94a3b8' }}>{label}</span>
                </div>
                {i < 1 && <div style={{ flex: 1, height: '2px', background: step === 'otp' ? '#4f46e5' : '#e2e8f0', borderRadius: '1px' }} />}
              </React.Fragment>
            ))}
          </div>

          {step === 'form' && (
            <form onSubmit={handleSendOTP}>
              {/* Role Selector */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>I am a *</label>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6366f1',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 6px',
                      borderRadius: '6px',
                    }}
                    title="Clear all fields"
                  >
                    <RotateCcw size={12} /> Clear Form
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['student', 'faculty'].map((r) => (
                    <button key={r} type="button" onClick={() => handleRoleChange(r)} style={{
                      padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700,
                      fontSize: '0.9rem', textTransform: 'capitalize', transition: 'all 0.2s',
                      border: role === r ? '2px solid #4f46e5' : '2px solid #e2e8f0',
                      background: role === r ? '#eef2ff' : '#f8fafc',
                      color: role === r ? '#4f46e5' : '#64748b',
                    }}>
                      {r === 'student' ? '🎓 Student' : '👨‍🏫 Faculty'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="Dr. Rahul Sharma" required />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="you@college.edu" required />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} placeholder="9876543210" required />
                </div>
                <div>
                  <label style={labelStyle}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input name="password" type={showPass ? 'text' : 'password'} value={formData.password}
                      onChange={handleChange} style={{ ...inputStyle, paddingRight: '42px' }} placeholder="Min 6 characters" required />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Department *</label>
                  <select name="department" value={formData.department} onChange={handleChange} style={inputStyle}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Student-specific fields */}
              {role === 'student' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Enrollment Number *</label>
                    <input name="enrollmentNo" value={formData.enrollmentNo} onChange={handleChange} style={inputStyle} placeholder="2021CSE001" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Semester *</label>
                    <select name="semester" value={formData.semester} onChange={handleChange} style={inputStyle}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Section</label>
                    <input name="section" value={formData.section} onChange={handleChange} style={inputStyle} placeholder="A" maxLength={2} />
                  </div>
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Guardian Name *</label>
                    <input name="guardianName" value={formData.guardianName} onChange={handleChange} style={inputStyle} placeholder="Parent / Guardian full name" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Guardian Phone</label>
                    <input name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} style={inputStyle} placeholder="Guardian mobile number" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Address</label>
                    <input name="address" value={formData.address} onChange={handleChange} style={inputStyle} placeholder="Residential address" />
                  </div>
                </div>
              )}

              {/* Faculty-specific fields */}
              {role === 'faculty' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Employee ID *</label>
                    <input name="employeeId" value={formData.employeeId} onChange={handleChange} style={inputStyle} placeholder="FAC-CSE-003" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Designation *</label>
                    <select name="designation" value={formData.designation} onChange={handleChange} style={inputStyle}>
                      {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Qualification *</label>
                    <input name="qualification" value={formData.qualification} onChange={handleChange} style={inputStyle} placeholder="M.Tech in CSE, IIT Delhi" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Experience (Years)</label>
                    <input name="experienceYears" type="number" min="0" value={formData.experienceYears} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff',
                fontWeight: 800, fontSize: '0.95rem', marginTop: '8px',
                opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <Mail size={18} />
                {loading ? 'Sending OTP...' : 'Send OTP to Email →'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyAndRegister}>
              {/* OTP banner (Sent to Email & displayed on Screen) */}
              {devOtp && (
                <div style={{
                  padding: '16px 18px', borderRadius: '14px', marginBottom: '20px',
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                  border: '1.5px solid #6366f1',
                  boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)',
                  textAlign: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#c7d2fe', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    <KeyRound size={16} color="#a5b4fc" />
                    <span>6-Digit Verification OTP (Sent to Email & Screen):</span>
                  </div>
                  <div style={{ color: '#ffffff', fontSize: '2.3rem', fontWeight: 900, letterSpacing: '0.35em', fontFamily: 'monospace', textShadow: '0 2px 10px rgba(0,0,0,0.5)', margin: '4px 0 12px 0' }}>
                    {devOtp}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(devOtp);
                        toast.success('OTP auto-filled into form!');
                      }}
                      style={{
                        padding: '7px 16px', borderRadius: '8px', border: '1px solid #818cf8',
                        background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#ffffff',
                        fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
                      }}
                    >
                      <CheckCircle size={15} /> Auto-Fill OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(devOtp);
                        toast.success('OTP copied to clipboard!');
                      }}
                      style={{
                        padding: '7px 14px', borderRadius: '8px', border: '1px solid #475569',
                        background: 'rgba(255, 255, 255, 0.12)', color: '#cbd5e1',
                        fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      <Copy size={15} /> Copy
                    </button>
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📧</div>
                <h3 style={{ fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', fontSize: '1.2rem' }}>Check your Email</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                  We sent a 6-digit OTP to <strong>{formData.email}</strong>
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '4px 0 0 0' }}>
                  (Also provided above for instant verification)
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Enter 6-Digit OTP *</label>
                <input
                  type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ ...inputStyle, textAlign: 'center', fontSize: '2rem', fontWeight: 900, letterSpacing: '0.4em', padding: '16px' }}
                  placeholder="000000" maxLength={6} autoFocus
                />
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} style={{
                width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff',
                fontWeight: 800, fontSize: '0.95rem', marginBottom: '14px',
                opacity: (loading || otp.length !== 6) ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <ShieldCheck size={18} />
                {loading ? 'Verifying & Creating Account...' : 'Verify OTP & Create Account'}
              </button>

              {/* Resend OTP */}
              <div style={{ textAlign: 'center' }}>
                {otpTimer > 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.83rem' }}>
                    Resend OTP in <strong style={{ color: '#4f46e5' }}>{otpTimer}s</strong>
                  </p>
                ) : (
                  <button type="button" onClick={handleSendOTP} disabled={loading} style={{
                    background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto',
                  }}>
                    <RefreshCw size={14} /> Resend OTP
                  </button>
                )}
              </div>

              <button type="button" onClick={() => setStep('form')} style={{
                background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
                fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '6px', margin: '16px auto 0',
              }}>
                <ArrowLeft size={14} /> Back to form
              </button>
            </form>
          )}

          {/* Faculty Pending Approval Screen */}
          {step === 'faculty-pending' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: '2rem',
                border: '3px solid #f59e0b',
                boxShadow: '0 8px 24px rgba(245,158,11,0.25)'
              }}>
                ⏳
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                Registration Submitted!
              </h3>
              <div style={{
                background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px',
                padding: '16px', marginBottom: '24px', textAlign: 'left',
              }}>
                <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '6px', fontSize: '0.92rem' }}>
                  🛡️ Admin Approval Required
                </div>
                <p style={{ color: '#78350f', fontSize: '0.86rem', margin: 0, lineHeight: 1.5 }}>
                  Your faculty account has been registered with Employee ID: <strong>{formData.employeeId}</strong>.
                  For security reasons, newly registered faculty members must be reviewed and activated by College Administration before gaining access to the ERP system.
                </p>
              </div>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', padding: '13px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none', boxSizing: 'border-box'
              }}>
                Proceed to Login Page
              </Link>
            </div>
          )}

          {/* Login link */}
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>Sign In →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
