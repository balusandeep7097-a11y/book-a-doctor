import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Heart, Activity } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '40px 40px 24px',
      color: 'var(--text-muted)',
      fontSize: '14px',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Left Section: Branding */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: '700', fontSize: '18px', marginBottom: '16px' }}>
            <Activity size={20} />
            <span style={{ color: 'var(--text-main)' }}>BookA</span>Doctor
          </div>
          <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>
            Connecting patients with certified medical professionals instantly. Manage consultations, schedule appointments, and share digital health reports securely.
          </p>
        </div>

        {/* Middle Section: Quick Links */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '16px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>
                Home Landing Page
              </Link>
            </li>
            <li>
              <Link to="/doctors" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>
                Find Specialists
              </Link>
            </li>
            <li>
              <Link to="/register" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>
                Register Workspace
              </Link>
            </li>
            <li>
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>
                Sign In Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Right Section: Support & Helpline */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '16px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
            24/7 Helpline & Support
          </h4>
          <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>
            Need emergency medical guidance or tech assistance? Our support coordinators are available 24/7 to guide you.
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px dashed rgba(59, 130, 246, 0.2)',
            padding: '12px 18px',
            borderRadius: '12px',
            width: 'fit-content'
          }}>
            <div style={{
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Phone size={18} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px', color: 'var(--primary-color)' }}>
                Toll-Free Support
              </span>
              <a href="tel:18001234567" style={{ display: 'block', fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', textDecoration: 'none' }}>
                1800-123-4567
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        fontSize: '13px'
      }}>
        <span>
          © {new Date().getFullYear()} BookADoctor. All rights reserved.
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Made with <Heart size={12} style={{ color: 'var(--error-color)', fill: 'var(--error-color)' }} /> for patient health care.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
