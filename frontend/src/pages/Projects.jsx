import React, { useState, useEffect } from 'react';
import { projectAPI } from '../api';
import toast from 'react-hot-toast';
import { FolderKanban, Plus, Trash2, Edit3, Check, X, Loader, Tag, ArrowRight } from 'lucide-react';

const STATUS_COLORS = { active: '#10b981', archived: '#8888aa', paused: '#f59e0b' };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', tags: '' });
  const [saving, setSaving] = useState(false);

  const load = () =>
    projectAPI.list().then(r => { setProjects(r.data.projects || []); setLoading(false); })
              .catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      await projectAPI.create({ ...form, tags });
      toast.success('Project created! 🚀');
      setForm({ name: '', description: '', tags: '' });
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await projectAPI.remove(id);
    toast.success('Project deleted');
    setProjects(p => p.filter(x => x._id !== id));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title-row">
            <div className="page-icon"><FolderKanban size={20} color="#fff" /></div>
            <h1 className="page-title">Projects</h1>
          </div>
          <p className="page-subtitle">Organise your builds and apps into projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> New Project</>}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card mb-24 fade-in" style={{ borderColor: 'rgba(124,58,237,.3)', background: 'rgba(124,58,237,.06)' }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Create Project</h3>
          <form onSubmit={create}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8888aa', marginBottom: 6, letterSpacing: '0.5px' }}>PROJECT NAME *</label>
                <input className="input" placeholder="My Awesome App" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8888aa', marginBottom: 6, letterSpacing: '0.5px' }}>TAGS (comma separated)</label>
                <input className="input" placeholder="react, mobile, v2" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              </div>
            </div>
            <div className="form-group" style={{ margin: 0, marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8888aa', marginBottom: 6, letterSpacing: '0.5px' }}>DESCRIPTION</label>
              <input className="input" placeholder="What is this project about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><Loader size={14} className="spinning" /> Creating...</> : <><Check size={14} /> Create Project</>}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#8888aa' }}>
          <FolderKanban size={50} style={{ opacity: 0.3, marginBottom: 16 }} />
          <p style={{ fontSize: 16, marginBottom: 14 }}>No projects yet</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={14} /> Create your first project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {projects.map(p => (
            <div key={p._id} className="card" style={{ position: 'relative' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,.35)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124,58,237,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderKanban size={18} color="#7c3aed" />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ padding: '3px 10px', borderRadius: 100, background: `${STATUS_COLORS[p.status]}18`, border: `1px solid ${STATUS_COLORS[p.status]}40`, color: STATUS_COLORS[p.status], fontSize: 11, fontWeight: 600 }}>{p.status}</div>
                  <button onClick={() => remove(p._id)} style={{ background: 'rgba(239,68,68,.1)', border: 'none', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{p.name}</h3>
              <p style={{ fontSize: 13, color: '#8888aa', marginBottom: 14, minHeight: 20 }}>{p.description || 'No description'}</p>
              {p.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', fontSize: 11, color: '#8888aa' }}>
                      <Tag size={9} /> {t}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 11, color: '#55556a' }}>Created {new Date(p.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
