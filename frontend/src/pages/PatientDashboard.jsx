import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Calendar, FileText, UploadCloud, User, AlertCircle, HeartPulse, CheckCircle2, RefreshCw, XCircle, Mail } from 'lucide-react';

const PatientDashboard = () => {
  const { user, token, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Document upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetDoctorId, setTargetDoctorId] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

  // View prescription modal state
  const [activePrescription, setActivePrescription] = useState(null);

  // Email state
  const [emailStatus, setEmailStatus] = useState({ id: '', message: '', type: '' });

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch appointments
      const appRes = await fetch(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const appData = await appRes.json();
      if (appData.success) setAppointments(appData.data);

      // 2. Fetch medical records
      const docRes = await fetch(`${API_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const docData = await docRes.json();
      if (docData.success) setDocuments(docData.data);

      // 3. Fetch doctors list (for file sharing dropdown)
      const docListRes = await fetch(`${API_URL}/doctors?status=approved`);
      const docListData = await docListRes.json();
      if (docListData.success) setDoctorsList(docListData.data);

    } catch (error) {
      console.error('Error loading dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const response = await fetch(`${API_URL}/appointments/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      const data = await response.json();
      if (data.success) {
        setAppointments(prev =>
          prev.map(app => (app._id === appId ? { ...app, status: 'cancelled' } : app))
        );
      } else {
        alert(data.error || 'Failed to cancel appointment');
      }
    } catch (e) {
      alert('Failed to update booking status.');
    }
  };

  const handleSendEmail = async (appId) => {
    setEmailStatus({ id: appId, message: 'Sending...', type: 'pending' });
    try {
      const response = await fetch(`${API_URL}/appointments/${appId}/send-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEmailStatus({ id: appId, message: 'Sent!', type: 'success' });
        setTimeout(() => setEmailStatus({ id: '', message: '', type: '' }), 2000);
      } else {
        setEmailStatus({ id: appId, message: data.error || 'Failed', type: 'error' });
        setTimeout(() => setEmailStatus({ id: '', message: '', type: '' }), 3000);
      }
    } catch (err) {
      setEmailStatus({ id: appId, message: 'Error', type: 'error' });
      setTimeout(() => setEmailStatus({ id: '', message: '', type: '' }), 3000);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadStatus({ type: '', message: '' });
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadStatus({ type: 'error', message: 'Please select a file to upload.' });
      return;
    }

    setUploadLoading(true);
    setUploadStatus({ type: '', message: '' });

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (targetDoctorId) {
      formData.append('doctorId', targetDoctorId);
    }

    try {
      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        setUploadStatus({ type: 'success', message: 'Medical document uploaded and shared successfully!' });
        setSelectedFile(null);
        setTargetDoctorId('');
        // Refresh documents list
        const refreshedDocs = await fetch(`${API_URL}/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const refData = await refreshedDocs.json();
        if (refData.success) setDocuments(refData.data);
      } else {
        setUploadStatus({ type: 'error', message: data.error || 'Upload failed.' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Network connection failed.' });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Delete this medical report?')) return;

    try {
      const response = await fetch(`${API_URL}/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(prev => prev.filter(doc => doc._id !== docId));
      }
    } catch (error) {
      alert('Delete operation failed.');
    }
  };

  const upcomingVisits = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const pastVisits = appointments.filter(a => ['completed', 'cancelled'].includes(a.status));

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar role="patient" activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Patient Workspace</h1>
            <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}</p>
          </div>
          <button onClick={fetchDashboardData} className="btn btn-secondary" style={{ padding: '10px' }}>
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
            Loading patient records...
          </div>
        ) : (
          <>
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                {/* Highlights row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', padding: '16px', borderRadius: '12px' }}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{upcomingVisits.length}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Upcoming Bookings</p>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-color)', padding: '16px', borderRadius: '12px' }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{documents.length}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Uploaded Reports</p>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', padding: '16px', borderRadius: '12px' }}>
                      <HeartPulse size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: '800' }}>Active</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Account Status</p>
                    </div>
                  </div>
                </div>

                {/* Main banner & latest appointments */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Scheduled Consultations</h3>
                    {upcomingVisits.length === 0 ? (
                      <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                        No upcoming sessions locked. Click "Find Doctors" in navigation to request a slot!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {upcomingVisits.slice(0, 3).map(app => (
                          <div key={app._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ fontSize: '16px', fontWeight: '600' }}>Dr. {app.doctor?.user?.name || 'Practitioner'}</h4>
                              <p style={{ fontSize: '13px', color: 'var(--primary-color)', fontWeight: '500' }}>{app.doctor?.specialty}</p>
                              <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <span>Date: <strong>{app.date}</strong></span>
                                <span>Slot: <strong>{app.timeSlot}</strong></span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                              <span className={`badge badge-${app.status}`}>{app.status}</span>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {emailStatus.id === app._id ? (
                                  <span style={{ fontSize: '12.5px', color: emailStatus.type === 'success' ? 'var(--accent-color)' : emailStatus.type === 'error' ? 'var(--error-color)' : 'var(--primary-color)', fontWeight: '600' }}>
                                    {emailStatus.message}
                                  </span>
                                ) : (
                                  <button onClick={() => handleSendEmail(app._id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Mail size={12} /> Email
                                  </button>
                                )}
                                <button onClick={() => handleCancelAppointment(app._id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="card" style={{ height: 'fit-content' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Medical Notice</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      Ensure you upload your past prescriptions and medical diagnostics prior to your scheduled calls. Doctors need access to files for comprehensive consultations.
                    </p>
                    <button onClick={() => setActiveTab('records')} className="btn btn-primary" style={{ width: '100%', fontSize: '13px' }}>
                      <UploadCloud size={16} />
                      Upload Records
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Your Appointments</h3>

                <h4 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '16px', marginTop: '20px' }}>Active & Upcoming</h4>
                {upcomingVisits.length === 0 ? (
                  <div className="card" style={{ color: 'var(--text-muted)', padding: '24px', marginBottom: '32px' }}>No pending or confirmed appointments found.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    {upcomingVisits.map(app => (
                      <div key={app._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: '600' }}>Dr. {app.doctor?.user?.name}</h4>
                          <p style={{ fontSize: '13px', color: 'var(--primary-color)' }}>{app.doctor?.specialty}</p>
                          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            <span>Scheduled: <strong>{app.date}</strong></span>
                            <span>Time: <strong>{app.timeSlot}</strong></span>
                            <span>Clinic: <strong>{app.doctor?.clinicAddress}</strong></span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span className={`badge badge-${app.status}`}>{app.status}</span>
                          {emailStatus.id === app._id ? (
                            <span style={{ fontSize: '12.5px', color: emailStatus.type === 'success' ? 'var(--accent-color)' : emailStatus.type === 'error' ? 'var(--error-color)' : 'var(--primary-color)', fontWeight: '600' }}>
                              {emailStatus.message}
                            </span>
                          ) : (
                            <button onClick={() => handleSendEmail(app._id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={12} /> Email Details
                            </button>
                          )}
                          <button onClick={() => handleCancelAppointment(app._id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            Cancel Booking
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h4 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '16px' }}>Past Consultations</h4>
                {pastVisits.length === 0 ? (
                  <div className="card" style={{ color: 'var(--text-muted)', padding: '24px' }}>No previous logs found.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pastVisits.map(app => (
                      <div key={app._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: '600' }}>Dr. {app.doctor?.user?.name}</h4>
                          <p style={{ fontSize: '13px', color: 'var(--primary-color)' }}>{app.doctor?.specialty}</p>
                          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            <span>Visited: <strong>{app.date}</strong></span>
                            <span>Slot: <strong>{app.timeSlot}</strong></span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span className={`badge badge-${app.status}`}>{app.status}</span>
                          {emailStatus.id === app._id ? (
                            <span style={{ fontSize: '12.5px', color: emailStatus.type === 'success' ? 'var(--accent-color)' : emailStatus.type === 'error' ? 'var(--error-color)' : 'var(--primary-color)', fontWeight: '600' }}>
                              {emailStatus.message}
                            </span>
                          ) : (
                            <button onClick={() => handleSendEmail(app._id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={12} /> Email Details
                            </button>
                          )}
                          {app.status === 'completed' && app.prescription && (
                            <button
                              onClick={() => setActivePrescription(app.prescription)}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              View Prescription
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: MEDICAL REPORTS */}
            {activeTab === 'records' && (
              <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                {/* Upload Section */}
                <div>
                  <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Upload Medical PDF</h3>
                    
                    {uploadStatus.message && (
                      <div style={{
                        background: uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: uploadStatus.type === 'success' ? 'var(--accent-color)' : 'var(--error-color)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '13px',
                        border: `1px solid ${uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                      }}>
                        {uploadStatus.message}
                      </div>
                    )}

                    <form onSubmit={handleFileUpload}>
                      <div className="form-group">
                        <label className="form-label">Select Report (PDF, PNG, JPG)</label>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="form-input"
                          onChange={handleFileChange}
                          style={{ padding: '10px' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Share directly with doctor (Optional)</label>
                        <select
                          className="form-input"
                          style={{ background: 'var(--bg-primary)' }}
                          value={targetDoctorId}
                          onChange={(e) => setTargetDoctorId(e.target.value)}
                        >
                          <option value="">Do not share (Keep private)</option>
                          {doctorsList.map(doc => (
                            <option key={doc._id} value={doc._id}>Dr. {doc.user?.name} ({doc.specialty})</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '10px' }}
                        disabled={uploadLoading || !selectedFile}
                      >
                        {uploadLoading ? 'Uploading File...' : 'Upload & Send'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* List Section */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Your Saved Documents</h3>
                  {documents.length === 0 ? (
                    <div className="card" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                      No medical reports uploaded yet. Upload a diagnostic file using the left panel.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {documents.map(doc => (
                        <div key={doc._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', padding: '12px', borderRadius: '10px' }}>
                              <FileText size={20} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '15px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px', whiteSpace: 'nowrap' }}>
                                {doc.fileName}
                              </h4>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Shared: {doc.doctor ? `Dr. ${doc.doctor.user?.name}` : 'Private'}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '12px' }}>
                            <a
                              href={`http://localhost:5000${doc.fileUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
                            >
                              Open File
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(doc._id)}
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="card animate-fade-in" style={{ maxWidth: '600px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Account Settings</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '32px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={36} color="var(--primary-color)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '600' }}>{user?.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Registered Email: {user?.email}</p>
                    <span className="badge badge-approved" style={{ marginTop: '8px' }}>Active Account</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  <p>Profile details updates are managed through the database sync. Please contact system support for any credential adjustments.</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Prescription Modal */}
      {activePrescription && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-secondary)' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>Medical Prescription</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Issued: {new Date(activePrescription.dateAdded).toLocaleDateString()}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Symptoms Diagnosed</span>
                <p style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '14px' }}>
                  {activePrescription.symptoms || 'No symptoms specified.'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Prescribed Medicines & Dosage</span>
                <p style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                  {activePrescription.medicines || 'No medicines added.'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Doctor Consultation Notes</span>
                <p style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '14px' }}>
                  {activePrescription.notes || 'No notes added.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button onClick={() => setActivePrescription(null)} className="btn btn-primary">
                Close Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
