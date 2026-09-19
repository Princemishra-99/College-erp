import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Eye, EyeOff, KeyRound, RefreshCw, CheckCircle, X, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

// ─── Forgot Password OTP Modal ─────────────────────────────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [devOtp, setDevOtp] = useState('');

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (!email) { toast.error('Enter your registered email'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/send-reset-otp', { email });
      if (res.data.success) {
        toast.success(res.data.message);
        if (res.data.devOtp) {
          setDevOtp(res.data.devOtp);
          toast(`🔧 Dev Mode OTP: ${res.data.devOtp}`, { icon: '🔑', style: { background: '#1e1b4b', color: '#c7d2fe', fontWeight: 700 }, duration: 30000 });
        }
        setStep('otp');
        setTimer(60);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    if (!newPassword || newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-and-reset-password', { email, otp, newPassword });
      if (res.data.success) {
        toast.success(res.data.message);
        setStep('success');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Check OTP and try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '0.9rem', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box', color: '#0f172a',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '24px',
    }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔐</div>
          <h2 style={{ fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', fontSize: '1.2rem' }}>Reset Password</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Verify your email with OTP to reset your password securely</p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendOTP}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Registered Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="your@email.com" required autoFocus />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontWeight: 800, fontSize: '0.9rem',
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Sending OTP...' : '📧 Send Reset OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleResetPassword}>
            {devOtp && (
              <div style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                border: '1.5px solid #6366f1',
                borderRadius: '12px', padding: '14px', marginBottom: '16px', textAlign: 'center',
                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.25)',
              }}>
                <div style={{ color: '#c7d2fe', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <KeyRound size={15} color="#a5b4fc" />
                  <span>6-Digit OTP (Email & Screen):</span>
                </div>
                <div style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 900, letterSpacing: '0.3em', fontFamily: 'monospace', margin: '4px 0 10px 0' }}>{devOtp}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(devOtp);
                      toast.success('OTP auto-filled!');
                    }}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', border: '1px solid #818cf8',
                      background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#ffffff',
                      fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                    }}
                  >
                    <CheckCircle size={13} /> Auto-Fill OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(devOtp);
                      toast.success('OTP copied!');
                    }}
                    style={{
                      padding: '5px 10px', borderRadius: '6px', border: '1px solid #475569',
                      background: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1',
                      fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                    }}
                  >
                    <Copy size={13} /> Copy
                  </button>
                </div>
              </div>
            )}
            <p style={{ color: '#64748b', fontSize: '0.83rem', textAlign: 'center', marginBottom: '16px' }}>
              OTP sent to <strong>{email}</strong> (also shown above)
            </p>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>6-Digit OTP *</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ ...inputStyle, textAlign: 'center', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.4em', padding: '12px' }}
                placeholder="000000" maxLength={6} autoFocus />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>New Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '42px' }} placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Confirm New Password *</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="Repeat new password" />
              {newPassword && confirmPassword && newPassword === confirmPassword && (
                <p style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 0' }}>
                  <CheckCircle size={12} /> Passwords match!
                </p>
              )}
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', fontWeight: 800, fontSize: '0.9rem',
              opacity: loading ? 0.7 : 1, marginBottom: '10px',
            }}>
              {loading ? 'Resetting...' : '🔒 Reset Password'}
            </button>
            {timer > 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>Resend OTP in <strong style={{ color: '#4f46e5' }}>{timer}s</strong></p>
            ) : (
              <button type="button" onClick={handleSendOTP} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 700, fontSize: '0.83rem', margin: '0 auto' }}>
                <RefreshCw size={14} /> Resend OTP
              </button>
            )}
          </form>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
            <h3 style={{ color: '#059669', fontWeight: 800, margin: '0 0 8px 0' }}>Password Reset Successful!</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>You can now login with your new password.</p>
            <button onClick={onClose} style={{
              padding: '12px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontWeight: 800,
            }}>
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main LoginPage ─────────────────────────────────────────────────────────────
export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [pendingApproval, setPendingApproval] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) { toast.error('Please enter email and password'); return; }
    setPendingApproval(false);
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        if (res.user.role === 'admin') navigate('/admin/dashboard');
        else if (res.user.role === 'faculty') navigate('/faculty/dashboard');
        else navigate('/student/dashboard');
      } else {
        toast.error(res.message || 'Invalid login credentials');
      }
    } catch (err) {
      // Special case: faculty account pending admin approval
      if (err.response?.data?.pendingApproval) {
        setPendingApproval(true);
      } else {
        toast.error(err.response?.data?.message || 'Login failed. Please verify server is running.');
      }
    } finally { setLoading(false); }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.success(`Filled demo credentials: ${demoEmail}`);
  };

  return (
    <>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        padding: '24px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glows */}
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div style={{
          width: '100%', maxWidth: '460px',
          background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(16px)',
          borderRadius: '24px', padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', position: 'relative', zIndex: 10,
        }}>
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px', height: '56px', margin: '0 auto 14px auto', borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(79, 70, 229, 0.35)',
            }}>
              <GraduationCap size={32} color="#fff" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>College ERP System</h1>
            <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span>Powered by MERN & Sarvam Indic AI</span>
              <Sparkles size={14} color="#ec4899" />
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Registered Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input type="email" className="form-input" placeholder="name@college.edu"
                  value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: '42px' }} required />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <button type="button" onClick={() => setShowForgot(true)}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '42px', paddingRight: '42px' }} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '14px', top: '13px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginBottom: '16px' }} disabled={loading}>
              {loading ? 'Authenticating...' : <><span>Sign In to Dashboard</span><ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Pending Approval Banner (Faculty only) */}
          {pendingApproval && (
            <div style={{
              padding: '16px 18px', borderRadius: '14px', marginBottom: '16px',
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              border: '2px solid #fde68a',
            }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem' }}>⏳</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.9rem', marginBottom: '4px' }}>
                    Account Pending Admin Approval
                  </div>
                  <p style={{ color: '#b45309', fontSize: '0.8rem', margin: '0 0 6px 0', lineHeight: 1.5 }}>
                    Your faculty account has been created but requires <strong>Admin approval</strong> before you can login. Please contact your college admin and ask them to approve your account from the <em>Manage Faculty</em> page.
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>
                    📧 {email}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Register Link */}
          <div style={{
            textAlign: 'center', padding: '14px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
            border: '1.5px solid #c7d2fe', marginBottom: '20px',
          }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151' }}>
              New Student / Faculty?{' '}
              <Link to="/register" style={{ color: '#4f46e5', fontWeight: 800, textDecoration: 'none' }}>
                Register with OTP →
              </Link>
            </p>
          </div>

          {/* 1-Click Demo Login */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', textAlign: 'center', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Quick Demo Login (1-Click Fill)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button type="button" onClick={() => handleDemoFill('admin@college.edu', 'Admin@123')}
                className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '8px 6px', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>Dean/Admin</span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Full Control</span>
              </button>
              <button type="button" onClick={() => handleDemoFill('faculty.sharma@college.edu', 'Faculty@123')}
                className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '8px 6px', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>Faculty</span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Attendance</span>
              </button>
              <button type="button" onClick={() => handleDemoFill('rahul@student.edu', 'Student@123')}
                className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '8px 6px', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>Student</span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
