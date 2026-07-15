import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Briefcase, Plus, UserPlus } from 'lucide-react';

const specialties = [
  'General Practitioner',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'Orthopedic',
  'Psychiatrist',
  'Dentist'
];

const Register = () => {
  const [role, setRole] = useState('patient'); // patient or doctor
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Doctor specific fields
  const [specialty, setSpecialty] = useState('General Practitioner');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      name,
      email,
      password,
      role
    };

    if (role === 'doctor') {
      payload.specialty = specialty;
      payload.experience = Number(experience);
      payload.fee = Number(fee);
      payload.clinicAddress = clinicAddress;
    }

    const result = await register(payload);

    if (result.success) {
      setTimeout(() => {
        navigate(`/dashboard/${role}`);
      }, 500);
    } else {
      setError(result.error || 'Registration failed. Try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      minHeight: 'calc(100vh - 73px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(circle at 10% 90%, rgba(16, 185, 129, 0.08) 0%, transparent 40%)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)' }}>Get started with booking or scheduling today</p>
        </div>

        {/* Role Toggle Switch */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '28px'
        }}>
          <button
            type="button"
            onClick={() => setRole('patient')}
            style={{
              flex: '1',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: role === 'patient' ? 'var(--primary-color)' : 'transparent',
              color: role === 'patient' ? 'white' : 'var(--text-muted)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            I am a Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            style={{
              flex: '1',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: role === 'doctor' ? 'var(--primary-color)' : 'transparent',
              color: role === 'doctor' ? 'white' : 'var(--text-muted)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            I am a Doctor
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--error-color)',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                className="form-input"
                style={{ paddingLeft: '48px' }}
                placeholder="Bonthu Sandeep"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '48px' }}
                placeholder="sandeep@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '48px' }}
                placeholder="•••••••• (Min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Conditional Doctor Fields */}
          {role === 'doctor' && (
            <div className="animate-fade-in" style={{
              background: 'rgba(59, 130, 246, 0.03)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px dashed var(--border-color)',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--primary-color)' }}>
                Professional Credentials
              </h3>

              <div className="form-group">
                <label className="form-label">Specialty Area</label>
                <select
                  className="form-input"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="form-input"
                    placeholder="e.g. 5"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    required
                    min="50"
                    className="form-input"
                    placeholder="e.g. 400"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Clinic / Hospital Address</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Apollo Hospital, Hyderabad"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={submitting}
          >
            {submitting ? 'Registering...' : 'Create Account'}
            <UserPlus size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
