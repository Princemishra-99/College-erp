import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, CheckCircle, AlertCircle, Clock, Plus, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Payment Record Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Online (UPI/Card)');

  const fetchFees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/fees', { params });
      if (res.data.success) {
        setFees(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load fee ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [statusFilter]);

  const handleOpenPay = (fee) => {
    setSelectedFee(fee);
    setPayAmount(fee.dueAmount);
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedFee || !payAmount) return;

    try {
      const res = await api.post('/fees/pay', {
        feeId: selectedFee._id,
        amount: Number(payAmount),
        paymentMode,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setIsPayModalOpen(false);
        setSelectedFee(null);
        fetchFees();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      val || 0
    );
  };

  const filteredFees = fees.filter((f) => {
    if (!search) return true;
    const name = f.studentId?.userId?.name || '';
    const roll = f.studentId?.enrollmentNo || '';
    return name.toLowerCase().includes(search.toLowerCase()) || roll.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Tuition & Fee Ledger
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Monitor student fee clearance, outstanding balances, and issue official payment receipts.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <div style={{ flex: 1, maxWidth: '340px', position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by student name or roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', height: '42px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['', 'Paid', 'Partial', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              {st || 'All Statuses'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Student Roll No</th>
              <th>Student Name</th>
              <th>Semester</th>
              <th>Total Fee</th>
              <th>Paid Amount</th>
              <th>Due Amount</th>
              <th>Status</th>
              <th>Receipt Ref</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Loading fee ledger records...
                </td>
              </tr>
            ) : filteredFees.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No fee records found.
                </td>
              </tr>
            ) : (
              filteredFees.map((fee) => (
                <tr key={fee._id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#4f46e5' }}>
                      {fee.studentId?.enrollmentNo || 'N/A'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{fee.studentId?.userId?.name || 'N/A'}</td>
                  <td>Sem {fee.semester}</td>
                  <td>{formatCurrency(fee.totalAmount)}</td>
                  <td style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(fee.paidAmount)}</td>
                  <td style={{ color: fee.dueAmount > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                    {formatCurrency(fee.dueAmount)}
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
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{fee.receiptNo || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {fee.dueAmount > 0 && (
                      <button
                        onClick={() => handleOpenPay(fee)}
                        className="btn btn-outline-primary"
                        style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                      >
                        Record Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {isPayModalOpen && selectedFee && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Record Fee Payment</h3>
              <button onClick={() => setIsPayModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', background: '#f8fafc', marginBottom: '16px', fontSize: '0.85rem' }}>
              <div><strong>Student:</strong> {selectedFee.studentId?.userId?.name} ({selectedFee.studentId?.enrollmentNo})</div>
              <div><strong>Outstanding Balance:</strong> <span style={{ color: '#dc2626', fontWeight: 700 }}>{formatCurrency(selectedFee.dueAmount)}</span></div>
            </div>

            <form onSubmit={handleRecordPayment}>
              <div className="form-group">
                <label className="form-label">Payment Amount (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  max={selectedFee.dueAmount}
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Mode *</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="Online (UPI/Card)">Online (UPI/Card)</option>
                  <option value="Bank Demand Draft">Bank Demand Draft</option>
                  <option value="Cash">Cash</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsPayModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Process & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
