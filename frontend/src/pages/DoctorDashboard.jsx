import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Calendar, FileText, Check, X, Clipboard, Clock, Heart, Users, RefreshCw, AlertCircle } from 'lucide-react';

const DoctorDashboard = () => {
  const { token, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Doctor state
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);

  // Schedule manager states
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [slotsInput, setSlotsInput] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState('');

  // Prescription builder state
  const [selectedApp, setSelectedApp] = useState(null); // Appointment selected for prescription
  const [symptoms, setSymptoms] = useState('');
  const [medicines, setMedicines] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptionStatus, setPrescriptionStatus] = useState('');

  useEffect(() => {
    if (token) {
      fetchDoctorDashboard();
    }
  }, [token]);

  const fetchDoctorDashboard = async () => {
    setLoading(true);
    try {
      // 1. Fetch own doctor profile details
      const profRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profData = await profRes.json();
      if (profData.success) {
        setDoctorProfile(profData.data.doctor);
        // Default the schedule input to doctor's existing schedule for the selected day
        const matched = profData.data.doctor?.availability.find(a => a.day === selectedDay);
        setSlotsInput(matched ? matched.slots.join(', ') : '');
      }

      // 2. Fetch appointments
      const appRes = await fetch(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const appData = await appRes.json();
      if (appData.success) setAppointments(appData.data);

      // 3. Fetch shared documents
      const docRes = await fetch(`${API_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const docData = await docRes.json();
      if (docData.success) setSharedDocs(docData.data);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setAppointments(prev =>
          prev.map(app => (app._id === appId ? { ...app, status: newStatus } : app))
        );
      }
    } catch (error) {
      alert('Status update failed');
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setScheduleStatus('');
    
    // Parse slots
    const slotsArray = slotsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Update availability in doctorProfile object
    let updatedAvail = [...(doctorProfile?.availability || [])];
    const index = updatedAvail.findIndex(a => a.day === selectedDay);

    if (index >= 0) {
      updatedAvail[index] = { day: selectedDay, slots: slotsArray };
    } else {
      updatedAvail.push({ day: selectedDay, slots: slotsArray });
    }

    try {
      const response = await fetch(`${API_URL}/doctors/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ availability: updatedAvail })
      });
      const data = await response.json();
      if (data.success) {
        setDoctorProfile(data.data);
        setScheduleStatus('Schedule updated successfully!');
      } else {
        setScheduleStatus(data.error || 'Failed to update availability.');
      }
    } catch (error) {
      setScheduleStatus('Network error.');
    }
  };

  // Sync input on changing day dropdown
  useEffect(() => {
    if (doctorProfile) {
      const matched = doctorProfile.availability.find(a => a.day === selectedDay);
      setSlotsInput(matched ? matched.slots.join(', ') : '');
    }
  }, [selectedDay, doctorProfile]);

  const handleOpenPrescription = (app) => {
    setSelectedApp(app);
    setSymptoms(app.prescription?.symptoms || '');
    setMedicines(app.prescription?.medicines || '');
    setNotes(app.prescription?.notes || '');
    setPrescriptionStatus('');
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setPrescriptionStatus('');

    try {
      const response = await fetch(`${API_URL}/appointments/${selectedApp._id}/prescription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ symptoms, medicines, notes })
      });
      const data = await response.json();

      if (data.success) {
        setPrescriptionStatus('Prescription saved successfully! Consultation completed.');
        // Refresh appointments list
        const appRes = await fetch(`${API_URL}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const appData = await appRes.json();
        if (appData.success) setAppointments(appData.data);

        setTimeout(() => {
          setSelectedApp(null);
        }, 1200);
      } else {
        setPrescriptionStatus(data.error || 'Failed to submit prescription.');
      }
    } catch (err) {
      setPrescriptionStatus('Network connection error.');
    }
  };

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const upcomingCount = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar role="doctor" activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Doctor Workspace</h1>
            <p style={{ color: 'var(--text-muted)' }}>Status: {doctorProfile?.verificationStatus === 'approved' ? 'Active Practitioner' : 'Verification Pending'}</p>
          </div>
          <button onClick={fetchDoctorDashboard} className="btn btn-secondary" style={{ padding: '10px' }}>
            <RefreshCw size={18} />
          </button>
        </div>

        {doctorProfile?.verificationStatus !== 'approved' && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px'
          }}>
            <AlertCircle size={20} />
            <div>
              <strong>Verification Pending</strong>: Your medical profile is currently under review by our administrators. You will be able to receive booking queries once approved.
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
            Loading doctor metrics...
          </div>
        ) : (
          <>
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                {/* Stats cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', padding: '16px', borderRadius: '12px' }}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{upcomingCount}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Upcoming Sessions</p>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '16px', borderRadius: '12px' }}>
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{pendingCount}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Pending Requests</p>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-color)', padding: '16px', borderRadius: '12px' }}>
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{completedCount}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Consultations</p>
                    </div>
                  </div>
                </div>

                {/* Dashboard logs grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                  <div>
                    {/* Pending Requests List */}
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Pending Booking Requests</h3>
                    {appointments.filter(a => a.status === 'pending').length === 0 ? (
                      <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px', marginBottom: '32px' }}>
                        No pending booking requests.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                        {appointments.filter(a => a.status === 'pending').map(app => (
                          <div key={app._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ fontSize: '16px', fontWeight: '600' }}>Patient: {app.patient?.name}</h4>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email: {app.patient?.email}</p>
                              <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '13px', color: 'var(--primary-color)' }}>
                                <span>Date: <strong>{app.date}</strong></span>
                                <span>Time Slot: <strong>{app.timeSlot}</strong></span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleUpdateStatus(app._id, 'confirmed')} className="btn btn-accent" style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={14} /> Confirm
                              </button>
                              <button onClick={() => handleUpdateStatus(app._id, 'cancelled')} className="btn btn-danger" style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <X size={14} /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Upcoming Appointments</h3>
                    {appointments.filter(a => a.status === 'confirmed').length === 0 ? (
                      <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                        No confirmed appointments scheduled for today.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {appointments.filter(a => a.status === 'confirmed').slice(0, 3).map(app => (
                          <div key={app._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{app.patient?.name}</h4>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email: {app.patient?.email}</p>
                              <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '13px', color: 'var(--primary-color)' }}>
                                <span>Date: <strong>{app.date}</strong></span>
                                <span>Time Slot: <strong>{app.timeSlot}</strong></span>
                              </div>
                            </div>
                            <button onClick={() => handleOpenPrescription(app)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                              <Clipboard size={16} />
                              Consult/Prescribe
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card" style={{ height: 'fit-content' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Schedule Builder</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Update your work schedule days and time ranges so patients can browse and book available slots dynamically.
                      </p>
                      <button onClick={() => setActiveTab('schedule')} className="btn btn-secondary" style={{ width: '100%' }}>
                        Manage Hours
                      </button>
                    </div>

                    <div className="card" style={{ height: 'fit-content' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>My Profile Details</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
                        <div>
                          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Specialty</span>
                          <strong>{doctorProfile?.specialty || 'Not Configured'}</strong>
                        </div>
                        <div>
                          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Experience</span>
                          <strong>{doctorProfile?.experience || 0} Years</strong>
                        </div>
                        <div>
                          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Consultation Fee</span>
                          <strong style={{ color: 'var(--accent-color)' }}>₹{doctorProfile?.fee || 0}</strong>
                        </div>
                        <div>
                          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Clinic Location</span>
                          <strong>{doctorProfile?.clinicAddress || 'Not Configured'}</strong>
                        </div>
                        {doctorProfile?.bio && (
                          <div>
                            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Professional Bio</span>
                            <p style={{ margin: '4px 0 0 0', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '12.5px', lineHeight: '1.4' }}>
                              "{doctorProfile.bio}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Appointments Management</h3>
                
                {appointments.length === 0 ? (
                  <div className="card" style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>
                    No bookings found in the system for your profile.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {appointments.map(app => (
                      <div key={app._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h4 style={{ fontSize: '17px', fontWeight: '600' }}>Patient: {app.patient?.name}</h4>
                            <span className={`badge badge-${app.status}`}>{app.status}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            <span>Scheduled Date: <strong>{app.date}</strong></span>
                            <span>Time Slot: <strong>{app.timeSlot}</strong></span>
                          </div>
                          
                          {/* Display shared patient files matching doctor */}
                          {sharedDocs.filter(d => d.patient?._id === app.patient?._id).length > 0 && (
                            <div style={{ marginTop: '12px', fontSize: '13px' }}>
                              <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Attached Reports:</span>
                              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                                {sharedDocs.filter(d => d.patient?._id === app.patient?._id).map(doc => (
                                  <a
                                    key={doc._id}
                                    href={`http://localhost:5000${doc.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'white', background: 'var(--bg-primary)', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <FileText size={12} />
                                    {doc.fileName.substring(0, 15)}...
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          {app.status === 'pending' && (
                            <>
                              <button onClick={() => handleUpdateStatus(app._id, 'confirmed')} className="btn btn-accent" style={{ padding: '8px 14px', fontSize: '13px' }}>
                                <Check size={16} /> Confirm
                              </button>
                              <button onClick={() => handleUpdateStatus(app._id, 'cancelled')} className="btn btn-danger" style={{ padding: '8px 14px', fontSize: '13px' }}>
                                <X size={16} /> Reject
                              </button>
                            </>
                          )}
                          {app.status === 'confirmed' && (
                            <>
                              <button onClick={() => handleOpenPrescription(app)} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                                <Clipboard size={16} /> Consult Patient
                              </button>
                              <button onClick={() => handleUpdateStatus(app._id, 'cancelled')} className="btn btn-danger" style={{ padding: '8px 14px', fontSize: '13px' }}>
                                Cancel
                              </button>
                            </>
                          )}
                          {app.status === 'completed' && (
                            <button onClick={() => handleOpenPrescription(app)} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
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

            {/* TAB: SCHEDULE */}
            {activeTab === 'schedule' && (
              <div className="card animate-fade-in" style={{ maxWidth: '600px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Manage Slot Schedule</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  Define which days of the week you are available at your clinic, and specify the individual session times.
                </p>

                {scheduleStatus && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--accent-color)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '14px',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    {scheduleStatus}
                  </div>
                )}

                <form onSubmit={handleSaveSchedule}>
                  <div className="form-group">
                    <label className="form-label">Day of Week</label>
                    <select
                      className="form-input"
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      style={{ background: 'var(--bg-primary)' }}
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Availability Slots (Comma separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 09:00 AM, 10:00 AM, 11:30 AM, 02:00 PM"
                      value={slotsInput}
                      onChange={(e) => setSlotsInput(e.target.value)}
                    />
                    <small style={{ display: 'block', color: 'var(--text-muted)', marginTop: '8px', fontSize: '12px' }}>
                      Separate multiple slots with commas. Example: <em>10:00 AM, 11:00 AM, 03:30 PM</em>
                    </small>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                    Save Schedule Day
                  </button>
                </form>

                {/* Print Current Availability List */}
                <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Your Saved Availability Hours</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {doctorProfile?.availability.map(avail => (
                      <div key={avail.day} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '14px' }}>
                        <strong>{avail.day}</strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {avail.slots.length > 0 ? avail.slots.join(' | ') : 'No hours added'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MY CONSULTATIONS */}
            {activeTab === 'patients' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Your Consultation Log</h3>
                
                {appointments.filter(a => a.status === 'completed').length === 0 ? (
                  <div className="card" style={{ color: 'var(--text-muted)', padding: '24px' }}>
                    No completed patient diagnostic sessions recorded.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {appointments.filter(a => a.status === 'completed').map(app => (
                      <div key={app._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                          <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '600' }}>Patient: {app.patient?.name}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date of Call: {app.date} | Slot: {app.timeSlot}</span>
                          </div>
                          <span className="badge badge-completed">Completed</span>
                        </div>
                        {app.prescription && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                            <div>
                              <strong>Symptoms:</strong>
                              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{app.prescription.symptoms || 'None specified.'}</p>
                            </div>
                            <div>
                              <strong>Medicines Prescribed:</strong>
                              <p style={{ color: 'var(--accent-color)', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{app.prescription.medicines || 'None prescribed.'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Consultation Modal (Prescription Writer) */}
      {selectedApp && (
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
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '550px', background: 'var(--bg-secondary)' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Write Medical Prescription</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Patient: {selectedApp.patient?.name} | Date: {selectedApp.date}</p>
            </div>

            {prescriptionStatus && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--accent-color)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {prescriptionStatus}
              </div>
            )}

            <form onSubmit={handleSubmitPrescription}>
              <div className="form-group">
                <label className="form-label">Symptoms & Diagnosis</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Mild fever, dry cough, throat irritation"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Medicines & Instructions (Dosage)</label>
                <textarea
                  className="form-input"
                  required
                  rows="4"
                  placeholder="e.g. Paracetamol 650mg - twice daily after food for 3 days"
                  value={medicines}
                  onChange={(e) => setMedicines(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Consultation Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Drink plenty of warm fluids. Return checkup in a week if fever persists."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-accent"
                >
                  Save & Complete Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
