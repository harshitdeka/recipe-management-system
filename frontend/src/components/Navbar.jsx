import { useEffect, useRef, useState } from 'react';

export default function Navbar({ user, currentPage, onNavigate, onResetDashboard, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateAndClose = (page) => {
    setOpen(false);
    if (page === currentPage && page === 'dashboard') {
      // If already on dashboard, reset it instead of navigating
      onResetDashboard();
    } else {
      onNavigate(page);
    }
  };

  const goToDashboardAndReset = () => {
    setOpen(false);
    if (currentPage === 'dashboard') {
      onResetDashboard();
      return;
    }
    onResetDashboard();
    onNavigate('dashboard');
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">
      <button className="brand-btn" onClick={goToDashboardAndReset}>
        <i className="fas fa-utensils" style={{ marginRight: '8px' }}></i>
        Find Recipe
      </button>
      </span>

      <div className="navbar-user">
        <span>Hello, <strong>{user.username}</strong></span>
        <div className="menu-wrapper" ref={menuRef}>
          <button
            className="hamburger-btn"
            aria-label="Open menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            ☰
          </button>

          {open && (
            <div className="navbar-dropdown">
              <button
                className={currentPage === 'dashboard' ? 'active' : ''}
                onClick={goToDashboardAndReset}
              >
                Home
              </button>
              <button
                className={currentPage === 'profile' ? 'active' : ''}
                onClick={() => navigateAndClose('profile')}
              >
                Profile
              </button>
              <button
                className={currentPage === 'favorites' ? 'active' : ''}
                onClick={() => navigateAndClose('favorites')}
              >
                Favorites
              </button>
              <button onClick={onLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
