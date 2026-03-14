import React, { useState, useEffect } from 'react';
import { projectAPI, appAPI, builderAPI } from '../api';
import { LayoutDashboard, FolderKanban, Code2, BarChart3, TrendingUp, Clock, CheckCircle, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState({ projects: [], apps: [], builds: [] });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('ucp_user') || '{}');

  useEffect(() => {
    Promise.allSettled([
      projectAPI.list(),
      appAPI.list(),
      builderAPI.jobs(),
    ]).then(([p, a, b]) => {
      setData({
        projects: p.value?.data?.projects || [],
        apps:     a.value?.data?.apps     || [],
        builds:   b.value?.data?.jobs     || [],
      });
      setLoading(false);
    });
  }, []);

  const successBuilds = data.builds.filter(b => b.status === 'success').length;

  const stats = [
    { label: 'Projects',       value: data.projects.length, icon: FolderKanban, color: '#7c3aed', bg: 'rgba(124,58,237,.15)', change: '+2 this week' },
    { label: 'Total Builds',   value: data.builds.length,   icon: Code2,        color: '#00e5ff', bg: 'rgba(0,229,255,.12)',   change: `${successBuilds} succeeded` },
    { label: 'Apps Deployed',  value: data.apps.length,     icon: Zap,          color: '#10b981', bg: 'rgba(16,185,129,.12)', change: 'Across platforms' },
    { label: 'Success Rate',   value: data.builds.length ? `${Math.round((successBuilds/data.builds.length)*100)}%` : '—', icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,.12)', change: 'Build pipeline' },
  ];

  const statusColor = { queued:'#8888aa', building:'#f59e0b', success:'#10b981', failed:'#ef4444' };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title-row">
            <div className="page-icon"><LayoutDashboard size={20} color="#fff" /></div>
            <h1 className="page-title">Dashboard</h1>
          </div>
          <p className="page-subtitle">Welcome back, <strong>{user.name || 'Developer'}</strong> 👋</p>
        </div>
        <Link to="/builder" className="btn btn-primary">
          <Code2 size={15} /> New Build <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div className="stat-value" style={{ color: s.color }}>
              {loading ? <div className="skeleton" style={{ width: 60, height: 32 }} /> : s.value}
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change up">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Recent builds + Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Recent Builds */}
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700 }}>Recent Builds</h2>
            <Link to="/builder" style={{ fontSize: 12, color: '#00e5ff', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
          </div>
          {loading ? (
            [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 10, borderRadius: 12 }} />)
          ) : data.builds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#8888aa' }}>
              <Code2 size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 14, marginBottom: 12 }}>No builds yet</p>
              <Link to="/builder" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 18px' }}>Start Building</Link>
            </div>
          ) : data.builds.slice(0, 5).map(b => (
            <div key={b._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[b.status], flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{b.appName}</div>
                <div style={{ fontSize: 11, color: '#8888aa' }}>{b.framework} · {new Date(b.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ padding: '3px 10px', borderRadius: 100, background: `${statusColor[b.status]}22`, color: statusColor[b.status], fontSize: 11, fontWeight: 700 }}>{b.status}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h2>
            {[
              { to: '/builder',  icon: Code2,        color: '#7c3aed', label: 'New Build',     sub: 'Code → Deploy everywhere' },
              { to: '/projects', icon: FolderKanban, color: '#10b981', label: 'New Project',   sub: 'Organise your work' },
              { to: '/analytics',icon: BarChart3,    color: '#f59e0b', label: 'View Analytics',sub: 'Charts & insights' },
            ].map(a => (
              <Link key={a.to} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.05)', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${a.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <a.icon size={16} color={a.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: '#8888aa' }}>{a.sub}</div>
                </div>
                <ArrowRight size={13} style={{ marginLeft: 'auto', color: '#55556a' }} />
              </Link>
            ))}
          </div>

          <div className="card" style={{ background: 'rgba(124,58,237,.08)', borderColor: 'rgba(124,58,237,.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <CheckCircle size={18} color="#10b981" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>System Status</span>
            </div>
            {[
              { label: 'API Server',    ok: true },
              { label: 'Build Pipeline',ok: true },
              { label: 'Database',      ok: true },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#8888aa' }}>{s.label}</span>
                <span style={{ color: s.ok ? '#10b981' : '#ef4444', fontWeight: 600 }}>{s.ok ? '● Operational' : '● Down'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
