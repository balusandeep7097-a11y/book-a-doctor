import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Calendar, MapPin, Award, Star, BookOpen, Clock, CheckCircle, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

const specialties = [
  'Anesthesiology',
  'Bariatrics',
  'Cardiac Sciences',
  'Cardiologist',
  'Cosmetology & Plastic Surgery',
  'Critical Care',
  'Critical Care & Emergency Medicine',
  'Dentist',
  'Dentistry',
  'Dermatologist',
  'Dermatology',
  'Dietician and Nutrition',
  'General Practitioner',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
  'Psychiatrist'
];

const DoctorSearch = () => {
  const [searchParams] = useSearchParams();
  const { token, user, API_URL } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [maxFee, setMaxFee] = useState('2000');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  // Collapse/Expand states
  const [isSpecialtyExpanded, setIsSpecialtyExpanded] = useState(true);
  const [isCityExpanded, setIsCityExpanded] = useState(true);

  // Booking states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  // Sync initial URL specialty if present
  useEffect(() => {
    const urlSpec = searchParams.get('specialty');
    if (urlSpec) {
      setSelectedSpecialties(urlSpec.split(','));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialties, maxFee, selectedCity]); // Re-fetch on filter change

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/doctors?status=approved`;
      if (selectedSpecialties.length > 0) {
        url += `&specialty=${encodeURIComponent(selectedSpecialties.join(','))}`;
      }
      if (maxFee) {
        url += `&maxFee=${maxFee}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        let filtered = data.data;
        if (search) {
          const regex = new RegExp(search, 'i');
          filtered = filtered.filter(doc => 
            (doc.user && regex.test(doc.user.name)) ||
            regex.test(doc.specialty) ||
            regex.test(doc.clinicAddress)
          );
        }
        if (selectedCity && selectedCity !== 'All Cities') {
          const regex = new RegExp(selectedCity, 'i');
          filtered = filtered.filter(doc => regex.test(doc.clinicAddress));
        }
        setDoctors(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const openBookingModal = (doc) => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'patient') {
      alert('Only patient accounts can schedule appointments!');
      return;
    }
    setSelectedDoctor(doc);
    setSelectedDate('');
    setSelectedSlot('');
    setBookingMessage({ type: '', text: '' });
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedSlot) {
      setBookingMessage({ type: 'error', text: 'Please select a date and an available slot' });
      return;
    }

    setBookingLoading(true);
    setBookingMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          date: selectedDate,
          timeSlot: selectedSlot
        })
      });

      const data = await response.json();

      if (data.success) {
        setBookingMessage({ type: 'success', text: 'Appointment booked successfully! Redirecting...' });
        setTimeout(() => {
          setSelectedDoctor(null);
          navigate('/dashboard/patient');
        }, 1500);
      } else {
        setBookingMessage({ type: 'error', text: data.error || 'Failed to book appointment' });
      }
    } catch (error) {
      setBookingMessage({ type: 'error', text: 'Network error. Try again later.' });
    } finally {
      setBookingLoading(false);
    }
  };

  // Helper: get slots for a specific date (mock days of the week matching doctor availability)
  const getAvailableSlotsForDate = () => {
    if (!selectedDoctor || !selectedDate) return [];
    
    // Split date string YYYY-MM-DD to avoid timezone shifting
    const parts = selectedDate.split('-');
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = days[dateObj.getDay()];

    // Find if doctor has availability for this day
    const availabilityObj = selectedDoctor.availability.find(
      a => a.day.toLowerCase() === selectedDayName.toLowerCase()
    );

    return availabilityObj ? availabilityObj.slots : [];
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px', minHeight: '80vh' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Find Registered Doctors</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Browse through certified medical professionals and book instantly.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
        {/* Filters Sidebar */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          height: 'fit-content'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={16} color="var(--primary-color)" />
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Filter By</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedSpecialties([]);
                setSpecialtySearch('');
                setSelectedCity('All Cities');
                setSearch('');
                setMaxFee('2000');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-color)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Clear All
            </button>
          </div>

          <form onSubmit={handleSearchSubmit}>
            {/* Search Doctor Name */}
            <div className="form-group">
              <label className="form-label">Doctor Name</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search doctor..."
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Specialty Checkboxes */}
            <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div
                onClick={() => setIsSpecialtyExpanded(!isSpecialtyExpanded)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '12px' }}
              >
                <span className="form-label" style={{ margin: 0, color: 'var(--text-main)', fontWeight: '600' }}>Speciality</span>
                {isSpecialtyExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {isSpecialtyExpanded && (
                <div className="animate-fade-in">
                  {/* Search Specialty Box */}
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search Specialty"
                      value={specialtySearch}
                      onChange={(e) => setSpecialtySearch(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '34px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px', borderRadius: '8px', height: '36px' }}
                    />
                  </div>

                  {/* Scrollable Specialties Checkbox List */}
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    paddingRight: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {specialties
                      .filter(spec => spec.toLowerCase().includes(specialtySearch.toLowerCase()))
                      .map(spec => (
                        <label
                          key={spec}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '6px 0',
                            cursor: 'pointer',
                            fontSize: '13.5px',
                            color: selectedSpecialties.includes(spec) ? 'var(--text-main)' : 'var(--text-muted)'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSpecialties.includes(spec)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSpecialties(prev => [...prev, spec]);
                              } else {
                                setSelectedSpecialties(prev => prev.filter(s => s !== spec));
                              }
                            }}
                            style={{
                              width: '15px',
                              height: '15px',
                              accentColor: 'var(--primary-color)',
                              cursor: 'pointer'
                            }}
                          />
                          <span>{spec}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* City Dropdown */}
            <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div
                onClick={() => setIsCityExpanded(!isCityExpanded)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '12px' }}
              >
                <span className="form-label" style={{ margin: 0, color: 'var(--text-main)', fontWeight: '600' }}>City</span>
                {isCityExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {isCityExpanded && (
                <select
                  className="form-input"
                  style={{ background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '13.5px', height: '38px' }}
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="All Cities">All Cities</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Pune">Pune</option>
                </select>
              )}
            </div>

            {/* Fee Range Slider */}
            <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: 'var(--text-main)' }}>
                <span>Max Fee</span>
                <span style={{ color: 'var(--accent-color)', fontWeight: '700' }}>₹{maxFee}</span>
              </label>
              <input
                type="range"
                min="100"
                max="2500"
                step="100"
                className="form-input"
                style={{ padding: 0, height: '6px', cursor: 'pointer' }}
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                marginTop: '24px', 
                padding: '12px', 
                fontWeight: '700',
                fontSize: '14px',
                borderRadius: '8px'
              }}
            >
              Search Doctors
            </button>
          </form>
        </div>

        {/* Doctors Grid/List */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
              Loading qualified doctors list...
            </div>
          ) : doctors.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
              No doctors found matching the search criteria. Try modifying your filters.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {doctors.map(doc => (
                <div key={doc._id} className="card" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {/* Left avatar */}
                  {doc.user?.avatar ? (
                    <img
                      src={doc.user.avatar}
                      alt={doc.user.name}
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '16px',
                        objectFit: 'cover',
                        border: '1.5px solid var(--border-color)',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '16px',
                      background: 'var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '32px',
                      color: 'var(--primary-color)',
                      flexShrink: 0
                    }}>
                      {doc.user?.name ? doc.user.name.charAt(0) : 'D'}
                    </div>
                  )}

                  {/* Details */}
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Dr. {doc.user?.name}</h3>
                          <span className="badge badge-approved" style={{ fontSize: '10px', padding: '2px 8px' }}>Verified</span>
                        </div>
                        <p style={{ color: 'var(--primary-color)', fontWeight: '600', fontSize: '15px', marginTop: '2px' }}>{doc.specialty}</p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Consultation Fee</span>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-color)' }}>₹{doc.fee}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', marginTop: '16px', flexWrap: 'wrap', fontSize: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={16} color="var(--primary-color)" />
                        <span><strong>{doc.experience} Years</strong> Experience</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} color="var(--primary-color)" />
                        <span>{doc.clinicAddress}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Star size={16} color="#f59e0b" fill="#f59e0b" />
                        <span><strong>{doc.rating}</strong> ({doc.reviewsCount} reviews)</span>
                      </div>
                    </div>

                    {/* Bio */}
                    {doc.bio && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px', lineBreak: 'anywhere' }}>
                        {doc.bio}
                      </p>
                    )}

                    {/* Booking CTAs */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                      {selectedDoctor?._id !== doc._id && (
                        <button onClick={() => openBookingModal(doc)} className="btn btn-primary">
                          <Calendar size={16} />
                          Book Appointment
                        </button>
                      )}
                    </div>

                    {/* Inline Booking Panel */}
                    {selectedDoctor?._id === doc._id && (
                      <div className="animate-fade-in" style={{
                        marginTop: '20px',
                        padding: '20px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>Schedule Appointment</h4>
                          <button 
                            onClick={() => setSelectedDoctor(null)} 
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                          >
                            Cancel
                          </button>
                        </div>

                        {bookingMessage.text && (
                          <div style={{
                            background: bookingMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: bookingMessage.type === 'success' ? 'var(--accent-color)' : 'var(--error-color)',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            border: `1px solid ${bookingMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                          }}>
                            {bookingMessage.text}
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                          {/* Step 1: Select Date */}
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '13px' }}>Select Date</label>
                            <input
                              type="date"
                              className="form-input"
                              min={new Date().toISOString().split('T')[0]}
                              value={selectedDate}
                              onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setSelectedSlot('');
                              }}
                            />
                          </div>

                          {/* Step 2: Select Slot */}
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '13px' }}>Available Time Slots</label>
                            {!selectedDate ? (
                              <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', paddingTop: '10px' }}>
                                Choose a date to view slots...
                              </div>
                            ) : getAvailableSlotsForDate().length === 0 ? (
                              <div style={{ color: 'var(--error-color)', fontSize: '12.5px', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '8px' }}>
                                No slots defined for this day.
                              </div>
                            ) : (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                                {getAvailableSlotsForDate().map(slot => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedSlot(slot)}
                                    style={{
                                      padding: '6px 8px',
                                      borderRadius: '6px',
                                      border: selectedSlot === slot ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                      background: selectedSlot === slot ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-primary)',
                                      color: selectedSlot === slot ? 'var(--primary-color)' : 'var(--text-main)',
                                      fontWeight: '600',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Submit Row */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedDoctor(null)}
                            className="btn btn-secondary"
                            style={{ padding: '8px 14px', fontSize: '13px' }}
                            disabled={bookingLoading}
                          >
                            Close
                          </button>
                          <button
                            type="button"
                            onClick={handleBookAppointment}
                            className="btn btn-primary"
                            style={{ padding: '8px 14px', fontSize: '13px' }}
                            disabled={bookingLoading || !selectedSlot}
                          >
                            {bookingLoading ? 'Scheduling...' : 'Lock Session'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSearch;
