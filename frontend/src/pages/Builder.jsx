import React, { useState, useEffect, useRef } from 'react';
import { builderAPI, projectAPI } from '../api';
import toast from 'react-hot-toast';
import {
  Play, Globe, Smartphone, Monitor, Code2, ExternalLink,
  Clock, CheckCircle, Loader, AlertCircle, Download, Zap, X
} from 'lucide-react';

const FRAMEWORKS = ['react', 'vue', 'html', 'flutter', 'react-native'];
const EXAMPLES = [
  {
    label: '🔐 Login Form',
    code: `function LoginForm() {
  return (
    <div>
      <h2>Login</h2>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button>Sign In</button>
    </div>
  );
}`
  },
  {
    label: '🛒 Product Card',
    code: `function ProductCard({ name, price }) {
  return (
    <div>
      <h3>{name}</h3>
      <p>\${price}</p>
      <button>Add to Cart</button>
    </div>
  );
}`
  },
  {
    label: '💬 Chat UI',
    code: `function ChatUI() {
  const [msg, setMsg] = React.useState('');
  return (
    <div>
      <div>Hello!</div>
      <div>Hi there!</div>
      <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type..." />
      <button>Send</button>
    </div>
  );
}`
  },
];

const pColors  = { web: '#00e5ff', android: '#10b981', ios: '#f472b6' };
const pIcons   = { web: Globe,     android: Smartphone, ios: Monitor };
const sColors  = { queued: '#8888aa', building: '#f59e0b', success: '#10b981', failed: '#ef4444' };

const StatusBadge = ({ status }) => {
  const icons = {
    success:  <CheckCircle size={13} color="#10b981" />,
    failed:   <AlertCircle size={13} color="#ef4444" />,
    building: <Loader      size={13} color="#f59e0b" className="spinning" />,
    queued:   <Clock       size={13} color="#8888aa" />,
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, background: `${sColors[status]}18`, border: `1px solid ${sColors[status]}40`, color: sColors[status], fontSize: 11, fontWeight: 700 }}>
      {icons[status]} {status}
    </span>
  );
};

