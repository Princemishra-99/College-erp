import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Plus, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageAcademics = () => {
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    department: 'Computer Science & Engg',
    semester: 4,
    credits: 4,
    facultyId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, facRes] = await Promise.all([api.get('/academics/subjects'), api.get('/faculty')]);
      if (subRes.data.success) setSubjects(subRes.data.data);
      if (facRes.data.success) setFacultyList(facRes.data.data);
    } catch (err) {
      toast.error('Failed to load courses data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/academics/subjects', formData);
      if (res.data.success) {
        toast.success('Course created successfully');
        setIsAddModalOpen(false);
        setFormData({
          subjectCode: '',
          subjectName: '',
          department: 'Computer Science & Engg',
          semester: 4,
          credits: 4,
          facultyId: '',
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete subject ${name}?`)) {
      try {
        const res = await api.delete(`/academics/subjects/${id}`);
        if (res.data.success) {
          toast.success('Subject deleted');
          fetchData();
        }
      } catch (err) {
        toast.error('Failed to delete subject');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Curriculum & Subjects
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Configure accredited subjects, credit weights, semester mappings, and faculty course leads.
          </p>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Subject</span>
        </button>
      </div>

      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Subject Name</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Credits</th>
              <th>Assigned Faculty</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Loading subjects...
                </td>
              </tr>
            ) : subjects.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No subjects found. Click "Add New Subject" to create one.
                </td>
              </tr>
            ) : (
              subjects.map((sub) => (
                <tr key={sub._id}>
                  <td>
                    <span style={{ fontWeight: 800, color: '#4f46e5' }}>{sub.subjectCode}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{sub.subjectName}</td>
                  <td>{sub.department}</td>
                  <td>Sem {sub.semester}</td>
                  <td>
                    <span className="badge badge-info">{sub.credits} Credits</span>
                  </td>
                  <td>{sub.facultyId ? sub.facultyId.designation + ' ' + (sub.facultyId.userId?.name || '') : 'Unassigned'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(sub._id, sub.subjectName)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px' }}
                      title="Delete Subject"
                    >
                      <Trash2 size={15} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add Academic Subject</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubject}>
              <div className="form-group">
                <label className="form-label">Subject Code *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. CS405"
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Artificial Intelligence & Machine Learning"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
                  <label className="form-label">Semester *</label>
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
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Credit Points *</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="6"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Faculty Member</label>
                  <select
                    className="form-select"
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  >
                    <option value="">Select Faculty (Optional)</option>
                    {facultyList.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.userId?.name} ({f.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
