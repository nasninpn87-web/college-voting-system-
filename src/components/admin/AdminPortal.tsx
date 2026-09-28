import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';
import { TallyModal } from './TallyModal';
import { RaceDetailModal } from './RaceDetailModal';

const DEPT_CODES = ['CS', 'ENG', 'BUS', 'ART', 'SCI', 'LAW'];
const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
];

export const AdminPortal: React.FC = () => {
  const {
    electionState,
    departments,
    addDepartment,
    removeDepartment,
    races,
    students,
    addStudent,
    removeStudent,
    addCandidateToRace,
    removeCandidateFromRace,
    toggleVotingState,
    concludeAndLock,
    setIsTallyModalOpen,
    publishCertifiedResults,
    downloadAuditTrail,
    injectSimulatedLog,
    setSelectedRaceForDetail,
    showToast,
  } = useElection();

  const [activeTab, setActiveTab] = useState<'overview' | 'voters' | 'candidates' | 'departments'>('overview');
  const [isSyncing, setIsSyncing] = useState(false);

  // Department management state
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptEligible, setNewDeptEligible] = useState('1000');
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);

  // Voter management state
  const [voterSearch, setVoterSearch] = useState('');
  const [voterDeptFilter, setVoterDeptFilter] = useState('ALL');
  const [voterStatusFilter, setVoterStatusFilter] = useState<'all' | 'voted' | 'not-voted'>('all');
  const [isAddVoterOpen, setIsAddVoterOpen] = useState(false);
  const [newVoterName, setNewVoterName] = useState('');
  const [newVoterDept, setNewVoterDept] = useState('CS');
  const [newVoterYear, setNewVoterYear] = useState('Freshman');

  // Candidate management state
  const [selectedRaceFilter, setSelectedRaceFilter] = useState('ALL');
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [newCandName, setNewCandName] = useState('');
  const [newCandSlate, setNewCandSlate] = useState('');
  const [newCandRace, setNewCandRace] = useState(races[0]?.id || 'race-pres');
  const [newCandDept, setNewCandDept] = useState('ENG');
  const [newCandYear, setNewCandYear] = useState('Senior');
  const [newCandTagline, setNewCandTagline] = useState('');

  const handleSimulateVote = () => {
    setIsSyncing(true);
    injectSimulatedLog();
    setTimeout(() => setIsSyncing(false), 600);
  };

  const turnoutPct = ((electionState.ballotsCast / electionState.totalElectors) * 100).toFixed(1);
  const remaining = electionState.totalElectors - electionState.ballotsCast;

  // Filtered voters
  const filteredVoters = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(voterSearch.toLowerCase()) ||
                        s.studentId.toLowerCase().includes(voterSearch.toLowerCase());
    const matchDept = voterDeptFilter === 'ALL' || s.dept === voterDeptFilter;
    const matchStatus = voterStatusFilter === 'all' ||
                        (voterStatusFilter === 'voted' && s.hasVoted) ||
                        (voterStatusFilter === 'not-voted' && !s.hasVoted);
    return matchSearch && matchDept && matchStatus;
  });

  const handleCreateVoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoterName.trim()) {
      showToast('Enter student name', 'warning');
      return;
    }
    const studentId = addStudent(newVoterName.trim(), newVoterDept, newVoterYear);
    showToast(`Enrolled ${newVoterName} with ID: ${studentId}`, 'badge');
    setNewVoterName('');
    setIsAddVoterOpen(false);
  };

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandName.trim() || !newCandSlate.trim()) {
      showToast('Provide candidate name and party/slate', 'warning');
      return;
    }
    const colors = ['#ff6b00', '#2563eb', '#059669', '#7c3aed', '#db2777', '#ea580c'];
    addCandidateToRace(newCandRace, {
      name: newCandName.trim(),
      slate: newCandSlate.trim(),
      partyColor: colors[Math.floor(Math.random() * colors.length)],
      major: newCandDept === 'CS' ? 'Computer Science' : `${newCandDept} Studies`,
      year: newCandYear,
      gpa: (3.2 + Math.random() * 0.7).toFixed(2),
      photoUrl: AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)],
      tagline: newCandTagline || `Committed to representing ${newCandDept}`,
      bio: `${newCandName.trim()} is dedicated to serving the collegiate council.`,
      policyPillars: ['Academic Resources', 'Student Advocacy'],
      endorsements: [],
      dept: newCandDept,
    });
    setNewCandName('');
    setNewCandSlate('');
    setNewCandTagline('');
    setIsAddCandidateOpen(false);
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptCode.trim() || !newDeptName.trim()) {
      showToast('Department code and name required', 'warning');
      return;
    }
    addDepartment(newDeptCode.trim(), newDeptName.trim(), parseInt(newDeptEligible) || 1000);
    setNewDeptCode('');
    setNewDeptName('');
    setNewDeptEligible('1000');
    setIsAddDeptOpen(false);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                electionState.isLocked ? 'bg-slate-200 text-slate-600'
                : electionState.isPaused ? 'bg-amber-100 text-amber-800'
                : 'bg-[#ff6b00]/10 text-[#a04100]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  electionState.isLocked ? 'bg-slate-500'
                  : electionState.isPaused ? 'bg-amber-500'
                  : 'bg-[#ff6b00] animate-pulse'
                }`}></span>
                {electionState.isLocked ? 'Locked' : electionState.isPaused ? 'Paused' : 'Election Active'}
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0d1c2e]">
              Admin Control Center
            </h1>
            <p className="text-sm text-[#565e74]">Manage election lifecycle, voter registry, and candidate nominations</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSimulateVote}
              className={`px-4 py-2 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0d1c2e] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 ${isSyncing ? 'opacity-60' : ''}`}
            >
              <span className={`material-symbols-outlined text-base text-[#a04100] ${isSyncing ? 'animate-spin' : ''}`}>
                sensors
              </span>
              Simulate Vote
            </button>
            <button
              onClick={downloadAuditTrail}
              className="px-4 py-2 rounded-full bg-white hover:bg-[#eff4ff] text-[#a04100] text-xs font-semibold shadow-sm border border-[#ff6b00]/20 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Export Report
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#eff4ff] border border-white/60 w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-[#ff6b00] text-white shadow-sm'
                : 'text-[#565e74] hover:text-[#0d1c2e] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">dashboard</span>
            Overview & Controls
          </button>

          <button
            onClick={() => setActiveTab('voters')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'voters'
                ? 'bg-[#ff6b00] text-white shadow-sm'
                : 'text-[#565e74] hover:text-[#0d1c2e] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">badge</span>
            Manage Voters ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'candidates'
                ? 'bg-[#ff6b00] text-white shadow-sm'
                : 'text-[#565e74] hover:text-[#0d1c2e] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">how_to_reg</span>
            Manage Candidates ({races.reduce((sum, r) => sum + r.candidates.length, 0)})
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'departments'
                ? 'bg-[#ff6b00] text-white shadow-sm'
                : 'text-[#565e74] hover:text-[#0d1c2e] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">domain</span>
            Manage Departments ({departments.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & CONTROLS */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            {/* 4 KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#8e7164] uppercase tracking-wider">Total Electors</span>
                  <div className="w-9 h-9 rounded-full bg-[#ffdbcc] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#a04100] text-lg">groups</span>
                  </div>
                </div>
                <span className="font-display font-bold text-3xl text-[#0d1c2e]">
                  {electionState.totalElectors.toLocaleString()}
                </span>
                <span className="text-xs text-[#565e74] mt-1">6 Academic Colleges</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#8e7164] uppercase tracking-wider">Ballots Cast</span>
                  <div className="w-9 h-9 rounded-full bg-[#ff6b00] flex items-center justify-center shadow-[0_2px_8px_rgba(255,107,0,0.35)]">
                    <span className="material-symbols-outlined text-white text-lg">how_to_vote</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-bold text-3xl text-[#0d1c2e]">
                    {electionState.ballotsCast.toLocaleString()}
                  </span>
                  <span className="font-display font-bold text-lg text-[#a04100]">{turnoutPct}%</span>
                </div>
                <div className="mt-2 w-full bg-[#dce9ff] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#a04100] to-[#ff6b00] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, parseFloat(turnoutPct))}%` }}
                  ></div>
                </div>
                <span className="text-[11px] text-[#565e74] mt-1">Quorum: 50% — {(parseFloat(turnoutPct) - 50).toFixed(1)}% above</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#8e7164] uppercase tracking-wider">Not Yet Voted</span>
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-500 text-lg">pending</span>
                  </div>
                </div>
                <span className="font-display font-bold text-3xl text-slate-700">
                  {remaining.toLocaleString()}
                </span>
                <span className="text-xs text-[#565e74] mt-1">Electors pending</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#8e7164] uppercase tracking-wider">Races Active</span>
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-700 text-lg">verified</span>
                  </div>
                </div>
                <span className="font-display font-bold text-3xl text-[#0d1c2e]">{races.length}</span>
                <span className="text-xs text-emerald-700 font-semibold mt-1">All stations online</span>
              </div>
            </div>

            {/* Election Controls */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="font-display font-bold text-lg text-[#0d1c2e] mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a04100]">tune</span>
                Election Controls
              </h2>
              <p className="text-xs text-[#565e74] mb-5">
                Manage the election lifecycle. Actions are irreversible once committed.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pause / Resume */}
                <div className="p-4 rounded-xl bg-[#eff4ff] border border-slate-200/50 flex flex-col gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-[#a04100] text-lg">
                        {electionState.isPaused ? 'play_arrow' : 'pause_circle'}
                      </span>
                      <span className="text-xs font-bold text-[#0d1c2e]">
                        {electionState.isPaused ? 'Resume Voting' : 'Pause Voting'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#565e74] leading-relaxed">
                      Temporarily halt all active voter booths across departments.
                    </p>
                  </div>
                  <button
                    onClick={toggleVotingState}
                    disabled={electionState.isLocked}
                    className={`w-full py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      electionState.isLocked
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : electionState.isPaused
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-[#d5e3fc] hover:bg-[#dce9ff] text-[#0d1c2e]'
                    }`}
                  >
                    {electionState.isPaused ? 'Resume Balloting' : 'Pause Balloting'}
                  </button>
                </div>

                {/* Lock */}
                <div className="p-4 rounded-xl bg-[#eff4ff] border border-slate-200/50 flex flex-col gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-[#a04100] text-lg">lock</span>
                      <span className="text-xs font-bold text-[#0d1c2e]">Close Election</span>
                    </div>
                    <p className="text-[11px] text-[#565e74] leading-relaxed">
                      Permanently lock ballot boxes. No further submissions accepted.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Close and lock election? This cannot be undone.')) concludeAndLock();
                    }}
                    disabled={electionState.isLocked}
                    className={`w-full py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      electionState.isLocked
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-[#d5e3fc] hover:bg-[#ffdad6] hover:text-[#93000a] text-[#0d1c2e]'
                    }`}
                  >
                    {electionState.isLocked ? '✓ Boxes Sealed' : 'Close & Lock'}
                  </button>
                </div>

                {/* Tally */}
                <div className="p-4 rounded-xl bg-[#eff4ff] border border-slate-200/50 flex flex-col gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-[#a04100] text-lg">calculate</span>
                      <span className="text-xs font-bold text-[#0d1c2e]">Count Votes</span>
                    </div>
                    <p className="text-[11px] text-[#565e74] leading-relaxed">
                      Run automated vote tabulation across all races and departments.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsTallyModalOpen(true)}
                    className="w-full py-2 rounded-full bg-[#ff6b00] text-white text-xs font-bold shadow-[0_3px_10px_rgba(255,107,0,0.35)] hover:bg-[#a04100] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {electionState.isTallied ? 'Re-Run Count' : 'Count Now'}
                  </button>
                </div>

                {/* Publish */}
                <div className="p-4 rounded-xl bg-[#eff4ff] border border-slate-200/50 flex flex-col gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-[#a04100] text-lg">publish</span>
                      <span className="text-xs font-bold text-[#0d1c2e]">Publish Results</span>
                    </div>
                    <p className="text-[11px] text-[#565e74] leading-relaxed">
                      Release certified final results to all students and staff.
                    </p>
                  </div>
                  <button
                    onClick={publishCertifiedResults}
                    disabled={!electionState.isLocked || !electionState.isTallied}
                    className={`w-full py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      electionState.isLocked && electionState.isTallied
                        ? 'bg-[#a04100] text-white hover:bg-[#ff6b00] shadow-[0_3px_10px_rgba(255,107,0,0.35)]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {electionState.isPublished ? '✓ Published' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>

            {/* Department Turnout */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <h2 className="font-display font-bold text-lg text-[#0d1c2e] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a04100]">pie_chart</span>
                Department Turnout
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {departments.map(dept => {
                  const pct = dept.turnoutPct;
                  const isLow = pct < 50;
                  const isHigh = pct >= 75;
                  return (
                    <div key={dept.code} className="p-4 rounded-2xl border border-slate-200/60 bg-[#eff4ff]/40 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            dept.code === 'CS' ? 'bg-[#ffdbcc] text-[#a04100]' : 'bg-[#d5e3fc] text-[#0d1c2e]'
                          }`}>
                            {dept.code}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#0d1c2e] leading-tight">{dept.name}</div>
                            <div className="text-[11px] text-[#8e7164]">{dept.voted.toLocaleString()} / {dept.eligible.toLocaleString()}</div>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isLow ? 'bg-red-100 text-red-700'
                          : isHigh ? 'bg-[#ff6b00]/10 text-[#a04100]'
                          : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isLow ? 'bg-red-500' : isHigh ? 'bg-[#ff6b00]' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Council Races */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <h2 className="font-display font-bold text-lg text-[#0d1c2e] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a04100]">diversity_3</span>
                Council Races
                <span className="text-xs font-normal text-[#8e7164] ml-1">Click a race to inspect standings</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {races.map(race => {
                  const leader = [...race.candidates].sort((a, b) => b.votes - a.votes)[0];
                  const leaderPct = race.totalVotes > 0 ? Math.round((leader.votes / race.totalVotes) * 100) : 0;
                  return (
                    <div
                      key={race.id}
                      onClick={() => setSelectedRaceForDetail(race)}
                      className="p-4 rounded-2xl border border-slate-200/60 bg-[#eff4ff]/40 hover:bg-[#dce9ff]/60 hover:border-slate-300 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#ff6b00]/10 group-hover:bg-[#ff6b00]/20 flex items-center justify-center text-[#ff6b00] font-bold font-display text-sm transition-colors">
                          {race.code}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#0d1c2e]">{race.title}</div>
                          <div className="text-xs text-[#565e74]">
                            Leading: <span className="font-semibold text-[#0d1c2e]">{leader.name.split('&')[0].trim()}</span>
                            {' '}({leaderPct}%)
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-mono font-bold text-[#a04100] bg-[#ff6b00]/10 px-2 py-0.5 rounded-full">
                          {race.totalVotes.toLocaleString()} votes
                        </span>
                        <span className="text-[10px] text-[#8e7164] group-hover:underline">View →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE VOTERS */}
        {activeTab === 'voters' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-lg text-[#0d1c2e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ff6b00]">badge</span>
                  Student Voter Registry
                </h2>
                <p className="text-xs text-[#565e74]">
                  Manage enrolled student voters. Each student is automatically assigned an official Student ID.
                </p>
              </div>

              <button
                onClick={() => setIsAddVoterOpen(v => !v)}
                className="px-4 py-2 rounded-xl bg-[#ff6b00] hover:bg-[#a04100] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-base">
                  {isAddVoterOpen ? 'close' : 'person_add'}
                </span>
                {isAddVoterOpen ? 'Cancel' : 'Enroll New Voter'}
              </button>
            </div>

            {/* Quick Add Voter Collapsible Form */}
            {isAddVoterOpen && (
              <form onSubmit={handleCreateVoter} className="p-4 rounded-2xl bg-[#eff4ff]/60 border border-slate-200/70 flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full">
                  <label className="text-[11px] font-bold text-[#0d1c2e] block mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={newVoterName}
                    onChange={e => setNewVoterName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0d1c2e] focus:outline-none focus:border-[#ff6b00]"
                    required
                  />
                </div>
                <div className="w-full sm:w-40">
                  <label className="text-[11px] font-bold text-[#0d1c2e] block mb-1">Department</label>
                  <select
                    value={newVoterDept}
                    onChange={e => setNewVoterDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0d1c2e] focus:outline-none focus:border-[#ff6b00]"
                  >
                    {DEPT_CODES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="w-full sm:w-40">
                  <label className="text-[11px] font-bold text-[#0d1c2e] block mb-1">Class / Year</label>
                  <select
                    value={newVoterYear}
                    onChange={e => setNewVoterYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0d1c2e] focus:outline-none focus:border-[#ff6b00]"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#ff6b00] hover:bg-[#a04100] text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  Generate ID & Enroll
                </button>
              </form>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8e7164] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by name or Student ID..."
                  value={voterSearch}
                  onChange={e => setVoterSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#eff4ff]/60 border border-slate-200/60 text-xs text-[#0d1c2e] focus:outline-none focus:border-[#ff6b00]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                {/* Department filter */}
                <select
                  value={voterDeptFilter}
                  onChange={e => setVoterDeptFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#eff4ff]/60 border border-slate-200/60 text-xs text-[#0d1c2e] font-semibold"
                >
                  <option value="ALL">All Departments</option>
                  {DEPT_CODES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                {/* Status filter */}
                <div className="flex items-center rounded-xl bg-[#eff4ff]/60 p-1 border border-slate-200/60">
                  {(['all', 'voted', 'not-voted'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setVoterStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        voterStatusFilter === s ? 'bg-white shadow-xs text-[#0d1c2e]' : 'text-[#565e74]'
                      }`}
                    >
                      {s === 'all' ? 'All' : s === 'voted' ? 'Voted' : 'Pending'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Voters Table */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#eff4ff]/70 text-[#565e74] font-bold uppercase tracking-wider border-b border-slate-200/80">
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Class Year</th>
                      <th className="py-3 px-4">Ballot Status</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVoters.map((student) => (
                      <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#a04100]">
                          {student.studentId}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#0d1c2e]">
                          {student.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#0d1c2e] font-bold border border-slate-200">
                            {student.dept}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#565e74]">
                          {student.year}
                        </td>
                        <td className="py-3 px-4">
                          {student.hasVoted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              Voted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Not Voted
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#8e7164] font-mono text-[11px]">
                          {student.time || '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Permanently delete student voter ${student.name} (${student.studentId})?`)) {
                                removeStudent(student.studentId);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold cursor-pointer transition-colors"
                            title="Delete voter"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredVoters.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#8e7164]">
                          No students matching your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE CANDIDATES */}
        {activeTab === 'candidates' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-lg text-[#0d1c2e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ff6b00]">how_to_reg</span>
                  Candidate Nominations
                </h2>
                <p className="text-xs text-[#565e74]">
                  Manage registered candidates across all council races and collegiate divisions.
                </p>
              </div>

              <button
                onClick={() => setIsAddCandidateOpen(v => !v)}
                className="px-4 py-2 rounded-xl bg-[#ff6b00] hover:bg-[#a04100] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-base">
                  {isAddCandidateOpen ? 'close' : 'person_add'}
                </span>
                {isAddCandidateOpen ? 'Cancel' : 'Nominate New Candidate'}
              </button>
            </div>

            {/* Quick Add Candidate Collapsible Form */}
            {isAddCandidateOpen && (
              <form onSubmit={handleCreateCandidate} className="p-5 rounded-2xl bg-[#eff4ff]/60 border border-slate-200/70 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#0d1c2e] block mb-1">Candidate Full Name</label>
                    <input
                      type="text"
                      value={newCandName}
                      onChange={e => setNewCandName(e.target.value)}
                      placeholder="e.g. Maya Chen"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0d1c2e] focus:outline-none focus:border-[#ff6b00]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#0d1c2e] block mb-1">Party / Slate</label>
                    <input
                      type="text"
                      value={newCandSlate}
                      onChange={e => setNewCandSlate(e.target.value)}
                      placeholder="e.g. Progressive Student Union"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0d1c2e] focus:outline-none focus:border-[#ff6b00]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#0d1c2e] block mb-1">Council Race</label>
                    <select
                      value={newCandRace}
                      onChange={e => setNewCandRace(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0d1c2e] focus:outline-none focus:border-[#ff6b00]"
                    >
                      {races.map(r => <option key={r.id} value={r.id}>{r.title} ({r.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#0d1c2e] block mb-1">Department</label>
                    <select
                      value={newCandDept}
                      onChange={e => setNewCandDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0d1c2e] focus:outline-none focus:border-[#ff6b00]"
                    >
                      {DEPT_CODES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#0d1c2e] block mb-1">Class Year</label>
                    <select
                      value={newCandYear}
                      onChange={e => setNewCandYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0d1c2e] focus:outline-none focus:border-[#ff6b00]"
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#0d1c2e] block mb-1">Campaign Slogan</label>
                    <input
                      type="text"
                      value={newCandTagline}
                      onChange={e => setNewCandTagline(e.target.value)}
                      placeholder="e.g. Transparency & Growth"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0d1c2e] focus:outline-none focus:border-[#ff6b00]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCandidateOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#565e74] hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#ff6b00] hover:bg-[#a04100] text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Register Candidate
                  </button>
                </div>
              </form>
            )}

            {/* Race Filter Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
              <button
                onClick={() => setSelectedRaceFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedRaceFilter === 'ALL'
                    ? 'bg-[#ff6b00] text-white shadow-sm'
                    : 'bg-[#eff4ff] text-[#565e74] hover:bg-[#dce9ff]'
                }`}
              >
                All Races
              </button>
              {races.map(race => (
                <button
                  key={race.id}
                  onClick={() => setSelectedRaceFilter(race.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedRaceFilter === race.id
                      ? 'bg-[#ff6b00] text-white shadow-sm'
                      : 'bg-[#eff4ff] text-[#565e74] hover:bg-[#dce9ff]'
                  }`}
                >
                  {race.code} • {race.title}
                </button>
              ))}
            </div>

            {/* Candidates Grouped by Race */}
            <div className="flex flex-col gap-6">
              {races
                .filter(r => selectedRaceFilter === 'ALL' || r.id === selectedRaceFilter)
                .map(race => (
                  <div key={race.id} className="p-4 rounded-2xl bg-[#eff4ff]/40 border border-slate-200/60 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-bold text-sm text-[#0d1c2e]">{race.title}</h3>
                        <p className="text-xs text-[#565e74]">{race.description} • {race.totalVotes.toLocaleString()} ballots cast</p>
                      </div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[#a04100]">
                        {race.candidates.length} Contenders
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {race.candidates.map(candidate => (
                        <div
                          key={candidate.id}
                          className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={candidate.photoUrl}
                              alt={candidate.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <div>
                              <div className="text-xs font-bold text-[#0d1c2e]">{candidate.name}</div>
                              <div className="text-[11px] text-[#565e74]">{candidate.slate}</div>
                              <div className="text-[10px] text-[#8e7164]">
                                Dept: {candidate.dept || 'Engineering'} • {candidate.votes.toLocaleString()} votes
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (confirm(`Remove candidate ${candidate.name} from ${race.title}?`)) {
                                removeCandidateFromRace(race.id, candidate.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                            title="Remove candidate"
                          >
                            <span className="material-symbols-outlined text-[17px]">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      <TallyModal />
      <RaceDetailModal />
    </div>
  );
};
