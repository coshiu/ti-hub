import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Papa from "papaparse";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SOURCER_PALETTE = ['#5b8fff','#47c5a8','#e8c547','#c084fc','#f97316','#06b6d4','#ec4899','#a3e635','#f07a4a','#818cf8'];
const DOMAIN_PALETTE  = ['#5b8fff','#47c5a8','#e8c547','#c084fc','#ec4899','#06b6d4','#f97316','#a3e635'];

const COL_DATE     = "Job Consideration's Offer's Latest Version's Created At";
const COL_CREDITED = "Job Consideration's Credited To";
const COL_DEPT     = "Job Consideration's Job's Department";
const COL_OUTCOME  = "Job Consideration's Outcome";

const DARK = {
  bg:'#0a0b0f', surface:'#111318', surface2:'#181c24', surface3:'#1e2530',
  border:'#1e2330', border2:'#252d3d',
  text:'#e8eaf0', textMuted:'#6b7491', textDim:'#3d4560',
  accent:'#5b8fff', accentDim:'rgba(91,143,255,0.08)', accentBdr:'rgba(91,143,255,0.22)',
  teal:'#47c5a8', tealDim:'rgba(71,197,168,0.07)', tealBdr:'rgba(71,197,168,0.2)',
  gold:'#e8c547', goldDim:'rgba(232,197,71,0.07)', goldBdr:'rgba(232,197,71,0.18)',
  green:'#4ade80', greenDim:'rgba(74,222,128,0.08)', greenBdr:'rgba(74,222,128,0.22)',
  danger:'#f07a4a', noise:true,
};
const LIGHT = {
  bg:'#f5f4f0', surface:'#ffffff', surface2:'#f0ede8', surface3:'#e8e4de',
  border:'#ddd9d2', border2:'#ccc8c0',
  text:'#1a1a1e', textMuted:'#6b6860', textDim:'#aaa59e',
  accent:'#2a5fd4', accentDim:'rgba(42,95,212,0.07)', accentBdr:'rgba(42,95,212,0.22)',
  teal:'#1a9e85', tealDim:'rgba(26,158,133,0.07)', tealBdr:'rgba(26,158,133,0.22)',
  gold:'#b08a00', goldDim:'rgba(176,138,0,0.08)', goldBdr:'rgba(176,138,0,0.22)',
  green:'#1a8c4e', greenDim:'rgba(26,140,78,0.08)', greenBdr:'rgba(26,140,78,0.22)',
  danger:'#c44b1a', noise:false,
};

const R = (d,c,dp,o) => ({ [COL_DATE]:d, [COL_CREDITED]:c, [COL_DEPT]:dp, [COL_OUTCOME]:o });
const CE = 'Cloud Engineering', ICS = 'IT, Compliance, and Security', CTO = 'CTO Office';
const HARDCODED_ROWS = [
  // ── Jan ──
  R('2026-01-16','Nicole Shiu',    CE,  'Hired'),
  R('2026-01-09','Dan Dougherty',  CE,  'Hired'),
  R('2026-01-08','Jimmy Tran',     CE,  'Archived'),
  // ── Feb ──
  R('2026-02-18','Nicole Shiu',    CE,  'Hired'),
  R('2026-02-05','Nicole Shiu',    CE,  'Hired'),
  R('2026-02-13','Nicole Shiu',    CE,  'Archived'),
  R('2026-02-20','Dan Dougherty',  CE,  'Hired'),
  R('2026-02-10','Jimmy Tran',     CE,  'Hired'),
  R('2026-02-16','Jimmy Tran',     CE,  'Archived'),
  R('2026-02-03','Jimmy Tran',     CE,  'Archived'),
  R('2026-02-25','Ali Aguayo',     CE,  'Archived'),
  // ── Mar ──
  R('2026-03-31','Dan Dougherty',  CE,  'Hired'),
  R('2026-03-30','Dan Dougherty',  CE,  'Hired'),
  R('2026-03-30','Dan Dougherty',  CE,  'Archived'),
  R('2026-03-26','Jimmy Tran',     CE,  'Hired'),
  R('2026-03-12','Jimmy Tran',     CE,  'Hired'),
  R('2026-03-16','Jimmy Tran',     CE,  'Archived'),
  R('2026-03-09','Jimmy Tran',     CE,  'Archived'),
  R('2026-03-08','Jimmy Tran',     CE,  'Archived'),
  R('2026-03-24','Ali Aguayo',     CE,  'Hired'),
  R('2026-03-02','Luis Valencia',  ICS, 'Hired'),
  R('2026-03-06','Luis Valencia',  CE,  'Hired'),
  R('2026-03-20','Luis Valencia',  ICS, 'Archived'),
  // ── Apr ──
  R('2026-04-24','Jimmy Tran',     CE,  'Hired'),
  R('2026-04-12','Jimmy Tran',     CE,  'Hired'),
  R('2026-04-08','Jimmy Tran',     CE,  'Hired'),
  R('2026-04-16','Nicole Shiu',    CE,  'Hired'),
  R('2026-04-29','Dan Dougherty',  CTO, 'Hired'),
  R('2026-04-30','Dan Dougherty',  CE,  'Hired'),
  R('2026-04-06','Ali Aguayo',     CE,  'Hired'),
  R('2026-04-23','Ali Aguayo',     CE,  'Archived'),
  R('2026-04-28','Zachary Beecher',ICS, 'Archived'),
  // ── May ──
  R('2026-05-14','Jimmy Tran',     CE,  'Hired'),
  R('2026-05-14','Jimmy Tran',     CE,  'Hired'),
  R('2026-05-18','Jimmy Tran',     CE,  'Hired'),
  R('2026-05-19','Jimmy Tran',     CE,  'Hired'),
  R('2026-05-04','Jimmy Tran',     CE,  'Hired'),
  R('2026-05-04','Dan Dougherty',  CE,  'Archived'),
  R('2026-05-08','Dan Dougherty',  CE,  'Archived'),
  R('2026-05-08','Ali Aguayo',     CE,  'Hired'),
  R('2026-05-11','Ali Aguayo',     CE,  'Archived'),
  R('2026-05-15','Luis Valencia',  ICS, 'Hired'),
  R('2026-05-08','Luis Valencia',  ICS, 'Archived'),
  R('2026-05-15','Luis Valencia',  ICS, 'Archived'),
  R('2026-05-05','Justin Lewis',   CE,  'Archived'),
  R('2026-05-19','Bianca Lucarelli',CE, 'Active'),
  R('2026-05-21','Zachary Beecher',ICS, 'Active'),
];

