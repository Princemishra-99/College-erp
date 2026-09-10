import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, Download, CheckCircle, Clock, AlertCircle, X, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pay Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Online (UPI/Card)');
  const [submitting, setSubmitting] = useState(false);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const meRes = await api.get('/auth/me');
      const st = meRes.data.user.profile;
      setStudentInfo(st);

      if (st?._id) {
        const res = await api.get(`/fees/student/${st._id}`);
        if (res.data.success) {
          setFees(res.data.data);
          if (res.data.data[0]?.dueAmount > 0) {
            setPayAmount(res.data.data[0].dueAmount);
          }
        }
      }
    } catch (err) {
      toast.error('Failed to load fee ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!fees[0] || !payAmount) return;

    setSubmitting(true);
    try {
      const res = await api.post('/fees/pay', {
        feeId: fees[0]._id,
        amount: Number(payAmount),
        paymentMode,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setIsPayModalOpen(false);
        fetchFees();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadReceipt = (fee) => {
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(30, 27, 75);
      doc.rect(0, 0, 210, 32, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('COLLEGE OF ENGINEERING & TECHNOLOGY', 105, 14, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL TUITION FEE RECEIPT / PAYMENT ACKNOWLEDGMENT', 105, 22, { align: 'center' });

      // Receipt Meta
      const roll = studentInfo?.enrollmentNo || '23CSE001';
      const receipt = fee.receiptNo || `REC-2026-${roll}`;

      autoTable(doc, {
        startY: 42,
        theme: 'plain',
        body: [
          ['Receipt Number:', receipt, 'Payment Date:', new Date(fee.paymentDate || Date.now()).toLocaleDateString()],
          ['Student Roll No:', roll, 'Department:', studentInfo?.department || 'CSE'],
          ['Payment Mode:', fee.paymentMode || 'Online (UPI)', 'Academic Term:', `Semester ${fee.semester}`],
        ],
        styles: { fontSize: 9, cellPadding: 2 },
      });

      // Amount Breakdown
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [['Description / Fee Head', 'Total Prescribed (INR)', 'Amount Paid (INR)', 'Balance Due (INR)']],
        body: [
          ['Tuition & Academic Semester Fees', `Rs. ${fee.totalAmount}`, `Rs. ${fee.paidAmount}`, `Rs. ${fee.dueAmount}`],
          ['Library & Laboratory Services', 'Included', 'Included', 'Nil'],
        ],
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 4 },
      });

      const finalY = doc.lastAutoTable.finalY + 30;
      doc.setFontSize(9);
      doc.text('Authorized Finance Controller', 140, finalY);
      doc.text('* Computer generated receipt, requires no manual signature.', 14, finalY + 12);

      doc.save(`FeeReceipt_${receipt}.pdf`);
      toast.success('Fee receipt PDF downloaded!');
    } catch (err) {
      toast.error('Failed to generate fee receipt');
    }
  };

  const currentFee = fees[0];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Tuition Fees & Payments
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Official university tuition ledger, payment gateway, and receipt generator.
          </p>
        </div>

        {currentFee?.dueAmount > 0 && (
          <button onClick={() => setIsPayModalOpen(true)} className="btn btn-primary" style={{ gap: '8px' }}>
            <CreditCard size={18} />
            <span>Pay Semester Dues</span>
          </button>
        )}
      </div>

      {/* Fee Summary Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Prescribed Fee
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            ₹{currentFee?.totalAmount || 45000}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Semester {currentFee?.semester || 4} Tuition</div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Paid So Far
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', margin: '4px 0' }}>
            ₹{currentFee?.paidAmount || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#16a34a' }}>Cleared & Receipted</div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Remaining Dues
          </div>
          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: currentFee?.dueAmount > 0 ? '#dc2626' : '#16a34a',
              margin: '4px 0',
            }}
          >
            ₹{currentFee?.dueAmount || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Status: <strong style={{ color: currentFee?.status === 'Paid' ? '#16a34a' : '#dc2626' }}>{currentFee?.status || 'Pending'}</strong>
          </div>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Semester</th>
              <th>Academic Year</th>
              <th>Total Prescribed</th>
              <th>Amount Paid</th>
              <th>Due Balance</th>
              <th>Payment Status</th>
              <th>Receipt Ref</th>
              <th style={{ textAlign: 'right' }}>Official Receipt</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Loading fee ledger...
                </td>
              </tr>
            ) : fees.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No fee records found.
                </td>
              </tr>
            ) : (
              fees.map((fee) => (
                <tr key={fee._id}>
                  <td>Sem {fee.semester}</td>
                  <td>{fee.academicYear || '2025-2026'}</td>
                  <td>₹{fee.totalAmount}</td>
                  <td style={{ color: '#16a34a', fontWeight: 700 }}>₹{fee.paidAmount}</td>
                  <td style={{ color: fee.dueAmount > 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                    ₹{fee.dueAmount}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        fee.status === 'Paid'
                          ? 'badge-success'
                          : fee.status === 'Partial'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {fee.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{fee.receiptNo || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {fee.paidAmount > 0 ? (
                      <button
                        onClick={() => downloadReceipt(fee)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        <Download size={14} />
                        <span>Download PDF</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Unpaid</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Online Payment Simulator Modal */}
      {isPayModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#16a34a" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pay Tuition Fee Online</h3>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePay}>
              <div className="form-group">
                <label className="form-label">Payment Amount (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  min="1"
                  max={currentFee?.dueAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Payment Gateway *</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="Online (UPI/Card)">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Net Banking">Internet Banking (SBI / HDFC / ICICI)</option>
                  <option value="Debit Card">Debit / Credit Card</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsPayModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-success">
                  {submitting ? 'Processing...' : `Pay ₹${payAmount} & Generate Receipt`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
