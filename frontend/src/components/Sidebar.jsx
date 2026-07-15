import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, FileText, Settings, Users, ShieldAlert, Heart, Activity } from 'lucide-react';

const Sidebar = ({ role, activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const getSidebarItems = () => {
    switch (role) {
      case 'patient':
        return [
          { id: 'overview', name: 'Overview', icon: <Activity size={18} /> },
          { id: 'appointments', name: 'My Appointments', icon: <Calendar size={18} /> },
          { id: 'records', name: 'Medical Reports', icon: <FileText size={18} /> },
          { id: 'settings', name: 'Account Settings', icon: <Settings size={18} /> }
        ];
      case 'doctor':
        return [
          { id: 'overview', name: 'Dashboard Overview', icon: <Activity size={18} /> },
          { id: 'appointments', name: 'Appointments Manager', icon: <Calendar size={18} /> },
          { id: 'schedule', name: 'Manage Schedule', icon: <Settings size={18} /> },
          { id: 'patients', name: 'My Consultations', icon: <Users size={18} /> }
        ];
      case 'admin':
        return [
          { id: 'overview', name: 'System Analytics', icon: <Activity size={18} /> },
          { id: 'verify', name: 'Doctor Approvals', icon: <ShieldAlert size={18} /> },
          { id: 'doctors', name: 'Doctors Database', icon: <Heart size={18} /> },
          { id: 'appointments', name: 'Global Bookings', icon: <Calendar size={18} /> }
        ];
      default:
        return [];
    }
  };

  const items = getSidebarItems();

  return (
    <div className="sidebar">
      {/* Logged In User Profile Widget */}
      {user && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'rgba(255, 255, 255, 0.02)', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '8px'
        }}>
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--primary-color)'
              }}
            />
          ) : (
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '24px'
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          
          <div style={{ marginTop: '4px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
              {user.name}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
              {user.email}
            </p>
          </div>

          <span className={`badge badge-${role === 'admin' ? 'pending' : role === 'doctor' ? 'completed' : 'confirmed'}`} style={{ 
            fontSize: '10px', 
            padding: '4px 10px', 
            textTransform: 'uppercase',
            fontWeight: '700',
            letterSpacing: '0.5px'
          }}>
            {role === 'admin' ? 'SYSTEM ADMIN' : role === 'doctor' ? 'PRACTITIONER' : 'PATIENT'}
          </span>
        </div>
      )}

      <div style={{ padding: '0 16px 12px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <h4 style={{ textTransform: 'capitalize', fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted)' }}>
          Navigation Menu
        </h4>
      </div>

      {items.map(item => (
        <div
          key={item.id}
          className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => setActiveTab(item.id)}
        >
          {item.icon}
          {item.name}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