const HARDCODED_ORGS = {
  'Ali Aguayo':       ['Foundations'],
  'Bianca Lucarelli': ['Cloud Availability'],
  'Dan Dougherty':    ['Foundations', 'Cloud Availability'],
  'Jimmy Tran':       ['Cloud Management'],
  'Justin Lewis':     ['Managed AI', 'Data'],
  'Luis Valencia':    ['IT'],
  'Nicole Shiu':      [],
  'Troy Liebesman':   ['Foundations'],
  'Zachary Beecher':  ['Security'],
};

const HARDCODED_MANUAL_SOURCERS = [
  { id:'m_bianca', name:'Bianca Lucarelli', isNew:true },
  { id:'m_troy',   name:'Troy Liebesman',  isNew:true },
];

export default function App() {
  const [darkMode, setDarkMode]                 = useState(true);
  const [sidebarOpen, setSidebarOpen]           = useState(true);
  const [csvData, setCsvData]                   = useState(null);
  const [uploadStatus, setUploadStatus]         = useState(null);
  const [reportTitle, setReportTitle]           = useState("Talent Intelligence - Progress Tracker");
  const [reportYear, setReportYear]             = useState(String(new Date().getFullYear()));
  const [annualTarget, setAnnualTarget]         = useState('');
  const [lastUpdated, setLastUpdated]           = useState('May 21, 2026');
  const [legendExpanded, setLegendExpanded]     = useState(false);
  const [activeFilter, setActiveFilter]         = useState('all');
  const [domains, setDomains]                   = useState([]);
  const [sourcerColors, setSourcerColors]       = useState({});
  const [dragOver, setDragOver]                 = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [sourcerOrgs, setSourcerOrgs]           = useState({});
  const [manualSourcers, setManualSourcers]     = useState(HARDCODED_MANUAL_SOURCERS);
  const [newSourcerInput, setNewSourcerInput]   = useState({ name:'', isNew:true });
  const [hideNicole, setHideNicole]             = useState(false);
  const [unlocked, setUnlocked]                 = useState(false);
  const [pwInput, setPwInput]                   = useState('');
  const [pwError, setPwError]                   = useState(false);
  const fileRef = useRef();

  const t = darkMode ? DARK : LIGHT;

  const submitPassword = () => {
    if (pwInput.toLowerCase().trim() === 'raise the bar') { setUnlocked(true); setPwError(false); }
    else { setPwError(true); setPwInput(''); }
  };

  const initFromRows = useCallback((rows) => {
    const deptSet = new Set();
    const sourcerSet = new Set();
    rows.forEach(row => {
      const d = row[COL_DEPT]?.trim(); if (d) deptSet.add(d);
      (row[COL_CREDITED] || '').split(',').forEach(n => { const t = n.trim(); if (t) sourcerSet.add(t); });
    });
    setDomains(Array.from(deptSet).map((dept, i) => ({
      id: dept, rawDept: dept, displayName: dept,
      color: DOMAIN_PALETTE[i % DOMAIN_PALETTE.length],
      subteams: [], expanded: true, newSubteam: '',
    })));
    const colors = {};
    const orgs = {};
    const allNames = Array.from(new Set([...Array.from(sourcerSet), ...Object.keys(HARDCODED_ORGS)])).sort();
    allNames.forEach((s, i) => {
      colors[s] = SOURCER_PALETTE[i % SOURCER_PALETTE.length];
      orgs[s] = { orgs: HARDCODED_ORGS[s] ? [...HARDCODED_ORGS[s]] : [], newOrg: '' };
    });
    setSourcerColors(colors);
    setSourcerOrgs(prev => {
      const merged = { ...orgs };
      Object.keys(prev).forEach(k => { if (merged[k] && prev[k].orgs.length > 0) merged[k].orgs = prev[k].orgs; });
      return merged;
    });
    setCsvData(rows);
    setActiveFilter('all');
  }, []);

  useEffect(() => { initFromRows(HARDCODED_ROWS); }, []);

  const processCSV = useCallback((file) => {
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data || [];
        if (!rows.length) { setUploadStatus('error'); return; }
        if (!(COL_DATE in rows[0]) && !(COL_CREDITED in rows[0])) { setUploadStatus('error'); return; }
        initFromRows(rows);
        setUploadStatus('success');
      },
      error: () => setUploadStatus('error'),
    });
  }, [initFromRows]);

  const onFileChange = (e) => { if (e.target.files[0]) processCSV(e.target.files[0]); };
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) processCSV(e.dataTransfer.files[0]); };

  const filteredData = useMemo(() => {
    if (!csvData) return [];
    if (activeFilter === 'all') return csvData;
    return csvData.filter(row => row[COL_DEPT]?.trim() === activeFilter);
  }, [csvData, activeFilter]);

  const sourcers = useMemo(() => {
    const s = new Set();
    filteredData.forEach(row => (row[COL_CREDITED] || '').split(',').forEach(n => { const tn = n.trim(); if (tn) s.add(tn); }));
    manualSourcers.forEach(ms => s.add(ms.name));
    return Array.from(s).sort().filter(n => !(hideNicole && n === 'Nicole Shiu'));
  }, [filteredData, manualSourcers, hideNicole]);

  const yr = parseInt(reportYear) || new Date().getFullYear();

  const sourcerMonthly = useMemo(() => {
    const map = {};
    sourcers.forEach(s => { map[s] = Array(12).fill(0); });
    filteredData.forEach(row => {
      const d = new Date(row[COL_DATE]);
      if (isNaN(d.getTime()) || d.getFullYear() !== yr) return;
      const mo = d.getMonth();
      (row[COL_CREDITED] || '').split(',').forEach(n => { const name = n.trim(); if (name && map[name]) map[name][mo]++; });
    });
    return map;
  }, [filteredData, sourcers, yr]);

  const outcomesMap = useMemo(() => {
    const out = {};
    sourcers.forEach(s => { out[s] = { Hired:0, Archived:0, Active:0 }; });
    filteredData.forEach(row => {
      const d = new Date(row[COL_DATE]);
      if (isNaN(d.getTime()) || d.getFullYear() !== yr) return;
      const outcome = row[COL_OUTCOME]?.trim();
      (row[COL_CREDITED] || '').split(',').forEach(n => {
        const name = n.trim();
        if (name && out[name] && outcome && out[name][outcome] !== undefined) out[name][outcome]++;
      });
    });
    return out;
  }, [filteredData, sourcers, yr]);

  const getYTD = (s) => (sourcerMonthly[s] || []).reduce((a, b) => a + b, 0);
  const monthlyTarget = annualTarget ? Number(annualTarget) / 12 : null;

  const getStatus = (s) => {
    if (!annualTarget) return null;
    const ytd = getYTD(s);
    const now = new Date();
    const elapsed = now.getFullYear() === yr ? now.getMonth() + 1 : 12;
    const expected = (Number(annualTarget) / 12) * elapsed;
    return ytd >= expected ? 'on-pace' : ytd >= expected * 0.85 ? 'close' : 'behind';
  };
  const getCatchUp = (s) => {
    if (!annualTarget) return null;
    const remaining = Number(annualTarget) - getYTD(s);
    if (remaining <= 0) return null;
    const now = new Date();
    const left = now.getFullYear() === yr ? 12 - now.getMonth() : 1;
    return left > 0 ? Math.ceil(remaining / left) : null;
  };

  const totalYTD   = sourcers.reduce((a, s) => a + getYTD(s), 0);
  const totalHired = sourcers.reduce((a, s) => a + (outcomesMap[s]?.Hired || 0), 0);

  const isNew = (name) => manualSourcers.some(ms => ms.name === name && ms.isNew);

  const addManualSourcer = () => {
    const name = newSourcerInput.name.trim();
    if (!name) return;
    const colorIdx = Object.keys(sourcerColors).length + manualSourcers.length;
    setSourcerColors(prev => ({ ...prev, [name]: SOURCER_PALETTE[colorIdx % SOURCER_PALETTE.length] }));
    setSourcerOrgs(prev => ({ ...prev, [name]: { orgs:[], newOrg:'' } }));
    setManualSourcers(prev => [...prev, { id:'m_'+Date.now(), name, isNew: newSourcerInput.isNew }]);
    setNewSourcerInput({ name:'', isNew:true });
  };
  const removeManualSourcer = (id) => setManualSourcers(prev => prev.filter(ms => ms.id !== id));
  const toggleManualNew     = (id) => setManualSourcers(prev => prev.map(ms => ms.id === id ? { ...ms, isNew: !ms.isNew } : ms));
  const updateManualName    = (id, name) => setManualSourcers(prev => prev.map(ms => ms.id === id ? { ...ms, name } : ms));

  const updateSourcerOrg = (name, field, val) =>
    setSourcerOrgs(prev => ({ ...prev, [name]: { ...(prev[name] || { orgs:[], newOrg:'' }), [field]: val } }));
  const addSourcerOrg = (name) =>
    setSourcerOrgs(prev => {
      const entry = prev[name] || { orgs:[], newOrg:'' };
      if (!entry.newOrg.trim()) return prev;
      return { ...prev, [name]: { orgs: [...entry.orgs, entry.newOrg.trim()], newOrg: '' } };
    });
  const removeSourcerOrg = (name, org) =>
    setSourcerOrgs(prev => ({ ...prev, [name]: { ...(prev[name] || { orgs:[], newOrg:'' }), orgs: prev[name].orgs.filter(o => o !== org) } }));

  const PILL = {
    'on-pace': { bg: t.greenDim,  text: t.green,  border: t.greenBdr,  label:'On pace ✓' },
    'close':   { bg: t.goldDim,   text: t.gold,   border: t.goldBdr,   label:'Close' },
    'behind':  { bg:`rgba(240,122,74,0.08)`, text: t.danger, border:`rgba(240,122,74,0.25)`, label:'Behind' },
  };

  // Shared style helpers
  const INPUT = {
    background: t.surface, border:`1px solid ${t.border2}`, borderRadius:4,
    padding:'8px 11px', fontSize:12, width:'100%', outline:'none',
    fontFamily:"'DM Sans', sans-serif", color: t.text,
    transition:'border-color .2s',
  };
  const MONO_LABEL = {
    fontSize:9, fontWeight:500, letterSpacing:'.14em', textTransform:'uppercase',
    fontFamily:"'DM Mono', monospace", color: t.textMuted,
  };
  const NEW_BADGE = {
    background: t.goldDim, border:`1px solid ${t.goldBdr}`, color: t.gold,
    borderRadius:3, padding:'1px 6px', fontSize:9, fontWeight:500,
    letterSpacing:'.08em', fontFamily:"'DM Mono', monospace",
  };

  // ── PASSWORD GATE ──
  if (!unlocked) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background: t.bg, fontFamily:"'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
      <div style={{ background: t.surface, border:`1px solid ${t.border2}`, borderRadius:6, padding:'40px 36px', width:340, textAlign:'center' }}>
        <div style={{ ...MONO_LABEL, marginBottom:12 }}>Talent Intelligence</div>
        <div style={{ fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:700, color: t.text, marginBottom:4, letterSpacing:'-.02em' }}>
          Progress <em style={{ color: t.accent, fontStyle:'italic' }}>Tracker</em>
        </div>
        <div style={{ fontSize:11, color: t.textMuted, marginBottom:28, fontWeight:300 }}>Confidential · Internal use only</div>
        <input
          type="password" value={pwInput}
          onChange={e => { setPwInput(e.target.value); setPwError(false); }}
          onKeyDown={e => e.key === 'Enter' && submitPassword()}
          placeholder="Enter password"
          autoFocus
          style={{ ...INPUT, textAlign:'center', marginBottom:8, borderColor: pwError ? t.danger : t.border2, background: pwError ? `rgba(240,122,74,0.06)` : t.surface }}
        />
        {pwError && <div style={{ fontSize:11, color: t.danger, marginBottom:10, fontWeight:400 }}>Incorrect — try again</div>}
        <button onClick={submitPassword} style={{ width:'100%', background: t.accent, border:'none', borderRadius:4, padding:'10px', fontSize:12, fontWeight:500, color:'#fff', cursor:'pointer', fontFamily:"'DM Sans', sans-serif", letterSpacing:'.03em' }}>
          Unlock →
        </button>
        <div style={{ marginTop:20, ...MONO_LABEL, opacity:.4 }}>Talent Intelligence</div>
      </div>
    </div>
  );

  // ── MAIN APP ──
  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:"'DM Sans', sans-serif", background: t.bg, color: t.text, overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.border2}; border-radius:4px; }
        .filter-btn:hover { opacity:.8; }
        .org-chip:hover { opacity:.65; }
        .remove-btn:hover { color: ${t.danger} !important; }
        input::placeholder { color: ${t.textDim}; font-style: italic; }
        input:focus { border-color: ${t.accentBdr} !important; box-shadow: 0 0 0 3px ${t.accentDim}; }
      `}</style>

      {/* ─── SIDEBAR ─── */}
      {sidebarOpen && (
        <aside style={{ width:268, minWidth:268, background: t.surface, borderRight:`1px solid ${t.border}`, display:'flex', flexDirection:'column', overflowY:'auto', zIndex:10, flexShrink:0 }}>
          {/* Sidebar header */}
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background: t.surface, zIndex:2 }}>
            <div>
              <div style={{ ...MONO_LABEL, marginBottom:3 }}>Talent Intelligence</div>
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:15, fontWeight:700, color: t.text, letterSpacing:'-.01em' }}>Controls</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {/* Dark/light toggle */}
              <button
                onClick={() => setDarkMode(m => !m)}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{ background: t.surface2, border:`1px solid ${t.border2}`, borderRadius:4, padding:'4px 8px', cursor:'pointer', fontSize:13, lineHeight:1, color: t.textMuted, fontFamily:'inherit' }}>
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={() => setSidebarOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color: t.textDim, lineHeight:1, padding:'2px 4px' }}>✕</button>
            </div>
          </div>

          <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:18, flex:1 }}>

            {/* Upload */}
            <div>
              <div style={{ ...MONO_LABEL, marginBottom:8 }}>Data Source</div>
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current.click()}
                style={{ border:`1px dashed ${dragOver ? t.teal : t.border2}`, borderRadius:4, padding:'14px 12px', textAlign:'center', cursor:'pointer', background: dragOver ? t.tealDim : t.surface2, transition:'all .2s' }}>
                <div style={{ fontSize:20, marginBottom:4 }}>📂</div>
                <div style={{ fontSize:11, fontWeight:400, color: t.textMuted }}>Drop CSV or click to upload</div>
                <div style={{ fontSize:10, color: t.textDim, marginTop:2, fontStyle:'italic' }}>Ashby export format</div>
              </div>
              <input ref={fileRef} type="file" accept=".csv" onChange={onFileChange} style={{ display:'none' }} />
              {uploadStatus === 'success' && <div style={{ marginTop:6, fontSize:11, color: t.teal, fontWeight:500 }}>✓ CSV loaded</div>}
              {uploadStatus === 'error'   && <div style={{ marginTop:6, fontSize:11, color: t.danger, fontWeight:500 }}>⚠ Check column format</div>}
            </div>

            {/* Settings */}
            <div>
              <div style={{ ...MONO_LABEL, marginBottom:8 }}>Report Settings</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <input value={reportTitle} onChange={e => setReportTitle(e.target.value)} style={INPUT} placeholder="Report title" />
                <input value={reportYear} onChange={e => setReportYear(e.target.value)} type="number" style={INPUT} placeholder="Year" />
                <input value={annualTarget} onChange={e => setAnnualTarget(e.target.value)} type="number" style={{ ...INPUT, fontSize:11 }} placeholder="Annual target per sourcer (optional)" />
                {/* Hide Nicole toggle */}
                <label style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', border:`1px solid ${hideNicole ? t.goldBdr : t.border}`, borderRadius:4, cursor:'pointer', background: hideNicole ? t.goldDim : t.surface2, transition:'all .15s', userSelect:'none', marginTop:2 }}>
                  <span style={{ fontSize:11, color: hideNicole ? t.gold : t.textMuted, fontWeight: hideNicole ? 500 : 300 }}>Hide Nicole Shiu</span>
                  <div onClick={() => setHideNicole(o => !o)} style={{ width:30, height:17, borderRadius:20, background: hideNicole ? t.gold : t.border2, position:'relative', transition:'background .2s', flexShrink:0 }}>
                    <div style={{ position:'absolute', top:2, left: hideNicole ? 15 : 2, width:13, height:13, borderRadius:'50%', background: t.surface, boxShadow:'0 1px 3px rgba(0,0,0,0.3)', transition:'left .2s' }} />
                  </div>
                </label>
              </div>
            </div>

            {/* Team Members */}
            <div>
              <div style={{ ...MONO_LABEL, marginBottom:6 }}>Team Members</div>
              <div style={{ fontSize:10, color: t.textDim, marginBottom:8, lineHeight:1.6, fontStyle:'italic' }}>Add sourcers not yet in the CSV.</div>
              {manualSourcers.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:8 }}>
                  {manualSourcers.map(ms => (
                    <div key={ms.id} style={{ display:'flex', alignItems:'center', gap:6, background: t.surface2, border:`1px solid ${t.border}`, borderRadius:4, padding:'5px 9px' }}>
                      <div style={{ width:7, height:7, borderRadius:2, background:sourcerColors[ms.name] || t.accent, flexShrink:0 }} />
                      <input value={ms.name} onChange={e => updateManualName(ms.id, e.target.value)}
                        style={{ flex:1, border:'none', borderBottom:`1px dashed ${t.border2}`, background:'transparent', fontSize:11, fontWeight:400, outline:'none', fontFamily:"'DM Sans', sans-serif", color: t.text, minWidth:0 }} />
                      <button onClick={() => toggleManualNew(ms.id)}
                        style={{ background: ms.isNew ? t.goldDim : 'transparent', border:`1px solid ${ms.isNew ? t.goldBdr : t.border2}`, borderRadius:3, padding:'1px 6px', fontSize:9, cursor:'pointer', color: ms.isNew ? t.gold : t.textDim, letterSpacing:'.06em', fontFamily:"'DM Mono', monospace", flexShrink:0 }}>
                        NEW
                      </button>
                      <button className="remove-btn" onClick={() => removeManualSourcer(ms.id)}
                        style={{ background:'none', border:'none', cursor:'pointer', color: t.textDim, fontSize:13, padding:'0 2px', lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                <input value={newSourcerInput.name} onChange={e => setNewSourcerInput(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addManualSourcer()}
                  placeholder="Sourcer name…"
                  style={{ ...INPUT, fontSize:11 }} />
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer', flex:1 }}>
                    <input type="checkbox" checked={newSourcerInput.isNew} onChange={e => setNewSourcerInput(p => ({ ...p, isNew: e.target.checked }))}
                      style={{ accentColor: t.gold, width:12, height:12 }} />
                    <span style={{ fontSize:11, color: t.textMuted, fontWeight:300 }}>Mark as new hire</span>
                  </label>
                  <button onClick={addManualSourcer} style={{ background: t.accentDim, border:`1px solid ${t.accentBdr}`, borderRadius:4, padding:'5px 12px', fontSize:11, fontWeight:500, color: t.accent, cursor:'pointer', fontFamily:"'DM Sans', sans-serif", flexShrink:0 }}>
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* How to Save */}
            <div style={{ marginTop:'auto' }}>
              <button onClick={() => setInstructionsOpen(o => !o)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', padding:0, ...MONO_LABEL, width:'100%', fontFamily:"'DM Mono', monospace" }}>
                How to Save in Chrome
                <span style={{ color: t.gold, fontSize:11 }}>{instructionsOpen ? '▾' : '▸'}</span>
              </button>
              {instructionsOpen && (
                <div style={{ marginTop:8, fontSize:11, color: t.textMuted, lineHeight:1.8, padding:'8px 10px', background: t.surface2, borderRadius:4, border:`1px solid ${t.border}`, fontWeight:300 }}>
                  1. Press <code style={{ background: t.surface3, padding:'1px 4px', borderRadius:2, fontSize:10, color: t.accent }}>Cmd+P</code><br />
                  2. Destination → "Save as PDF"<br />
                  3. Margins → None<br />
                  4. Enable "Background graphics"
                </div>
              )}
            </div>

          </div>
        </aside>
      )}

      {/* Sidebar reopen tab */}
      {!sidebarOpen && (
        <div style={{ position:'fixed', left:0, top:'50%', transform:'translateY(-50%)', zIndex:20 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: t.surface, border:`1px solid ${t.border2}`, borderLeft:'none', borderRadius:'0 4px 4px 0', padding:'12px 5px', cursor:'pointer', writingMode:'vertical-rl', ...MONO_LABEL, fontFamily:"'DM Mono', monospace" }}>
            MENU
          </button>
        </div>
      )}

      {/* ─── MAIN PANEL ─── */}
      <main style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', minWidth:0, position:'relative' }}>
        {/* Noise texture (dark only) */}
        {t.noise && <div style={{ position:'fixed', inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, opacity:.022, pointerEvents:'none', zIndex:0 }} />}

        {/* Sticky header */}
        <div style={{ padding:'20px 28px 0', background: t.bg, position:'sticky', top:0, zIndex:5, borderBottom:`1px solid ${t.border}` }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:2 }}>
            <div style={{ minWidth:0 }}>
              <div style={{ ...MONO_LABEL, marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:3, height:3, borderRadius:'50%', background: t.accent, opacity:.7, display:'inline-block' }} />
                Talent Intelligence Hub
                <span style={{ width:3, height:3, borderRadius:'50%', background: t.accent, opacity:.7, display:'inline-block' }} />
                Progress Tracker
              </div>
              <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:700, margin:0, letterSpacing:'-.02em', color: t.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {reportTitle.replace('Talent Intelligence - ', '').split('Tracker')[0]}
                <em style={{ color: t.accent, fontStyle:'italic' }}>Tracker</em>
              </h1>
              <div style={{ fontSize:11, color: t.textMuted, marginTop:3, fontWeight:300 }}>Offer outcomes & monthly results by sourcer · Jan–Dec {reportYear}</div>
              <div style={{ fontSize:9, color: t.textDim, marginTop:3, fontFamily:"'DM Mono', monospace", letterSpacing:'.06em' }}>prepared by Nicole Shiu</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0, marginTop:4 }}>
              <span style={{ ...MONO_LABEL, fontSize:9 }}>Last updated:</span>
              <input value={lastUpdated} onChange={e => setLastUpdated(e.target.value)} placeholder="—"
                style={{ border:'none', borderBottom:`1px dashed ${t.border2}`, background:'transparent', fontSize:11, outline:'none', width:88, color: t.textMuted, fontFamily:"'DM Mono', monospace" }} />
            </div>
          </div>

          {/* Filter bar */}
          {domains.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:4, padding:'10px 0 12px' }}>
              <button className="filter-btn" onClick={() => setActiveFilter('all')} style={{ padding:'3px 12px', border:`1px solid ${activeFilter==='all' ? t.accentBdr : t.border}`, borderRadius:3, fontSize:10, fontWeight:500, cursor:'pointer', transition:'all .15s', background: activeFilter==='all' ? t.accentDim : 'transparent', color: activeFilter==='all' ? t.accent : t.textMuted, fontFamily:"'DM Mono', monospace", letterSpacing:'.06em' }}>
                ALL
              </button>
              {domains.map(dom => (
                <button key={dom.id} className="filter-btn" onClick={() => setActiveFilter(dom.rawDept)} style={{ padding:'3px 12px', border:`1px solid`, borderLeft:`3px solid ${dom.color}`, borderColor: activeFilter===dom.rawDept ? dom.color : t.border, borderRadius:3, fontSize:10, fontWeight:500, cursor:'pointer', transition:'all .15s', background: activeFilter===dom.rawDept ? `${dom.color}18` : 'transparent', color: activeFilter===dom.rawDept ? dom.color : t.textMuted, fontFamily:"'DM Mono', monospace", letterSpacing:'.06em' }}>
                  {dom.displayName.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding:'20px 28px 48px', flex:1, position:'relative', zIndex:1 }}>

          {csvData && sourcers.length === 0 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, color: t.textDim, fontSize:13 }}>
              No sourcer data found for {reportYear}{activeFilter !== 'all' ? ' in selected domain' : ''}.
            </div>
          )}

          {csvData && sourcers.length > 0 && (
            <>
              {/* Legend */}
              <div style={{ marginBottom:12, border:`1px solid ${t.border}`, borderRadius:4, overflow:'hidden', background: t.surface }}>
                <button onClick={() => setLegendExpanded(o => !o)} style={{ width:'100%', background:'transparent', border:'none', padding:'9px 14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', fontFamily:"'DM Sans', sans-serif" }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ ...MONO_LABEL }}>Legend</span>
                    {!legendExpanded && sourcers.map(s => (
                      <span key={s} style={{ display:'inline-block', width:8, height:8, borderRadius:2, background:sourcerColors[s] || t.accent }} />
                    ))}
                  </div>
                  <span style={{ color: t.gold, fontSize:12 }}>{legendExpanded ? '▾' : '▸'}</span>
                </button>
                {legendExpanded && (
                  <div style={{ padding:'10px 14px', borderTop:`1px solid ${t.border}`, display:'flex', flexWrap:'wrap', gap:14 }}>
                    {sourcers.map(s => {
                      const c = sourcerColors[s] || t.accent;
                      return (
                        <div key={s} style={{ display:'flex', alignItems:'center', gap:7, fontSize:11 }}>
                          <span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:c }} />
                          <span style={{ fontWeight:400, color: t.text }}>{s}</span>
                          {isNew(s) && <span style={NEW_BADGE}>NEW</span>}
                          {annualTarget && <svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke={c} strokeWidth="1.5" strokeDasharray="4 2" /></svg>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Per-sourcer charts */}
              {sourcers.map((s, idx) => {
                const monthly = sourcerMonthly[s] || Array(12).fill(0);
                const chartData = MONTHS.map((m, i) => ({ month: m, offers: monthly[i] }));
                const ytd = getYTD(s);
                const color = sourcerColors[s] || SOURCER_PALETTE[idx % SOURCER_PALETTE.length];
                return (
                  <div key={s} style={{ marginBottom:6, background: t.surface, border:`1px solid ${t.border}`, borderRadius:4, overflow:'hidden' }}>
                    <div style={{ padding:'10px 16px', borderBottom:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:color, flexShrink:0 }} />
                        <span style={{ fontWeight:500, fontSize:13 }}>{s}</span>
                        {isNew(s) && <span style={NEW_BADGE}>NEW</span>}
                      </div>
                      <div style={{ fontSize:11, color: t.textMuted, fontFamily:"'DM Mono', monospace" }}>
                        {isNew(s)
                          ? <span style={{ fontStyle:'italic', color: t.textDim }}>No offers yet</span>
                          : <><span style={{ fontWeight:700, fontSize:16, color: t.text }}>{ytd}</span> offers YTD</>
                        }
                      </div>
                    </div>
                    <div style={{ padding:'10px 4px 4px' }}>
                      <ResponsiveContainer width="100%" height={100}>
                        <BarChart data={chartData} margin={{ top:2, right:10, left:-24, bottom:0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize:9, fill: t.textDim, fontFamily:"'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize:9, fill: t.textDim }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{ background: t.surface2, border:`1px solid ${t.border2}`, borderRadius:4, fontSize:11, fontFamily:"'DM Sans', sans-serif", color: t.text }}
                            labelStyle={{ fontWeight:600, color: t.text, marginBottom:2 }}
                            formatter={(val) => [val, 'Offers']}
                            cursor={{ fill: t.accentDim }}
                          />
                          <Bar dataKey="offers" fill={color} radius={[2,2,0,0]} maxBarSize={24} />
                          {monthlyTarget && (
                            <ReferenceLine y={monthlyTarget} stroke={color} strokeDasharray="5 3" strokeOpacity={0.5} strokeWidth={1.5} />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}

              {/* Summary */}
              <div style={{ marginTop:14, background: t.surface, border:`1px solid ${t.border}`, borderRadius:4, padding:'14px 18px' }}>
                <div style={{ ...MONO_LABEL, marginBottom:12 }}>Summary</div>
                <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                  <div style={{ background: t.surface2, border:`1px solid ${t.border}`, borderRadius:4, padding:'10px 16px', minWidth:110 }}>
                    <div style={{ ...MONO_LABEL, fontSize:8, marginBottom:4 }}>Total Offers YTD</div>
                    <div style={{ fontSize:24, fontWeight:700, fontFamily:"'Playfair Display', serif", color: t.text }}>{totalYTD}</div>
                  </div>
                  <div style={{ background: t.greenDim, border:`1px solid ${t.greenBdr}`, borderRadius:4, padding:'10px 16px', minWidth:110 }}>
                    <div style={{ ...MONO_LABEL, fontSize:8, color: t.green, marginBottom:4 }}>Total Hired YTD</div>
                    <div style={{ fontSize:24, fontWeight:700, fontFamily:"'Playfair Display', serif", color: t.green }}>{totalHired}</div>
                  </div>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {sourcers.map(s => {
                    const status = getStatus(s);
                    const catchUp = getCatchUp(s);
                    const ytd = getYTD(s);
                    const c = sourcerColors[s];
                    const pill = status ? PILL[status] : null;
                    return (
                      <div key={s} style={{ flex:'1 1 130px', border:`1px solid ${t.border}`, borderRadius:4, padding:'10px 12px', minWidth:120, background: t.surface2 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                          <div style={{ width:7, height:7, borderRadius:2, background:c, flexShrink:0 }} />
                          <span style={{ fontSize:11, fontWeight:400, color: t.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{s}</span>
                          {isNew(s) && <span style={NEW_BADGE}>NEW</span>}
                        </div>
                        {isNew(s)
                          ? <div style={{ fontSize:11, color: t.textDim, fontStyle:'italic', marginBottom:3 }}>No offers yet</div>
                          : <div style={{ fontSize:20, fontWeight:700, fontFamily:"'Playfair Display', serif", marginBottom:5, color: t.text }}>{ytd}</div>
                        }
                        {pill && !isNew(s) && (
                          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                            <span style={{ display:'inline-block', background:pill.bg, color:pill.text, border:`1px solid ${pill.border}`, borderRadius:3, padding:'1px 8px', fontSize:9, fontWeight:500, width:'fit-content', fontFamily:"'DM Mono', monospace", letterSpacing:'.05em' }}>
                              {pill.label}
                            </span>
                            {catchUp && <span style={{ fontSize:10, color: t.textDim, fontWeight:300 }}>Needs {catchUp}/mo</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Offer Outcomes */}
              <div style={{ marginTop:14 }}>
                <div style={{ ...MONO_LABEL, marginBottom:10 }}>Offer Outcomes</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {sourcers.map(s => {
                    const oc = outcomesMap[s] || { Hired:0, Archived:0, Active:0 };
                    const total = oc.Hired + oc.Archived + oc.Active;
                    const pct = (n) => total ? Math.round(n / total * 100) : 0;
                    const c = sourcerColors[s];
                    const rows = [
                      ['Hired',    t.green,  t.greenDim,  t.greenBdr],
                      ['Archived', t.danger, `rgba(240,122,74,0.08)`, `rgba(240,122,74,0.25)`],
                      ['Active',   t.accent, t.accentDim, t.accentBdr],
                    ];
                    return (
                      <div key={s} style={{ flex:'1 1 160px', background: t.surface, border:`1px solid ${t.border}`, borderRadius:4, overflow:'hidden', minWidth:140 }}>
                        <div style={{ padding:'8px 13px', borderBottom:`1px solid ${t.border}`, display:'flex', alignItems:'center', gap:6 }}>
                          <div style={{ width:7, height:7, borderRadius:2, background:c, flexShrink:0 }} />
                          <span style={{ fontSize:11, fontWeight:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{s}</span>
                          {isNew(s) && <span style={NEW_BADGE}>NEW</span>}
                        </div>
                        <div style={{ padding:'8px 13px' }}>
                          {rows.map(([label, text, bg, border]) => (
                            <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 0', borderBottom:`1px solid ${t.border}` }}>
                              <span style={{ display:'inline-block', background:bg, color:text, border:`1px solid ${border}`, borderRadius:3, padding:'1px 6px', fontSize:9, fontWeight:500, fontFamily:"'DM Mono', monospace", letterSpacing:'.05em' }}>{label}</span>
                              <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                                <span style={{ fontSize:13, fontWeight:600, fontFamily:"'Playfair Display', serif" }}>{oc[label]}</span>
                                <span style={{ fontSize:9, color: t.textDim, fontFamily:"'DM Mono', monospace", minWidth:26, textAlign:'right' }}>{pct(oc[label])}%</span>
                              </div>
                            </div>
                          ))}
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'5px 0' }}>
                            <span style={{ ...MONO_LABEL, fontSize:8 }}>Total</span>
                            <span style={{ fontSize:14, fontWeight:700, fontFamily:"'Playfair Display', serif", color: t.text }}>{total}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Org Coverage */}
              <div style={{ marginTop:14 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ ...MONO_LABEL }}>Org Coverage</div>
                  <span style={{ fontSize:9, color: t.textDim, fontStyle:'italic', fontFamily:"'DM Sans', sans-serif" }}>Click + to assign · hover chip to remove</span>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {sourcers.map(s => {
                    const c = sourcerColors[s];
                    const entry = sourcerOrgs[s] || { orgs:[], newOrg:'' };
                    return (
                      <div key={s} style={{ flex:'1 1 190px', background: t.surface, border:`1px solid ${t.border}`, borderRadius:4, overflow:'hidden', minWidth:170 }}>
                        <div style={{ padding:'8px 13px', borderBottom:`1px solid ${t.border}`, display:'flex', alignItems:'center', gap:7, background: t.surface2 }}>
                          <div style={{ width:7, height:7, borderRadius:2, background:c, flexShrink:0 }} />
                          <span style={{ fontSize:11, fontWeight:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{s}</span>
                          {isNew(s) && <span style={NEW_BADGE}>NEW</span>}
                        </div>
                        <div style={{ padding:'10px 12px' }}>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:4, minHeight:26, marginBottom: entry.orgs.length ? 8 : 0 }}>
                            {entry.orgs.length === 0 && <span style={{ fontSize:10, color: t.textDim, fontStyle:'italic', lineHeight:'26px' }}>No orgs assigned yet</span>}
                            {entry.orgs.map(org => (
                              <span key={org} className="org-chip" onClick={() => removeSourcerOrg(s, org)}
                                style={{ display:'inline-flex', alignItems:'center', gap:3, background:`${c}18`, border:`1px solid ${c}44`, color:c, borderRadius:3, padding:'2px 8px', fontSize:10, fontWeight:500, cursor:'pointer', transition:'opacity .15s', userSelect:'none', fontFamily:"'DM Mono', monospace", letterSpacing:'.03em' }}>
                                {org}
                                <span style={{ fontSize:9, opacity:.4 }}>×</span>
                              </span>
                            ))}
                          </div>
                          <div style={{ display:'flex', gap:4 }}>
                            <input value={entry.newOrg} onChange={e => updateSourcerOrg(s, 'newOrg', e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && addSourcerOrg(s)} placeholder="Add org…"
                              style={{ flex:1, border:`1px solid ${t.border2}`, borderRadius:4, padding:'4px 8px', fontSize:11, outline:'none', fontFamily:"'DM Sans', sans-serif", color: t.text, background: t.surface2, minWidth:0 }} />
                            <button onClick={() => addSourcerOrg(s)} style={{ background:c, border:'none', borderRadius:4, padding:'4px 10px', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', lineHeight:1, flexShrink:0 }}>+</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </>
          )}

          {/* Footer credit */}
          <div style={{ textAlign:'right', padding:'24px 0 4px', fontSize:9, color: t.textDim, letterSpacing:'.08em', userSelect:'none', fontFamily:"'DM Mono', monospace" }}>
            designed by Nicole Shiu
          </div>
        </div>
      </main>
    </div>
  );
}
