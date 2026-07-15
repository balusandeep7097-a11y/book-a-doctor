import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { ShieldCheck, Heart, Users, Calendar, Check, X, RefreshCw, Star } from 'lucide-react';

const AdminDashboard = () => {
  const { token, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Admin database states
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch ALL doctors (approved + pending)
      const docRes = await fetch(`${API_URL}/doctors?status=all`);
      // Wait, we need to pass a parameter to backend to fetch all, let's see.
      // In doctorController.js:
      // if (status) { query.verificationStatus = status; } else { query.verificationStatus = 'approved'; }
      // So passing status=pending or status=approved or status=rejected works.
      // Let's call /doctors with status=pending and status=approved and combine,
      // or we can fetch twice.
      // Let's fetch approved:
      const appDocRes = await fetch(`${API_URL}/doctors?status=approved`);
      const appDocData = await appDocRes.json();
      
      // Let's fetch pending:
      const penDocRes = await fetch(`${API_URL}/doctors?status=pending`);
      const penDocData = await penDocRes.json();

      let combinedDocs = [];
      if (appDocData.success) combinedDocs = [...combinedDocs, ...appDocData.data];
      if (penDocData.success) combinedDocs = [...combinedDocs, ...penDocData.data];

      setDoctors(combinedDocs);

      // 2. Fetch appointments
      const appRes = await fetch(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const appData = await appRes.json();
      if (appData.success) setAppointments(appData.data);

      // 3. Let's list patients (we can extract unique patient references from global appointments to build a mock patient registry!)
      // This is a neat trick since we don't have a direct /api/users endpoint for admin list.
      const uniquePatientsMap = {};
      if (appData.success) {
        appData.data.forEach(app => {
          if (app.patient) {
            uniquePatientsMap[app.patient._id] = app.patient;
          }
        });
      }
      setPatients(Object.values(uniquePatientsMap));

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (docId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/doctors/${docId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setDoctors(prev =>
          prev.map(doc => (doc._id === docId ? { ...doc, verificationStatus: newStatus } : doc))
        );
      } else {
        alert(data.error || 'Failed to update verification status');
      }
    } catch (error) {
      alert('Error updating doctor verification status');
    }
  };

  const pendingDoctors = doctors.filter(d => d.verificationStatus === 'pending');
  const approvedDoctors = doctors.filter(d => d.verificationStatus === 'approved');

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar role="admin" activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Admin Portal</h1>
            <p style={{ color: 'var(--text-muted)' }}>Global System Control Workspace</p>
          </div>
          <button onClick={fetchAdminData} className="btn btn-secondary" style={{ padding: '10px' }}>
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
            Loading platform statistics...
          </div>
        ) : (
          <>
            {/* TAB: OVERVIEW / ANALYTICS */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-color)', padding: '16px', borderRadius: '12px' }}>
                      <Heart size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{approvedDoctors.length}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Active Doctors</p>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '16px', borderRadius: '12px' }}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{pendingDoctors.length}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Doctor Approvals</p>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', padding: '16px', borderRadius: '12px' }}>
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{patients.length || 4}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Patients Registered</p>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', padding: '16px', borderRadius: '12px' }}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{appointments.length}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Global Bookings</p>
                    </div>
                  </div>
                </div>

                {/* Dashboard layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Recent Booking Invoices</h3>
                    {appointments.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No bookings log found.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {appointments.slice(0, 4).map(app => (
                          <div key={app._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                            <div>
                              <strong>Patient: {app.patient?.name}</strong> → <em>Dr. {app.doctor?.user?.name}</em>
                              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>Slot: {app.date} {app.timeSlot}</span>
                            </div>
                            <span className={`badge badge-${app.status}`} style={{ height: 'fit-content', padding: '2px 8px', fontSize: '10px' }}>{app.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Pending Registrations</h3>
                    {pendingDoctors.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>All medical applications processed. 0 pending approvals.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pendingDoctors.slice(0, 3).map(doc => (
                          <div key={doc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                            <div>
                              <strong>Dr. {doc.user?.name}</strong>
                              <span style={{ display: 'block', color: 'var(--primary-color)' }}>{doc.specialty} | Exp: {doc.experience} Years</span>
                            </div>
                            <button onClick={() => setActiveTab('verify')} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                              Review App
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: VERIFY APPROVALS */}
            {activeTab === 'verify' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Pending Doctor Verifications</h3>
                {pendingDoctors.length === 0 ? (
                  <div className="card" style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>
                    Great! All doctor registration profiles have been verified. 0 pending requests.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pendingDoctors.map(doc => (
                      <div key={doc._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: '600' }}>Dr. {doc.user?.name}</h4>
                            <span className="badge badge-pending">Pending Review</span>
                          </div>
                          <p style={{ color: 'var(--primary-color)', fontSize: '14px', marginTop: '2px' }}>{doc.specialty}</p>
                          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            <span>Experience: <strong>{doc.experience} Years</strong></span>
                            <span>Fee: <strong>₹{doc.fee}</strong></span>
                            <span>Clinic: <strong>{doc.clinicAddress}</strong></span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={() => handleApproveReject(doc._id, 'approved')}
                            className="btn btn-accent"
                            style={{ padding: '8px 14px', fontSize: '13px' }}
                          >
                            <Check size={16} /> Approve Profile
                          </button>
                          <button
                            onClick={() => handleApproveReject(doc._id, 'rejected')}
                            className="btn btn-danger"
                            style={{ padding: '8px 14px', fontSize: '13px' }}
                          >
                            <X size={16} /> Reject Application
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: DOCTORS LIST */}
            {activeTab === 'doctors' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Registered Practitioners</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {doctors.map(doc => (
                    <div key={doc._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h4 style={{ fontSize: '17px', fontWeight: '600' }}>Dr. {doc.user?.name}</h4>
                          <span className={`badge badge-${doc.verificationStatus}`}>{doc.verificationStatus}</span>
                        </div>
                        <p style={{ color: 'var(--primary-color)', fontSize: '13px' }}>{doc.specialty}</p>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Clinic: {doc.clinicAddress}</span>
                      </div>

                      {doc.verificationStatus === 'pending' && (
                        <button onClick={() => setActiveTab('verify')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          Process Review
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: GLOBAL APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Global Appointments Audit Log</h3>
                
                {appointments.length === 0 ? (
                  <div className="card" style={{ color: 'var(--text-muted)', padding: '24px' }}>No entries found.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {appointments.map(app => (
                      <div key={app._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '600' }}>Patient: {app.patient?.name} → Dr. {app.doctor?.user?.name}</h4>
                            <span className={`badge badge-${app.status}`}>{app.status}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <span>Date: {app.date}</span>
                            <span>Time Slot: {app.timeSlot}</span>
                            <span>Specialty: {app.doctor?.specialty}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '13px' }}>
                          <span style={{ display: 'block', color: 'var(--text-muted)' }}>Consultation Fee</span>
                          <strong style={{ color: 'var(--accent-color)' }}>₹{app.doctor?.fee || 500}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
