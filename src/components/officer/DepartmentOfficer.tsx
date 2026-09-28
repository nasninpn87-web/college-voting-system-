import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';

const DEPT_CODES = ['CS', 'ENG', 'BUS', 'ART', 'SCI', 'LAW'];
const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
];

export const DepartmentOfficer: React.FC = () => {
  const {
    currentUser,
    departments,
    races,
    students,
    addStudent,
    removeStudent,
    addCandidateToRace,
    removeCandidateFromRace,
    showToast,
  } = useElection();

  const deptCodes = departments.map(d => d.code);

  // Active tab
  const [activeTab, setActiveTab] = useState<'voters' | 'candidates' | 'add-voter' | 'add-candidate'>('voters');

  // Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'voted' | 'not-voted'>('all');

  // Add Voter form
  const [voterName, setVoterName] = useState('');
  const [voterDept, setVoterDept] = useState('CS');
  const [voterYear, setVoterYear] = useState('Freshman');

  // Add Candidate form
  const [candName, setCandName] = useState('');
  const [candSlate, setCandSlate] = useState('');
  const [candMajor, setCandMajor] = useState('');
  const [candYear, setCandYear] = useState('Senior');
  const [candTagline, setCandTagline] = useState('');
  const [candRace, setCandRace] = useState(races[0]?.id || 'race-pres');
  const [candDept, setCandDept] = useState('CS');

  const deptData = departments.find(d => d.code === 'ENG') || departments[0];

  // Filtered voters
  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'all' || (filterStatus === 'voted' && s.hasVoted) || (filterStatus === 'not-voted' && !s.hasVoted);
    return matchSearch && matchFilter;
  });

  const votedCount = students.filter(s => s.hasVoted).length;
  const pendingCount = students.filter(s => !s.hasVoted).length;

  // Credential display after registration
  const [lastCredentials, setLastCredentials] = useState<{ studentId: string; password: string; name: string; dept: string } | null>(null);

  const handleAddVoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName.trim()) { showToast('Enter the student name.', 'warning'); return; }
    const { studentId, password } = addStudent(voterName.trim(), voterDept, voterYear);
    setLastCredentials({ studentId, password, name: voterName.trim(), dept: voterDept });
    showToast(`${voterName.trim()} registered as ${studentId}`, 'check_circle');
    setVoterName('');
  };

  const copyCredentials = () => {
    if (!lastCredentials) return;
    const text = `CampusVote Login Credentials\n─────────────────────────\nStudent ID: ${lastCredentials.studentId}\nPassword:   ${lastCredentials.password}\nStudent:    ${lastCredentials.name}\nDepartment: ${lastCredentials.dept}\n─────────────────────────\nLogin at: CampusVote Portal`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Credentials copied to clipboard!', 'content_copy');
    });
  };

  const printCredentials = () => {
    if (!lastCredentials) return;
    const printWindow = window.open('', '_blank', 'width=400,height=350');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Student Credentials</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 30px; text-align: center; }
          .card { border: 2px solid #ff6b00; border-radius: 16px; padding: 24px; max-width: 320px; margin: 0 auto; }
          .logo { font-size: 20px; font-weight: 800; color: #ff6b00; margin-bottom: 12px; }
          .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-top: 12px; }
          .value { font-size: 18px; font-weight: 700; color: #0d1c2e; font-family: monospace; }
          .name { font-size: 14px; color: #565e74; margin-top: 4px; }
          hr { border: none; border-top: 1px dashed #ddd; margin: 16px 0; }
          .footer { font-size: 10px; color: #aaa; margin-top: 16px; }
        </style></head><body>
        <div class="card">
          <div class="logo">🗳️ CampusVote</div>
          <div class="name">${lastCredentials.name} · ${lastCredentials.dept}</div>
          <hr/>
          <div class="label">Student ID (Username)</div>
          <div class="value">${lastCredentials.studentId}</div>
          <div class="label" style="margin-top:16px">Password</div>
          <div class="value">${lastCredentials.password}</div>
          <hr/>
          <div class="footer">Keep this confidential. Use these credentials to log in and cast your vote.</div>
        </div>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName.trim()) { showToast('Enter the candidate name.', 'warning'); return; }
    if (!candSlate.trim()) { showToast('Enter a party/slate name.', 'warning'); return; }

    const colors = ['#ff6b00', '#3b82f6', '#10b981', '#a855f7', '#f43f5e', '#eab308'];
    addCandidateToRace(candRace, {
      name: candName.trim(),
      slate: candSlate.trim(),
      partyColor: colors[Math.floor(Math.random() * colors.length)],
      major: candMajor || 'Undeclared',
      year: candYear,
      gpa: (3.0 + Math.random() * 0.9).toFixed(2),
      photoUrl: AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)],
      tagline: candTagline || `Vote for ${candName.trim()}!`,
      bio: `${candName.trim()} is running for office to make a difference.`,
      policyPillars: ['Committed to student welfare'],
      endorsements: [],
      dept: candDept,
    });
    setCandName(''); setCandSlate(''); setCandMajor(''); setCandTagline('');
    setActiveTab('candidates');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">domain_verification</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-[#0d1c2e]">Department Officer</h1>
              <p className="text-xs text-[#565e74]">{currentUser.name} • {deptData.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-center">
              <div className="text-[10px] font-bold text-[#8e7164] uppercase">Voted</div>
              <div className="font-display font-bold text-lg text-emerald-700">{votedCount}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 text-center">
              <div className="text-[10px] font-bold text-[#8e7164] uppercase">Pending</div>
              <div className="font-display font-bold text-lg text-slate-600">{pendingCount}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#ffdbcc]/50 text-center">
              <div className="text-[10px] font-bold text-[#8e7164] uppercase">Turnout</div>
              <div className="font-display font-bold text-lg text-[#a04100]">{deptData.turnoutPct}%</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-[#eff4ff] border border-white/60 w-fit">
          {([
            { id: 'voters', label: 'Voters', icon: 'group' },
            { id: 'candidates', label: 'Candidates', icon: 'person_raised_hand' },
            { id: 'add-voter', label: '+ Add Voter', icon: 'person_add' },
            { id: 'add-candidate', label: '+ Add Candidate', icon: 'person_add' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#ff6b00] text-white shadow-sm'
                  : 'text-[#565e74] hover:text-[#0d1c2e] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── VOTERS TAB ── */}
        {activeTab === 'voters' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-display font-bold text-lg text-[#0d1c2e]">Registered Voters</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-0.5 rounded-full bg-[#eff4ff]">
                  {(['all', 'voted', 'not-voted'] as const).map(f => (
                    <button key={f} onClick={() => setFilterStatus(f)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                        filterStatus === f ? 'bg-[#ff6b00] text-white' : 'text-[#565e74]'
                      }`}>
                      {f === 'all' ? 'All' : f === 'voted' ? '✓ Voted' : '○ Pending'}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-[14px] text-[#8e7164]">search</span>
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="pl-7 pr-3 py-1.5 rounded-full bg-[#eff4ff] text-xs border border-slate-200 focus:outline-none focus:border-[#ff6b00] w-36" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filtered.map(s => (
                <div key={s.studentId} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  s.hasVoted ? 'bg-emerald-50 border-emerald-200/60' : 'bg-white border-slate-200/60'
                }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    s.hasVoted ? 'bg-emerald-200 text-emerald-800' : 'bg-[#eff4ff] text-[#565e74]'
                  }`}>{s.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#0d1c2e] truncate">{s.name}</div>
                    <div className="text-[11px] text-[#8e7164] font-mono">{s.studentId} · {s.dept} · {s.year}</div>
                    <div className="text-[10px] text-[#565e74] font-mono mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">key</span>
                      pw: {s.password}
                    </div>
                  </div>
                  {s.hasVoted ? (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {s.time}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#8e7164] shrink-0">Pending</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove voter ${s.name} (${s.studentId})?`)) {
                        removeStudent(s.studentId);
                      }
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Delete voter"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-8 text-[#8e7164] text-sm">
                  <span className="material-symbols-outlined text-2xl block mb-1">search_off</span>
                  No voters found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CANDIDATES TAB ── */}
        {activeTab === 'candidates' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col gap-4">
            <h2 className="font-display font-bold text-lg text-[#0d1c2e]">Registered Candidates</h2>
            <div className="flex flex-col gap-4">
              {races.map(race => (
                <div key={race.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-[#8e7164]">Race #{race.code}</span>
                    <span className="text-sm font-bold text-[#0d1c2e]">{race.title}</span>
                    <span className="text-[11px] text-[#565e74]">({race.candidates.length} candidates)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {race.candidates.map(c => {
                      const pct = race.totalVotes > 0 ? Math.round((c.votes / race.totalVotes) * 100) : 0;
                      return (
                        <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#eff4ff]/60 border border-slate-200/40">
                          <img src={c.photoUrl} alt={c.name} className="w-9 h-9 rounded-full object-cover border border-white shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#0d1c2e] truncate">{c.name}</div>
                            <div className="text-[11px] text-[#565e74] truncate">{c.slate}</div>
                            <div className="w-full bg-slate-200 rounded-full h-1 mt-1 overflow-hidden">
                              <div className="bg-[#ff6b00] h-full rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#a04100] shrink-0">{pct}%</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Remove candidate ${c.name} from ${race.title}?`)) {
                                removeCandidateFromRace(race.id, c.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                            title="Delete candidate"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ADD VOTER FORM ── */}
        {activeTab === 'add-voter' && (
          <div className="flex flex-col gap-5 max-w-lg">
            {/* Registration Form */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="font-display font-bold text-lg text-[#0d1c2e] mb-1">Register New Voter</h2>
              <p className="text-xs text-[#565e74] mb-5">Add a student to the voter registry. A Student ID and password will be generated and issued automatically.</p>

              <form onSubmit={handleAddVoter} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider block mb-1">Full Name</label>
                  <input type="text" value={voterName} onChange={e => setVoterName(e.target.value)} placeholder="e.g. Sarah Johnson"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border border-transparent focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 text-sm outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider block mb-1">Department</label>
                    <select value={voterDept} onChange={e => setVoterDept(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#eff4ff] border border-transparent focus:border-[#ff6b00] text-sm outline-none">
                      {deptCodes.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider block mb-1">Year</label>
                    <select value={voterYear} onChange={e => setVoterYear(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#eff4ff] border border-transparent focus:border-[#ff6b00] text-sm outline-none">
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-xl bg-[#ff6b00] hover:bg-[#a04100] text-white font-bold text-sm shadow-[0_4px_16px_rgba(255,107,0,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Register & Issue Credentials
                </button>
              </form>
            </div>

            {/* Credential Card — shown after successful registration */}
            {lastCredentials && (
              <div className="relative bg-gradient-to-br from-[#0d1c2e] to-[#1a3a5c] rounded-2xl shadow-xl p-6 text-white overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b00]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#ff6b00]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#ff6b00] flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-lg">badge</span>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b00]">Issued Credentials</div>
                        <div className="text-xs text-white/60">Give these to the student</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-emerald-400 text-2xl">verified</span>
                  </div>

                  {/* Student Info */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-full bg-[#ff6b00]/20 flex items-center justify-center text-[#ff6b00] font-bold text-sm">
                      {lastCredentials.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{lastCredentials.name}</div>
                      <div className="text-xs text-white/50">{lastCredentials.dept} Department</div>
                    </div>
                  </div>

                  {/* Credentials */}
                  <div className="grid grid-cols-1 gap-3 mb-5">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b00] mb-1">Student ID (Login Username)</div>
                      <div className="font-mono font-bold text-lg tracking-wider">{lastCredentials.studentId}</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b00] mb-1">Password</div>
                      <div className="font-mono font-bold text-lg tracking-wider">{lastCredentials.password}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button onClick={copyCredentials}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      Copy
                    </button>
                    <button onClick={printCredentials}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">print</span>
                      Print
                    </button>
                    <button onClick={() => { setLastCredentials(null); }}
                      className="flex-1 py-2.5 rounded-xl bg-[#ff6b00] hover:bg-[#a04100] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      Register Another
                    </button>
                  </div>

                  {/* Security notice */}
                  <div className="mt-3 flex items-start gap-1.5 text-[10px] text-white/40">
                    <span className="material-symbols-outlined text-[12px] mt-0.5">info</span>
                    <span>These credentials are shown only once. Ensure the student receives them securely before closing.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ADD CANDIDATE FORM ── */}
        {activeTab === 'add-candidate' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-lg">
            <h2 className="font-display font-bold text-lg text-[#0d1c2e] mb-1">Register New Candidate</h2>
            <p className="text-xs text-[#565e74] mb-5">Add a candidate to a council race from your department.</p>

            <form onSubmit={handleAddCandidate} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider block mb-1">Candidate Name</label>
                <input type="text" value={candName} onChange={e => setCandName(e.target.value)} placeholder="e.g. Alex Rivera"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border border-transparent focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 text-sm outline-none" required />
              </div>
              <div>
                <label className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider block mb-1">Party / Slate</label>
                <input type="text" value={candSlate} onChange={e => setCandSlate(e.target.value)} placeholder="e.g. Student Unity Party"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border border-transparent focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 text-sm outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider block mb-1">Race</label>
                  <select value={candRace} onChange={e => setCandRace(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#eff4ff] border border-transparent focus:border-[#ff6b00] text-sm outline-none">
                    {races.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider block mb-1">Department</label>
                  <select value={candDept} onChange={e => setCandDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#eff4ff] border border-transparent focus:border-[#ff6b00] text-sm outline-none">
                    {deptCodes.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider block mb-1">Major</label>
                  <input type="text" value={candMajor} onChange={e => setCandMajor(e.target.value)} placeholder="e.g. Computer Science"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border border-transparent focus:border-[#ff6b00] text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider block mb-1">Year</label>
                  <select value={candYear} onChange={e => setCandYear(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#eff4ff] border border-transparent focus:border-[#ff6b00] text-sm outline-none">
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider block mb-1">Tagline (optional)</label>
                <input type="text" value={candTagline} onChange={e => setCandTagline(e.target.value)} placeholder="e.g. A better campus for all"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] border border-transparent focus:border-[#ff6b00] text-sm outline-none" />
              </div>
              <button type="submit"
                className="w-full py-3 rounded-xl bg-[#ff6b00] hover:bg-[#a04100] text-white font-bold text-sm shadow-[0_4px_16px_rgba(255,107,0,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">person_add</span>
                Register Candidate
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
