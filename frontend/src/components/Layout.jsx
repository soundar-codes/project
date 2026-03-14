import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, BarChart3, Code2, LogOut, ChevronRight, Layers } from 'lucide-react';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/projects',  icon: FolderKanban,   label: 'Projects'    },
  { to: '/analytics', icon: BarChart3,      label: 'Analytics'   },
  { to: '/builder',   icon: Code2,          label: 'Build Studio' },
];

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ucp_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <Layers size={18} color="#fff" />
          </div>
          <h2>Unified-Class</h2>
          <p>Platform v2.0</p>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} className="nav-icon" />
              <span className="nav-label">{label}</span>
              <ChevronRight size={13} className="nav-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.name || 'Developer'}</div>
              <div className="user-role">{user?.role || 'developer'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content fade-in">
        <Outlet />
      </main>
    </div>
  );
}