export default function Builder() {
  const [code,      setCode]      = useState('');
  const [framework, setFramework] = useState('react');
  const [platforms, setPlatforms] = useState(['web', 'android', 'ios']);
  const [appName,   setAppName]   = useState('MyApp');
  const [projectId, setProjectId] = useState('');
  const [projects,  setProjects]  = useState([]);
  const [jobs,      setJobs]      = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [tab,       setTab]       = useState('editor');
  const pollRef = useRef(null);

  useEffect(() => {
    projectAPI.list().then(r => setProjects(r.data.projects || [])).catch(() => {});
    builderAPI.jobs().then(r => setJobs(r.data.jobs || [])).catch(() => {});
    return () => clearInterval(pollRef.current);
  }, []);

  const togglePlatform = (p) =>
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const startPolling = (jobId) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const r = await builderAPI.job(jobId);
        const j = r.data.job;
        setActiveJob(j);
        setJobs(prev => {
          const exists = prev.find(x => x._id === j._id);
          return exists ? prev.map(x => x._id === j._id ? j : x) : [j, ...prev];
        });
        if (j.status === 'success' || j.status === 'failed') {
          clearInterval(pollRef.current);
          if (j.status === 'success') toast.success('Build complete! ✅');
          else toast.error('Build failed ❌');
        }
      } catch {}
    }, 2000);
  };

  const submit = async () => {
    if (!code.trim())       return toast.error('Write some code first!');
    if (!platforms.length)  return toast.error('Select at least one platform');
    setLoading(true);
    try {
      const { data } = await builderAPI.submit({ code, framework, platforms, projectId, appName });
      toast.success('Build submitted! 🚀');
      setActiveJob(data.job);
      setJobs(prev => [data.job, ...prev]);
      setTab('preview');
      startPolling(data.job._id);
    } catch { toast.error('Submit failed — is the backend running?'); }
    finally { setLoading(false); }
  };

  /* ── TABS ── */
  const tabBtns = [
    { key: 'editor',  label: '✏️ Code Editor' },
    { key: 'jobs',    label: `📋 History (${jobs.length})` },
    { key: 'preview', label: '🚀 Live Preview' },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title-row">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#00e5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 size={20} color="#fff" />
            </div>
            <h1 className="page-title">Build Studio</h1>
          </div>
          <p className="page-subtitle">Write once → Deploy to Web, Android &amp; iOS instantly</p>
        </div>
        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,.04)', padding: 5, borderRadius: 12, border: '1px solid rgba(255,255,255,.08)' }}>
          {tabBtns.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: tab === t.key ? 'linear-gradient(135deg,#7c3aed,#00e5ff)' : 'transparent',
              color: tab === t.key ? '#fff' : '#8888aa',
              transition: 'all .2s'
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ══════════════════════ EDITOR TAB ══════════════════════ */}
      {tab === 'editor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          {/* Left: Code area */}
          <div>
            {/* Example snippets */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {EXAMPLES.map(ex => (
                <button key={ex.label} onClick={() => setCode(ex.code)}
                  style={{ padding: '5px 13px', borderRadius: 100, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)', color: '#8888aa', fontSize: 12, cursor: 'pointer', transition: 'all .2s' }}
                  onMouseEnter={e => { e.target.style.borderColor = 'rgba(124,58,237,.4)'; e.target.style.color = '#c0c0d8'; }}
                  onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,.1)'; e.target.style.color = '#8888aa'; }}
                >{ex.label}</button>
              ))}
            </div>

            {/* Textarea editor */}
            <div style={{ position: 'relative', borderRadius: 14, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.08)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#ef4444','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
                </div>
                <span style={{ fontSize: 11, color: '#55556a', fontWeight: 600, letterSpacing: 1 }}>CODE EDITOR — {framework.toUpperCase()}</span>
                {code && (
                  <button onClick={() => setCode('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#55556a', cursor: 'pointer', display: 'flex' }}>
                    <X size={13} />
                  </button>
                )}
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={"// Write your code here — any language\n// Or describe your app in plain English!\n\nfunction MyApp() {\n  return <h1>Hello World 🚀</h1>;\n}"}
                style={{ width: '100%', minHeight: 420, padding: '20px', background: 'transparent', border: 'none', color: '#00e5ff', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: 'none', resize: 'vertical', lineHeight: 1.8 }}
                onKeyDown={e => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const s = e.target.selectionStart;
                    setCode(v => v.substring(0, s) + '  ' + v.substring(s));
                    setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0);
                  }
                }}
              />
              {code && (
                <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,.05)', fontSize: 11, color: '#55556a', display: 'flex', gap: 16 }}>
                  <span>{code.split('\n').length} lines</span>
                  <span>{code.length} chars</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Settings panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* App Name */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8888aa', letterSpacing: 1, marginBottom: 8 }}>APP NAME</div>
              <input className="input" value={appName} onChange={e => setAppName(e.target.value)} placeholder="MyApp" style={{ fontSize: 13 }} />
            </div>

            {/* Framework */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8888aa', letterSpacing: 1, marginBottom: 10 }}>FRAMEWORK</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {FRAMEWORKS.map(f => (
                  <button key={f} onClick={() => setFramework(f)} style={{
                    padding: '5px 11px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                    background: framework === f ? 'rgba(124,58,237,.3)' : 'rgba(255,255,255,.06)',
                    color: framework === f ? '#00e5ff' : '#8888aa',
                  }}>{f}</button>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8888aa', letterSpacing: 1, marginBottom: 10 }}>TARGET PLATFORMS</div>
              {['web', 'android', 'ios'].map(pl => {
                const Icon = pIcons[pl];
                const sel  = platforms.includes(pl);
                return (
                  <button key={pl} onClick={() => togglePlatform(pl)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
                    cursor: 'pointer', width: '100%', marginBottom: 8, transition: 'all .2s',
                    background: sel ? `${pColors[pl]}15` : 'rgba(255,255,255,.03)',
                    border: sel ? `1px solid ${pColors[pl]}55` : '1px solid rgba(255,255,255,.08)',
                  }}>
                    <Icon size={15} color={sel ? pColors[pl] : '#55556a'} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: sel ? pColors[pl] : '#8888aa', textTransform: 'capitalize', flex: 1, textAlign: 'left' }}>{pl}</span>
                    {sel && <span style={{ fontSize: 9, color: '#fff', background: pColors[pl], borderRadius: '50%', width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Link to Project */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8888aa', letterSpacing: 1, marginBottom: 8 }}>LINK TO PROJECT</div>
              <select className="input" value={projectId} onChange={e => setProjectId(e.target.value)} style={{ fontSize: 13 }}>
                <option value="">None</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>

            {/* Submit */}
            <button onClick={submit} disabled={loading || !code.trim() || !platforms.length}
              className="btn btn-primary"
              style={{ padding: 15, fontSize: 14, borderRadius: 12, boxShadow: '0 0 30px rgba(124,58,237,.4)', opacity: (loading || !code.trim() || !platforms.length) ? 0.5 : 1 }}>
              {loading
                ? <><Loader size={16} className="spinning" /> Submitting...</>
                : <><Zap size={16} /> Build for {platforms.length} Platform{platforms.length !== 1 ? 's' : ''}</>}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════ HISTORY TAB ══════════════════════ */}
      {tab === 'jobs' && (
        <div>
          {jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#8888aa' }}>
              <Code2 size={48} style={{ opacity: 0.25, marginBottom: 18 }} />
              <p style={{ fontSize: 16, marginBottom: 14 }}>No builds yet</p>
              <button className="btn btn-primary" onClick={() => setTab('editor')}><Zap size={14} /> Start Building</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {jobs.map(job => (
                <div key={job._id}
                  onClick={() => { setActiveJob(job); setTab('preview'); }}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,.4)'; e.currentTarget.style.background = 'rgba(124,58,237,.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: sColors[job.status], flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{job.appName}</div>
                      <div style={{ color: '#8888aa', fontSize: 12, marginTop: 2 }}>{job.framework} · {(job.platforms || []).join(', ')} · {new Date(job.createdAt).toLocaleString()}</div>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                  {job.status === 'success' && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                      {(job.platforms || []).map(pl => {
                        const Icon = pIcons[pl] || Globe;
                        return (
                          <div key={pl} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: `${pColors[pl]}12`, border: `1px solid ${pColors[pl]}30`, fontSize: 11, color: pColors[pl], fontWeight: 600 }}>
                            <Icon size={11} /> {pl} ready
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════ PREVIEW TAB ══════════════════════ */}
      {tab === 'preview' && (
        <div>
          {!activeJob ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#8888aa' }}>
              <Play size={48} style={{ opacity: 0.25, marginBottom: 18 }} />
              <p style={{ fontSize: 16, marginBottom: 14 }}>No active build selected</p>
              <button className="btn btn-primary" onClick={() => setTab('editor')}><Code2 size={14} /> Write Code</button>
            </div>
          ) : (
            <div>
              {/* Status banner */}
              <div style={{
                padding: '16px 20px', borderRadius: 14, marginBottom: 22,
                background: activeJob.status === 'success' ? 'rgba(16,185,129,.08)' : activeJob.status === 'building' ? 'rgba(245,158,11,.08)' : activeJob.status === 'failed' ? 'rgba(239,68,68,.08)' : 'rgba(255,255,255,.04)',
                border: `1px solid ${activeJob.status === 'success' ? 'rgba(16,185,129,.3)' : activeJob.status === 'building' ? 'rgba(245,158,11,.3)' : activeJob.status === 'failed' ? 'rgba(239,68,68,.3)' : 'rgba(255,255,255,.1)'}`,
                display: 'flex', alignItems: 'center', gap: 14
              }}>
                {activeJob.status === 'building' ? <Loader size={18} color="#f59e0b" className="spinning" /> :
                 activeJob.status === 'success'  ? <CheckCircle size={18} color="#10b981" /> :
                 activeJob.status === 'failed'   ? <AlertCircle size={18} color="#ef4444" /> :
                 <Clock size={18} color="#8888aa" />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{activeJob.appName}</div>
                  <div style={{ color: '#8888aa', fontSize: 13, marginTop: 2 }}>
                    {activeJob.status === 'queued'   && 'Waiting in queue...'}
                    {activeJob.status === 'building' && '⚡ Building for all platforms...'}
                    {activeJob.status === 'success'  && '✅ All platforms ready! Scroll down for preview.'}
                    {activeJob.status === 'failed'   && '❌ Build failed. Check your code.'}
                  </div>
                </div>
                <StatusBadge status={activeJob.status} />
              </div>

              {/* Platform cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
                {(activeJob.platforms || []).map(pl => {
                  const Icon  = pIcons[pl] || Globe;
                  const ready = activeJob.status === 'success';
                  return (
                    <div key={pl} className="card" style={{ borderColor: ready ? `${pColors[pl]}40` : undefined }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: `${pColors[pl]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={17} color={pColors[pl]} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, textTransform: 'capitalize' }}>{pl}</div>
                          <div style={{ fontSize: 11, color: '#8888aa' }}>{pl === 'web' ? 'React/HTML' : pl === 'android' ? 'Kotlin/APK' : 'Swift/IPA'}</div>
                        </div>
                        <div style={{ padding: '3px 10px', borderRadius: 100, background: ready ? `${pColors[pl]}18` : 'rgba(255,255,255,.06)', color: ready ? pColors[pl] : '#8888aa', fontSize: 11, fontWeight: 700 }}>
                          {ready ? '✅ Ready' : activeJob.status === 'building' ? '⏳ Building' : '⏸ Queued'}
                        </div>
                      </div>
                      {ready ? (
                        pl === 'web' ? (
                          <a href={`http://localhost:5000/api/builder/preview/${activeJob._id}`} target="_blank" rel="noreferrer"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 9, border: `1px solid ${pColors[pl]}40`, background: `${pColors[pl]}0d`, color: pColors[pl], fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                            <ExternalLink size={12} /> Live Preview
                          </a>
                        ) : (
                          <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 9, border: `1px solid ${pColors[pl]}40`, background: `${pColors[pl]}0d`, color: pColors[pl], fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <Download size={12} /> Download {pl === 'android' ? 'APK' : 'IPA'}
                          </button>
                        )
                      ) : (
                        <div style={{ height: 38, borderRadius: 9, background: 'rgba(255,255,255,.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#55556a', fontSize: 12 }}>
                          {activeJob.status === 'building' ? '⚡ Building...' : '⏸ Waiting...'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Inline web preview iframe */}
              {activeJob.status === 'success' && activeJob.platforms?.includes('web') && (
                <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.1)' }}>
                  <div style={{ padding: '11px 14px', background: 'rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {['#ef4444','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,.06)', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#8888aa', fontFamily: 'monospace' }}>
                      localhost:5000/api/builder/preview/{activeJob._id}
                    </div>
                    <a href={`http://localhost:5000/api/builder/preview/${activeJob._id}`} target="_blank" rel="noreferrer" style={{ color: '#8888aa', display: 'flex' }}>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                  <iframe
                    src={`http://localhost:5000/api/builder/preview/${activeJob._id}`}
                    style={{ width: '100%', height: 400, border: 'none', background: '#0d0d24' }}
                    title="Live Preview"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
