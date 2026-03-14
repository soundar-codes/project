import React, { useState, useEffect } from 'react';
import { analyticsAPI, builderAPI, projectAPI } from '../api';
import { BarChart3, TrendingUp, Globe, Smartphone, Monitor, Activity, RefreshCw } from 'lucide-react';

const Bar = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: '#c0c0d8', fontWeight: 500 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value} <span style={{ color: '#55556a', fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,.06)', borderRadius: 100 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
};

export default function Analytics() {
  const [builds,   setBuilds]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const load = () => {
    setLoading(true);
    Promise.allSettled([builderAPI.jobs(), projectAPI.list()]).then(([b, p]) => {
      setBuilds(b.value?.data?.jobs || []);
      setProjects(p.value?.data?.projects || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const total   = builds.length;
  const success = builds.filter(b => b.status === 'success').length;
  const failed  = builds.filter(b => b.status === 'failed').length;
  const running = builds.filter(b => b.status === 'building' || b.status === 'queued').length;
  const web     = builds.filter(b => b.platforms?.includes('web')).length;
  const android = builds.filter(b => b.platforms?.includes('android')).length;
  const ios     = builds.filter(b => b.platforms?.includes('ios')).length;
  const maxPlat = Math.max(web, android, ios, 1);

  const fwMap = {};
  builds.forEach(b => { fwMap[b.framework] = (fwMap[b.framework] || 0) + 1; });
  const fwEntries = Object.entries(fwMap).sort((a, b) => b[1] - a[1]);
  const maxFw = fwEntries[0]?.[1] || 1;

  const fwColors = { react: '#00e5ff', vue: '#10b981', html: '#f59e0b', flutter: '#f472b6', 'react-native': '#7c3aed' };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title-row">
            <div className="page-icon"><BarChart3 size={20} color="#fff" /></div>
            <h1 className="page-title">Analytics</h1>
          </div>
          <p className="page-subtitle">Build pipeline metrics & platform insights</p>
        </div>
        <button className="btn btn-ghost" onClick={load}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh
        </button>
      </div>

      {/* Top Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'Total Builds',  value: total,                                  color: '#7c3aed', bg: 'rgba(124,58,237,.12)', icon: Activity },
          { label: 'Success',       value: success,                                color: '#10b981', bg: 'rgba(16,185,129,.12)',  icon: TrendingUp },
          { label: 'Failed',        value: failed,                                 color: '#ef4444', bg: 'rgba(239,68,68,.12)',   icon: Activity },
          { label: 'Success Rate',  value: total ? `${Math.round(success/total*100)}%` : '—', color: '#f59e0b', bg: 'rgba(245,158,11,.12)', icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={18} color={s.color} /></div>
            <div className="stat-value" style={{ color: s.color, fontSize: 24 }}>
              {loading ? <div className="skeleton" style={{ width: 50, height: 28 }} /> : s.value}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Platform Distribution */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={16} color="#00e5ff" /> Platform Distribution
          </h3>
          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 36, marginBottom: 14, borderRadius: 8 }} />) : (
            <>
              <Bar label="🌐 Web"     value={web}     max={maxPlat} color="#00e5ff" />
              <Bar label="🤖 Android" value={android} max={maxPlat} color="#10b981" />
              <Bar label="🍎 iOS"     value={ios}     max={maxPlat} color="#f472b6" />
            </>
          )}
        </div>

        {/* Framework Usage */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="#7c3aed" /> Framework Usage
          </h3>
          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 36, marginBottom: 14, borderRadius: 8 }} />) :
           fwEntries.length === 0 ? <p style={{ color: '#55556a', fontSize: 13 }}>No builds yet</p> :
           fwEntries.map(([fw, count]) => (
            <Bar key={fw} label={fw} value={count} max={maxFw} color={fwColors[fw] || '#8888aa'} />
           ))}
        </div>

        {/* Projects Summary */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>📁 Projects</h3>
          {loading ? <div className="skeleton" style={{ height: 80, borderRadius: 12 }} /> :
           projects.length === 0 ? <p style={{ color: '#55556a', fontSize: 13 }}>No projects yet</p> :
           projects.slice(0, 5).map(p => (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
              <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 100, background: 'rgba(16,185,129,.12)', color: '#10b981', fontWeight: 600 }}>{p.status}</span>
            </div>
           ))}
        </div>

        {/* Build Status Breakdown */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>⚡ Build Status</h3>
          {[
            { label: 'Successful', val: success, color: '#10b981' },
            { label: 'Failed',     val: failed,  color: '#ef4444' },
            { label: 'Running',    val: running,  color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 12, background: `${s.color}10`, border: `1px solid ${s.color}25`, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{loading ? '—' : s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
