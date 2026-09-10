import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Plus, Search, Filter, Trash2, Eye, X, CheckCircle, AlertTriangle, Pencil, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageStudents = () => {
  const { role } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewStudentProfile, setViewStudentProfile] = useState(null);
  // Edit modal state
  const [editStudent, setEditStudent] = useState(null); // null = closed, object = student to edit
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    enrollmentNo: '',
    department: 'Computer Science & Engg',
    semester: 4,
    section: 'A',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    password: 'Student@123',
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept) params.department = selectedDept;
      if (selectedSem) params.semester = selectedSem;
      if (search) params.search = search;

      const res = await api.get('/students', { params });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load students list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedDept, selectedSem, search]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/students', formData);
      if (res.data.success) {
        toast.success('Student registered successfully!');
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          email: '',
          enrollmentNo: '',
          department: 'Computer Science & Engg',
          semester: 4,
          section: 'A',
          phone: '',
          guardianName: '',
          guardianPhone: '',
          address: '',
          password: 'Student@123',
        });
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create student');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}? This will delete all academic records.`)) {
      try {
        const res = await api.delete(`/students/${id}`);
        if (res.data.success) {
          toast.success('Student deleted');
          fetchStudents();
        }
      } catch (err) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleViewProfile = async (id) => {
    try {
      const res = await api.get(`/students/${id}`);
      if (res.data.success) {
        setViewStudentProfile(res.data.data);
      }
    } catch (err) {
      toast.error('Could not load academic profile');
    }
  };

  const handleOpenEdit = (student) => {
    setEditStudent(student);
    setEditForm({
      name: student.userId?.name || '',
      department: student.department,
      semester: student.semester,
      section: student.section,
      phone: student.phone,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone || '',
      address: student.address || '',
      gender: student.gender || 'Male',
    });
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editStudent) return;
    setEditLoading(true);
    try {
      const res = await api.put(`/students/${editStudent._id}`, editForm);
      if (res.data.success) {
        toast.success('Student details updated successfully!');
        setEditStudent(null);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            {role === 'faculty' ? 'Student Directory & Records' : 'Student Registry & Admissions'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            {role === 'faculty'
              ? 'View student records, contact profiles, and edit academic details.'
              : 'Manage enrollment, batch allocations, contact profiles, and academic status.'}
          </p>
        </div>

        {role === 'admin' && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>New Student Admission</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, roll no, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', height: '42px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ height: '42px', minWidth: '180px' }}
          >
            <option value="">All Departments</option>
            <option value="Computer Science & Engg">Computer Science & Engg</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Comm">Electronics & Comm</option>
            <option value="Mechanical Engg">Mechanical Engg</option>
          </select>

          <select
            className="form-select"
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            style={{ height: '42px', minWidth: '130px' }}
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Sem {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Enrollment No</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>Semester & Sec</th>
              <th>Contact Phone</th>
              <th>Guardian</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Loading students records...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No students found matching the selected filter.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s._id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#4f46e5' }}>{s.enrollmentNo}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.userId?.name || 'N/A'}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{s.userId?.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{s.department}</span>
                  </td>
                  <td>
                    Sem {s.semester} (Sec {s.section})
                  </td>
                  <td>{s.phone}</td>
                  <td>{s.guardianName}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => handleViewProfile(s._id)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        title="View Full Profile"
                      >
                        <Eye size={15} color="#4f46e5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        title="Edit Student Details"
                      >
                        <Pencil size={15} color="#059669" />
                      </button>
                      {role === 'admin' && (
                        <button
                          onClick={() => handleDelete(s._id, s.userId?.name)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          title="Delete Student"
                        >
                          <Trash2 size={15} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Student Admission Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>New Student Admission</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent}>
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
                  <label className="form-label">Enrollment / Roll No *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. 23CSE010"
                    value={formData.enrollmentNo}
                    onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
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
                  <label className="form-label">Semester & Section *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="form-select"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Sem {s}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Sec"
                      style={{ width: '70px' }}
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Guardian / Parent Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Guardian Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile & Academic Details Modal */}
      {viewStudentProfile && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {viewStudentProfile.student.userId?.name}
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Enrollment: {viewStudentProfile.student.enrollmentNo}
                </span>
              </div>
              <button onClick={() => setViewStudentProfile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Academic Overview Quick Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ATTENDANCE AVERAGE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: viewStudentProfile.academicSummary.attendancePercentage < 75 ? '#dc2626' : '#16a34a' }}>
                  {viewStudentProfile.academicSummary.attendancePercentage}%
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {viewStudentProfile.academicSummary.attendedClasses} / {viewStudentProfile.academicSummary.totalClasses} classes attended
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>DEPARTMENT & BRANCH</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {viewStudentProfile.student.department}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Semester {viewStudentProfile.student.semester} - Section {viewStudentProfile.student.section}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Email:</strong> {viewStudentProfile.student.userId?.email}</div>
              <div><strong>Phone:</strong> {viewStudentProfile.student.phone}</div>
              <div><strong>Guardian:</strong> {viewStudentProfile.student.guardianName} ({viewStudentProfile.student.guardianPhone || 'N/A'})</div>
              <div><strong>Batch Year:</strong> {viewStudentProfile.student.batchYear}</div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button onClick={() => setViewStudentProfile(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Student Modal */}
      {editStudent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 2px 0' }}>✏️ Edit Student Details</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Enrollment: {editStudent.enrollmentNo}</span>
              </div>
              <button onClick={() => setEditStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateStudent}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-input" required value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input type="text" className="form-input" required value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-select" value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })}>
                    <option>Computer Science & Engg</option>
                    <option>Information Technology</option>
                    <option>Electronics & Comm</option>
                    <option>Mechanical Engg</option>
                    <option>Civil Engg</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select className="form-select" value={editForm.semester} onChange={e => setEditForm({ ...editForm, semester: Number(e.target.value) })}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input type="text" className="form-input" value={editForm.section} maxLength={2}
                    onChange={e => setEditForm({ ...editForm, section: e.target.value.toUpperCase() })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Guardian Name *</label>
                  <input type="text" className="form-input" required value={editForm.guardianName}
                    onChange={e => setEditForm({ ...editForm, guardianName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Guardian Phone</label>
                  <input type="text" className="form-input" value={editForm.guardianPhone}
                    onChange={e => setEditForm({ ...editForm, guardianPhone: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address</label>
                  <input type="text" className="form-input" value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setEditStudent(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  <Save size={15} />
                  <span>{editLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
