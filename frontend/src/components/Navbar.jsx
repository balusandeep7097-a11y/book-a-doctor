import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, LayoutDashboard, HeartPulse, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout, theme, toggleTheme, API_URL } = useAuth();
  const navigate = useNavigate();

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 20 seconds for real-time reminders
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setShowDropdown(false);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error('Error marking notification as read', error);
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing notifications', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
        <HeartPulse size={32} color="var(--primary-color)" />
        <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Book<span style={{ color: 'var(--primary-color)' }}>A</span>Doctor
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/" className="sidebar-item" style={{ padding: '8px 12px', fontSize: '15px' }}>Home</Link>
        {(!user || user.role === 'patient') && (
          <Link to="/doctors" className="sidebar-item" style={{ padding: '8px 12px', fontSize: '15px' }}>Find Doctors</Link>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{ padding: '8px', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            {/* Notifications Dropdown Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="btn btn-secondary"
                style={{ padding: '8px', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: 'var(--error-color)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '10px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="card animate-fade-in" style={{
                  position: 'absolute',
                  top: '48px',
                  right: '0',
                  width: '320px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '16px',
                  zIndex: 1001,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.length === 0 ? (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                        No notifications yet.
                      </span>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif._id}
                          onClick={() => handleMarkAsRead(notif._id)}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: notif.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.08)',
                            border: '1px solid var(--border-color)',
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                            e.currentTarget.style.borderColor = 'var(--primary-color)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = notif.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.08)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                          }}
                        >
                          <span style={{ color: notif.isRead ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: notif.isRead ? '400' : '600' }}>
                            {notif.message}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to={`/dashboard/${user.role}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '14px' }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>Sign In</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
