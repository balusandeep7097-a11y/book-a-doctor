import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Calendar, Heart, Shield, Award, MapPin } from 'lucide-react';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const { theme } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all approved doctors
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/doctors?status=approved');
        const data = await response.json();
        if (data.success) {
          setDoctors(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch doctors', error);
      }
    };
    fetchDoctors();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/doctors?search=${searchTerm}`);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section style={{
        backgroundImage: theme === 'light' 
          ? 'linear-gradient(rgba(248, 250, 252, 0.82), rgba(248, 250, 252, 0.88)), url("/medical_hero_bg.jpg")'
          : 'linear-gradient(rgba(11, 15, 25, 0.82), rgba(11, 15, 25, 0.88)), url("/medical_hero_bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '110px 20px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.2', marginBottom: '20px' }}>
            Connecting You to <span style={{ color: 'var(--primary-color)' }}>Trusted Care</span> Instantly
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '40px' }}>
            Book appointments, manage medical logs, and get consultations with top certified medical professionals, all in one secure platform.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '50px',
            padding: '8px 16px',
            maxWidth: '600px',
            margin: '0 auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
          }}>
            <Search size={22} style={{ color: 'var(--text-muted)', marginRight: '12px' }} />
            <input
              type="text"
              placeholder="Search doctors by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flexGrow: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: 'white',
                fontSize: '16px',
                padding: '8px 0'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '50px', padding: '10px 24px' }}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Stats section */}
      <section className="container" style={{ margin: '60px auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          textAlign: 'center'
        }}>
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '36px', color: 'var(--primary-color)', fontWeight: '800' }}>10k+</h2>
            <p style={{ color: 'var(--text-muted)' }}>Happy Patients Served</p>
          </div>
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '36px', color: 'var(--accent-color)', fontWeight: '800' }}>500+</h2>
            <p style={{ color: 'var(--text-muted)' }}>Verified Specialists</p>
          </div>
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '36px', color: 'var(--primary-color)', fontWeight: '800' }}>99.8%</h2>
            <p style={{ color: 'var(--text-muted)' }}>On-time Consultation</p>
          </div>
        </div>
      </section>

      {/* Certified Doctors Section */}
      <section className="container" style={{ margin: '80px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700' }}>Our Certified Doctors</h2>
            <p style={{ color: 'var(--text-muted)' }}>Browse through all verified medical professionals and book appointments instantly</p>
          </div>
          <Link to="/doctors" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>Search & Filter Doctors →</Link>
        </div>

        {doctors.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No approved doctors registered yet. New doctors will appear here once verified by admins.
          </div>
        ) : (
          <div className="grid-3">
            {doctors.map((doc) => (
              <div key={doc._id} className="card">
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  {doc.user?.avatar ? (
                    <img
                      src={doc.user.avatar}
                      alt={doc.user.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        border: '1.5px solid var(--border-color)'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      background: 'var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '20px',
                      color: 'var(--primary-color)'
                    }}>
                      {doc.user?.name ? doc.user.name.charAt(0) : 'D'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Dr. {doc.user?.name || 'Specialist'}</h3>
                    <p style={{ color: 'var(--primary-color)', fontSize: '14px', fontWeight: '500' }}>{doc.specialty}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <MapPin size={12} />
                      <span>{doc.clinicAddress}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', fontSize: '14px' }}>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px' }}>Experience</span>
                    <span style={{ fontWeight: '600' }}>{doc.experience} Years</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px' }}>Consultation Fee</span>
                    <span style={{ fontWeight: '600', color: 'var(--accent-color)' }}>₹{doc.fee}</span>
                  </div>
                </div>

                <Link to={`/doctors?id=${doc._id}`} className="btn btn-primary" style={{ width: '100%' }}>
                  <Calendar size={16} />
                  Book Appointment
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section style={{ background: 'var(--bg-secondary)', padding: '80px 20px', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700' }}>Why Patients Trust BookADoctor</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '10px auto 0' }}>We deliver modern tools for hassle-free medical management.</p>
          </div>

          <div className="grid-3">
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-color)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Shield size={28} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>100% Encrypted Data</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>All uploaded records, documents, and medical prescriptions are saved securely and shared only with verified practitioners.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Calendar size={28} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>Real-time Booking</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Instantly lock slots, request changes, and get confirmed alerts on your dashboard from the doctors themselves.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-color)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Award size={28} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>Verified Medical Degrees</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Every practitioner must upload license certificates and undergo manual review by system administrators before accepting appointments.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
