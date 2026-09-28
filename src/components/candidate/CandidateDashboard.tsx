import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';

export const CandidateDashboard: React.FC = () => {
  const {
    currentUser,
    races,
    departments,
    electionState,
    setCurrentScreen,
    showToast,
  } = useElection();

  // Find the candidate's race or default to the first race
  const [selectedRaceId, setSelectedRaceId] = useState<string>(() => {
    // Check if current user name matches any candidate
    const foundRace = races.find(r =>
      r.candidates.some(c => c.name.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(c.name.toLowerCase()))
    );
    return foundRace?.id || races[0]?.id || 'race-pres';
  });

  const activeRace = races.find(r => r.id === selectedRaceId) || races[0];

  // Sort candidates by votes descending
  const sortedCandidates = [...(activeRace?.candidates || [])].sort((a, b) => b.votes - a.votes);
  const raceTotalVotes = activeRace?.totalVotes || sortedCandidates.reduce((acc, c) => acc + c.votes, 0) || 1;

  // Find candidate's own candidate record if available
  const myCandidateRecord = activeRace?.candidates.find(
    c => c.name.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(c.name.toLowerCase())
  ) || sortedCandidates[0];

  const myRank = sortedCandidates.findIndex(c => c.id === myCandidateRecord?.id) + 1;
  const myVotes = myCandidateRecord?.votes || 0;
  const myPct = ((myVotes / raceTotalVotes) * 100).toFixed(1);

  // Local campaign announcements state
  const [announcements, setAnnouncements] = useState<Array<{ id: string; title: string; body: string; time: string; tags: string[] }>>([
    {
      id: 'ann-1',
      title: 'Open Forum Q&A Session Today at 4 PM',
      body: 'Join us at the Engineering quad or tune in to the live stream to ask questions about our campus transit & dining reform plan.',
      time: '1 hour ago',
      tags: ['Event', 'Townhall'],
    },
    {
      id: 'ann-2',
      title: 'Released Comprehensive Mental Health & Wellness Platform',
      body: 'Our full policy blueprint is now available for all students. We are pledging a 30% increase in counselor availability.',
      time: '3 hours ago',
      tags: ['Platform', 'Policy'],
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      showToast('Please provide both title and content.', 'warning');
      return;
    }
    const newAnn = {
      id: `ann-${Date.now()}`,
      title: newTitle.trim(),
      body: newBody.trim(),
      time: 'Just now',
      tags: ['Campaign Update'],
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setNewTitle('');
    setNewBody('');
    setIsPosting(false);
    showToast('Campaign announcement published!', 'campaign');
  };

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* Top Hero / Candidate Banner */}
        <div className="bg-gradient-to-br from-[#0d1c2e] via-[#1a2c42] to-[#2a1a0e] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#ff6b00]/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                  alt={currentUser.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#ff6b00]/40 shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-[#ff6b00] text-white text-[10px] font-black uppercase tracking-wider shadow">
                  Candidate
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
                    {currentUser.name}
                  </h1>
                  {currentUser.studentId && (
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/15">
                      ID: {currentUser.studentId}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 font-medium">
                  {currentUser.roleTitle} • {currentUser.department}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Ballot Status: Certified Active
                  </span>
                  <span>•</span>
                  <span>Contending in: <strong className="text-white">{activeRace?.title}</strong></span>
                </div>
              </div>
            </div>

            {/* Live Status Chip & Quick Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ff6b00] text-lg">timer</span>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] uppercase font-bold text-slate-300">Remaining</span>
                  <span className="font-mono font-bold text-sm text-white">
                    {formatTimer(electionState.timeRemainingSeconds)}
                  </span>
                </div>
                <span className="w-px h-4 bg-white/20 mx-1"></span>
                <span className={`text-xs font-bold ${electionState.isPaused ? 'text-amber-400' : electionState.isLocked ? 'text-slate-400' : 'text-emerald-400'}`}>
                  {electionState.isPaused ? 'Paused' : electionState.isLocked ? 'Locked' : '● Voting Live'}
                </span>
              </div>

              {!currentUser.hasVoted && (
                <button
                  onClick={() => setCurrentScreen('student-voter-candidate-booth')}
                  className="px-5 py-2.5 rounded-xl bg-[#ff6b00] hover:bg-[#ff8533] text-white font-bold text-xs shadow-lg shadow-[#ff6b00]/30 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">how_to_vote</span>
                  Cast Your Ballot
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Your Standing */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#8e7164] uppercase tracking-wider">Current Standing</span>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${myRank === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                <span className="material-symbols-outlined text-lg">
                  {myRank === 1 ? 'emoji_events' : 'leaderboard'}
                </span>
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-3xl text-[#0d1c2e]">
                Rank #{myRank}
              </span>
              <div className="text-xs font-medium text-[#565e74] mt-1">
                {myRank === 1 ? 'Leading this race!' : `${sortedCandidates[0]?.votes - myVotes} votes behind leader`}
              </div>
            </div>
          </div>

          {/* Card 2: Candidate Vote Tally */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#8e7164] uppercase tracking-wider">Your Votes</span>
              <div className="w-9 h-9 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">how_to_vote</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-3xl text-[#0d1c2e]">
                  {myVotes.toLocaleString()}
                </span>
                <span className="font-display font-bold text-base text-[#a04100]">{myPct}%</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#a04100] to-[#ff6b00] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, parseFloat(myPct) || 0)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Card 3: Total Race Votes */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#8e7164] uppercase tracking-wider">Race Total Ballots</span>
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">ballot</span>
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-3xl text-[#0d1c2e]">
                {raceTotalVotes.toLocaleString()}
              </span>
              <div className="text-xs text-[#565e74] mt-1">
                Across {activeRace?.candidates.length} registered candidates
              </div>
            </div>
          </div>

          {/* Card 4: Overall Election Turnout */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#8e7164] uppercase tracking-wider">Campus Turnout</span>
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">pie_chart</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-3xl text-[#0d1c2e]">
                  {((electionState.ballotsCast / electionState.totalElectors) * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-[#565e74]">
                  ({electionState.ballotsCast.toLocaleString()} votes)
                </span>
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-1">
                Quorum reached (50%+)
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Live Race Standings & Department Turnout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Cols: Live Standings for the selected race */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-display font-bold text-lg text-[#0d1c2e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff6b00]">bar_chart</span>
                    Live Race Standings
                  </h2>
                  <p className="text-xs text-[#565e74]">
                    Real-time vote count breakdown by candidate
                  </p>
                </div>

                {/* Race Switcher Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {races.map(race => (
                    <button
                      key={race.id}
                      onClick={() => setSelectedRaceId(race.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        selectedRaceId === race.id
                          ? 'bg-[#ff6b00] text-white shadow-sm'
                          : 'bg-[#eff4ff] text-[#565e74] hover:bg-[#dce9ff] hover:text-[#0d1c2e]'
                      }`}
                    >
                      {race.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Race Title Banner */}
              <div className="p-4 rounded-xl bg-[#eff4ff]/60 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#0d1c2e]">{activeRace?.title}</div>
                  <div className="text-xs text-[#565e74]">{activeRace?.description}</div>
                </div>
                <span className="font-mono text-xs font-bold text-[#ff6b00] bg-white px-2.5 py-1 rounded-full border border-slate-200">
                  {raceTotalVotes.toLocaleString()} votes cast
                </span>
              </div>

              {/* Candidates List */}
              <div className="flex flex-col gap-3">
                {sortedCandidates.map((candidate, idx) => {
                  const pct = raceTotalVotes > 0 ? ((candidate.votes / raceTotalVotes) * 100).toFixed(1) : '0';
                  const isMe = candidate.id === myCandidateRecord?.id;
                  const isLeader = idx === 0;

                  return (
                    <div
                      key={candidate.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isMe
                          ? 'bg-[#ffdbcc]/20 border-[#ff6b00]/40 ring-2 ring-[#ff6b00]/20 shadow-sm'
                          : 'bg-white border-slate-200/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                            isLeader ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            #{idx + 1}
                          </span>
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
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#0d1c2e]">{candidate.name}</span>
                              {isMe && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff6b00] text-white">
                                  You
                                </span>
                              )}
                              {isLeader && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">grade</span>
                                  Leader
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#565e74]">
                              {candidate.slate} • {candidate.dept || candidate.major}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="font-display font-bold text-base text-[#0d1c2e]">
                            {candidate.votes.toLocaleString()} <span className="text-xs font-normal text-[#565e74]">votes</span>
                          </span>
                          <span className="text-xs font-bold text-[#ff6b00]">{pct}%</span>
                        </div>
                      </div>

                      {/* Vote share bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, parseFloat(pct))}%`,
                            backgroundColor: candidate.partyColor || '#ff6b00',
                          }}
                        ></div>
                      </div>

                      {/* Tagline / Policy Quote */}
                      {candidate.tagline && (
                        <div className="mt-2 text-[11px] text-[#565e74] italic">
                          "{candidate.tagline}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Campaign Announcements & Updates */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-[#0d1c2e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff6b00]">campaign</span>
                    Campaign Feed & Announcements
                  </h3>
                  <p className="text-xs text-[#565e74]">
                    Post updates and campaign memos directly to voters
                  </p>
                </div>
                <button
                  onClick={() => setIsPosting(v => !v)}
                  className="px-3 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0d1c2e] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">{isPosting ? 'close' : 'add'}</span>
                  {isPosting ? 'Cancel' : 'New Post'}
                </button>
              </div>

              {/* New Announcement Form */}
              {isPosting && (
                <form onSubmit={handlePostAnnouncement} className="p-4 rounded-xl bg-[#eff4ff]/60 border border-slate-200/60 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#0d1c2e]">Post Title</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="e.g. Rally in Front of Student Center Tomorrow!"
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0d1c2e] focus:outline-none focus:border-[#ff6b00]"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#0d1c2e]">Message</label>
                    <textarea
                      rows={3}
                      value={newBody}
                      onChange={e => setNewBody(e.target.value)}
                      placeholder="Detail your campaign update, platform point, or event invitation..."
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0d1c2e] focus:outline-none focus:border-[#ff6b00]"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPosting(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#565e74] hover:bg-slate-200 cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#ff6b00] hover:bg-[#a04100] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      Publish to Feed
                    </button>
                  </div>
                </form>
              )}

              {/* Feed items */}
              <div className="flex flex-col gap-3">
                {announcements.map(ann => (
                  <div key={ann.id} className="p-4 rounded-xl bg-[#eff4ff]/30 border border-slate-200/50 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#0d1c2e]">{ann.title}</h4>
                      <span className="text-[10px] text-[#8e7164]">{ann.time}</span>
                    </div>
                    <p className="text-xs text-[#565e74] leading-relaxed">{ann.body}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {ann.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-white text-[10px] font-semibold text-[#a04100] border border-slate-200">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Department Turnout & Candidate Platform */}
          <div className="flex flex-col gap-6">

            {/* Department Turnout Tracker */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col gap-4">
              <div>
                <h3 className="font-display font-bold text-base text-[#0d1c2e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ff6b00]">pie_chart</span>
                  College Turnout
                </h3>
                <p className="text-xs text-[#565e74]">
                  Track voting participation across academic colleges
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {departments.map(dept => {
                  const pct = dept.turnoutPct;
                  return (
                    <div key={dept.code} className="p-3 rounded-xl bg-[#eff4ff]/40 border border-slate-200/50 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#0d1c2e]">{dept.code}</span>
                          <span className="text-[#8e7164] font-normal">• {dept.name}</span>
                        </div>
                        <span className="font-mono font-bold text-[#a04100]">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#a04100] to-[#ff6b00] h-full rounded-full"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-[#8e7164] flex justify-between">
                        <span>{dept.voted.toLocaleString()} ballots</span>
                        <span>{dept.eligible.toLocaleString()} total electors</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform & Manifesto Pillars */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col gap-4">
              <div>
                <h3 className="font-display font-bold text-base text-[#0d1c2e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ff6b00]">verified</span>
                  Platform Pillars
                </h3>
                <p className="text-xs text-[#565e74]">
                  Key pledges committed to the student electorate
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  { icon: 'school', title: 'Academic Resource Grants', desc: 'Expand free textbook access & lab fee subsidies for all undergraduates.' },
                  { icon: 'directions_bus', title: 'Night Transit & Safety', desc: 'Add 24/7 on-demand campus shuttle routes and improved pathway lighting.' },
                  { icon: 'local_dining', title: 'Affordable Dining Options', desc: 'Introduce $5 student combo meals and round-the-clock grab & go pantry.' },
                  { icon: 'savings', title: 'Club Funding Transparency', desc: 'Open-ledger budget allocations so every registered student group gets fair funding.' },
                ].map((pillar, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#eff4ff]/30 border border-slate-200/40 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ff6b00]/10 text-[#ff6b00] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-base">{pillar.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0d1c2e]">{pillar.title}</h4>
                      <p className="text-[11px] text-[#565e74] leading-relaxed mt-0.5">{pillar.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
